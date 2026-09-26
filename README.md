# Gerk Elznik's Personal Project & Blog Portfolio

Built with Jekyll and hosted at <https://gerkElznik.github.io> on GitHub Pages.

## Local development

Install [mise](https://mise.jdx.dev/getting-started.html), then run:

```bash
git clone https://github.com/gerkElznik/gerkElznik.github.io.git
cd gerkElznik.github.io
mise trust
mise install
mise run dev
```

Open <http://localhost:4000>. Live reload is enabled; restart the server after
editing `_config.yml`. Builds need network access to download the remote theme.

`mise.toml` pins Ruby and defines the project tasks. Bundler manages Jekyll and
the site's gems using `Gemfile.lock`, including its `BUNDLED WITH` version.
Tasks install missing gems automatically, so a separate `bundle install` is
usually unnecessary. Shell activation is optional when using `mise run`.

## Tasks

| Command | Purpose |
| --- | --- |
| `mise run setup` | Install missing gems from the lockfile |
| `mise run dev` | Preview with live reload (`serve` is an alias) |
| `mise run build` | Build `_site` with `JEKYLL_ENV=production` |
| `mise run check` | Build the production site, then run Jekyll diagnostics |
| `mise run clean` | Remove generated output and Jekyll caches |
| `mise tasks` | List available tasks |

Pass Jekyll options directly to the build or preview task:

```bash
mise run dev --drafts --port 4001
mise run build --future
```

## Dependency updates

The site uses GitHub Pages' built-in Jekyll build. Its latest `github-pages`
bundle (232) pins Jekyll to 3.10.0 and requires a CommonMarker release that does
not support Ruby 4. Ruby is therefore pinned to the latest compatible 3.4 release.

Change the Ruby version in `mise.toml`, then run `mise install` and
`mise run check`. Keep gem dependencies in `Gemfile` and commit changes to
`Gemfile.lock` alongside dependency updates. For example:

```bash
mise exec -- bundle update --all
mise run check
mise exec -- bundle outdated --strict
```

Minimal Mistakes is pinned with `remote_theme` in `_config.yml`. Templates,
styles, and JavaScript come from that release; local overrides retain the
custom footer, favicons, share buttons, UI text, and styles in
`assets/css/main.scss`. When upgrading the theme, review those overrides
against the new release. Font Awesome is pinned in `_includes/head.html`.
