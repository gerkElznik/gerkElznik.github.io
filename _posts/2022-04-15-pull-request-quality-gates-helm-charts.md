---
layout: single
title:  "Pull request quality gates for Helm charts"
date:   2022-04-15 11:00:00 -0600
classes: wide
header:
  teaser: assets/images/helm.png
excerpt: Learn about adding CI pipeline quality gates to lint and test your helm charts during a pull request
---
If you're practicing continuous integration and continuous delivery, it's a good idea to test and verify *actually deploying* your changes during a pull request, to ensure they're production-ready, before you've merged them with the main line of code.  At this point, a mistake that breaks something hasn't necessarily caused any problems for your co-workers and the reasoning behind your changes will still be fresh in your head.

{% include figure class="align-center text-center" image_path="/assets/images/deployments-brian-fantana.jpg" alt="60% of the time deployments work everytime" caption="[**Photo credit**](https://mokkapps.de/blog/run-automated-electron-app-tests-using-travis-ci)" %}

The challenging aspect of testing an actual deployment is that it requires a *target environment* to be running and ready which can be too time-consuming to seem feasible for every pull request -- you also want the test environment to have as much parity with your production environment as possible or else the value of the tests will diminish the more disparate they are.

Fortunately, when we're working with Kubernetes, there are a growing number of options to quickly spin up a local cluster with high feature parity to that of your production cluster.  This article will demonstrate one such option by using [`kind`](https://kind.sigs.k8s.io) in a CI pipeline (we'll use GitHub Actions, but `kind` could be used in any CI tool that has Docker available).  In my previous article, I demonstrated how to [*Provision a free personal Helm chart repo using GitHub*](https://gerkelznik.github.io/provision-personal-helm-chart-repo/); we'll now continue where it left off and see how to add automated **linting** and **testing** of our charts on every pull request -- the tests will utilize a disposable `kind` cluster as a fully-functional Kubernetes environment.

## Step 1: Set up a Branch Policy enforcing pull requests
Using the GitHub [repository](https://github.com/gerkElznik/helm-charts) we set up in the last article, we already created a [`Release Charts`](https://github.com/gerkElznik/helm-charts/actions/workflows/release.yml) pipeline that is triggered when a change is pushed to the `main` branch, and it then creates a new [GitHub Release](https://docs.github.com/en/enterprise-cloud@latest/repositories/releasing-projects-on-github/about-releases) if a new version for a chart is detected, however, as I learned the hard way by overlooking something, it is possible to create a release for a chart that is in a state that won't successfully deploy to Kubernetes -- this required me to create a fix and then delete and recreate the bad release -- which obviously would have been bad news for an end-user who quickly picked up the new release and started depending on it before I was able to fix the mistake.

Because I was the only one working on the code in this repo, I was lazily working directly on the `main` branch locally and pushing changes directly to the remote `main` branch without a pull request or anyone else reviewing my changes.  I'd like to prevent the possibility of another mistake leading to a bad release of my helm charts so the first thing I need to do is start requiring all changes to the `main` branch to come via a pull request.  This can be accomplished with a branch policy, or as they are called in GitHub, a [`Branch protection rule`](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule) as shown here:

![Branch protection rule](/assets/images/github-branch-protection-rule.png "Branch protection rule")

I'm not using it in this case, but the option to [`Require review from Code Owners`](https://docs.github.com/en/enterprise-server@3.4/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) is a really powerful feature I usually use when working with a cross-functional team that shares a code base, but where different members of the team have specialties in certain areas and need to review any changes to specific files or directories associated with their role or specialty.

Since you are most likely an administrator of your GitHub repo and we want this protection to apply for you as well as anyone else, be sure to also check the `Include administrators` option.

## Step 2: Configure CI pipeline to trigger on pull requests
Now that we've ensured all changes to our main line of code come from a pull request, we can use that to trigger a CI pipeline and add quality gates to our continuous integration process.

Example GitHub Actions Workflow [`.github/workflows/lint-test.yml`](https://github.com/gerkElznik/helm-charts/blob/main/.github/workflows/lint-test.yml)
{% raw %}
```yaml
name: Lint and Test Charts

on: pull_request

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Set up Helm
        uses: azure/setup-helm@v1
        with:
          version: v3.8.1

      - uses: actions/setup-python@v2
        with:
          python-version: 3.7

      - name: Set up chart-testing
        uses: helm/chart-testing-action@v2.2.1

      - name: Run chart-testing (list-changed)
        id: list-changed
        run: |
          changed=$(ct list-changed --config .github/chart-testing-config.yml)
          if [[ -n "$changed" ]]; then
            echo "::set-output name=changed::true"
          fi

      - name: Run chart-testing (lint)
        run: ct lint --config .github/chart-testing-config.yml

      - name: Create kind cluster
        uses: helm/kind-action@v1.2.0
        if: steps.list-changed.outputs.changed == 'true'

      - name: Run chart-testing (install)
        run: ct install --config .github/chart-testing-config.yml

      - name: Run chart-testing (upgrade)
        run: ct install --upgrade --config .github/chart-testing-config.yml
```
{% endraw %}

Example chart-testing config file [`.github/chart-testing-config.yml`](https://github.com/gerkElznik/helm-charts/blob/main/.github/chart-testing-config.yml)
```yaml
# See https://github.com/helm/chart-testing#configuration
remote: origin
target-branch: main
chart-dirs:
  - charts
helm-extra-args: --timeout 600s
```

The above YAML config files will add a new workflow named [`Lint and Test Charts`](https://github.com/gerkElznik/helm-charts/actions/workflows/lint-test.yml) that is triggered on every pull request and must succeed in order for the pull request to be merged; let's breakdown the steps:

1. **Checkout:** Checks out the new version of the code.
2. **Set up Helm:** Helm is a dependency for the chart-testing tool used later.
3. **Set up Python:** Python is a dependency for the Chart Testing tool used later.
4. **Set up chart-testing:** Install the `ct` CLI tool, see [https://github.com/helm/chart-testing](https://github.com/helm/chart-testing).
5. **Run chart-testing (list-changed):** Sets an output value of `changed` to `true` if the changes in this pull request actually changed a chart, otherwise we can save on build time and avoid running unnecessary steps.
6. **Run chart-testing (lint):** Runs `helm lint`, version checking, YAML schema validation on `Chart.yaml`, YAML linting on `Chart.yaml` and `values.yaml`, and maintainer validation on.  See [`ct lint`](https://github.com/helm/chart-testing/blob/main/doc/ct_lint.md).
7. **Create kind cluster:** Runs a local Kubernetes cluster using Docker to provide a test environment.  Skipped if no chart changes were detected earlier to avoid lengthy build times.  Note that an optional `config` input with the path to a [kind config file](https://kind.sigs.k8s.io/docs/user/configuration) can be used to customize your test cluster.
8. **Run chart-testing (install):** Runs [`helm install`](https://helm.sh/docs/helm/helm_install) and [`helm test`](https://helm.sh/docs/helm/helm_test).  Ensures that your helm chart deploys successfully to a real Kubernetes cluster.  Also runs the helm chart's tests which are helm hooks that can run all kinds of functional tests against your chart release in a real environment.   See  [`ct install`](https://github.com/helm/chart-testing/blob/main/doc/ct_install.md).
9. **Run chart-testing (upgrade):** Same as above, except it validates tests will pass after upgrading a chart that has an existing release (of the chart's previous version).  This provides extra protection for problems that wouldn't arise on a chart's initial release but occur on subsequent releases.

## Step 3: Verify by changing a chart and creating a pull request
Everything should be in place now to lint and test changes to any helm charts in the repo, the last thing to do is verify things are working as expected.  First, we can make a small change to the existing helm chart on our local `main` branch and ensure the branch protection rule will prevent pushing the change directly to the remote `main` branch.  I'll just add an innocuous additional label to the Service created by the helm chart called `foo: bar`:
{% raw %}
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "macgruber.fullname" . }}
  labels:
    {{- include "macgruber.labels" . | nindent 4 }}
    foo: bar
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "macgruber.selectorLabels" . | nindent 4 }}
```
{% endraw %}
*Reference [charts/macgruber/templates/service.yaml](https://github.com/gerkElznik/helm-charts/commit/b03a6542f36c876e5e4669421bddf40bb46749b7)*

I'll also bump `version: 0.1.0` to `version: 0.1.1` in [`Chart.yaml`](https://github.com/gerkElznik/helm-charts/blob/main/charts/macgruber/Chart.yaml).

Then I will try pushing this change:
```console
$ git add . 
$ 
$ git commit -m "Add innocuous foo label and bump chart version"
[main 055d4d0] Add innocuous foo label and bump chart version
 1 file changed, 1 insertion(+), 1 deletion(-)
$ 
$ git push                                                      
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 8 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (5/5), 494 bytes | 494.00 KiB/s, done.
Total 5 (delta 2), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To github.com:gerkElznik/helm-charts.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'github.com:gerkElznik/helm-charts.git'
```

Success!  We protected ourselves from being able to push directly to the `main` branch.  Let's try that again by using a non-protected branch:
```console
$ git branch newlabel 
$ 
$ git reset --keep HEAD~1
$ 
$ git checkout newlabel
Switched to branch 'newlabel'
$ 
$ git push --set-upstream origin newlabel
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 8 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (5/5), 494 bytes | 494.00 KiB/s, done.
Total 5 (delta 2), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
remote: 
remote: Create a pull request for 'newlabel' on GitHub by visiting:
remote:      https://github.com/gerkElznik/helm-charts/pull/new/newlabel
remote: 
To github.com:gerkElznik/helm-charts.git
 * [new branch]      newlabel -> newlabel
Branch 'newlabel' set up to track remote branch 'newlabel' from 'origin'.
```

This time it worked pushing to a non-protected branch.  Now open a pull request merging the `newlabel` branch into the `main` branch.  We should see our `Lint and Test Charts` automatically run, but notice it failed:

![Failed Pull Request Check](/assets/images/github-pull-request-failed.png "Failed Pull Request Check")

If we look at the `Details` we see that we violated one of our linting rules to ensure that a maintainer has been added to the chart.

![Failed Linting](/assets/images/github-linting-failed.png "Failed Linting")

To resolve this, I added the following to my `Chart.yaml` and pushed it to the remote `newlabel` branch:
```yaml
maintainers:
- name: gerkElznik
  email: 69826913+gerkElznik@users.noreply.github.com
```

Once the change is pushed, the pull request will automatically re-run the `Lint and Test Charts` workflow, this time successfully:

![Succeeded Linting and Testing](/assets/images/github-linting-testing-succeeded.png "Succeeded Linting and Testin")

Notice that in less than three minutes we were able to spin up our local Kubernetes cluster, perform a fresh install of our new chart version, and perform an install of the previous chart version followed by an upgrade to the new chart version.

## In Conclusion
After accidentally creating a release for my helm chart that was in a bad state and failed to install, I decided it was necessary to add some quality gates that would protect me from myself -- as the old proverb says, *"to err is human"* -- by protecting the main line of code and requiring pull requests to be used I was able to force changes to my helm charts to pass linting and testing, ensuring they can be successfully released to a real Kubernetes environment before risking polluting my teammate's code or releases that others depend on with bugs or mistakes.

If you enjoyed this post I'd [appreciate some claps](https://medium.com/@gerkElznik/pull-request-quality-gates-for-helm-charts-6e56cecb3) for it over on Medium!
