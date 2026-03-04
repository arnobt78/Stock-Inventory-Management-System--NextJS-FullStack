/**
 * Scroll Control Utility
 * Prevents scroll bounce and controls scroll restoration on page load
 */

if (typeof window !== "undefined") {
  // Disable scroll restoration
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  // Prevent overscroll bounce
  document.documentElement.style.overscrollBehavior = "none";
  document.body.style.overscrollBehavior = "none";

  // Reset scroll position on load
  window.addEventListener("beforeunload", () => {
    window.scrollTo(0, 0);
  });

  // Ensure we start at top on page load
  window.addEventListener("load", () => {
    window.scrollTo(0, 0);
  });
}

export {};
