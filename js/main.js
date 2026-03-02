const services = [
  {
    id: 'solo',
    name: 'Pilates Solo',
    description: 'Aula personalizada com foco em postura, força e mobilidade.',
    duration: '50 min',
    price: '€45 / aula'
  },
  {
    id: 'equipamentos',
    name: 'Pilates Máquinas',
    description: 'Sessões com Reformer e Cadillac para resultados rápidos e seguros.',
    duration: '50 min',
    price: '€55 / aula'
  },
  {
    id: 'grupo',
    name: 'Aulas em Grupo',
    description: 'Treinos em grupo reduzido (até 6 pessoas), motivadores e dinâmicos.',
    duration: '55 min',
    price: '€22 / aula'
  }
];

function renderServices(targetId, showConditions = false) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = services.map((service) => `
    <article class="card">
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <p><strong>Duração:</strong> ${service.duration}</p>
      <p class="price">${service.price}</p>
      ${showConditions ? '<p class="small">Condições: packs mensais e semestrais com desconto. Valores podem ser editados diretamente em <code>js/main.js</code>.</p>' : ''}
    </article>
  `).join('');
}

function markActiveLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

renderServices('services-grid');
renderServices('plans-grid', true);
markActiveLink();
