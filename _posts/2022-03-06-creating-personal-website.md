---
layout: single
title:  "Creating a Personal Website Using GitHub Pages"
date:   2022-03-26 10:23:45 -0700
classes: wide
# categories:
#   - blogging
header:
#   image: assets/images/github-pages-jekyll.jpg
  teaser: assets/images/github-pages-jekyll.jpg
excerpt: Learn why you should consider using GitHub Pages to host your personal website, including instructions to get started, and this site as an example
---

## Background
As an avid reader of technology blog posts on [Medium](https://medium.com), I’ve learned so much from the writings of others, I’ve made advancements in my career that are undoubtedly thanks to the information and insights I’ve gleaned from the community, and now I find myself inspired to begin a writing journey of my own so that I might contribute to the growth of others in a similar fashion.  I find that my favorite blog posts are generally the ones that act as tutorials to build a simple demo, and for these Medium is not enough on its own.  Just as I advocate on the job to store one’s work in version control, to have a single source of truth, I desire the same for the blog posts I will be writing.  If Medium were to suddenly vanish, I want to have a backup of all my work.  Also, given that I intend for many of my posts to link to an accompanying git repo that can easily be cloned by readers wanting to follow along or start where I left off and tinker with things, I realized a git hosting solution was of paramount importance to be able to share my work.

Enter [GitHub](https://github.com).  Public GitHub repositories and [GitHub Gists](https://gist.github.com) are probably the most well-known and trusted of their kind, and when combined with [GitHub Pages](https://pages.github.com/) I can quickly set up a personal blog site linked to the accompanying code that a reader can use to follow along and obtain valuable hands-on experience.  For example, all of the source code and configuration used to develop, build, deploy, and host this site can be examined from this one [repo](https://github.com/gerkElznik/gerkElznik.github.io), even the [source code](https://raw.githubusercontent.com/gerkElznik/gerkElznik.github.io/main/_posts/2022-03-06-creating-personal-website.md) behind this very post.

Creating a personalized brand allowing others to identify my linked work is also important to me, and with GitHub Pages being tied to my GitHub account and profile, I’m able to use my recognizable **Gerk Elznik** identity so that others can easily identify my work across platforms.

## Setting up GitHub Pages
GitHub Pages relies on Jekyll, which allows me to author my blog posts in [markdown](https://www.markdownguide.org) and commit my changes with `git`, giving me peace of mind that I’ll always have an original copy of my work in my possession with all the version history preserved.

You can follow the [getting started instructions](https://pages.github.com/) to set up your site using GitHub Pages. Make sure your repository name is `[your-username].github.io`, this will end up being the base URL of your website.  After working through the steps, you will have a bare-bones website with "Hello World" in an index.html.  From here you’ll want to assess how you can use Jekyll to further customize your site.

## Setting up my Development Environment
Rather than writing a whole bunch of HTML, Jekyll allows us to use markdown, which has become somewhat of the de facto standard for writing static documentation and content in git repos that will render nicely when viewed in a browser.  In my opinion, it is easy on the eyes and allows for simple maintenance as it is written in plain text and without too much fuss it allows you to add basic formatting with headers, lists, tables, images, links, and more.

Once you get going, you’ll soon run into the desire to add some custom styling to your site, but if you’re like me and your objective is not to work on your design and CSS skills then you’ll likely just want to add an existing [Jekyll theme](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-a-theme-to-your-github-pages-site-using-jekyll) as opposed to writing much of your own styling.  I found the documentation for this to be a little lacking, and this is where I squandered a good deal of time evaluating my options.

The built-in Theme Chooser under the GitHub Settings for Pages did not quite have what I was looking for, I briefly evaluated the Architect theme but decided it would still leave too much of the site's styling up to me.  I was mainly looking for these four things from a theme:
- A simple and clean way to set up my personal branding including a picture and bio so that visitors will recognize me.
- Attractive and prominent links to my various social media accounts.
- A page for listing my blog posts that would link to another page for the actual post.
- A page listing my projects in a gallery view with pictures and links for each project.

After browsing a few different sites with free and paid Jekyll themes like this [one](https://jekyllthemes.io), I decided that [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes) looked the best out of the ones that covered my above criteria.  The site has a quick-start guide and documentation that I found worth reading through and following along with in order to get moving.

I was new to Jekyll as well as Ruby (Jekyll is a Ruby Gem), so the instructions sent me on a journey to learn about these dependencies first.  I’m the type of person who enjoys learning new things so this didn’t bother me, but if you’re not looking to spend much time in this area, I would recommend simply selecting one of the GitHub Pages themes using the built-in Theme Chooser.

Since I work on a Mac, installing Ruby could be as simple as `brew install ruby`, but being a fan of twelve-factor app practices, specifically concerning [dependencies](https://12factor.net/dependencies), I felt the need to use a version manager that would allow me to pin the version of Ruby in my project’s directory and manage it independently of my system-wide installation.  For this, I chose [rbenv](https://github.com/rbenv/rbenv) and installed the latest version of Ruby local to my project’s repo.  Then with my local version of Ruby active, I was able to `gem install bundler jekyll`.  [Bundler](https://bundler.io) along with a `Gemfile` and `Gemfile.lock` are also important for consistent dependency management and following twelve-factor app practices.

Finally I could simply run `bundle exec jekyll serve --livereload` to locally serve my website with hot-reload enabled, providing a fast feeback loop to start tinkering with things.

## Making your site Personal
The most important file concerning your theme is `_config.yml`, which will be at the root of your directory.  If you also went with the Minimal Mistakes theme and followed the quick-start instructions, then you’ll have a bunch of default values set in it which should give you a decent idea of the out-of-the-box personalization you can make.  I went down the list, setting my values for things like my bio, images, google analytics, social media links, and more.  I recommend taking a look at [mine](https://github.com/gerkElznik/gerkElznik.github.io/blob/main/_config.yml) and comparing it to my site to spot which settings control which pieces of content.  Other files of interest may be [`_includes/analytics-providers/google-gtag.html`](https://github.com/gerkElznik/gerkElznik.github.io/blob/main/_includes/analytics-providers/google-gtag.html) where I added my global site tag for [Google Analytics](https://marketingplatform.google.com/about/analytics) and [`_includes/head/custom.html`](https://github.com/gerkElznik/gerkElznik.github.io/blob/main/_includes/head/custom.html) where I added links for favicons.

## Alternatives
I evaluated some alternatives for hosting my personal website besides GitHub Pages.  [Netlify](https://www.netlify.com) was one such alternative, [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/) was another, as well as using the static site hosting capabilities of [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) or [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website).  While I have some experience with the latter two as well as experience with front-end JavaScript frameworks for SPAs like [Create React App](https://create-react-app.dev) and [Vue CLI](https://cli.vuejs.org/#getting-started), I felt all of these options would be overkill as I don’t plan on doing things like calling APIs and needing a reactive front-end.  Jekyll wasn’t a technology I was clamoring to learn, it is less likely to be beneficial to my career than honing my skills with these alternatives, but ultimately, I was looking for a solution that would require the least effort to add new site content or change existing site content; for that, I felt GitHub Pages and Jekyll were the winners.

## In Conclusion
Using GitHub Pages to build a personal website and distinguish yourself with a recognizable identity and external brand in your communities of interest is a worthwhile endeavor if you’re willing to spend some extra time setting things up.  You’ll end up with a public git repo that you can share with others and that will be the single source of truth for your work that you can always keep in your possession.  Jekyll requires a bit of initial ramp-up time, but I like the simplicity of writing my blog posts in markdown.  GitHub Actions will handle building and deploying changes committed to your repo, but it is also well worth setting up your local development environment to enable a fast feedback loop as you tinker with your site.  After your content is published to your personal blog site, you can export it to an aggregator such as Medium where it’s more likely to be discovered by others who can comment, clap, and support you.

Speaking of claps, if you enjoyed this post I'd [appreciate some claps](https://medium.com/@gerkElznik) for it over on Medium!
