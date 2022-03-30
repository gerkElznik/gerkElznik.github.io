---
layout: single
title:  "Provision a free personal Helm chart repo using GitHub"
date:   2022-03-31 14:23:45 -0700
classes: wide
# tags:
#   - helm
#   - chart releaser
#   - github pages
header:
  teaser: assets/images/helm-loves-github-pages.png
excerpt: Learn why you should consider using GitHub to host your personal helm chart repo, including instructions to get started, and a real example
---
Who couldn't use their very own personal helm chart repository these days?  I know I sure could. But I know what you're thinking, *"welp, there's another fee periodically dinging me for something I rarely use -- I already haven't used my Peacock Plus subscription since I finished watching MacGruber months ago..."*, right?

![MacGruber](/assets/images/macgruber.jpg "Wrong")

Wrong.  Thanks to the building blocks GitHub provides us **free of charge** we can host our helm chart repo, we can store our Docker and OCI images, we can cut new releases, we can have an automated CI process for it all, and with the money we're saving we can even afford to hang on to that otherwise worthless Peacock Plus subscription until the next season of MacGruber drops!  Let's take a look at the building blocks first, and then step through an example(add link) you can follow along with to create your own:
- [GitHub Repo](https://docs.github.com/en/get-started/quickstart/create-a-repo) will store our code.
- [GitHub Pages](https://pages.github.com) will provide us with a public endpoint and a HTTP server for our chart repo.
- [GitHub Actions](https://docs.github.com/en/actions) will provide us with a pipleline that will orchestrate our automation.
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) will provide us with container registry capabilities and storage for our custom Docker images.
- [Chart Releaser](https://helm.sh/docs/howto/chart_releaser_action) is an open source [tool](https://github.com/helm/chart-releaser) that will make this all a breeze (and inspired this article).
- [GitHub Releases](https://github.com/helm/chart-releaser) will store our packaged chart releases.

## Step 1: Create a GitHub Repo to house everything
My intention is for this repo to be a central home for all of my personal helm charts, not just a single chart, so I’m going to create a new public repo generically named `helm-charts`, taking my inspiration from the [prometheus-community](https://github.com/prometheus-community/helm-charts) repo who keep the code for a multitude of charts in a single repo.  Also, for future reference, if you read the [documentation](https://helm.sh/docs/howto/chart_releaser_action) for Chart Releaser which we'll be using in a bit, it instructs us to create a branch in our new repo explicitly named `gh-branch` used by GitHub Pages, and also in the `main` branch to keep our charts in a directory explicitly named `charts`.

Clone the empty repo we just created:
```console
git clone https://github.com/gerkElznik/helm-charts.git && cd helm-charts
```

## Step 2: Set up GitHub Pages
Create the `gh-pages` branch (it will have separate content and lineage than the main branch and they're never intended to be merged):
```console
git checkout --orphan gh-pages
git rm -rf .
git commit -m "Initial commit" --allow-empty
git push
```

## Step 3: Bring it all together in a CI pipeline using GitHub Actions

## Step 4: Verify the end user experience
