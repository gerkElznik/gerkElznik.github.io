// Open social profiles in a new tab, keeping the site available.
document
  .querySelectorAll(".author__urls a[rel~='me'], .page__footer-follow a[rel~='nofollow']")
  .forEach((link) => {
    link.target = "_blank";
  });

// Keep the sidebar and anchor destinations below the header at every screen size.
const masthead = document.querySelector(".masthead");
if (masthead) {
  const updateMastheadHeight = () => {
    document.documentElement.style.setProperty("--masthead-height", `${masthead.offsetHeight}px`);
  };
  updateMastheadHeight();
  new ResizeObserver(updateMastheadHeight).observe(masthead);

  // Native anchor scrolling respects scroll-padding and reduced-motion settings.
  document.querySelectorAll("a[href*='#']").forEach((link) => {
    link.setAttribute("data-scroll-ignore", "");
  });
}
