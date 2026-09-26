source "https://rubygems.org"

# Keep Jekyll and its plugins compatible with GitHub Pages.
gem "github-pages", "~> 232", group: :jekyll_plugins
gem "jekyll-include-cache", "~> 0.2.1", group: :jekyll_plugins

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows, :jruby do
  gem "tzinfo", "~> 2.0"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.2.0", platforms: :windows

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Required by Jekyll's development server on modern Ruby.
gem "webrick", "~> 1.9", ">= 1.9.1"
