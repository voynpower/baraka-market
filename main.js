// Baraka Market - FullStack API Integration (User Auth & Sync Edition)

// Configuration
const API_BASE_URL = 'http://localhost:3000'; 
const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 15;

// Fallback Data
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'iPhone 15 Pro',
        category: 'phones',
        price: 999,
        badge: 'Yangi',
        mainImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800',
        description: 'Titan dizayn, A17 Pro chip va professional kamera tizimi.',
        specs: [{ icon: 'fa-microchip', val: 'A17 Pro' }, { icon: 'fa-camera', val: '48MP' }],
        images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800']
    }
];

let products = [...DEFAULT_PRODUCTS];
let currentStep = 1;
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initUserAuth(); // New: Initialize User Authentication
    fetchProducts(); 
    updateCartUI();
    updateWishlistUI();
    initScrollReveal();
    initTestimonialSlider();
    initHeaderScroll();

    // DOM Elements
    const cartBtn = document.querySelector('.cart-btn');
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const userAuthBtn = document.getElementById('user-auth-btn'); // New
    
    const cartSidebar = document.getElementById('cart-sidebar');
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const productModal = document.getElementById('product-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const authModal = document.getElementById('auth-modal'); // New
    
    const themeToggle = document.getElementById('theme-toggle');
    const searchToggle = document.getElementById('search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('search-input');
    const checkoutBtn = document.querySelector('.checkout-btn');

    const closeAll = () => {
        [cartSidebar, wishlistSidebar, productModal, checkoutModal, authModal, cartOverlay].forEach(el => el && el.classList.remove('open'));
    };

    // Event Delegation
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // Wishlist Toggle
        const wishBtn = target.closest('.wishlist-toggle');
        if (wishBtn) { e.stopPropagation(); toggleWishlist(parseInt(wishBtn.dataset.id)); return; }
        
        // Add to Cart
        const addBtn = target.closest('.add-to-cart');
        if (addBtn) { e.stopPropagation(); handleAddToCart(parseInt(addBtn.dataset.id)); return; }
        
        // Product Card (Open Modal)
        const card = target.closest('.product-card');
        if (card && !target.closest('button')) { openQuickView(parseInt(card.dataset.id)); return; }
        
        // Modal Thumbnail
        const thumb = target.closest('.thumb-item');
        if (thumb) { switchModalImage(thumb.dataset.url, thumb); return; }
        
        // UI Toggles
        if (target.closest('.cart-btn')) { closeAll(); cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); }
        if (target.closest('.wishlist-btn')) { closeAll(); wishlistSidebar.classList.add('open'); cartOverlay.classList.add('open'); }
        if (target.closest('#user-auth-btn')) { closeAll(); authModal.classList.add('open'); cartOverlay.classList.add('open'); }
        if (target.closest('.search-btn')) { searchBox.classList.toggle('active'); if(searchBox.classList.contains('active')) searchInput.focus(); }
        
        // Close buttons & Overlay
        if (target.closest('.close-cart, .close-wishlist, .close-modal, .close-checkout, #close-auth-modal') || target.classList.contains('cart-overlay')) closeAll();
    });

    // Checkout Navigation
    document.addEventListener('click', (e) => {
        const nextBtn = e.target.closest('#next-step');
        const prevBtn = e.target.closest('#prev-step');
        if (nextBtn && !nextBtn.disabled) {
            if (currentStep < 3) { currentStep++; updateCheckoutUI(currentStep); } else finalizeOrder();
        }
        if (prevBtn) { if (currentStep > 1) { currentStep--; updateCheckoutUI(currentStep); } }
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            renderProducts(products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)));
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length > 0) {
                currentStep = 1; closeAll(); checkoutModal.classList.add('open'); cartOverlay.classList.add('open');
                initCheckoutValidation(); updateCheckoutUI(currentStep);
            } else showToast("Savatchangiz bo'sh!", "error");
        });
    }
});

// --- USER AUTH & SYNC LOGIC ---

async function initUserAuth() {
    const token = localStorage.getItem('user_token');
    const userInfo = JSON.parse(localStorage.getItem('user_info'));
    
    if (token && userInfo) {
        currentUser = userInfo;
        updateUserUI(true);
        fetchUserWishlist(); // Sync wishlist on load
    }

    // Tab Switching
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('user-login-form');
    const registerForm = document.getElementById('user-register-form');

    tabLogin.onclick = () => {
        tabLogin.classList.add('active'); tabLogin.style.color = 'var(--text-dark)';
        tabRegister.classList.remove('active'); tabRegister.style.color = 'var(--text-light)';
        loginForm.style.display = 'block'; registerForm.style.display = 'none';
    };

    tabRegister.onclick = () => {
        tabRegister.classList.add('active'); tabRegister.style.color = 'var(--text-dark)';
        tabLogin.classList.remove('active'); tabLogin.style.color = 'var(--text-light)';
        registerForm.style.display = 'block'; loginForm.style.display = 'none';
    };

    // Login Submission
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user_token', data.access_token);
                localStorage.setItem('user_info', JSON.stringify(data.user));
                currentUser = data.user;
                showToast(`Xush kelibsiz, ${currentUser.name}!`, 'success');
                updateUserUI(true);
                syncWishlistWithServer(); // Sync local hearts to server
                document.getElementById('auth-modal').classList.remove('open');
                document.getElementById('cart-overlay').classList.remove('open');
            } else showToast(data.message, 'error');
        } catch (e) { showToast('Server hatosi', 'error'); }
    };

    // Register Submission
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            if (res.ok) {
                showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Endi kiring.', 'success');
                tabLogin.click();
            } else {
                const data = await res.json();
                showToast(data.message, 'error');
            }
        } catch (e) { showToast('Server hatosi', 'error'); }
    };

    // Logout
    document.getElementById('user-logout-btn').onclick = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
        currentUser = null;
        updateUserUI(false);
        showToast('Tizimdan chiqildi', 'info');
    };
}

function updateUserUI(loggedIn) {
    const profileView = document.getElementById('user-profile-view');
    const loginForm = document.getElementById('user-login-form');
    const authTabs = document.querySelector('.auth-tabs');
    const userAuthBtn = document.getElementById('user-auth-btn');

    if (loggedIn) {
        document.getElementById('profile-name').innerText = `Xush kelibsiz, ${currentUser.name}!`;
        document.getElementById('profile-email').innerText = currentUser.email;
        profileView.style.display = 'block';
        loginForm.style.display = 'none';
        document.getElementById('user-register-form').style.display = 'none';
        authTabs.style.display = 'none';
        userAuthBtn.style.color = 'var(--accent-color)';
        fetchUserOrders();
    } else {
        profileView.style.display = 'none';
        loginForm.style.display = 'block';
        authTabs.style.display = 'flex';
        userAuthBtn.style.color = '#e74c3c'; // Back to original color
    }
}

async function fetchUserWishlist() {
    if (!currentUser) return;
    try {
        const token = localStorage.getItem('user_token');
        const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            const serverIds = data.wishlist.map(w => w.productId);
            let localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            // Merge unique
            const combined = [...new Set([...localWishlist, ...serverIds])];
            localStorage.setItem('wishlist', JSON.stringify(combined));
            renderProducts(products);
            updateWishlistUI();
        }
    } catch (e) { console.error('Wishlist sync error:', e); }
}

async function syncWishlistWithServer() {
    if (!currentUser) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    try {
        const token = localStorage.getItem('user_token');
        await fetch(`${API_BASE_URL}/users/wishlist/sync`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productIds: wishlist })
        });
    } catch (e) { console.error('Wishlist full sync error:', e); }
}

async function fetchUserOrders() {
    if (!currentUser) return;
    try {
        const token = localStorage.getItem('user_token');
        const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const listContainer = document.getElementById('order-list');
        if (res.ok && data.orders.length > 0) {
            listContainer.innerHTML = data.orders.map(o => `
                <div style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.85rem;">
                    <strong>#${o.id}</strong> - $${o.totalAmount.toLocaleString()} 
                    <span style="color:var(--accent-color)">${o.status}</span>
                    <p style="margin-top:5px; color:var(--text-light)">${new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
            `).join('');
        }
    } catch (e) { console.error('Orders fetch error:', e); }
}

// --- CORE FUNCTIONS (Updated) ---

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (data && data.length > 0) { products = data; renderProducts(products); }
    } catch (e) { renderProducts(products); }
}

function renderProducts(items) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    items.forEach(product => {
        const isWished = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = 'product-card reveal active'; 
        card.dataset.id = product.id;
        let badgeHtml = product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : '';
        card.innerHTML = `
            <button class="wishlist-toggle ${isWished ? 'active' : ''}" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <div class="product-image"><img src="${product.mainImage}" alt="${product.name}" loading="lazy">${badgeHtml}</div>
            <div class="product-info">
                <h3>${product.name}</h3><p>${product.description.substring(0, 40)}...</p>
                <div class="product-price"><span class="new-price">$${product.price.toLocaleString()}</span></div>
                <button class="add-to-cart" data-id="${product.id}">Savatchaga qo'shish</button>
            </div>`;
        grid.appendChild(card);
    });
}

function handleAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += 1; else cart.push({ ...product, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showToast(`${product.name} savatchaga qo'shildi!`);
    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.style.animation = 'none';
    setTimeout(() => cartBtn.style.animation = 'bounceNumber 0.5s ease', 10);
}

function toggleWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    let isAdding = false;
    if (wishlist.includes(id)) { 
        wishlist = wishlist.filter(x => x !== id); 
        showToast("O'chirildi", "info"); 
    } else { 
        wishlist.push(id); 
        showToast("Sevimli mahsulotlarga qo'shildi");
        isAdding = true;
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Sync with server if logged in
    if (currentUser) {
        const token = localStorage.getItem('user_token');
        fetch(`${API_BASE_URL}/users/wishlist/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    renderProducts(products);
    updateWishlistUI();
}

async function finalizeOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderData = {
        customerName: document.getElementById('checkout-name').value, customerPhone: document.getElementById('checkout-phone').value,
        customerAddress: document.getElementById('checkout-address').value, totalAmount: parseFloat(document.getElementById('cart-total-price').innerText.replace(/[^0-9.]/g, '')),
        paymentMethod: document.querySelector('input[name="payment"]:checked').value, items: cart,
        userId: currentUser ? currentUser.id : null // Link to user
    };
    const nextBtn = document.getElementById('next-step');
    nextBtn.disabled = true; nextBtn.innerHTML = '<span>Yuborilmoqda...</span><i class="fas fa-spinner fa-spin"></i>';
    try {
        const res = await fetch(`${API_BASE_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
        if (res.ok) {
            const saved = await res.json();
            document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = 'none');
            document.getElementById('checkout-success').style.display = 'flex';
            document.getElementById('order-id-val').innerText = saved.id;
            localStorage.removeItem('cart'); updateCartUI(); showToast("Buyurtma qabul qilindi!", "success");
        } else throw new Error();
    } catch (e) { showToast("Xatolik!", "error"); nextBtn.disabled = false; nextBtn.innerHTML = 'Tasdiqlash'; }
}

// --- UTILS ---

function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.querySelector('.cart-count').innerText = cart.reduce((s, i) => s + i.quantity, 0);
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    const shippingMsg = document.getElementById('shipping-msg');
    const shippingProgress = document.getElementById('shipping-progress');
    if (cart.length === 0) {
        if (container) container.innerHTML = `<div class="empty-cart-view"><i class="fas fa-shopping-basket"></i><p>Savatchangiz hozircha bo'sh</p></div>`;
        if (totalEl) totalEl.innerText = '$0'; if (shippingProgress) shippingProgress.style.width = '0%'; return;
    }
    container.innerHTML = ''; let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div'); div.className = 'cart-item'; div.setAttribute('data-id', item.id);
        div.innerHTML = `<img src="${item.mainImage}" alt="${item.name}" class="cart-item-img"><div class="cart-item-info"><h4>${item.name}</h4><p>$${item.price.toLocaleString()} x ${item.quantity}</p><div class="quantity-controls"><button onclick="changeQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button><span class="qty-num">${item.quantity}</span><button onclick="changeQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button></div></div><button onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>`;
        container.appendChild(div);
    });
    totalEl.innerText = `$${(subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE)).toLocaleString()}`;
    if (shippingMsg && shippingProgress) {
        const percent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
        shippingProgress.style.width = `${percent}%`;
        shippingMsg.innerHTML = subtotal >= FREE_SHIPPING_THRESHOLD ? 'Bepul yetkazib berish!' : `Yana <span>$${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</span> xarid qiling`;
    }
}

function changeQuantity(id, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === id);
    if (item) { item.quantity += delta; if (item.quantity <= 0) cart = cart.filter(i => i.id !== id); }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    setTimeout(() => { const el = document.querySelector(`.cart-item[data-id="${id}"] .qty-num`); if (el) { el.classList.add('quantity-bounce'); setTimeout(() => el.classList.remove('quantity-bounce'), 400); } }, 10);
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    localStorage.setItem('cart', JSON.stringify(cart.filter(i => i.id !== id)));
    updateCartUI();
}

function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    document.querySelector('.wishlist-count').innerText = wishlist.length;
    const container = document.getElementById('wishlist-items');
    if (!container) return;
    if (wishlist.length === 0) { container.innerHTML = `<div class="empty-wishlist-view"><i class="fas fa-heart-broken"></i><p>Bo'sh</p></div>`; return; }
    container.innerHTML = '';
    wishlist.forEach(id => {
        const p = products.find(x => x.id === id);
        if (p) {
            const div = document.createElement('div'); div.className = 'wishlist-item';
            div.innerHTML = `<img src="${p.mainImage}" alt="${p.name}" class="wishlist-item-img"><div class="wishlist-item-info"><h4>${p.name}</h4><p>$${p.price.toLocaleString()}</p></div><div class="wishlist-actions"><button onclick="handleAddToCart(${p.id}); toggleWishlist(${p.id})"><i class="fas fa-cart-plus"></i></button><button onclick="toggleWishlist(${p.id})"><i class="fas fa-trash"></i></button></div>`;
            container.appendChild(div);
        }
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div'); toast.className = `toast ${type}`;
    let icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 400); }, 3000);
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
}

function initScrollReveal() {
    const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); if (e.target.id === 'about') animateStats(); } }); }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        if (stat.classList.contains('animated')) return;
        stat.classList.add('animated');
        const text = stat.innerText;
        const target = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        let count = 0; const duration = 2000; const startTime = performance.now();
        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime; const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = progress * (2 - progress); count = Math.floor(easeProgress * target);
            stat.innerText = count + suffix; if (progress < 1) requestAnimationFrame(updateCount); else stat.innerText = target + suffix;
        };
        requestAnimationFrame(updateCount);
    });
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => { if (window.scrollY > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled'); });
}

function initTestimonialSlider() {
    const track = document.querySelector('.testimonial-track');
    const slides = Array.from(document.querySelectorAll('.testimonial-card'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    if (!track || slides.length === 0) return;
    let idx = 0;
    const update = (i) => { track.style.transform = `translateX(-${i * 100}%)`; slides.forEach((s, j) => s.classList.toggle('active', i === j)); dots.forEach((d, j) => d.classList.toggle('active', i === j)); idx = i; };
    dots.forEach((dot, i) => dot.onclick = () => update(i));
    setInterval(() => update((idx + 1) % slides.length), 5000);
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price-val').innerText = `$${product.price.toLocaleString()}`;
    const mainImg = document.getElementById('modal-main-img');
    const skeleton = document.querySelector('.modal-skeleton');
    mainImg.classList.add('hidden'); skeleton.style.display = 'block'; mainImg.src = product.mainImage;
    mainImg.onload = () => { skeleton.style.display = 'none'; mainImg.classList.remove('hidden'); };
    const gallery = document.getElementById('modal-gallery');
    if (gallery) {
        const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
        gallery.innerHTML = images.map((img, idx) => `<div class="thumb-item ${idx === 0 ? 'active' : ''}" data-url="${img}"><img src="${img}" alt="Thumb"></div>`).join('');
    }
    const specs = Array.isArray(product.specs) ? product.specs : JSON.parse(product.specs || '[]');
    document.getElementById('modal-specs').innerHTML = specs.map(s => `<div class="spec-item"><i class="fas ${s.icon}"></i><span>${s.val}</span></div>`).join('');
    const modalAddBtn = document.getElementById('modal-add-btn');
    modalAddBtn.classList.remove('success'); modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`;
    modalAddBtn.onclick = () => {
        handleAddToCart(product.id);
        modalAddBtn.classList.add('success'); modalAddBtn.innerHTML = `<span>Savatchaga qo'shildi!</span><i class="fas fa-check"></i>`;
        setTimeout(() => { modalAddBtn.classList.remove('success'); modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`; }, 2000);
    };
    document.getElementById('product-modal').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
}

function switchModalImage(imgUrl, element) {
    const mainImg = document.getElementById('modal-main-img');
    const skeleton = document.querySelector('.modal-skeleton');
    mainImg.style.opacity = '0'; skeleton.style.display = 'block'; mainImg.src = imgUrl;
    mainImg.onload = () => { skeleton.style.display = 'none'; mainImg.style.opacity = '1'; };
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

function initCheckoutValidation() {
    const name = document.getElementById('checkout-name');
    const phone = document.getElementById('checkout-phone');
    const addr = document.getElementById('checkout-address');
    const next = document.getElementById('next-step');
    const validate = () => {
        let valid = true;
        if (name.value.trim().length < 3) { setFieldError(name, true); valid = false; } else setFieldError(name, false);
        const pVal = phone.value.replace(/\D/g, '');
        if (pVal.length !== 12) { setFieldError(phone, true); valid = false; } else setFieldError(phone, false);
        if (addr.value.trim().length < 5) { setFieldError(addr, true); valid = false; } else setFieldError(addr, false);
        next.disabled = !valid;
    };
    phone.oninput = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (!val.startsWith('998')) val = '998' + val; val = val.substring(0, 12);
        let res = '+998 ';
        if (val.length > 3) res += '(' + val.substring(3, 5) + ') ';
        if (val.length > 5) res += val.substring(5, 8) + ' ';
        if (val.length > 8) res += val.substring(8, 10) + ' ';
        if (val.length > 10) res += val.substring(10, 12);
        e.target.value = res; validate();
    };
    name.oninput = addr.oninput = validate; validate();
}

function setFieldError(el, isErr) {
    const gp = el.closest('.form-group');
    if (gp) { gp.classList.toggle('has-error', isErr); gp.classList.toggle('is-valid', !isErr); }
}
