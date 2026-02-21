// ==========================================
// Customer Module — Menu, Orders, Billing
// ==========================================

// ---- Menu Page ----
async function loadMenu() {
    const search = document.getElementById('menu-search')?.value || '';
    const category = document.getElementById('menu-category')?.value || '';
    const vegOnly = document.getElementById('veg-filter')?.checked;
    let url = `/menu?search=${search}&category=${category}`;
    if (vegOnly) url += '&isVeg=true';
    try {
        const items = await api(url);
        renderMenuGrid(items);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderMenuGrid(items) {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;
    if (!items.length) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-utensils"></i><h3>No items found</h3><p>Try a different search or filter</p></div>';
        return;
    }
    grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <div class="menu-card-img">
        ${getCategoryEmoji(item.category)}
        <span class="veg-badge badge ${item.isVeg ? 'badge-veg' : 'badge-nonveg'}">
          ${item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
        </span>
      </div>
      <div class="menu-card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <span class="badge badge-preparing" style="margin-bottom:8px">${item.category}</span>
        <span class="text-muted" style="font-size:0.75rem; margin-left:8px">⏱ ${item.preparationTime} min</span>
        <div class="menu-card-footer">
          <span class="price">${formatCurrency(item.price)}</span>
          ${item.available
            ? `<button class="btn btn-primary btn-sm" onclick="addToCart({menuItem:'${item._id}',name:'${item.name}',price:${item.price}})">
                <i class="fas fa-cart-plus"></i> Add
              </button>`
            : '<span class="badge badge-cancelled">Unavailable</span>'}
        </div>
      </div>
    </div>
  `).join('');
}

// ---- Cart Sidebar ----
function toggleCart() {
    document.getElementById('cart-sidebar')?.classList.toggle('open');
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;
    const cart = getCart();
    if (!cart.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><h3>Cart is empty</h3><p>Add items from the menu</p></div>';
        if (totalEl) totalEl.textContent = '₹0.00';
        return;
    }
    container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span class="cart-price">${formatCurrency(item.price)} × ${item.quantity}</span>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="changeQty('${item.menuItem}', ${item.quantity - 1})">−</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty('${item.menuItem}', ${item.quantity + 1})">+</button>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeItem('${item.menuItem}')" style="padding:6px 8px">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
    if (totalEl) totalEl.textContent = formatCurrency(getCartTotal());
}

function changeQty(id, qty) {
    if (qty < 1) { removeItem(id); return; }
    updateCartItemQty(id, qty);
    renderCart();
    updateCartCount();
}

function removeItem(id) {
    removeFromCart(id);
    renderCart();
    showToast('Item removed from cart', 'info');
}

async function placeOrder() {
    const cart = getCart();
    if (!cart.length) { showToast('Cart is empty!', 'error'); return; }
    const tableNumber = document.getElementById('table-number')?.value || null;
    const specialInstructions = document.getElementById('special-instructions')?.value || '';
    try {
        const order = await api('/orders', {
            method: 'POST',
            body: { items: cart, tableNumber: tableNumber ? Number(tableNumber) : null, specialInstructions }
        });
        clearCart();
        renderCart();
        toggleCart();
        showToast('Order placed successfully! 🎉');
        setTimeout(() => window.location.href = '/customer/orders.html', 1000);
    } catch (err) { showToast(err.message, 'error'); }
}

// ---- My Orders Page ----
async function loadMyOrders() {
    try {
        const orders = await api('/orders/my');
        renderMyOrders(orders);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderMyOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    if (!orders.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No orders yet</h3><p>Browse the menu and place your first order!</p></div>';
        return;
    }
    container.innerHTML = orders.map(order => `
    <div class="card mb-2">
      <div class="d-flex justify-between align-center flex-wrap gap-2">
        <div>
          <h3 style="font-family:'Inter',sans-serif;font-size:1rem;">Order #${order._id.slice(-6).toUpperCase()}</h3>
          <span class="text-muted" style="font-size:0.8rem">${formatDate(order.createdAt)}</span>
        </div>
        <div class="d-flex align-center gap-2">
          ${statusBadge(order.status)}
          <span class="price" style="font-size:1.1rem">${formatCurrency(order.total)}</span>
        </div>
      </div>
      <div class="divider"></div>
      ${renderOrderTimeline(order.status)}
      <div class="mt-2">
        <table style="width:100%">
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>
            ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${formatCurrency(i.price * i.quantity)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${order.tableNumber ? `<p class="text-muted mt-2" style="font-size:0.8rem">🪑 Table: ${order.tableNumber}</p>` : ''}
    </div>
  `).join('');
}

function renderOrderTimeline(status) {
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const icons = ['fa-clock', 'fa-check', 'fa-fire', 'fa-bell', 'fa-truck'];
    const currentIdx = steps.indexOf(status);
    if (status === 'cancelled') return '<p class="text-danger"><i class="fas fa-times-circle"></i> Order Cancelled</p>';
    return `<div class="order-timeline">
    ${steps.map((s, i) => `
      <div class="timeline-step ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}">
        <div class="timeline-dot"><i class="fas ${icons[i]}"></i></div>
        <span class="timeline-label">${s}</span>
      </div>
    `).join('')}
  </div>`;
}

// Auto-refresh orders
let orderRefresh;
function startOrderPolling() {
    loadMyOrders();
    orderRefresh = setInterval(loadMyOrders, 10000);
}
function stopOrderPolling() { if (orderRefresh) clearInterval(orderRefresh); }
