document.getElementById('year').textContent = new Date().getFullYear();

const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

hamburger.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
});

navMobile.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Transparent hanging-logo header -> compact solid header, once the
// page has scrolled roughly a third of the way past the hero (the
// middle of the requested 200-300px range).
const siteHeader = document.getElementById('siteHeader');
const SCROLL_THRESHOLD = 500;
function onScroll() {
  siteHeader.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
