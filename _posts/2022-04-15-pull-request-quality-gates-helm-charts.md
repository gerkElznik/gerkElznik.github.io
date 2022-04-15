---
layout: single
title:  "Pull request quality gates for Helm charts"
date:   2022-04-15 11:00:00 -0600
classes: wide
header:
  teaser: assets/images/helm.png
excerpt: Learn about adding CI pipeline quality gates to lint and test your helm charts during a pull request
---
If you're practicing continuous integration and continuous delivery it's a good idea to test *actually deploying* your changes during a pull request, to ensure they're production-ready, before you've merged them in with the main line of code.  At this point, a mistake that breaks something hasn't necessarily caused any problems for your co-workers and the reasoning behind your changes will still be fresh in your head.

The challenging aspect about testing an actual deployment is that it requires a *target environment* to be running and ready which can be too time consuming to seem feasible for every pull request -- you also want the test environment to have as much parity with your production environment as possible or else the value of the tests will diminish the more disparate they are.

Fortunately, when we're working with Kubernetes, there are a growing number of options to quickly spin up a local cluster with high feature parity to that of your production cluster.  This article will demonstrate one such option by using [`kind`](https://kind.sigs.k8s.io) in a CI pipeline (we'll use GitHub Actions but `kind` could be used in any CI tool that has Docker available).  In my previous article I demonstrated how to [*Provision a free personal Helm chart repo using GitHub*](https://gerkelznik.github.io/provision-personal-helm-chart-repo/); we'll now continue where it left off and see how to add automated **linting** and **testing** of our charts on every pull request -- the tests will utilize a disposable `kind` cluster as a fully-functional Kubernetes environment.

