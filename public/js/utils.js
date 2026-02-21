// ==========================================
// Utility Functions — Restaurant Management
// ==========================================

const API_BASE = '/api';

// ---- Storage ----
function getToken() { return localStorage.getItem('token'); }
function setToken(token) { localStorage.setItem('token', token); }
function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
function setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('cart'); }

// ---- API Helper ----
async function api(endpoint, options = {}) {
    const token = getToken();
    const config = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    };
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    // Don't redirect on auth endpoints — let the login/register form show the error
    const isAuthEndpoint = endpoint.startsWith('/auth/');
    if (res.status === 401 && !isAuthEndpoint) {
        clearAuth();
        window.location.href = '/index.html';
        return;
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) return res.blob();
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
}

// ---- Auth Guard ----
function requireAuth(allowedRoles = []) {
    const user = getUser();
    const token = getToken();
    if (!user || !token) { window.location.href = '/index.html'; return false; }
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        window.location.href = `/${user.role === 'admin' ? 'admin/dashboard.html' : user.role === 'staff' ? 'staff/dashboard.html' : 'customer/menu.html'}`;
        return false;
    }
    return true;
}

// ---- Sidebar Setup ----
function setupSidebar() {
    const user = getUser();
    if (!user) return;
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

    // Highlight active link
    const current = window.location.pathname;
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === current || current.endsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// ---- Toast ----
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', info: 'fas fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
}

// ---- Format Helpers ----
function formatCurrency(amount) { return `₹${Number(amount).toFixed(2)}`; }
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function statusBadge(status) { return `<span class="badge badge-${status}">${status}</span>`; }

// ---- Cart ----
function getCart() { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(c => c.menuItem === item.menuItem);
    if (existing) { existing.quantity += 1; }
    else { cart.push({ ...item, quantity: 1 }); }
    saveCart(cart);
    showToast(`${item.name} added to cart`);
    updateCartCount();
}
function removeFromCart(menuItemId) {
    let cart = getCart();
    cart = cart.filter(c => c.menuItem !== menuItemId);
    saveCart(cart);
    updateCartCount();
}
function updateCartItemQty(menuItemId, qty) {
    const cart = getCart();
    const item = cart.find(c => c.menuItem === menuItemId);
    if (item) {
        item.quantity = Math.max(1, qty);
        saveCart(cart);
    }
}
function getCartTotal() { return getCart().reduce((sum, c) => sum + c.price * c.quantity, 0); }
function updateCartCount() {
    const cart = getCart();
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = cart.reduce((s, c) => s + c.quantity, 0);
}
function clearCart() { localStorage.removeItem('cart'); updateCartCount(); }

// ---- Logout ----
function logout() { clearAuth(); window.location.href = '/index.html'; }

// ---- Mobile Sidebar Toggle ----
function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('open');
}

// Category emoji mapping
function getCategoryEmoji(category) {
    const map = {
        'appetizer': '🥗', 'main-course': '🍛', 'dessert': '🍰',
        'beverage': '🥤', 'snack': '🍟', 'special': '⭐'
    };
    return map[category] || '🍽️';
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
    setupSidebar();
    updateCartCount();

    // Make sidebar brand/logo clickable → navigate to main page
    const brand = document.querySelector('.sidebar-brand');
    if (brand) {
        brand.style.cursor = 'pointer';
        brand.addEventListener('click', () => {
            const user = getUser();
            if (!user) { window.location.href = '/index.html'; return; }
            const destinations = {
                customer: '/customer/menu.html',
                staff: '/staff/dashboard.html',
                admin: '/admin/dashboard.html'
            };
            window.location.href = destinations[user.role] || '/index.html';
        });
    }
});
