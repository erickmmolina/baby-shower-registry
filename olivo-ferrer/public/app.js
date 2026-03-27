// ─── State ───
let gifts = [];
let activeCat = 'all';
let activeFilter = 'all';
let activeSort = 'none';
let selectedGiftId = null;

const catLabels = {
  all: 'Todos',
  ropa: 'Ropa',
  accesorios: 'Accesorios',
  alimentacion: 'Alimentación',
  dormitorio: 'Dormitorio',
  higiene: 'Higiene'
};

const catEmojis = {
  ropa: '👕',
  accesorios: '🎒',
  alimentacion: '🍽',
  dormitorio: '🛏',
  higiene: '🛁',
  otros: '🎁'
};

const fmt = n => n.toLocaleString('es-CL');

// ─── Init ───
document.addEventListener('DOMContentLoaded', async () => {
  createStars();
  startCountdown();
  setupFilterListeners();
  setupSortListeners();
  await loadGifts();
  await loadEvent();
});

// ─── Countdown ───
function startCountdown() {
  const target = new Date('2026-04-25T14:30:00-04:00').getTime();
  const container = document.getElementById('countdown');

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      container.outerHTML = '<div class="countdown-done">¡El gran día llegó!</div>';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ─── Celestial animations ───
function createStars() {
  const sl = document.getElementById('starsLayer');

  // Layered star field — dim distant stars + bright near stars
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('div');
    const isBright = Math.random() < .15;
    const isBlue = Math.random() < .2;
    const size = isBright ? 2 + Math.random() * 2 : 1 + Math.random();
    s.className = `star${isBright ? ' star--bright' : ''}${isBlue ? ' star--blue' : ''}`;
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${2+Math.random()*5}s;animation-delay:-${Math.random()*6}s;width:${size}px;height:${size}px`;
    sl.appendChild(s);
  }

  // Shooting stars
  createShootingStars();
}

function createShootingStars() {
  const container = document.getElementById('shootingStars');
  function launchStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.cssText = `top:${5+Math.random()*40}%;left:${10+Math.random()*60}%;animation:shoot ${.8+Math.random()*.6}s ease-out forwards`;
    container.appendChild(star);
    star.addEventListener('animationend', () => star.remove());
    setTimeout(launchStar, 3000 + Math.random() * 6000);
  }
  setTimeout(launchStar, 2000);
  setTimeout(launchStar, 5000);
}

// ─── Load gifts from API ───
async function loadGifts() {
  const grid = document.getElementById('giftGrid');
  grid.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Cargando regalitos...</div>';

  try {
    const res = await fetch('/api/gifts');
    gifts = await res.json();
    buildCatTabs();
    renderGifts();
  } catch (e) {
    grid.innerHTML = '<div class="empty-state">Error al cargar los regalos. Intenta recargar la página.</div>';
  }
}

// ─── Build category tabs from data ───
function buildCatTabs() {
  const cats = ['all', ...new Set(gifts.map(g => g.cat))];
  const container = document.getElementById('catTabs');
  container.innerHTML = cats.map(c => {
    const emoji = c === 'all' ? '' : (catEmojis[c] || '🎁') + ' ';
    const label = catLabels[c] || c.charAt(0).toUpperCase() + c.slice(1);
    return `<button class="cat-btn${c === activeCat ? ' active' : ''}" data-cat="${c}">${emoji}${label}</button>`;
  }).join('');

  container.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat;
      container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGifts();
    });
  });
}

// ─── Filter listeners ───
function setupFilterListeners() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGifts();
    });
  });
}

// ─── Sort listeners ───
function setupSortListeners() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sort = btn.dataset.sort;
      if (activeSort === sort) {
        activeSort = 'none';
        btn.classList.remove('active');
      } else {
        activeSort = sort;
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      renderGifts();
    });
  });
}

// ─── Render gift cards ───
function renderGifts() {
  const grid = document.getElementById('giftGrid');
  const filtered = gifts.filter(g => {
    const catOk = activeCat === 'all' || g.cat === activeCat;
    const isReserved = g.status === 'Ya elegido';
    const filterOk = activeFilter === 'all' || (activeFilter === 'available' ? !isReserved : isReserved);
    return catOk && filterOk;
  });

  if (activeSort === 'asc') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (activeSort === 'desc') filtered.sort((a, b) => (b.price || 0) - (a.price || 0));

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No hay regalos en esta categoría</div>';
    return;
  }

  grid.innerHTML = filtered.map(g => {
    const isReserved = g.status === 'Ya elegido';
    const emoji = catEmojis[g.cat] || '🎁';
    const claimedName = g.claimedBy ? `${g.claimedBy.nombre} ${g.claimedBy.apellido}` : '';

    const hasImg = g.image && g.image.startsWith('http');
    const imgSrc = hasImg ? `/api/img?url=${encodeURIComponent(g.image)}` : '';

    return `
      <div class="gift-card${isReserved ? ' reserved' : ''}">
        <div class="gift-img-wrap${hasImg ? '' : ' no-img'}">
          ${hasImg
            ? `<img src="${imgSrc}" alt="${g.name}" loading="lazy" onerror="this.parentElement.classList.add('no-img');this.remove();this.parentElement.innerHTML='<span class=gift-emoji>${emoji}</span>'+this.parentElement.innerHTML">`
            : `<span class="gift-emoji">${emoji}</span>`}
          ${g.priority ? `<span class="gift-priority">${g.priority === 'alta' ? 'Prioridad alta' : g.priority}</span>` : ''}
          <span class="gift-cat-badge">${catLabels[g.cat] || g.cat}</span>
        </div>
        <div class="gift-body">
          <div class="gift-store">${g.store || ''}</div>
          <div class="gift-name">${g.name}</div>
          <div class="gift-desc">${g.description || ''}</div>
          ${isReserved && claimedName ? `<div class="gift-claimed-by">Elegido por ${claimedName}</div>` : ''}
          <div class="gift-footer">
            <div class="gift-price">${g.price ? `<small>CLP $</small>${fmt(g.price)}` : ''}</div>
            <div class="gift-actions">
              ${g.link1 ? `<a class="btn-link" href="${g.link1}" target="_blank" rel="noopener">Ver</a>` : ''}
              <button class="btn-reserve" onclick="openClaimModal(${g.id})" ${isReserved ? 'disabled' : ''}>
                ${isReserved ? 'Elegido' : 'Elegir'}
              </button>
              ${g.link1 && !isReserved ? `<button class="btn-share" onclick="shareGift(${g.id})" title="Compartir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></button>` : ''}
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ─── Load event info ───
async function loadEvent() {
  try {
    const res = await fetch('/api/event');
    const ev = await res.json();
    document.getElementById('eventCards').innerHTML = `
      <div class="event-card">
        <div class="event-card-icon">📅</div>
        <div class="event-card-label">Fecha</div>
        <div class="event-card-value">${ev.date || 'Por confirmar'}</div>
      </div>
      <div class="event-card">
        <div class="event-card-icon">🕑</div>
        <div class="event-card-label">Hora</div>
        <div class="event-card-value">${ev.time || 'Por confirmar'}</div>
      </div>
      <div class="event-card">
        <div class="event-card-icon">📍</div>
        <div class="event-card-label">Lugar</div>
        <div class="event-card-value">${ev.location || ''}${ev.address ? '<br>' + ev.address : ''}</div>
        ${ev.mapLink ? `<br><a class="btn-maps" href="${ev.mapLink}" target="_blank" rel="noopener">Ver en Maps</a>` : ''}
      </div>
      <div class="event-card">
        <div class="event-card-icon">🧥</div>
        <div class="event-card-label">Dress Code</div>
        <div class="event-card-value">${ev.dressCode || 'Casual'}</div>
      </div>`;
  } catch (e) {
    console.error('Error cargando evento:', e);
  }
}

// ─── Modal helpers ───
function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  selectedGiftId = null;
}

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// ─── Claim gift modal ───
function openClaimModal(id) {
  selectedGiftId = id;
  const g = gifts.find(x => x.id === id);
  if (!g) return;

  openModal(`
    <h2 class="modal-title">Reservar regalo</h2>
    <p class="modal-sub">Completa tus datos para reservar <strong>${g.name}</strong> y que nadie más lo tome.</p>
    <div class="form-row">
      <div class="form-group"><label>Nombre *</label><input id="f-nombre" placeholder="Tu nombre"></div>
      <div class="form-group"><label>Apellido *</label><input id="f-apellido" placeholder="Tu apellido"></div>
    </div>
    <div class="form-group"><label>Email *</label><input id="f-email" type="email" placeholder="tu@email.com"></div>
    <div class="form-group"><label>Teléfono (opcional)</label><input id="f-tel" type="tel" placeholder="+56 9 xxxx xxxx"></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-confirm" id="btnConfirmClaim">Reservar</button>
    </div>
  `);

  document.getElementById('btnConfirmClaim').addEventListener('click', confirmClaim);
}

async function confirmClaim() {
  const nombre = document.getElementById('f-nombre').value.trim();
  const apellido = document.getElementById('f-apellido').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const telefono = document.getElementById('f-tel').value.trim();

  if (!nombre || !apellido || !email) {
    showFieldError('Por favor completa los campos obligatorios.');
    return;
  }

  const btn = document.getElementById('btnConfirmClaim');
  btn.disabled = true;
  btn.textContent = 'Reservando...';

  try {
    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ giftId: selectedGiftId, nombre, apellido, email, telefono })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Actualizar el regalo localmente
      const idx = gifts.findIndex(g => g.id === selectedGiftId);
      if (idx >= 0) gifts[idx] = data.gift;
      renderGifts();

      launchConfetti();

      openModal(`
        <div class="success-modal">
          <div class="success-icon">✓</div>
          <h2 class="success-title">¡Regalo reservado!</h2>
          <p class="success-msg">Gracias, <strong>${nombre}</strong>. Tu regalo está reservado. ¡Olivo y sus papás te lo agradecen!</p>
          <button class="btn-close" onclick="closeModal()">¡Listo!</button>
        </div>
      `);
    } else {
      showFieldError(data.error || 'Error al reservar. Intenta de nuevo.');
      btn.disabled = false;
      btn.textContent = 'Reservar';
    }
  } catch (e) {
    showFieldError('Error de conexión. Intenta de nuevo.');
    btn.disabled = false;
    btn.textContent = 'Reservar';
  }
}

// ─── Confetti ───
function launchConfetti() {
  const colors = ['#c9a96e', '#4a90d9', '#6ec9a9', '#f7f3ed'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  container.style.cssText = 'position:fixed;inset:0;z-index:2000;pointer-events:none;overflow:hidden';
  document.body.appendChild(container);

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const duration = 2 + Math.random() * 1.5;
    piece.style.cssText = `left:${left}%;background:${color};animation-duration:${duration}s;animation-delay:${delay}s`;
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 4000);
}

// ─── Share gift ───
async function shareGift(id) {
  const g = gifts.find(x => x.id === id);
  if (!g) return;
  const text = `Mira este regalo para el Baby Shower de Olivo: ${g.name}${g.price ? ` - $${fmt(g.price)}` : ''}`;
  const url = g.link1;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Baby Shower Olivo Ferrer', text, url });
    } catch (e) { /* user cancelled */ }
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' 👉 ' + url)}`, '_blank');
  }
}

function showFieldError(msg) {
  const existing = document.querySelector('.form-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'form-error';
  div.style.cssText = 'color:#e74c3c;font-size:.82rem;text-align:center;margin-bottom:10px';
  div.textContent = msg;
  document.querySelector('.modal-actions')?.insertAdjacentElement('beforebegin', div);
}

// ─── RSVP modal ───
function openRsvpModal(asiste) {
  openModal(`
    <h2 class="modal-title">${asiste ? '¡Qué alegría!' : 'Lamentamos que no puedas'}</h2>
    <p class="modal-sub">${asiste ? 'Confirma tus datos para que sepamos que vienes.' : 'Déjanos tus datos de todas formas.'}</p>
    <div class="form-row">
      <div class="form-group"><label>Nombre *</label><input id="r-nombre" placeholder="Tu nombre"></div>
      <div class="form-group"><label>Apellido</label><input id="r-apellido" placeholder="Tu apellido"></div>
    </div>
    <div class="form-group"><label>Email *</label><input id="r-email" type="email" placeholder="tu@email.com"></div>
    ${asiste ? `
      <div class="form-group">
        <label>¿Vienes con acompañantes?</label>
        <select id="r-acomp">
          <option value="0">Solo yo</option>
          <option value="1">+1 acompañante</option>
          <option value="2">+2 acompañantes</option>
          <option value="3">+3 acompañantes</option>
        </select>
      </div>` : ''}
    <div class="form-group"><label>Mensaje (opcional)</label><textarea id="r-msg" placeholder="Un mensajito para los papás..."></textarea></div>
    <input type="hidden" id="r-asiste" value="${asiste}">
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-confirm" id="btnConfirmRsvp">Confirmar</button>
    </div>
  `);

  document.getElementById('btnConfirmRsvp').addEventListener('click', confirmRsvp);
}

async function confirmRsvp() {
  const nombre = document.getElementById('r-nombre').value.trim();
  const apellido = document.getElementById('r-apellido')?.value.trim() || '';
  const email = document.getElementById('r-email').value.trim();
  const asiste = document.getElementById('r-asiste').value === 'true';
  const acompanantes = document.getElementById('r-acomp')?.value || '0';
  const mensaje = document.getElementById('r-msg')?.value.trim() || '';

  if (!nombre || !email) {
    showFieldError('Por favor completa nombre y email.');
    return;
  }

  const btn = document.getElementById('btnConfirmRsvp');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const res = await fetch('/api/rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido, email, asiste, acompanantes, mensaje })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      openModal(`
        <div class="success-modal">
          <div class="success-icon">${asiste ? '🎉' : '💙'}</div>
          <h2 class="success-title">${asiste ? '¡Confirmado!' : 'Gracias por avisarnos'}</h2>
          <p class="success-msg">${asiste
            ? `Gracias, <strong>${nombre}</strong>. ¡Te esperamos el 25 de Abril!`
            : `Gracias, <strong>${nombre}</strong>. Los acompañamos en espíritu.`
          }</p>
          <button class="btn-close" onclick="closeModal()">¡Listo!</button>
        </div>
      `);
    } else {
      showFieldError(data.error || 'Error al enviar. Intenta de nuevo.');
      btn.disabled = false;
      btn.textContent = 'Confirmar';
    }
  } catch (e) {
    showFieldError('Error de conexión. Intenta de nuevo.');
    btn.disabled = false;
    btn.textContent = 'Confirmar';
  }
}
