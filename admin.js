// admin.js - Admin Dashboard Logic (Robust Fix)
const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/products`;

document.addEventListener('DOMContentLoaded', () => {
    fetchAdminProducts();

    const addBtn = document.getElementById('open-add-modal');
    const modal = document.getElementById('admin-modal');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('close-admin-modal');
    const form = document.getElementById('product-form');
    const imagePreview = document.getElementById('image-preview');
    const mainImageInput = document.getElementById('p-main-image');
    const imageFileInput = document.getElementById('p-image-file');

    // Open Modal for Add
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('modal-title').innerText = 'Mahsulot qo\'shish';
        imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Rasm tanlash</p>';
        imagePreview.classList.remove('has-image');
        mainImageInput.value = '';
        modal.classList.add('open');
        overlay.classList.add('open');
    });

    // Close Modal
    const closeModal = () => {
        modal.classList.remove('open');
        overlay.classList.remove('open');
    };

    [closeBtn, overlay].forEach(btn => btn.addEventListener('click', closeModal));

    // --- IMAGE UPLOAD LOGIC ---
    imageFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        imagePreview.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Yuklanmoqda...</p>';

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                mainImageInput.value = data.url;
                imagePreview.innerHTML = `<img src="${data.url}" alt="Preview" style="width:100%; height:100%; object-fit:contain;">`;
                imagePreview.classList.add('has-image');
                showToast('Rasm yuklandi', 'success');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            imagePreview.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Xato</p>';
            showToast('Rasm yuklashda xatolik', 'error');
        }
    });

    // --- FORM SUBMIT (CREATE / UPDATE) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('save-product');
        const id = document.getElementById('product-id').value;
        
        const productData = {
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            price: parseFloat(document.getElementById('p-price').value),
            oldPrice: document.getElementById('p-old-price').value ? parseFloat(document.getElementById('p-old-price').value) : null,
            mainImage: mainImageInput.value || 'https://placehold.co/600x400?text=No+Image', // Default if empty
            description: document.getElementById('p-description').value,
            images: [mainImageInput.value || ''],
            specs: [] 
        };

        saveBtn.disabled = true;
        saveBtn.innerText = 'Saqlanmoqda...';

        try {
            const method = id ? 'PATCH' : 'POST';
            const url = id ? `${API_URL}/${id}` : API_URL;

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                showToast(id ? 'Muvaffaqiyatli tahrirlandi' : 'Muvaffaqiyatli qo\'shildi', 'success');
                closeModal();
                fetchAdminProducts();
            } else {
                const err = await response.json();
                showToast(err.message || 'Xatolik yuz berdi', 'error');
            }
        } catch (error) {
            showToast('Server bilan aloqa yo\'q', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = 'Saqlash';
        }
    });
});

async function fetchAdminProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        renderAdminTable(products);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function renderAdminTable(products) {
    const list = document.getElementById('admin-product-list');
    if (!list) return;
    list.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>
                <div style="width:50px; height:50px; overflow:hidden; border-radius:8px;">
                    <img src="${p.mainImage}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://placehold.co/50x50?text=Error'">
                </div>
            </td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>$${p.price.toLocaleString()}</td>
            <td class="action-btns">
                <button class="edit-btn" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        list.appendChild(tr);
    });
}

window.editProduct = async function(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const p = await response.json();
        const imagePreview = document.getElementById('image-preview');

        document.getElementById('product-id').value = p.id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-old-price').value = p.oldPrice || '';
        document.getElementById('p-main-image').value = p.mainImage;
        document.getElementById('p-description').value = p.description;
        
        imagePreview.innerHTML = `<img src="${p.mainImage}" alt="Preview" style="width:100%; height:100%; object-fit:contain;">`;
        imagePreview.classList.add('has-image');

        document.getElementById('modal-title').innerText = 'Mahsulotni tahrirlash';
        document.getElementById('admin-modal').classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
    } catch (error) {
        showToast('Xatolik', 'error');
    }
}

window.deleteProduct = async function(id) {
    if (!confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showToast('O\'chirildi', 'info');
            fetchAdminProducts();
        }
    } catch (error) {
        showToast('Server xatosi', 'error');
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
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
