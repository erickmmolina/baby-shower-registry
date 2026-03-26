// Estado de la aplicación
let allGifts = [];
let currentFilter = 'all';

// API Base URL - funciona tanto local como en Vercel
const API_URL = window.location.hostname === 'localhost' ? '/api' : '/api';

// Emojis para diferentes tipos de regalos
const giftEmojis = {
    'BAÑERA': '🛁',
    'COCHE': '🚗',
    'PAÑALERA': '🎒',
    'COJIN': '🛏️',
    'MONITOR': '📹',
    'CARRITO': '🛒',
    'FULAR': '👶',
    'KIT': '🧰',
    'CAMBIADOR': '🔄',
    'GYM': '🤸',
    'BIBERONES': '🍼',
    'SILLA': '🪑',
    'ALFOMBRA': '🟦',
    'LUZ': '💡',
    'ASPIRADOR': '💨',
    'CORRAL': '🏠',
    'EXTRACTOR': '🍶',
    'ROPA': '👕',
    'BOX': '📦',
    'JUGUETES': '🧸',
    'SET': '🎁',
    'ALIMENTACIÓN': '🍽️',
    'CUIDADOS': '🧴',
    'BAMBINO': '🐻',
    'BODYS': '👶',
    'CHUPON': '😴'
};

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
    loadGifts();
    setupFilters();
    setupModal();
});

// Cargar regalos desde la API
async function loadGifts() {
    const loading = document.getElementById('loading');
    const giftsGrid = document.getElementById('giftsGrid');
    const emptyState = document.getElementById('emptyState');

    try {
        loading.style.display = 'block';
        giftsGrid.innerHTML = '';

        const response = await fetch(`${API_URL}/gifts`);

        if (!response.ok) {
            throw new Error('Error al cargar los regalos');
        }

        allGifts = await response.json();
        loading.style.display = 'none';

        displayGifts(allGifts);
    } catch (error) {
        console.error('Error:', error);
        loading.innerHTML = '<p style="color: var(--danger-color);">Error al cargar los regalos. Por favor recarga la página.</p>';
    }
}

// Mostrar regalos en el grid
function displayGifts(gifts) {
    const giftsGrid = document.getElementById('giftsGrid');
    const emptyState = document.getElementById('emptyState');

    // Filtrar según el filtro activo
    let filteredGifts = gifts;
    if (currentFilter === 'available') {
        filteredGifts = gifts.filter(g => g.status === 'Disponible');
    } else if (currentFilter === 'claimed') {
        filteredGifts = gifts.filter(g => g.status === 'Ya elegido');
    }

    if (filteredGifts.length === 0) {
        giftsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    giftsGrid.innerHTML = filteredGifts.map(gift => createGiftCard(gift)).join('');
}

// Crear tarjeta de regalo
function createGiftCard(gift) {
    const isAvailable = gift.status === 'Disponible';
    const emoji = getGiftEmoji(gift.name);
    const statusClass = isAvailable ? 'disponible' : 'claimed';
    const statusText = isAvailable ? 'Disponible' : 'Ya elegido';

    return `
        <div class="gift-card ${isAvailable ? '' : 'claimed'}">
            <div class="gift-image">
                <div style="font-size: 4rem; z-index: 1;">${emoji}</div>
                <span class="gift-status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="gift-content">
                <h3 class="gift-name">${gift.name}</h3>
                <div class="gift-links">
                    ${gift.link1 ? `<a href="${gift.link1}" target="_blank" class="gift-link">Ver opción 1</a>` : ''}
                    ${gift.link2 ? `<a href="${gift.link2}" target="_blank" class="gift-link">Ver opción 2</a>` : ''}
                </div>
                <div class="gift-actions">
                    <button 
                        class="btn btn-primary" 
                        onclick="openClaimModal(${gift.id})"
                        ${!isAvailable ? 'disabled' : ''}
                    >
                        ${isAvailable ? '✨ Elegir este regalo' : '❌ No disponible'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Obtener emoji según el nombre del regalo
function getGiftEmoji(name) {
    const nameUpper = name.toUpperCase();

    for (const [key, emoji] of Object.entries(giftEmojis)) {
        if (nameUpper.includes(key)) {
            return emoji;
        }
    }

    return '🎁'; // Emoji por defecto
}

// Configurar filtros
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones activos
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Cambiar filtro
            currentFilter = btn.dataset.filter;
            displayGifts(allGifts);
        });
    });
}

// Configurar modal
function setupModal() {
    const modal = document.getElementById('modal');
    const form = document.getElementById('claimForm');

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await claimGift();
    });
}

// Abrir modal para reclamar regalo
function openClaimModal(giftId) {
    const gift = allGifts.find(g => g.id === giftId);

    if (!gift || gift.status !== 'Disponible') {
        alert('Este regalo ya no está disponible');
        return;
    }

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalLinks = document.getElementById('modalLinks');
    const giftIdInput = document.getElementById('giftId');
    const form = document.getElementById('claimForm');
    const successMessage = document.getElementById('successMessage');

    // Configurar modal
    modalTitle.textContent = gift.name;
    giftIdInput.value = gift.id;

    // Mostrar links
    let linksHtml = '<h4>Opciones de compra:</h4>';
    if (gift.link1) {
        linksHtml += `<a href="${gift.link1}" target="_blank">🔗 Opción 1</a>`;
    }
    if (gift.link2) {
        linksHtml += `<a href="${gift.link2}" target="_blank">🔗 Opción 2</a>`;
    }
    modalLinks.innerHTML = linksHtml;

    // Resetear formulario
    form.reset();
    form.style.display = 'flex';
    successMessage.style.display = 'none';

    // Mostrar modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Reclamar regalo
async function claimGift() {
    const giftId = document.getElementById('giftId').value;
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    
    if (!nombre || !apellido || !email) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    const form = document.getElementById('claimForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Deshabilitar botón
        submitBtn.disabled = true;
        submitBtn.textContent = 'Reservando...';
        
        const response = await fetch(`${API_URL}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                giftId,
                nombre,
                apellido,
                email,
                telefono
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al reservar el regalo');
        }

        // Mostrar mensaje de éxito
        form.style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';

        // Recargar regalos
        await loadGifts();

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al reservar el regalo. Por favor intenta nuevamente.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Hacer funciones globales para uso en HTML
window.openClaimModal = openClaimModal;
window.closeModal = closeModal;

