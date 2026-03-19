// Baraka Market - FullStack API Integration (Final Stable Version)

// --- 1. CONFIGURATION & STATE ---
const API_BASE_URL = 'http://localhost:3000'; 
const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 15;

let products = [];
let currentStep = 1;
let currentUser = null;

// --- 2. GLOBAL FUNCTIONS (Hoisted for reliability) ---

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

function updateCheckoutUI(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById(`step-${step}`);
    if (stepEl) stepEl.classList.add('active');
    
    document.querySelectorAll('.step').forEach((s, i) => { 
        s.classList.toggle('active', i + 1 === step); 
        s.classList.toggle('completed', i + 1 < step); 
    });
    
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    
    if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'block';
    if (nextBtn) nextBtn.innerText = step === 3 ? 'Tasdiqlash' : 'Keyingisi';
    
    if (step === 2) initCheckoutValidation();

    if (step === 3) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartTotalPrice = document.getElementById('cart-total-price');
        document.getElementById('summary-count').innerText = `${cart.length} ta`;
        if (cartTotalPrice) document.getElementById('summary-total').innerText = cartTotalPrice.innerText;
        document.getElementById('preview-name').innerText = document.getElementById('checkout-name').value;
        document.getElementById('preview-phone').innerText = document.getElementById('checkout-phone').value;
        document.getElementById('preview-address').innerText = document.getElementById('checkout-address').value;
    }
}

function initCheckoutValidation() {
    const name = document.getElementById('checkout-name');
    const phone = document.getElementById('checkout-phone');
    const addr = document.getElementById('checkout-address');
    const next = document.getElementById('next-step');
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');

    const validate = () => {
        let valid = true;
        if (currentStep === 1) {
            if (name && name.value.trim().length < 3) { setFieldError(name, true); valid = false; } else if(name) setFieldError(name, false);
            if (phone) {
                const pVal = phone.value.replace(/\D/g, '');
                if (pVal.length !== 12) { setFieldError(phone, true); valid = false; } else setFieldError(phone, false);
            }
            if (addr && addr.value.trim().length < 5) { setFieldError(addr, true); valid = false; } else if(addr) setFieldError(addr, false);
        }
        if (currentStep === 2) {
            const pMethodInput = document.querySelector('input[name="payment"]:checked');
            const pMethod = pMethodInput ? pMethodInput.value : 'cash';
            if (pMethod === 'card') {
                const isNum = (cardNumber.value || "").replace(/\s/g, '').length === 16;
                const isExp = (cardExpiry.value || "").length === 5;
                const isCvv = (cardCvv.value || "").length === 3;
                setFieldError(cardNumber, !isNum); setFieldError(cardExpiry, !isExp); setFieldError(cardCvv, !isCvv);
                if (!isNum || !isExp || !isCvv) valid = false;
            }
        }
        if (next) next.disabled = !valid;
    };

    if (phone) {
        phone.oninput = (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (!val.startsWith('998')) val = '998' + val;
            val = val.substring(0, 12);
            let res = '+998 ';
            if (val.length > 3) res += '(' + val.substring(3, 5) + ') ';
            if (val.length > 5) res += val.substring(5, 8) + ' ';
            if (val.length > 8) res += val.substring(8, 10) + ' ';
            if (val.length > 10) res += val.substring(10, 12);
            e.target.value = res; validate();
        };
    }

    [name, addr, cardNumber, cardExpiry, cardCvv].forEach(el => { if (el) el.oninput = validate; });
    validate();
}

function setFieldError(el, isErr) {
    const gp = el.closest('.form-group');
    if (gp) { gp.classList.toggle('has-error', isErr); gp.classList.toggle('is-valid', !isErr); }
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
    
    const nextBtn = document.getElementById('next-step');
    nextBtn.disabled = true; nextBtn.innerHTML = '<span>Yuborilmoqda...</span><i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
        const result = await res.json();
        if (res.ok) {
            document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = 'none');
            document.getElementById('checkout-success').style.display = 'flex';
            document.getElementById('order-id-val').innerText = result.id;
            localStorage.removeItem('cart'); updateCartUI(); showToast("Buyurtma qabul qilindi!", "success");
        } else {
            showToast(result.message || "Xatolik!", "error");
            nextBtn.disabled = false; nextBtn.innerHTML = 'Tasdiqlash';
        }
    } catch (e) { showToast("Server hatosi", "error"); nextBtn.disabled = false; nextBtn.innerHTML = 'Tasdiqlash'; }
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const toggle = document.getElementById('theme-toggle');
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggle) toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    if (toggle) {
        toggle.onclick = () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        };
    }
}

function initScrollReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
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
        let count = 0; const duration = 2000; const startTime = performance.now();
        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = progress * (2 - progress);
            count = Math.floor(easeProgress * target);
            stat.innerText = count + suffix;
            if (progress < 1) requestAnimationFrame(updateCount); else stat.innerText = target + suffix;
        };
        requestAnimationFrame(updateCount);
    });
}

// --- 3. MAIN INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initUserAuth();
    fetchProducts();
    updateCartUI();
    updateWishlistUI();
    initScrollReveal();
    initHeaderScroll();
    initTestimonialSlider();

    const cartSidebar = document.getElementById('cart-sidebar');
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const productModal = document.getElementById('product-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const authModal = document.getElementById('auth-modal');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('search-input');
    const checkoutBtn = document.querySelector('.checkout-btn');

    const closeAll = () => { [cartSidebar, wishlistSidebar, productModal, checkoutModal, authModal, cartOverlay].forEach(el => el && el.classList.remove('open')); };

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('#user-auth-btn')) { closeAll(); authModal.classList.add('open'); cartOverlay.classList.add('open'); }
        if (target.closest('.cart-btn')) { closeAll(); cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); }
        if (target.closest('.wishlist-btn') && !target.closest('#user-auth-btn')) { closeAll(); wishlistSidebar.classList.add('open'); cartOverlay.classList.add('open'); }
        
        const pCard = target.closest('.payment-card');
        if (pCard) {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active')); pCard.classList.add('active');
            const radio = pCard.querySelector('input[name="payment"]');
            if (radio) {
                radio.checked = true;
                const cardForm = document.getElementById('card-details-form');
                if (radio.value === 'card') {
                    cardForm.style.display = 'block';
                    setTimeout(() => { checkoutModal.scrollTo({ top: checkoutModal.scrollHeight, behavior: 'smooth' }); }, 100);
                } else { cardForm.style.display = 'none'; }
                initCheckoutValidation();
            }
        }

        if (target.closest('#next-step') && !target.closest('#next-step').disabled) { if (currentStep < 3) { currentStep++; updateCheckoutUI(currentStep); } else finalizeOrder(); }
        if (target.closest('#prev-step')) { if (currentStep > 1) { currentStep--; updateCheckoutUI(currentStep); } }
        if (target.closest('.close-cart, .close-wishlist, .close-modal, .close-checkout, #close-auth-modal') || target.classList.contains('cart-overlay')) closeAll();
        
        if (target.closest('.wishlist-toggle')) { e.stopPropagation(); toggleWishlist(parseInt(target.closest('.wishlist-toggle').dataset.id)); }
        if (target.closest('.add-to-cart')) { e.stopPropagation(); handleAddToCart(parseInt(target.closest('.add-to-cart').dataset.id)); }
        if (target.closest('.product-card') && !target.closest('button')) { openQuickView(parseInt(target.closest('.product-card').dataset.id)); }
    });

    if (checkoutBtn) checkoutBtn.onclick = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) {
            document.getElementById('checkout-success').style.display = 'none';
            document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = '');
            currentStep = 1; closeAll(); checkoutModal.classList.add('open'); cartOverlay.classList.add('open');
            initCheckoutValidation(); updateCheckoutUI(currentStep);
        } else showToast("Savatchangiz bo'sh!", "error");
    };

    if (searchInput) searchInput.oninput = (e) => { const query = e.target.value.toLowerCase(); renderProducts(products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))); };
});

// --- 4. HELPERS ---

async function initUserAuth() {
    const token = localStorage.getItem('user_token');
    if (token && token !== 'null') {
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { currentUser = await res.json(); updateUserUI(true); fetchUserOrders(); }
            else { localStorage.removeItem('user_token'); updateUserUI(false); }
        } catch (e) { updateUserUI(false); }
    }
    
    document.getElementById('tab-login').onclick = () => { switchAuthTab('login'); };
    document.getElementById('tab-register').onclick = () => { switchAuthTab('register'); };
    
    document.getElementById('user-login-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/user/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const data = await res.json();
            if (res.ok) { localStorage.setItem('user_token', data.access_token); currentUser = data.user; updateUserUI(true); closeAuthModal(); showToast('Xush kelibsiz!'); } else showToast(data.message, 'error');
        } catch (e) { showToast('Server hatosi', 'error'); }
    };

    document.getElementById('user-register-form').onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/user/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
            if (res.ok) { showToast('Muvaffaqiyatli! Endi kiring.'); switchAuthTab('login'); } else { const data = await res.json(); showToast(data.message, 'error'); }
        } catch (e) { showToast('Server hatosi', 'error'); }
    };

    document.getElementById('user-logout-btn').onclick = () => { localStorage.removeItem('user_token'); currentUser = null; updateUserUI(false); showToast('Tizimdan chiqildi', 'info'); };
}

function switchAuthTab(type) {
    const tl = document.getElementById('tab-login'), tr = document.getElementById('tab-register');
    const fl = document.getElementById('user-login-form'), fr = document.getElementById('user-register-form');
    if (type === 'login') { tl.classList.add('active'); tr.classList.remove('active'); fl.style.display = 'block'; fr.style.display = 'none'; }
    else { tr.classList.add('active'); tl.classList.remove('active'); fr.style.display = 'block'; fl.style.display = 'none'; }
}

function closeAuthModal() { document.getElementById('auth-modal').classList.remove('open'); document.getElementById('cart-overlay').classList.remove('open'); }

function updateUserUI(loggedIn) {
    const pv = document.getElementById('user-profile-view'), lf = document.getElementById('user-login-form');
    const tabs = document.querySelector('.auth-tabs'), btn = document.getElementById('user-auth-btn');
    if (!pv) return;
    if (loggedIn) {
        document.getElementById('profile-name').innerText = `Xush kelibsiz, ${currentUser.name}!`;
        document.getElementById('profile-email').innerText = currentUser.email;
        pv.style.display = 'block'; lf.style.display = 'none'; document.getElementById('user-register-form').style.display = 'none';
        tabs.style.display = 'none'; if(btn) btn.style.color = 'var(--primary-color)';
    } else { pv.style.display = 'none'; lf.style.display = 'block'; tabs.style.display = 'flex'; if(btn) btn.style.color = ''; }
}

async function fetchUserOrders() {
    if (!currentUser) return;
    const token = localStorage.getItem('user_token');
    try {
        const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const container = document.getElementById('order-list');
        if (res.ok && data.orders && data.orders.length > 0) {
            container.innerHTML = data.orders.map(o => `<div style="padding: 10px; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 0.85rem;"><strong>#${o.id}</strong> - $${o.totalAmount.toLocaleString()} <span style="color:var(--primary-color)">${o.status}</span><p style="margin-top:5px; opacity:0.6">${new Date(o.createdAt).toLocaleDateString()}</p></div>`).join('');
        }
    } catch (e) {}
}

async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) { products = await res.json(); renderProducts(products); }
    } catch (e) { }
}

function renderProducts(items) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    items.forEach(product => {
        const isWished = wishlist.includes(product.id);
        const isOutOfStock = product.stock <= 0;
        const card = document.createElement('div');
        card.className = `product-card reveal active ${isOutOfStock ? 'out-of-stock' : ''}`;
        card.dataset.id = product.id;
        card.innerHTML = `
            <button class="wishlist-toggle ${isWished ? 'active' : ''}" data-id="${product.id}"><i class="fas fa-heart"></i></button>
            <div class="product-image" style="${isOutOfStock ? 'filter: grayscale(1); opacity: 0.6;' : ''}">
                <img src="${product.mainImage}" alt="${product.name}" loading="lazy">
                ${isOutOfStock ? '<div class="product-badge out-of-stock-badge">Sotuvda yo\'q</div>' : (product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : '')}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3><p>${product.description.substring(0, 40)}...</p>
                <div class="product-price"><span class="new-price">$${product.price.toLocaleString()}</span></div>
                <button class="add-to-cart" data-id="${product.id}" ${isOutOfStock ? 'disabled style="background: #ccc;"' : ''}>${isOutOfStock ? 'Tugagan' : 'Savatchaga qo\'shish'}</button>
            </div>`;
        grid.appendChild(card);
    });
}

function handleAddToCart(productId) {
    const p = products.find(x => x.id === productId); if (!p) return;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const ex = cart.find(i => i.id === productId);
    if (ex) ex.quantity += 1; else cart.push({ ...p, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI(); showToast(`${p.name} qo'shildi!`);
}

function toggleWishlist(id) {
    let w = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (w.includes(id)) { w = w.filter(x => x !== id); showToast("O'chirildi", "info"); }
    else { w.push(id); showToast("Saqlandi"); }
    localStorage.setItem('wishlist', JSON.stringify(w));
    if (currentUser) {
        const token = localStorage.getItem('user_token');
        fetch(`${API_BASE_URL}/users/wishlist/${id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    }
    renderProducts(products); updateWishlistUI();
}

function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.querySelector('.cart-count');
    if(countEl) countEl.innerText = cart.reduce((s, i) => s + i.quantity, 0);
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    const shippingProgress = document.getElementById('shipping-progress');
    const shippingMsg = document.getElementById('shipping-msg');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-view"><i class="fas fa-shopping-basket"></i><p>Savatchangiz bo'sh</p></div>`;
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
    localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI();
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    localStorage.setItem('cart', JSON.stringify(cart.filter(i => i.id !== id))); updateCartUI();
}

function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const countEl = document.querySelector('.wishlist-count');
    if(countEl) countEl.innerText = wishlist.length;
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

function openQuickView(id) {
    const p = products.find(x => x.id === id); if (!p) return;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.description;
    document.getElementById('modal-price-val').innerText = `$${p.price.toLocaleString()}`;
    const mi = document.getElementById('modal-main-img'), sk = document.querySelector('.modal-skeleton');
    mi.classList.add('hidden'); sk.style.display = 'block'; mi.src = p.mainImage;
    mi.onload = () => { sk.style.display = 'none'; mi.classList.remove('hidden'); };
    const ma = document.getElementById('modal-add-btn');
    ma.onclick = () => { handleAddToCart(p.id); };
    document.getElementById('product-modal').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
}

function switchModalImage(u, el) {
    const mi = document.getElementById('modal-main-img'), sk = document.querySelector('.modal-skeleton');
    mi.style.opacity = '0'; sk.style.display = 'block'; mi.src = u;
    mi.onload = () => { sk.style.display = 'none'; mi.style.opacity = '1'; };
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

function initHeaderScroll() {
    const h = document.querySelector('.header');
    window.addEventListener('scroll', () => { if (window.scrollY > 50) h.classList.add('scrolled'); else h.classList.remove('scrolled'); });
}

function initTestimonialSlider() {
    const t = document.querySelector('.testimonial-track');
    const s = Array.from(document.querySelectorAll('.testimonial-card'));
    if (!t || s.length === 0) return;
    let i = 0; setInterval(() => { i = (i + 1) % s.length; t.style.transform = `translateX(-${i * 100}%)`; }, 5000);
}
