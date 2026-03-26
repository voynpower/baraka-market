// admin.js - Final Clean & Error-Free Integrated Version
const BASE_URL = 'http://localhost:3000';
const PRODUCTS_URL = `${BASE_URL}/products`;
const ORDERS_URL = `${BASE_URL}/orders`;

let salesChart = null;
let adminOrders = [];

// --- 1. GLOBAL HELPERS ---

const getAuthHeader = () => window.AdminApi.getAuthHeader();
const request = (url, options) => window.AdminApi.request(url, options);

const handleAuthError = (res) => {
    return window.AdminApi.handleAuthError(res, () => {
        showToast('Sessiya muddati tugadi. Qayta kiring.', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    });
};

const closeModal = () => { 
    const productModal = document.getElementById('admin-modal');
    const orderModal = document.getElementById('order-details-modal');
    const overlay = document.getElementById('cart-overlay');
    if (productModal) productModal.classList.remove('open'); 
    if (orderModal) orderModal.classList.remove('open');
    if (overlay) overlay.classList.remove('open'); 
};

async function parseResponseError(res, fallbackMessage) {
    const data = await window.AdminApi.parseResponse?.(res);
    return window.AdminApi.getErrorMessage(data, fallbackMessage);
}

function parseOrderItems(items) {
    if (Array.isArray(items)) return items;
    if (!items) return [];
    try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 500); 
    }, 3000);
}

function parseSpecLines(value) {
    return (value || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ icon: 'fa-circle-check', val: line }));
}

function getCategoryLabel(value) {
    const map = {
        phones: 'Telefonlar',
        laptops: 'Noutbuklar',
        accessories: 'Aksessuarlar',
        tablets: 'Planshetlar',
    };
    return map[value] || 'Kategoriya';
}

function updateAdminProductPreview() {
    const name = document.getElementById('p-name')?.value.trim() || 'Mahsulot nomi';
    const category = document.getElementById('p-category')?.value || 'phones';
    const price = Number(document.getElementById('p-price')?.value || 0);
    const oldPrice = Number(document.getElementById('p-old-price')?.value || 0);
    const stock = Number(document.getElementById('p-stock')?.value || 0);
    const badge = document.getElementById('p-badge')?.value.trim() || '';
    const description = document.getElementById('p-description')?.value.trim() || "Mahsulot tavsifi shu yerda ko'rinadi.";
    const image = document.getElementById('p-main-image')?.value;
    const tempImage = document.querySelector('#image-preview img')?.getAttribute('src') || '';
    const specs = parseSpecLines(document.getElementById('p-specs')?.value || '');

    const previewName = document.getElementById('preview-product-name');
    const previewCategory = document.getElementById('preview-category-chip');
    const previewStock = document.getElementById('preview-stock-chip');
    const previewDescription = document.getElementById('preview-product-description');
    const previewPrice = document.getElementById('preview-price');
    const previewOldPrice = document.getElementById('preview-old-price');
    const previewBadge = document.getElementById('preview-badge');
    const previewImage = document.getElementById('admin-preview-image');
    const previewSpecList = document.getElementById('preview-spec-list');

    if (previewName) previewName.innerText = name;
    if (previewCategory) previewCategory.innerText = getCategoryLabel(category);
    if (previewStock) {
        previewStock.innerText = stock > 0 ? `Zahira: ${stock}` : 'Tugagan';
        previewStock.classList.toggle('is-empty', stock <= 0);
    }
    if (previewDescription) previewDescription.innerText = description;
    if (previewPrice) previewPrice.innerText = `$${price.toLocaleString()}`;
    if (previewOldPrice) {
        if (oldPrice > price && oldPrice > 0) {
            previewOldPrice.innerText = `$${oldPrice.toLocaleString()}`;
            previewOldPrice.classList.remove('hidden');
        } else {
            previewOldPrice.classList.add('hidden');
            previewOldPrice.innerText = '';
        }
    }
    if (previewBadge) {
        if (badge) {
            previewBadge.innerText = badge;
            previewBadge.classList.remove('hidden');
        } else {
            previewBadge.classList.add('hidden');
            previewBadge.innerText = '';
        }
    }
    if (previewImage) {
        const previewSrc = image || tempImage;
        previewImage.innerHTML = previewSrc ? `<img src="${previewSrc}" alt="${name}">` : '<i class="fas fa-box-open"></i>';
        previewImage.classList.toggle('has-image', Boolean(previewSrc));
    }
    if (previewSpecList) {
        previewSpecList.innerHTML = specs.length > 0
            ? specs.map((spec) => `<div class="admin-preview-spec-item"><i class="fas ${spec.icon}"></i><span>${spec.val}</span></div>`).join('')
            : '<div class="admin-preview-spec-item"><i class="fas fa-circle-check"></i><span>Xususiyatlar shu yerda ko\'rinadi</span></div>';
    }
}

function resetProductForm(form, imagePreview, mainImageInput) {
    if (form) form.reset();
    const productId = document.getElementById('product-id');
    const modalTitle = document.getElementById('modal-title');
    const saveBtn = document.getElementById('save-product');
    const specsInput = document.getElementById('p-specs');
    const badgeInput = document.getElementById('p-badge');

    if (productId) productId.value = '';
    if (modalTitle) modalTitle.innerText = 'Mahsulot qo\'shish';
    if (saveBtn) saveBtn.innerText = 'Saqlash';
    if (imagePreview) imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Rasm tanlash</p><span>PNG, JPG yoki WEBP</span>';
    if (imagePreview) imagePreview.classList.remove('has-image');
    if (mainImageInput) mainImageInput.value = '';
    if (specsInput) specsInput.value = '';
    if (badgeInput) badgeInput.value = '';
    updateAdminProductPreview();
}

// --- 2. MAIN INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    const token = window.AdminApi.getAdminToken();
    if (!token) { window.location.href = 'login.html'; return; }

    refreshDashboard();

    const addBtn = document.getElementById('open-add-modal');
    const closeBtn = document.getElementById('close-admin-modal');
    const closeOrderBtn = document.getElementById('close-order-modal');
    const overlay = document.getElementById('cart-overlay');
    const form = document.getElementById('product-form');
    const imagePreview = document.getElementById('image-preview');
    const mainImageInput = document.getElementById('p-main-image');
    const imageFileInput = document.getElementById('p-image-file');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const previewInputs = ['p-name', 'p-category', 'p-price', 'p-stock', 'p-old-price', 'p-badge', 'p-description', 'p-specs'];

    if (addBtn) {
        addBtn.onclick = () => {
            resetProductForm(form, imagePreview, mainImageInput);
            const modal = document.getElementById('admin-modal');
            if (modal) modal.classList.add('open');
            if (overlay) overlay.classList.add('open');
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('admin_token');
            showToast('Tizimdan chiqildi', 'info');
            setTimeout(() => { window.location.href = 'login.html'; }, 500);
        };
    }

    [closeBtn, closeOrderBtn, overlay].forEach(btn => { 
        if (btn) btn.onclick = closeModal; 
    });

    if (imageFileInput) {
        imageFileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const localPreviewUrl = URL.createObjectURL(file);
            imagePreview.innerHTML = `<img src="${localPreviewUrl}" alt="Preview" class="upload-preview-temp">`;
            imagePreview.classList.add('has-image', 'is-uploading');
            updateAdminProductPreview();
            imagePreview.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Yuklanmoqda...</p><span>Iltimos, kuting</span>';
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch(`${PRODUCTS_URL}/upload`, { 
                    method: 'POST', 
                    headers: getAuthHeader(), 
                    body: formData 
                });
                if (handleAuthError(res)) return;
                if (res.ok) {
                    const data = await res.json();
                    mainImageInput.value = data.url;
                    imagePreview.innerHTML = `<img src="${data.url}" alt="Preview">`;
                    imagePreview.classList.add('has-image');
                    imagePreview.classList.remove('is-uploading');
                    updateAdminProductPreview();
                    showToast('Rasm yuklandi');
                } else {
                    imagePreview.classList.remove('is-uploading');
                    showToast(await parseResponseError(res, 'Yuklashda xato'), 'error');
                }
            } catch (err) {
                imagePreview.classList.remove('is-uploading');
                showToast(err?.message || 'Yuklashda xato', 'error');
            } finally {
                URL.revokeObjectURL(localPreviewUrl);
            }
        };
    }

    previewInputs.forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', updateAdminProductPreview);
        if (input && input.tagName === 'SELECT') input.addEventListener('change', updateAdminProductPreview);
    });
    updateAdminProductPreview();

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('product-id').value;
            const productPayload = {
                name: document.getElementById('p-name').value,
                category: document.getElementById('p-category').value,
                price: parseFloat(document.getElementById('p-price').value),
                stock: parseInt(document.getElementById('p-stock').value || 0),
                oldPrice: document.getElementById('p-old-price').value ? parseFloat(document.getElementById('p-old-price').value) : null,
                badge: document.getElementById('p-badge').value.trim() || null,
                mainImage: mainImageInput.value,
                description: document.getElementById('p-description').value,
                images: [mainImageInput.value],
                specs: parseSpecLines(document.getElementById('p-specs').value)
            };
            try {
                const { response, data } = await request(id ? `${PRODUCTS_URL}/${id}` : PRODUCTS_URL, {
                    method: id ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify(productPayload)
                });
                if (handleAuthError(response)) return;
                if (response.ok) { 
                    showToast('Saqlandi'); 
                    closeModal(); 
                    refreshDashboard(); 
                } else {
                    showToast(window.AdminApi.getErrorMessage(data, 'Saqlashda xatolik'), 'error');
                }
            } catch (err) { showToast('Xato yuz berdi', 'error'); }
        };
    }
});

// --- 3. DASHBOARD LOGIC ---

async function refreshDashboard() {
    await fetchAdminProducts();
    await fetchAdminOrders();
    await fetchDashboardStats();
}

async function fetchDashboardStats() {
    const summaryEl = document.getElementById('chart-summary-data');
    try {
        const { response, data } = await request(`${ORDERS_URL}/stats`, { headers: getAuthHeader() });
        if (handleAuthError(response)) return;

        const revEl = document.getElementById('stat-today-revenue');
        const ordEl = document.getElementById('stat-today-orders');
        const prdEl = document.getElementById('stat-total-products');

        if (revEl) revEl.innerText = `$${(data.todayRevenue || 0).toLocaleString()}`;
        if (ordEl) ordEl.innerText = `${data.todayOrdersCount || 0} ta`;
        if (prdEl) prdEl.innerText = `${data.totalProductsCount || 0} ta`;

        if (data.chartData && Array.isArray(data.chartData)) {
            renderSalesChart(data.chartData);
            const totalWeekly = data.chartData.reduce((s, d) => s + d.value, 0);
            const avgDaily = Math.round(totalWeekly / 7);
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <div class="summary-item"><span>Haftalik jami:</span><strong>$${totalWeekly.toLocaleString()}</strong></div>
                    <div class="summary-item"><span>O'rtacha kunlik:</span><strong>$${avgDaily.toLocaleString()}</strong></div>
                    <div class="summary-item"><span>Muvaffaqiyatli buyurtmalar:</span><strong>${data.totalOrdersCount || 0} ta</strong></div>
                `;
            }
        }
    } catch (e) {
        console.error(e);
        if (summaryEl) summaryEl.innerHTML = '<p>Ma\'lumot yuklashda xatolik.</p>';
    }
}

function renderSalesChart(chartData) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: chartData.map(d => d.date),
            datasets: [{
                label: 'Tushum ($)',
                data: chartData.map(d => d.value),
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#ff6b35'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

async function fetchAdminProducts() {
    try {
        const { data } = await request(PRODUCTS_URL);
        const list = document.getElementById('admin-product-list');
        if (!Array.isArray(data) || !list) return;
        list.innerHTML = data.map(p => {
            const stockColor = p.stock <= 0 ? '#e74c3c' : (p.stock < 5 ? '#f39c12' : '#27ae60');
            const stockText = p.stock <= 0 ? 'Tugagan' : p.stock + ' ta';
            return `
                <tr>
                    <td>${p.id}</td>
                    <td><img src="${p.mainImage}" alt="${p.name}" style="width:40px;height:40px;object-fit:cover;border-radius:5px;"></td>
                    <td>${p.name}</td>
                    <td><span class="badge-cat">${p.category}</span></td>
                    <td>$${p.price.toLocaleString()}</td>
                    <td><strong style="color: ${stockColor}">${stockText}</strong></td>
                    <td class="action-btns">
                        <button onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) { console.error(e); }
}

async function fetchAdminOrders() {
    try {
        const { response, data } = await request(ORDERS_URL, { headers: getAuthHeader() });
        if (handleAuthError(response)) return;
        const list = document.getElementById('admin-order-list');
        if (!Array.isArray(data) || !list) return;
        adminOrders = data;
        list.innerHTML = data.map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customerName}</td>
                <td>${o.customerPhone}</td>
                <td><strong>$${o.totalAmount.toLocaleString()}</strong></td>
                <td>
                    <select class="status-select ${o.status}" onchange="updateOrderStatus(${o.id}, this.value)">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Kutilmoqda</option>
                        <option value="shipping" ${o.status === 'shipping' ? 'selected' : ''}>Yetkazilmoqda</option>
                        <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Bajarildi</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Bekor qilindi</option>
                    </select>
                </td>
                <td><button class="edit-btn" onclick="viewOrderDetails(${o.id})"><i class="fas fa-eye"></i></button></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

window.updateOrderStatus = async function(id, status) {
    try {
        const { response, data } = await request(`${ORDERS_URL}/${id}/status`, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, 
            body: JSON.stringify({ status }) 
        });
        if (handleAuthError(response)) return;
        if (response.ok) { showToast('Holat yangilandi'); refreshDashboard(); }
        else { showToast(window.AdminApi.getErrorMessage(data, 'Holat yangilanmadi'), 'error'); }
    } catch (e) { showToast('Xatolik', 'error'); }
};

window.editProduct = async function(id) {
    try {
        const { response, data } = await request(`${PRODUCTS_URL}/${id}`);
        if (!response.ok) {
            showToast(window.AdminApi.getErrorMessage(data, 'Ma\'lumotni yuklashda xato'), 'error');
            return;
        }
        const p = data;
        document.getElementById('product-id').value = p.id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock || 0;
        document.getElementById('p-old-price').value = p.oldPrice || '';
        document.getElementById('p-badge').value = p.badge || '';
        document.getElementById('p-main-image').value = p.mainImage;
        document.getElementById('p-description').value = p.description;
        document.getElementById('p-specs').value = Array.isArray(p.specs) ? p.specs.map((spec) => spec.val || '').join('\n') : '';
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.innerHTML = `<img src="${p.mainImage}" alt="Preview">`;
            preview.classList.add('has-image');
        }
        document.getElementById('modal-title').innerText = 'Mahsulotni tahrirlash';
        const saveBtn = document.getElementById('save-product');
        if (saveBtn) saveBtn.innerText = 'O\'zgarishlarni saqlash';
        updateAdminProductPreview();
        const modal = document.getElementById('admin-modal');
        const overlay = document.getElementById('cart-overlay');
        if (modal) modal.classList.add('open');
        if (overlay) overlay.classList.add('open');
    } catch (e) { showToast('Ma\'lumotni yuklashda xato', 'error'); }
};

window.deleteProduct = async function(id) {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
        const { response, data } = await request(`${PRODUCTS_URL}/${id}`, { 
            method: 'DELETE', 
            headers: getAuthHeader() 
        });
        if (handleAuthError(response)) return;
        if (response.ok) {
            showToast('O\'chirildi');
            refreshDashboard();
        } else {
            showToast(window.AdminApi.getErrorMessage(data, 'O\'chirishda xatolik'), 'error');
        }
    } catch (e) { showToast('Xatolik', 'error'); }
};

window.viewOrderDetails = function(id) {
    const order = adminOrders.find(item => item.id === id);
    if (!order) {
        showToast('Buyurtma topilmadi', 'error');
        return;
    }

    const content = document.getElementById('order-details-content');
    const modal = document.getElementById('order-details-modal');
    const overlay = document.getElementById('cart-overlay');
    const items = parseOrderItems(order.items);

    if (!content || !modal || !overlay) return;

    content.innerHTML = `
        <div class="glass" style="padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
                <div><strong>Buyurtma ID</strong><p>#${order.id}</p></div>
                <div><strong>Mijoz</strong><p>${order.customerName}</p></div>
                <div><strong>Telefon</strong><p>${order.customerPhone}</p></div>
                <div><strong>Holat</strong><p>${order.status}</p></div>
                <div><strong>To'lov turi</strong><p>${order.paymentMethod || 'cash'}</p></div>
                <div><strong>Sana</strong><p>${new Date(order.createdAt).toLocaleString()}</p></div>
            </div>
            <div style="margin-top:1rem;">
                <strong>Manzil</strong>
                <p style="margin-top:0.4rem;">${order.customerAddress}</p>
            </div>
        </div>
        <div class="glass" style="padding: 1.5rem;">
            <h3 style="margin-bottom:1rem;">Mahsulotlar</h3>
            <div style="display:grid; gap:0.75rem;">
                ${items.length > 0 ? items.map(item => `
                    <div style="display:flex; justify-content:space-between; gap:1rem; padding:0.9rem 1rem; border-radius:12px; background:rgba(255,255,255,0.7);">
                        <div>
                            <strong>${item.name || 'Mahsulot'}</strong>
                            <p style="opacity:0.7; margin-top:0.25rem;">Soni: ${item.quantity || 1}</p>
                        </div>
                        <div style="font-weight:700;">$${(((item.price || 0) * (item.quantity || 1))).toLocaleString()}</div>
                    </div>
                `).join('') : '<p>Mahsulot ma\'lumotlari topilmadi.</p>'}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.25rem; padding-top:1rem; border-top:1px solid rgba(0,0,0,0.08);">
                <strong>Jami</strong>
                <strong>$${Number(order.totalAmount || 0).toLocaleString()}</strong>
            </div>
        </div>
    `;

    modal.classList.add('open');
    overlay.classList.add('open');
};
