// ==========================================
// Admin Module — Dashboard, Menu, Employees, Reports
// ==========================================

// ---- Admin Analytics Dashboard ----
async function loadAdminDashboard() {
    try {
        const data = await api('/analytics');
        renderAdminStats(data);
        renderRevenueChart(data.dailyRevenue);
        renderOrderStatusChart(data.ordersByStatus);
        renderPopularItems(data.popularItems);
        renderRecentOrders(data.recentOrders);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderAdminStats(data) {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-revenue', formatCurrency(data.totalRevenue));
    el('stat-orders', data.totalOrders);
    el('stat-pending', data.pendingOrders);
    el('stat-customers', data.totalCustomers);
    el('stat-staff', data.totalStaff);
    el('stat-menu', data.totalMenuItems);
}

function renderRevenueChart(dailyRevenue) {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;
    const labels = dailyRevenue.map(d => d._id);
    const values = dailyRevenue.map(d => d.revenue);
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Revenue (₹)',
                data: values,
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230,126,34,0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#e67e22',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#8899aa' } } },
            scales: {
                x: { ticks: { color: '#8899aa' }, grid: { color: '#2a3040' } },
                y: { ticks: { color: '#8899aa' }, grid: { color: '#2a3040' } }
            }
        }
    });
}

function renderOrderStatusChart(ordersByStatus) {
    const ctx = document.getElementById('status-chart');
    if (!ctx) return;
    const labels = ordersByStatus.map(o => o._id);
    const values = ordersByStatus.map(o => o.count);
    const colors = {
        pending: '#f1c40f', confirmed: '#3498db', preparing: '#e67e22',
        ready: '#1abc9c', delivered: '#2ecc71', cancelled: '#e74c3c'
    };
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: labels.map(l => colors[l] || '#8899aa'),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: '#8899aa', padding: 16 } } }
        }
    });
}

function renderPopularItems(items) {
    const ctx = document.getElementById('popular-chart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: items.map(i => i._id),
            datasets: [{
                label: 'Times Ordered',
                data: items.map(i => i.totalOrdered),
                backgroundColor: ['#e67e22', '#1abc9c', '#3498db', '#f1c40f', '#e74c3c'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#8899aa' }, grid: { display: false } },
                y: { ticks: { color: '#8899aa' }, grid: { color: '#2a3040' } }
            }
        }
    });
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recent-orders');
    if (!container) return;
    container.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>
      ${orders.map(o => `
        <tr>
          <td><strong>#${o._id.slice(-6).toUpperCase()}</strong></td>
          <td>${o.customer?.name || 'N/A'}</td>
          <td class="text-primary">${formatCurrency(o.total)}</td>
          <td>${statusBadge(o.status)}</td>
          <td class="text-muted" style="font-size:0.8rem">${formatDate(o.createdAt)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

// ---- Menu Management ----
async function loadMenuManage() {
    try {
        const items = await api('/menu');
        renderMenuTable(items);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderMenuTable(items) {
    const container = document.getElementById('menu-table');
    if (!container) return;
    container.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Veg</th><th>Available</th><th>Actions</th></tr></thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td><strong>${item.name}</strong><br><small class="text-muted">${item.description.substring(0, 40)}...</small></td>
          <td><span class="badge badge-preparing">${item.category}</span></td>
          <td class="text-primary">${formatCurrency(item.price)}</td>
          <td>${item.isVeg ? '<span class="badge badge-veg">VEG</span>' : '<span class="badge badge-nonveg">NON-VEG</span>'}</td>
          <td>${item.available ? '<span class="badge badge-delivered">Yes</span>' : '<span class="badge badge-cancelled">No</span>'}</td>
          <td>
            <div class="d-flex gap-2" style="gap:6px">
              <button class="btn btn-info btn-sm" onclick="editMenuItem('${item._id}')"><i class="fas fa-edit"></i></button>
              <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${item._id}')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

function showAddMenuModal() {
    document.getElementById('menu-modal-title').textContent = 'Add Menu Item';
    document.getElementById('menu-form').reset();
    document.getElementById('menu-item-id').value = '';
    document.getElementById('menu-modal').classList.add('active');
}

async function editMenuItem(id) {
    try {
        const item = await api(`/menu/${id}`);
        document.getElementById('menu-modal-title').textContent = 'Edit Menu Item';
        document.getElementById('menu-item-id').value = item._id;
        document.getElementById('m-name').value = item.name;
        document.getElementById('m-description').value = item.description;
        document.getElementById('m-price').value = item.price;
        document.getElementById('m-category').value = item.category;
        document.getElementById('m-prep-time').value = item.preparationTime;
        document.getElementById('m-veg').checked = item.isVeg;
        document.getElementById('m-available').checked = item.available;
        document.getElementById('menu-modal').classList.add('active');
    } catch (err) { showToast(err.message, 'error'); }
}

async function saveMenuItem(e) {
    e.preventDefault();
    const id = document.getElementById('menu-item-id').value;
    const data = {
        name: document.getElementById('m-name').value,
        description: document.getElementById('m-description').value,
        price: Number(document.getElementById('m-price').value),
        category: document.getElementById('m-category').value,
        preparationTime: Number(document.getElementById('m-prep-time').value),
        isVeg: document.getElementById('m-veg').checked,
        available: document.getElementById('m-available').checked
    };
    try {
        if (id) {
            await api(`/menu/${id}`, { method: 'PUT', body: data });
            showToast('Menu item updated!');
        } else {
            await api('/menu', { method: 'POST', body: data });
            showToast('Menu item created!');
        }
        closeModal('menu-modal');
        loadMenuManage();
    } catch (err) { showToast(err.message, 'error'); }
}

async function deleteMenuItem(id) {
    if (!confirm('Delete this menu item?')) return;
    try {
        await api(`/menu/${id}`, { method: 'DELETE' });
        showToast('Menu item deleted');
        loadMenuManage();
    } catch (err) { showToast(err.message, 'error'); }
}

// ---- Employee Management ----
async function loadEmployees() {
    const search = document.getElementById('emp-search')?.value || '';
    const role = document.getElementById('emp-role')?.value || '';
    try {
        let url = `/users?search=${search}`;
        if (role) url += `&role=${role}`;
        const users = await api(url);
        renderEmployeeTable(users);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderEmployeeTable(users) {
    const container = document.getElementById('employee-table');
    if (!container) return;
    container.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
    <tbody>
      ${users.map(u => `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td>${u.phone || '—'}</td>
          <td><span class="badge badge-${u.role === 'admin' ? 'preparing' : u.role === 'staff' ? 'confirmed' : 'delivered'}">${u.role}</span></td>
          <td>${u.isActive ? '<span class="badge badge-delivered">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}</td>
          <td class="text-muted" style="font-size:0.8rem">${formatDate(u.createdAt)}</td>
          <td>
            <div class="d-flex gap-2" style="gap:6px">
              <button class="btn btn-info btn-sm" onclick="editEmployee('${u._id}')"><i class="fas fa-edit"></i></button>
              <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${u._id}')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

async function editEmployee(id) {
    try {
        const user = await api(`/users/${id}`);
        document.getElementById('emp-modal-title').textContent = 'Edit User';
        document.getElementById('emp-id').value = user._id;
        document.getElementById('e-name').value = user.name;
        document.getElementById('e-phone').value = user.phone || '';
        document.getElementById('e-role').value = user.role;
        document.getElementById('e-active').checked = user.isActive;
        document.getElementById('emp-modal').classList.add('active');
    } catch (err) { showToast(err.message, 'error'); }
}

async function saveEmployee(e) {
    e.preventDefault();
    const id = document.getElementById('emp-id').value;
    const data = {
        name: document.getElementById('e-name').value,
        phone: document.getElementById('e-phone').value,
        role: document.getElementById('e-role').value,
        isActive: document.getElementById('e-active').checked
    };
    try {
        await api(`/users/${id}`, { method: 'PUT', body: data });
        showToast('User updated!');
        closeModal('emp-modal');
        loadEmployees();
    } catch (err) { showToast(err.message, 'error'); }
}

async function deleteEmployee(id) {
    if (!confirm('Delete this user?')) return;
    try {
        await api(`/users/${id}`, { method: 'DELETE' });
        showToast('User deleted');
        loadEmployees();
    } catch (err) { showToast(err.message, 'error'); }
}

// ---- Reports Page ----
async function loadReports() {
    try {
        const data = await api('/analytics');
        renderAdminStats(data);
        renderRevenueChart(data.dailyRevenue);
        renderOrderStatusChart(data.ordersByStatus);
        renderPopularItems(data.popularItems);

        // Payments table
        const payments = await api('/payments');
        renderPaymentsTable(payments);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderPaymentsTable(payments) {
    const container = document.getElementById('payments-table');
    if (!container) return;
    container.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Payment ID</th><th>Order</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Invoice</th></tr></thead>
    <tbody>
      ${payments.map(p => `
        <tr>
          <td><strong>#${p._id.slice(-6).toUpperCase()}</strong></td>
          <td>#${p.order?._id?.slice(-6)?.toUpperCase() || 'N/A'}</td>
          <td class="text-primary">${formatCurrency(p.amount)}</td>
          <td>${p.method.toUpperCase()}</td>
          <td>${statusBadge(p.status)}</td>
          <td class="text-muted" style="font-size:0.8rem">${p.paidAt ? formatDate(p.paidAt) : '—'}</td>
          <td><button class="btn btn-outline btn-sm" onclick="downloadPDF('${p._id}')"><i class="fas fa-file-pdf"></i> PDF</button></td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
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

// ---- Inventory Management (Admin) ----
async function loadAdminInventory() {
    try {
        const items = await api('/inventory');
        renderAdminInventoryTable(items);
    } catch (err) { showToast(err.message, 'error'); }
}

function renderAdminInventoryTable(items) {
    const container = document.getElementById('inventory-table');
    if (!container) return;
    container.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Reorder</th><th>Cost/Unit</th><th>Supplier</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td><strong>${item.itemName}</strong></td>
          <td>${item.quantity}</td><td>${item.unit}</td><td>${item.reorderLevel}</td>
          <td>${formatCurrency(item.costPerUnit)}</td><td>${item.supplier || '—'}</td>
          <td>${item.quantity <= item.reorderLevel ? '<span class="badge badge-cancelled">LOW</span>' : '<span class="badge badge-delivered">OK</span>'}</td>
          <td>
            <div class="d-flex gap-2" style="gap:6px">
              <button class="btn btn-info btn-sm" onclick="editInventory('${item._id}')"><i class="fas fa-edit"></i></button>
              <button class="btn btn-danger btn-sm" onclick="deleteInventory('${item._id}')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

function showAddInventoryModal() {
    document.getElementById('inv-modal-title').textContent = 'Add Inventory Item';
    document.getElementById('inv-form').reset();
    document.getElementById('inv-item-id').value = '';
    document.getElementById('inv-modal').classList.add('active');
}

async function editInventory(id) {
    try {
        const item = await api(`/inventory/${id}`);
        document.getElementById('inv-modal-title').textContent = 'Edit Inventory Item';
        document.getElementById('inv-item-id').value = item._id;
        document.getElementById('i-name').value = item.itemName;
        document.getElementById('i-qty').value = item.quantity;
        document.getElementById('i-unit').value = item.unit;
        document.getElementById('i-reorder').value = item.reorderLevel;
        document.getElementById('i-cost').value = item.costPerUnit;
        document.getElementById('i-supplier').value = item.supplier;
        document.getElementById('inv-modal').classList.add('active');
    } catch (err) { showToast(err.message, 'error'); }
}

async function saveInventory(e) {
    e.preventDefault();
    const id = document.getElementById('inv-item-id').value;
    const data = {
        itemName: document.getElementById('i-name').value,
        quantity: Number(document.getElementById('i-qty').value),
        unit: document.getElementById('i-unit').value,
        reorderLevel: Number(document.getElementById('i-reorder').value),
        costPerUnit: Number(document.getElementById('i-cost').value),
        supplier: document.getElementById('i-supplier').value
    };
    try {
        if (id) {
            await api(`/inventory/${id}`, { method: 'PUT', body: data });
            showToast('Inventory updated!');
        } else {
            await api('/inventory', { method: 'POST', body: data });
            showToast('Inventory item added!');
        }
        closeModal('inv-modal');
        loadAdminInventory();
    } catch (err) { showToast(err.message, 'error'); }
}

async function deleteInventory(id) {
    if (!confirm('Delete this inventory item?')) return;
    try {
        await api(`/inventory/${id}`, { method: 'DELETE' });
        showToast('Inventory item deleted');
        loadAdminInventory();
    } catch (err) { showToast(err.message, 'error'); }
}

// ---- Utils ----
function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}
