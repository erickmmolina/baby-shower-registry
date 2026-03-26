// ─── State ───
let gifts = [];
let activeCat = 'all';
let activeFilter = 'all';
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
  setupFilterListeners();
  await loadGifts();
  await loadEvent();
});

// ─── Stars animation ───
function createStars() {
  const sl = document.getElementById('starsLayer');
  for (let i = 0; i < 55; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${2+Math.random()*4}s;animation-delay:-${Math.random()*5}s;width:${Math.random()<.3?4:2}px;height:${Math.random()<.3?4:2}px`;
    sl.appendChild(s);
  }
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

// ─── Render gift cards ───
function renderGifts() {
  const grid = document.getElementById('giftGrid');
  const filtered = gifts.filter(g => {
    const catOk = activeCat === 'all' || g.cat === activeCat;
    const isReserved = g.status === 'Ya elegido';
    const filterOk = activeFilter === 'all' || (activeFilter === 'available' ? !isReserved : isReserved);
    return catOk && filterOk;
  });

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No hay regalos en esta categoría</div>';
    return;
  }

  grid.innerHTML = filtered.map(g => {
    const isReserved = g.status === 'Ya elegido';
    const emoji = catEmojis[g.cat] || '🎁';
    const claimedName = g.claimedBy ? `${g.claimedBy.nombre} ${g.claimedBy.apellido}` : '';

    const hasImg = g.image && g.image.startsWith('http');

    return `
      <div class="gift-card${isReserved ? ' reserved' : ''}">
        <div class="gift-img-wrap${hasImg ? '' : ' no-img'}">
          ${hasImg
            ? `<img src="${g.image}" alt="${g.name}" loading="lazy" onerror="this.parentElement.classList.add('no-img');this.remove();this.parentElement.innerHTML='<span class=gift-emoji>${emoji}</span>'+this.parentElement.innerHTML">`
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
