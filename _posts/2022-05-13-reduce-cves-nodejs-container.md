---
layout: single
title:  "Reduce CVEs in your containerized Node.js app using a *Distroless* base image"
date:   2022-05-13 12:00:00 -0600
classes: wide
header:
  teaser: assets/images/distroless-images.png
excerpt: Compare the number of CVEs found in the official Node.js base image versus Google's distroless Node.js base image
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
- Use ***Debian***.  When it comes to Node (again, at the time of this writing), Alpine isn't considered as stable as Debian and is not supported by the Node.js team.
- Use ***Bullseye***.  Bullseye is the code word for Debian 11, which is the latest release for the Debian distro at the time of writing and will have the most up-to-date package manager and least CVEs.
- Use ***Slim***.  The slim versions are generally just a good way to reduce the bloat.

The above decisions dictate that we will use:

```console
docker pull node:16.15.0-bullseye-slim
```

---

When it comes to [Google's distroless](https://github.com/GoogleContainerTools/distroless) Node.js image, unfortunately, they don't provide deterministic tags down to the patch level of Node, so we'll have to pin to the latest sha256 hash of the image for Node 16 and Debian 11 for our comparison, at the time of writing, for [`nodejs-debian11`](https://console.cloud.google.com/gcr/images/distroless/global/nodejs-debian11), that is:

```console
docker pull gcr.io/distroless/nodejs-debian11@sha256:2b0fe69900014a74bc85fd4588e86b90139777a8fa7e2feea1f14447ea82e651
```

## Compare the two

Now that we've pulled the images we want to compare, we can use [Trivy](https://github.com/aquasecurity/trivy) to scan the images for CVEs.  You can install trivy as a CLI tool for your operating system and check the version using `trivy --version`.  Here is the version I'm using for this article:

```console
$ trivy --version
Version: 0.27.1
Vulnerability DB:
  Version: 2
  UpdatedAt: 2022-05-13 12:07:05.183041398 +0000 UTC
  NextUpdate: 2022-05-13 18:07:05.183041198 +0000 UTC
  DownloadedAt: 2022-05-13 16:25:10.388442 +0000 UTC
```

Now we can scan the official Node.js image, taking note of the summarized count of CVEs discovered, shown on line 9:

{% highlight console linenos %}
$ trivy image node:16.15.0-bullseye-slim
2022-05-13T10:25:58.045-0600	INFO	Detected OS: debian
2022-05-13T10:25:58.045-0600	INFO	Detecting Debian vulnerabilities...
2022-05-13T10:25:58.065-0600	INFO	Number of language-specific files: 1
2022-05-13T10:25:58.065-0600	INFO	Detecting node-pkg vulnerabilities...

node:16.15.0-bullseye-slim (debian 11.3)
========================================
Total: 77 (UNKNOWN: 0, LOW: 61, MEDIUM: 3, HIGH: 12, CRITICAL: 1)
...output redacted for brevity
{% endhighlight %}

So as we can see, even our latest/greatest supported tag option from the Node.js official image has one *Critical* CVE (CVE-2022-1292) and 12 *High* CVEs.

Now let's compare this to the latest distroless Node.js image:

{% highlight console linenos %}
$ trivy image gcr.io/distroless/nodejs-debian11
2022-05-13T11:53:20.702-0600	INFO	Detected OS: debian
2022-05-13T11:53:20.702-0600	INFO	Detecting Debian vulnerabilities...
2022-05-13T11:53:20.710-0600	INFO	Number of language-specific files: 0

gcr.io/distroless/nodejs-debian11 (debian 11.3)
===============================================
Total: 14 (UNKNOWN: 0, LOW: 11, MEDIUM: 0, HIGH: 1, CRITICAL: 2)
...output redacted for brevity
{% endhighlight %}

I was a little surprised by the result here.  We see that distroless has 2 *Critical* CVEs, but upon inspection, it was actually the same CVE-2022-1292, it just exists in two different libraries, openssl and libssl1.1, so is counted twice -- whereas the official Node.js image only has the vulnerability in the libssl1.1 library and it doesn't contain openssl.  Otherwise, as I expected the distroless image has fewer CVEs at 14 compared to 77.  Also, the official Node.js image came in at 187MB, whereas the distroless image was a lighter 109MB.

## In Conclusion
Upon comparing the official Node.js base image to Google's distroless Node.js base image, we can see the distroless image is lighter weight and more secure.  You should still test and verify that the given image would provide a stable runtime for your particular Node.js application though. Also, given the nature of the distroless image it will not be as useful for development and testing scenarios:

> "Distroless" images contain only your application and its runtime dependencies. They do not contain package managers, shells or any other programs you would expect to find in a standard Linux distribution.

This means you will likely need to make your Dockerfile a little more complex and difficult to maintain and add additional *stages* that will satisfy your development and testing needs -- these dev/test stages will still use the official Node.js base image, you will just use the distroless base image for your final production stage (see Docker's [multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/)).  Also, be sure that between the two base images, the versions of Debian and Node are as in-sync as possible between the stages used for dev/test and the final production stage.  If you're concerned that the additional maintenance required to keep these multiple stages in sync will get overlooked and the risk from inconsistencies outweighs the security benefits of *distroless* then this option may not be for you.

If you enjoyed this post I’d [appreciate some claps for it over on Medium](https://medium.com/@gerkElznik/reduce-cves-in-your-containerized-node-js-app-using-a-distroless-base-image-6caca3505a1b) where you can [follow me](https://medium.com/@gerkElznik) for more of the same.
