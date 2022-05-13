---
layout: single
title:  "Reduce CVEs in your Node.js container using *Distroless*"
date:   2022-05-08 12:00:00 -0600
classes: wide
header:
  teaser: assets/images/distroless-images.png
excerpt: Compare the number of CVEs found in the official Node.js base image vs. Google's distroless image
---

When creating a production-ready container image for a Node.js application, you have many options and considerations, the first of which might be the base image to use.  You'll want the runtime to have everything it needs to be stable, but at the same time, you'll want to remove any unnecessary bloat that will make your app less secure as well as a bigger burden to transport around.

{% include figure class="align-center text-center" image_path="/assets/images/distroless-images.png" alt="Distroless Images" caption="[**Photo credit: learnk8s.io**](https://learnk8s.io/blog/smaller-docker-images)" %}

## Get the base images

Understandably, the first place you might look to is Docker Hub's [official Node.js image](https://hub.docker.com/_/node) where you'll peruse its supported tags and make decisions on things like:
- What Node version to use?
- Which linux distro (OS) to use, alpine or debian?
- What version of the linux distro (OS) to use?
- Will "slim" images work?

The purpose of this article is to compare the "official Node.js image" with Google's distroless image for Node.js, so let us assume for the sake of comparison that for the official Node.js image we decided:
- Use Node ***16.15.0***.  We should always choose even numbers with Node because those are the long-term support (LTS) versions, and at the time of this writing Node 18 is still a few months away from being promoted to LTS.  Also, pinning all the way to the patch level of the version ensures consistent, reproducible builds and tests.
- Use ***Debian***.  When it comes to Node (again, at the time of this writing), Alpine isn't considered as stable and is not supported by the Node.js team.
- Use ***Bullseye***.  Bullseye is the code word for Debian 11, which is the latest release for this distro at the time of writing and will have the most up-to-date package manager and least CVEs.
- Use ***Slim***.  The slim versions are generally just a good way to reduce the bloat.

The above decisions dictate that we will use:

```console
docker pull node:16.15.0-bullseye-slim
```

When it comes to Google's distroless Node.js image, unfortunately they don't provide deterministic tags down to the patch level of Node, so we'll have to pin to the sha256 hash of the image for Node 16 and Debian 11 for our comparison -- at the time of writing, for [`nodejs-debian11`](https://console.cloud.google.com/gcr/images/distroless/global/nodejs-debian11) that is:

```console
docker pull gcr.io/distroless/nodejs-debian11@sha256:2b0fe69900014a74bc85fd4588e86b90139777a8fa7e2feea1f14447ea82e651
```

---

## Compare the two

Now that we've pulled the images we want to compare, we can use [Trivy](https://github.com/aquasecurity/trivy) to scan the images for CVEs.  Install trivy for your operating system, here is the version I'm using for this article:

```console
$ trivy --version
Version: 0.27.1
Vulnerability DB:
  Version: 2
  UpdatedAt: 2022-05-13 12:07:05.183041398 +0000 UTC
  NextUpdate: 2022-05-13 18:07:05.183041198 +0000 UTC
  DownloadedAt: 2022-05-13 16:25:10.388442 +0000 UTC
```

Now we can scan the official Node.js image:

```console
$ trivy image node:16.15.0-bullseye-slim
2022-05-13T10:25:58.045-0600	INFO	Detected OS: debian
2022-05-13T10:25:58.045-0600	INFO	Detecting Debian vulnerabilities...
2022-05-13T10:25:58.065-0600	INFO	Number of language-specific files: 1
2022-05-13T10:25:58.065-0600	INFO	Detecting node-pkg vulnerabilities...

node:16.15.0-bullseye-slim (debian 11.3)
========================================
Total: 77 (UNKNOWN: 0, LOW: 61, MEDIUM: 3, HIGH: 12, CRITICAL: 1)
```

So even our latest/greatest supported tag option from the Node.js official image has one *Critical* CVE (CVE-2022-1292) and 12 *High* CVEs.  Now let's compare this to the latest distroless Node.js image:

```console
$ trivy image gcr.io/distroless/nodejs-debian11
2022-05-13T11:53:20.702-0600	INFO	Detected OS: debian
2022-05-13T11:53:20.702-0600	INFO	Detecting Debian vulnerabilities...
2022-05-13T11:53:20.710-0600	INFO	Number of language-specific files: 0

gcr.io/distroless/nodejs-debian11 (debian 11.3)
===============================================
Total: 14 (UNKNOWN: 0, LOW: 11, MEDIUM: 0, HIGH: 1, CRITICAL: 2)
```

I was a little surprised to see Trivy tell us that distroless has 2 *Critical* CVEs, but upon inspection, it was actually the same CVE-2022-1292, but it existed in two different libraries, openssl and libssl1.1, whereas the official Node.js image only has it in the libssl1.1 library.  Otherwise, as I expected the distroless image has fewer CVEs.  The official Node.js image came in at 187MB, whereas the distroless image was a lighter 109MB.

## In Conlusion
Upon comparing the official Node.js base image to Google's distroless Node.js base image, we can see that distroless is lighter weight and more secure.  You should still test and verify that the given image would provide a stable runtime for your particular Node.js application though. Also, given the nature of the distroless container it will not be as useful for development and testing scenarios:

> "Distroless" images contain only your application and its runtime dependencies. They do not contain package managers, shells or any other programs you would expect to find in a standard Linux distribution.

This means you will likely need to make your Dockerfile a little more complex and difficult to maintain with more stages that satisfy your development and testing needs using the official Node.js base image, and only use distroless in your final production stage, and be sure to keep versions of debian and Node as in-sync as possible.
