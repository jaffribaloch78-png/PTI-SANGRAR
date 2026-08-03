// js/landing.js — hero-only interactions (dots / accessibility)
(function(){
  'use strict';

  // Dots behavior for hero (no console warnings, no nav manipulation)
  const dots = Array.from(document.querySelectorAll('.carousel-dots .dot'));
  if(!dots || dots.length === 0) return;

  function setActiveDot(idx){
    dots.forEach((d,i) => {
      const active = i === idx;
      d.classList.toggle('active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
      d.tabIndex = active ? 0 : -1;
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index,10) || 0;
      setActiveDot(idx);
    });
    dot.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); dot.click(); }
    });
  });

  // Initialize
  setActiveDot(0);

})();
