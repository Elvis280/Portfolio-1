/* =========================================
   ANIMATIONS JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for subtle scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Trigger slightly before element is fully visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, observerOptions);

  // Staggered animation for Hero elements on load
  const heroElements = document.querySelectorAll('.hero .animate-up, .hero .animate-fade-in');
  heroElements.forEach((el, index) => {
    el.style.transitionDelay = `${index * 150}ms`;
  });

  // Observe ALL animated elements across the page
  const allAnimatedElements = document.querySelectorAll('.animate-up, .animate-fade-in');
  allAnimatedElements.forEach(el => {
    observer.observe(el);
  });
});
