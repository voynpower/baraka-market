// Baraka Market - FullStack API (Final User Auth & Advanced Filtering Integrated)

const API_BASE_URL = 'http://localhost:3000';
let allProducts = []; 
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initUserAuth(); // Restore Full Auth System
    fetchProducts();
    updateCartUI();
    updateWishlistUI();
    initScrollReveal();
    initHeaderScroll();
    initTestimonialSlider();

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const sortBadgeWrapper = document.getElementById('sort-badge-wrapper');
    const categoryTabs = document.querySelectorAll('.tab-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // 1. Search Logic
    if (searchInput) {
        searchInput.oninput = (e) => {
            currentSearch = e.target.value.toLowerCase();
            applyFilters();
        };
    }

    // 2. Category Filter
    categoryTabs.forEach(tab => {
        tab.onclick = () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            applyFilters();
        };
    });

    // 3. Smart Badge Sorting Logic
    if (sortSelect) {
        sortSelect.onchange = (e) => {
            currentSort = e.target.value;
            if (sortBadgeWrapper) sortBadgeWrapper.className = `sort-wrapper status-${currentSort}`;
            applyFilters();
        };
    }

    // Unified Event Delegation
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.closest('.cart-btn')) openSidebar('cart-sidebar');
        if (target.closest('.wishlist-btn') && !target.closest('#user-auth-btn')) openSidebar('wishlist-sidebar');
        if (target.closest('#user-auth-btn')) openSidebar('auth-modal');
        if (target.closest('.search-btn')) {
            const box = document.querySelector('.search-box');
            box.classList.toggle('active');
            if(box.classList.contains('active')) searchInput.focus();
        }
        
        const closeTrigger = target.closest('.close-cart, .close-wishlist, .close-modal, .close-checkout, #close-auth-modal') || target.classList.contains('cart-overlay');
        if (closeTrigger) closeAllModals();

        if (target.closest('.wishlist-toggle')) { e.stopPropagation(); toggleWishlist(parseInt(target.closest('.wishlist-toggle').dataset.id)); }
        if (target.closest('.add-to-cart')) { e.stopPropagation(); handleAddToCart(parseInt(target.closest('.add-to-cart').dataset.id)); }
        if (target.closest('.product-card') && !target.closest('button')) { openQuickView(parseInt(target.closest('.product-card').dataset.id)); }
        if (target.closest('.thumb-item')) { switchModalImage(target.closest('.thumb-item').dataset.url, target.closest('.thumb-item')); }
        
        // Payment Selection
        const pCard = target.closest('.payment-card');
        if (pCard) {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
            pCard.classList.add('active');
            const radio = pCard.querySelector('input[name="payment"]');
            if (radio) radio.checked = true;
        }

        // Checkout Nav
        if (target.closest('#next-step') && !target.closest('#next-step').disabled) {
            const stepEl = document.querySelector('.step.active');
            const step = stepEl ? parseInt(stepEl.dataset.step) : 1;
            if (step < 3) handleCheckoutNavigation(step + 1); else finalizeOrder();
        }
        if (target.closest('#prev-step')) {
            const stepEl = document.querySelector('.step.active');
            const step = stepEl ? parseInt(stepEl.dataset.step) : 1;
            handleCheckoutNavigation(step - 1);
        }
    });

    if (checkoutBtn) checkoutBtn.onclick = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) {
            document.getElementById('checkout-success').style.display = 'none';
            document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = '');
            openSidebar('checkout-modal');
            handleCheckoutNavigation(1);
        } else showToast("Savatchangiz bo'sh!", "error");
    };
});

// --- USER AUTH SYSTEM ---
async function initUserAuth() {
    const token = localStorage.getItem('user_token');
    if (token && token !== 'null') {
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { 
                currentUser = await res.json(); 
                updateUserUI(true);
                fetchUserOrders();
            } else { localStorage.removeItem('user_token'); updateUserUI(false); }
        } catch (e) { updateUserUI(false); }
    }

    // Tab Logic
    const tLogin = document.getElementById('tab-login'), tReg = document.getElementById('tab-register');
    if(tLogin) tLogin.onclick = () => switchAuthTab('login');
    if(tReg) tReg.onclick = () => switchAuthTab('register');

    // Login Submit
    const loginForm = document.getElementById('user-login-form');
    if(loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('user-email').value;
            const password = document.getElementById('user-password').value;
            try {
                const res = await fetch(`${API_BASE_URL}/auth/user/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('user_token', data.access_token);
                    currentUser = data.user;
                    updateUserUI(true);
                    fetchUserOrders();
                    showToast('Xush kelibsiz!');
                } else showToast(data.message, 'error');
            } catch (e) { showToast('Server hatosi', 'error'); }
        };
    }

    // Register Submit
    const regForm = document.getElementById('user-register-form');
    if(regForm) {
        regForm.onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            try {
                const res = await fetch(`${API_BASE_URL}/auth/user/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
                if (res.ok) { showToast('Muvaffaqiyatli! Endi kiring.'); switchAuthTab('login'); }
                else { const data = await res.json(); showToast(data.message, 'error'); }
            } catch (e) { showToast('Server hatosi', 'error'); }
        };
    }

    // Logout
    const logoutBtn = document.getElementById('user-logout-btn');
    if(logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('user_token');
            currentUser = null;
            updateUserUI(false);
            showToast('Tizimdan chiqildi', 'info');
        };
    }
}

function switchAuthTab(type) {
    const tl = document.getElementById('tab-login'), tr = document.getElementById('tab-register');
    const fl = document.getElementById('user-login-form'), fr = document.getElementById('user-register-form');
    if (type === 'login') {
        tl.classList.add('active'); tl.style.color = 'var(--text-dark)';
        tr.classList.remove('active'); tr.style.color = 'var(--text-light)';
        fl.style.display = 'block'; fr.style.display = 'none';
    } else {
        tr.classList.add('active'); tr.style.color = 'var(--text-dark)';
        tl.classList.remove('active'); tl.style.color = 'var(--text-light)';
        fr.style.display = 'block'; fl.style.display = 'none';
    }
}

function updateUserUI(loggedIn) {
    const pv = document.getElementById('user-profile-view'), lf = document.getElementById('user-login-form');
    const rf = document.getElementById('user-register-form'), tabs = document.querySelector('.auth-tabs');
    const btn = document.getElementById('user-auth-btn');
    if (!pv) return;
    if (loggedIn) {
        document.getElementById('profile-name').innerText = `Xush kelibsiz, ${currentUser.name}!`;
        document.getElementById('profile-email').innerText = currentUser.email;
        pv.style.display = 'block'; lf.style.display = 'none'; rf.style.display = 'none'; tabs.style.display = 'none';
        if(btn) btn.style.color = 'var(--primary-color)';
    } else {
        pv.style.display = 'none'; lf.style.display = 'block'; tabs.style.display = 'flex';
        if(btn) btn.style.color = '';
    }
}

async function fetchUserOrders() {
    if (!currentUser) return;
    const token = localStorage.getItem('user_token');
    try {
        const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const container = document.getElementById('order-list');
        if (res.ok && data.orders && data.orders.length > 0) {
            container.innerHTML = data.orders.map(o => `
                <div style="padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 0.85rem;">
                    <strong>#${o.id}</strong> - $${o.totalAmount.toLocaleString()} 
                    <span class="status-badge ${o.status}" style="margin-left:10px;">${o.status}</span>
                    <p style="margin-top:5px; opacity:0.6;">${new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="padding:20px; opacity:0.5; text-align:center;">Hozircha buyurtmalar yo\'q</p>';
        }
    } catch (e) {}
}

// --- FILTERING ENGINE ---
function applyFilters() {
    let filtered = [...allProducts];
    if (currentCategory !== 'all') filtered = filtered.filter(p => p.category === currentCategory);
    if (currentSearch) filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearch) || p.description.toLowerCase().includes(currentSearch));
    if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (currentSort === 'newest') filtered.sort((a, b) => b.id - a.id);
    renderProducts(filtered);
}

// --- CORE FUNCTIONS ---
async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) { allProducts = await res.json(); applyFilters(); }
    } catch (e) { showToast('Server bilan aloqa yo\'q', 'error'); }
}

function renderProducts(items) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (items.length === 0) {
        grid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 5rem 0; opacity: 0.6;"><i class="fas fa-search" style="font-size: 4rem; margin-bottom: 1.5rem;"></i><h3>Mahsulot topilmadi</h3><p>Boshqa so'zlar bilan qidirib ko'ring</p></div>`;
        return;
    }
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    items.forEach(product => {
        const isWished = wishlist.includes(product.id);
        const isOutOfStock = product.stock <= 0;
        const card = document.createElement('div');
        card.className = `product-card reveal active ${isOutOfStock ? 'out-of-stock' : ''}`;
        card.innerHTML = `
            <button class="wishlist-toggle ${isWished ? 'active' : ''}" data-id="${product.id}"><i class="fas fa-heart"></i></button>
            <div class="product-image" style="${isOutOfStock ? 'filter: grayscale(1); opacity: 0.6;' : ''}">
                <img src="${product.mainImage}" alt="${product.name}" loading="lazy">
                ${isOutOfStock ? '<div class="product-badge out-of-stock-badge">Sotuvda yo\'q</div>' : (product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : '')}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3><p>${product.description.substring(0, 40)}...</p>
                <div class="product-price"><span class="new-price">$${product.price.toLocaleString()}</span></div>
                <button class="add-to-cart" data-id="${product.id}" ${isOutOfStock ? 'disabled style="background: #ccc;"' : ''}>${isOutOfStock ? 'Tugagan' : 'Savatchaga'}</button>
            </div>`;
        grid.appendChild(card);
    });
}

function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price-val').innerText = `$${product.price.toLocaleString()}`;
    const mainImg = document.getElementById('modal-main-img');
    const skeleton = document.querySelector('.modal-skeleton');
    if(mainImg) {
        mainImg.classList.add('hidden'); if(skeleton) skeleton.style.display = 'block';
        mainImg.src = product.mainImage;
        mainImg.onload = () => { if(skeleton) skeleton.style.display = 'none'; mainImg.classList.remove('hidden'); };
    }
    const gallery = document.getElementById('modal-gallery');
    if (gallery) {
        const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
        gallery.innerHTML = images.map((img, idx) => `<div class="thumb-item ${idx === 0 ? 'active' : ''}" data-url="${img}"><img src="${img}" alt="Thumb"></div>`).join('');
    }
    const specs = Array.isArray(product.specs) ? product.specs : JSON.parse(product.specs || '[]');
    const specsCont = document.getElementById('modal-specs');
    if(specsCont) specsCont.innerHTML = specs.map(s => `<div class="spec-item"><i class="fas ${s.icon}"></i><span>${s.val}</span></div>`).join('');
    document.getElementById('modal-add-btn').onclick = () => { handleAddToCart(product.id); };
    openSidebar('product-modal');
}

function switchModalImage(imgUrl, element) {
    const mainImg = document.getElementById('modal-main-img');
    if(!mainImg) return;
    mainImg.style.opacity = '0'; mainImg.src = imgUrl;
    mainImg.onload = () => { mainImg.style.opacity = '1'; };
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

function handleCheckoutNavigation(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.add('active');
    document.querySelectorAll('.step').forEach((s, i) => { s.classList.toggle('active', i + 1 === step); s.classList.toggle('completed', i + 1 < step); });
    document.getElementById('prev-step').style.display = step === 1 ? 'none' : 'block';
    document.getElementById('next-step').innerText = step === 3 ? 'Tasdiqlash' : 'Keyingisi';
    if (step === 3) {
        const nameInput = document.getElementById('checkout-name');
        const totalEl = document.getElementById('cart-total-price');
        document.getElementById('preview-name').innerText = nameInput ? nameInput.value : '-';
        document.getElementById('summary-total').innerText = totalEl ? totalEl.innerText : '$0';
    }
}

async function finalizeOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderData = {
        customerName: document.getElementById('checkout-name').value,
        customerPhone: document.getElementById('checkout-phone').value,
        customerAddress: document.getElementById('checkout-address').value,
        totalAmount: parseFloat(document.getElementById('cart-total-price').innerText.replace(/[^0-9.]/g, '')),
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        items: cart
    };
    if (currentUser) orderData.userId = currentUser.id;
    try {
        const res = await fetch(`${API_BASE_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
        if (res.ok) {
            const result = await res.json();
            document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = 'none');
            document.getElementById('checkout-success').style.display = 'flex';
            document.getElementById('order-id-val').innerText = result.id;
            localStorage.removeItem('cart'); updateCartUI();
        } else { const err = await res.json(); showToast(err.message, 'error'); }
    } catch (e) { showToast('Server hatosi', 'error'); }
}

// --- UTILS ---
function openSidebar(id) { closeAllModals(); const el = document.getElementById(id); if(el) el.classList.add('open'); document.getElementById('cart-overlay').classList.add('open'); }
function closeAllModals() { document.querySelectorAll('.cart-sidebar, .wishlist-sidebar, .product-modal, .cart-overlay, .checkout-modal').forEach(el => el.classList.remove('open')); }

function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.querySelector('.cart-count');
    if(countEl) countEl.innerText = cart.reduce((s, i) => s + i.quantity, 0);
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    if (!container) return;
    if (cart.length === 0) { container.innerHTML = `<div class="empty-cart-view"><i class="fas fa-shopping-basket"></i><p>Bo'sh</p></div>`; totalEl.innerText = '$0'; return; }
    container.innerHTML = ''; let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div'); div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.mainImage}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toLocaleString()} x ${item.quantity}</p>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button>
                    <span class="qty-num">${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>`;
        container.appendChild(div);
    });
    totalEl.innerText = `$${subtotal.toLocaleString()}`;
}

function changeQuantity(id, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function removeFromCart(id) { let cart = JSON.parse(localStorage.getItem('cart')) || []; localStorage.setItem('cart', JSON.stringify(cart.filter(i => i.id !== id))); updateCartUI(); }
function handleAddToCart(id) { const p = allProducts.find(x => x.id === id); let cart = JSON.parse(localStorage.getItem('cart')) || []; const ex = cart.find(i => i.id === id); if (ex) ex.quantity++; else cart.push({...p, quantity: 1}); localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI(); showToast(`${p.name} qo'shildi!`); }
function toggleWishlist(id) { let w = JSON.parse(localStorage.getItem('wishlist')) || []; if (w.includes(id)) w = w.filter(x => x !== id); else w.push(id); localStorage.setItem('wishlist', JSON.stringify(w)); updateWishlistUI(); applyFilters(); }

function updateWishlistUI() {
    const w = JSON.parse(localStorage.getItem('wishlist')) || [];
    const countEl = document.querySelector('.wishlist-count');
    if(countEl) countEl.innerText = w.length;
    const container = document.getElementById('wishlist-items');
    if (!container) return;
    container.innerHTML = w.length === 0 ? '<p style="text-align:center; padding:2rem; opacity:0.5;">Bo\'sh</p>' : w.map(id => {
        const p = allProducts.find(x => x.id === id);
        return p ? `<div class="wishlist-item" style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem; padding:1rem; background:white; border-radius:10px;"><img src="${p.mainImage}" alt="${p.name}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"><h4>${p.name}</h4></div>` : '';
    }).join('');
}

function showToast(msg, type = 'success') { 
    const c = document.getElementById('toast-container');
    if(!c) return;
    const t = document.createElement('div'); t.className = `toast ${type}`; t.innerText = msg;
    c.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000); 
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
    const btn = document.getElementById('theme-toggle');
    if(btn) {
        btn.onclick = () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        };
    }
}

function initScrollReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                // Trigger animation if it's the about section
                if (e.target.id === 'about') animateStats();
            }
        });
    }, { threshold: 0.1 });
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
        let count = 0;
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function for smoother start/end
            const easeProgress = progress * (2 - progress);
            count = Math.floor(easeProgress * target);
            
            stat.innerText = count + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                stat.innerText = text; // Ensure final text is exact
            }
        };
        requestAnimationFrame(updateCount);
    });
}
function initHeaderScroll() { window.onscroll = () => { const h = document.querySelector('.header'); if(h) h.classList.toggle('scrolled', window.scrollY > 50); }; }
function initTestimonialSlider() { const t = document.querySelector('.testimonial-track'); const s = document.querySelectorAll('.testimonial-card'); if (!t || s.length === 0) return; let i = 0; setInterval(() => { i = (i + 1) % s.length; t.style.transform = `translateX(-${i * 100}%)`; }, 5000); }
