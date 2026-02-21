// ==========================================
// Staff Module — Orders & Inventory
// ==========================================

// ---- Staff Dashboard / Order Queue ----
async function loadStaffDashboard() {
    try {
        const orders = await api('/orders');
        renderOrderQueue(orders);
        updateStaffStats(orders);
    } catch (err) { showToast(err.message, 'error'); }
}

function updateStaffStats(orders) {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const today = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-pending', pending);
    el('stat-preparing', preparing);
    el('stat-ready', ready);
    el('stat-today', today);
}

function renderOrderQueue(orders) {
    const container = document.getElementById('order-queue');
    if (!container) return;
    const filterStatus = document.getElementById('order-filter')?.value || '';
    let filtered = orders;
    if (filterStatus) filtered = orders.filter(o => o.status === filterStatus);

    if (!filtered.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-list"></i><h3>No orders</h3></div>';
        return;
    }
    container.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
    <tbody>
      ${filtered.map(order => `
        <tr>
          <td><strong>#${order._id.slice(-6).toUpperCase()}</strong></td>
          <td>${order.customer?.name || 'N/A'}</td>
          <td>${order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</td>
          <td class="text-primary">${formatCurrency(order.total)}</td>
          <td>${statusBadge(order.status)}</td>
          <td class="text-muted" style="font-size:0.8rem">${formatDate(order.createdAt)}</td>
          <td>
            <div class="d-flex gap-2" style="gap:6px">
              ${getStatusActions(order)}
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

function getStatusActions(order) {
    const nextStatus = {
        'pending': 'confirmed', 'confirmed': 'preparing',
        'preparing': 'ready', 'ready': 'delivered'
    };
    const next = nextStatus[order.status];
    let html = '';
    if (next) {
        html += `<button class="btn btn-success btn-sm" onclick="updateOrderStatus('${order._id}','${next}')">
      <i class="fas fa-arrow-right"></i> ${next}
    </button>`;
    }
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
        html += `<button class="btn btn-danger btn-sm" onclick="updateOrderStatus('${order._id}','cancelled')">
      <i class="fas fa-times"></i>
    </button>`;
    }
    if (order.status === 'delivered') {
        html += `<button class="btn btn-info btn-sm" onclick="createPayment('${order._id}')">
      <i class="fas fa-receipt"></i> Bill
    </button>`;
    }
    return html;
}

async function updateOrderStatus(id, status) {
    try {
        await api(`/orders/${id}/status`, { method: 'PATCH', body: { status } });
        showToast(`Order updated to ${status}`);
        loadStaffDashboard();
    } catch (err) { showToast(err.message, 'error'); }
}

async function createPayment(orderId) {
    const method = prompt('Payment method (cash/card/upi):', 'cash');
    if (!method) return;
    try {
        const payment = await api('/payments', { method: 'POST', body: { orderId, method } });
        showToast('Payment recorded! Downloading bill...');
        downloadPDF(payment._id);
    } catch (err) { showToast(err.message, 'error'); }
}

async function downloadPDF(paymentId) {
    try {
        const blob = await api(`/payments/${paymentId}/pdf`);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bill-${paymentId}.pdf`;
        a.click(); window.URL.revokeObjectURL(url);
    } catch (err) { showToast('PDF download failed', 'error'); }
}

// ---- Inventory Page ----
async function loadInventory() {
    const search = document.getElementById('inv-search')?.value || '';
    const lowStock = document.getElementById('low-stock-filter')?.checked;
    try {
        let url = `/inventory?search=${search}`;
        if (lowStock) url += '&lowStock=true';
        const items = await api(url);
        renderInventory(items);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderInventory(items) {
    const container = document.getElementById('inventory-table');
    if (!container) return;
    if (!items.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-boxes"></i><h3>No inventory items</h3></div>';
        return;
    }
    container.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Reorder Level</th><th>Cost/Unit</th><th>Supplier</th><th>Last Restocked</th><th>Status</th></tr></thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td><strong>${item.itemName}</strong></td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
          <td>${item.reorderLevel}</td>
          <td>${formatCurrency(item.costPerUnit)}</td>
          <td>${item.supplier || '—'}</td>
          <td class="text-muted" style="font-size:0.8rem">${formatDate(item.lastRestocked)}</td>
          <td>${item.quantity <= item.reorderLevel ? '<span class="badge badge-cancelled">LOW STOCK</span>' : '<span class="badge badge-delivered">OK</span>'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

// Auto-refresh staff dashboard
let staffRefresh;
function startStaffPolling() {
    loadStaffDashboard();
    staffRefresh = setInterval(loadStaffDashboard, 8000);
}
function stopStaffPolling() { if (staffRefresh) clearInterval(staffRefresh); }
