// admin.js - Admin Dashboard Logic (Secured with JWT + Orders Management)
const BASE_URL = 'http://localhost:3000';
const PRODUCTS_URL = `${BASE_URL}/products`;
const ORDERS_URL = `${BASE_URL}/orders`;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { window.location.href = 'login.html'; return; }

    // Initial Fetch
    fetchAdminProducts();
    fetchAdminOrders();

    const addBtn = document.getElementById('open-add-modal');
    const modal = document.getElementById('admin-modal');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('close-admin-modal');
    const form = document.getElementById('product-form');
    const imagePreview = document.getElementById('image-preview');
    const mainImageInput = document.getElementById('p-main-image');
    const imageFileInput = document.getElementById('p-image-file');

    // Logout
    const navUl = document.querySelector('.nav ul');
    if (navUl) {
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" style="color: #e74c3c;" onclick="event.preventDefault(); localStorage.removeItem('admin_token'); window.location.href='login.html';">Chiqish</a>`;
        navUl.appendChild(logoutLi);
    }

    // Modal Control
    const closeModal = () => { modal.classList.remove('open'); overlay.classList.remove('open'); };
    addBtn.onclick = () => {
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('modal-title').innerText = 'Mahsulot qo\'shish';
        imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Rasm tanlash</p>';
        imagePreview.classList.remove('has-image');
        modal.classList.add('open');
        overlay.classList.add('open');
    };
    [closeBtn, overlay].forEach(btn => btn.onclick = closeModal);

    // Image Upload
    imageFileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        imagePreview.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Yuklanmoqda...</p>';
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`${PRODUCTS_URL}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                mainImageInput.value = data.url;
                imagePreview.innerHTML = `<img src="${data.url}" alt="Preview">`;
                imagePreview.classList.add('has-image');
                showToast('Rasm yuklandi');
            } else throw new Error();
        } catch (e) { showToast('Yuklashda xato', 'error'); }
    };

    // Product Form Submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const data = {
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            price: parseFloat(document.getElementById('p-price').value),
            oldPrice: document.getElementById('p-old-price').value ? parseFloat(document.getElementById('p-old-price').value) : null,
            mainImage: mainImageInput.value,
            description: document.getElementById('p-description').value,
            images: [mainImageInput.value],
            specs: []
        };
        try {
            const res = await fetch(id ? `${PRODUCTS_URL}/${id}` : PRODUCTS_URL, {
                method: id ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (res.ok) { showToast('Saqlandi'); closeModal(); fetchAdminProducts(); }
            else if (res.status === 401) window.location.href = 'login.html';
        } catch (e) { showToast('Xato', 'error'); }
    };
});

// --- PRODUCT FUNCTIONS ---
async function fetchAdminProducts() {
    try {
        const res = await fetch(PRODUCTS_URL);
        const data = await res.json();
        const list = document.getElementById('admin-product-list');
        list.innerHTML = data.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.mainImage}" alt="${p.name}" style="width:40px;height:40px;object-fit:cover;border-radius:5px;"></td>
                <td>${p.name}</td>
                <td><span class="badge-cat">${p.category}</span></td>
                <td>$${p.price.toLocaleString()}</td>
                <td class="action-btns">
                    <button onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

window.editProduct = async function(id) {
    const res = await fetch(`${PRODUCTS_URL}/${id}`);
    const p = await res.json();
    document.getElementById('product-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-old-price').value = p.oldPrice || '';
    document.getElementById('p-main-image').value = p.mainImage;
    document.getElementById('p-description').value = p.description;
    const preview = document.getElementById('image-preview');
    preview.innerHTML = `<img src="${p.mainImage}" alt="Preview">`;
    preview.classList.add('has-image');
    document.getElementById('modal-title').innerText = 'Mahsulotni tahrirlash';
    document.getElementById('admin-modal').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
};

window.deleteProduct = async function(id) {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchAdminProducts();
};

// --- ORDER FUNCTIONS ---
async function fetchAdminOrders() {
    const token = localStorage.getItem('admin_token');
    try {
        const res = await fetch(ORDERS_URL, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const list = document.getElementById('admin-order-list');
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
                <td>
                    <button class="edit-btn" onclick="viewOrderDetails(${o.id})" title="Batafsil"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

window.updateOrderStatus = async function(id, status) {
    const token = localStorage.getItem('admin_token');
    try {
        const res = await fetch(`${ORDERS_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (res.ok) { showToast('Holat yangilandi'); fetchAdminOrders(); }
    } catch (e) { showToast('Xatolik', 'error'); }
};

window.viewOrderDetails = function(id) {
    // Simple order detail view can be expanded later
    alert(`Buyurtma #${id} tafsilotlari tez orada qo'shiladi.`);
};

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 400); }, 3000);
}
