(function(){
  const createStickyCta = () => {
    if (document.querySelector('[data-sticky-cta]')) return;
    const dock = document.createElement('div');
    dock.className = 'sticky-cta';
    dock.dataset.stickyCta = 'true';
    dock.setAttribute('aria-label', 'Ações rápidas do Studio 23');

    const portfolio = document.createElement('a');
    portfolio.href = '/portfolio/';
    portfolio.textContent = 'Portfólio';

    const agendar = document.createElement('a');
    agendar.href = '/agendar/';
    agendar.className = 'primary';
    agendar.textContent = 'Agendar';

    dock.append(portfolio, agendar);
    document.body.appendChild(dock);
  };

  document.addEventListener('DOMContentLoaded', () => {
    createStickyCta();

    const trigger = document.querySelector('[data-cta-trigger]');
    if (trigger) {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const path = trigger.getAttribute('href');
        if (path) window.location.href = path;
      });
    }
  });
})();
