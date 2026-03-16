// Onlayn Market - Premium System (Real Photos, Skeleton UI & Real-time Validation)

// Configuration
const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 15;

// Premium Product Data with High-Res Unsplash Images
const products = [
    {
        id: 1,
        name: 'iPhone 15 Pro',
        category: 'phones',
        price: 999,
        oldPrice: 1199,
        badge: 'Yangi',
        mainImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1695048133142-13c8ed7bc23c?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1695048132813-909df9939907?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1691424043140-9aa3ad3247cc?q=80&w=800&auto=format&fit=crop'
        ],
        description: 'Titan dizayn, A17 Pro chip va professional kamera tizimi. Eng kuchli iPhone tajribasi.',
        specs: [
            { icon: 'fa-microchip', val: 'A17 Pro' },
            { icon: 'fa-camera', val: '48MP' },
            { icon: 'fa-battery-full', val: '24h+' }
        ]
    },
    {
        id: 2,
        name: 'MacBook Pro M3',
        category: 'laptops',
        price: 1999,
        oldPrice: 2499,
        badge: 'Chegirma',
        badgeClass: 'sale',
        mainImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1611186871348-b1ec696e5237?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop'
        ],
        description: 'Professional ishlar va ijod uchun yaratilgan qudrat. M3 chipi bilan yangi bosqichga chiqing.',
        specs: [
            { icon: 'fa-microchip', val: 'M3 Pro' },
            { icon: 'fa-memory', val: '18GB' },
            { icon: 'fa-desktop', val: '14.2"' }
        ]
    },
    {
        id: 3,
        name: 'AirPods Pro',
        category: 'accessories',
        price: 249,
        mainImage: 'https://images.unsplash.com/photo-1588423770574-910ae27755a7?q=80&w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1588423770574-910ae27755a7?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
        ],
        description: 'Musiqa va ovozning yangi darajasi. Active Noise Cancellation va Spatial Audio tajribasi.',
        specs: [
            { icon: 'fa-volume-up', val: 'ANC' },
            { icon: 'fa-bluetooth', val: 'BT 5.3' },
            { icon: 'fa-tint', val: 'IPX4' }
        ]
    },
    {
        id: 4,
        name: 'iPad Air',
        category: 'tablets',
        price: 599,
        mainImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1527698266440-12104e498b76?q=80&w=800&auto=format&fit=crop'
        ],
        description: 'Kreativ ishlar va o\'yinlar uchun mukammal hamroh. M2 chipi bilan yanada tezroq va kuchliroq.',
        specs: [
            { icon: 'fa-microchip', val: 'M2 Chip' },
            { icon: 'fa-pencil-alt', val: 'Pencil' },
            { icon: 'fa-tablet-alt', val: '10.9"' }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProducts(products);
    updateCartUI();
    updateWishlistUI();
    initScrollReveal();
    initTestimonialSlider();
    initHeaderScroll();

    // UI Elements
    const cartBtn = document.querySelector('.cart-btn');
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const productModal = document.getElementById('product-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const themeToggle = document.getElementById('theme-toggle');
    const searchToggle = document.getElementById('search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('search-input');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');

    const closeAll = () => {
        [cartSidebar, wishlistSidebar, productModal, checkoutModal, cartOverlay].forEach(el => el && el.classList.remove('open'));
    };

    cartBtn.addEventListener('click', () => { closeAll(); cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); });
    wishlistBtn.addEventListener('click', () => { closeAll(); wishlistSidebar.classList.add('open'); cartOverlay.classList.add('open'); });
    document.querySelectorAll('.close-cart, .close-wishlist, .close-modal, .close-checkout, .cart-overlay').forEach(btn => btn.addEventListener('click', closeAll));

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    searchToggle.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) searchInput.focus();
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        renderProducts(filtered);
    });

    document.querySelectorAll('.floating-card').forEach(card => {
        card.addEventListener('click', () => {
            const categoryMap = { 'Telefonlar': 'phones', 'Noutbuklar': 'laptops', 'Aksessuarlar': 'accessories' };
            const category = categoryMap[card.querySelector('span').innerText];
            if (category) {
                renderProducts(products.filter(p => p.category === category));
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Checkout Modal Logic
    let currentStep = 1;
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length > 0) {
                currentStep = 1;
                closeAll();
                checkoutModal.classList.add('open');
                cartOverlay.classList.add('open');
                initCheckoutValidation();
                updateCheckoutUI(currentStep);
            } else {
                showToast("Savatchangiz bo'sh!", "error");
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < 3) { currentStep++; updateCheckoutUI(currentStep); }
            else finalizeOrder();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) { currentStep--; updateCheckoutUI(currentStep); }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

// --- CORE FUNCTIONS ---

function renderProducts(items) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    items.forEach(product => {
        const isWished = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = 'product-card reveal active'; 
        card.onclick = () => openQuickView(product.id);
        let badgeHtml = product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : '';
        card.innerHTML = `
            <button class="wishlist-toggle ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
                <i class="fas fa-heart"></i>
            </button>
            <div class="product-image"><img src="${product.mainImage}" alt="${product.name}" loading="lazy">${badgeHtml}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 40)}...</p>
                <div class="product-price"><span class="new-price">$${product.price.toLocaleString()}</span></div>
                <button class="add-to-cart" onclick="event.stopPropagation(); handleAddToCart(${product.id})">Savatchaga qo'shish</button>
            </div>`;
        grid.appendChild(card);
    });
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price-val').innerText = `$${product.price.toLocaleString()}`;
    
    const mainImg = document.getElementById('modal-main-img');
    const skeleton = document.querySelector('.modal-skeleton');
    mainImg.classList.add('hidden');
    skeleton.style.display = 'block';
    mainImg.src = product.mainImage;
    mainImg.onload = () => { skeleton.style.display = 'none'; mainImg.classList.remove('hidden'); };
    
    const gallery = document.getElementById('modal-gallery');
    if (gallery) {
        gallery.innerHTML = product.images.map((img, idx) => `
            <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="switchModalImage('${img}', this)">
                <img src="${img}" alt="Thumbnail">
            </div>`).join('');
    }
    document.getElementById('modal-specs').innerHTML = product.specs.map(s => `<div class="spec-item"><i class="fas ${s.icon}"></i><span>${s.val}</span></div>`).join('');
    const modalAddBtn = document.getElementById('modal-add-btn');
    modalAddBtn.classList.remove('success');
    modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`;
    modalAddBtn.onclick = () => {
        handleAddToCart(product.id);
        modalAddBtn.classList.add('success');
        modalAddBtn.innerHTML = `<span>Savatchaga qo'shildi!</span><i class="fas fa-check"></i>`;
        setTimeout(() => { modalAddBtn.classList.remove('success'); modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`; }, 2000);
    };
    document.getElementById('product-modal').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
}

function switchModalImage(imgUrl, element) {
    const mainImg = document.getElementById('modal-main-img');
    const skeleton = document.querySelector('.modal-skeleton');
    mainImg.style.opacity = '0';
    skeleton.style.display = 'block';
    mainImg.src = imgUrl;
    mainImg.onload = () => { skeleton.style.display = 'none'; mainImg.style.opacity = '1'; };
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

// --- CHECKOUT VALIDATION ---

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
        if (addr.value.trim().length < 10) { setFieldError(addr, true); valid = false; } else setFieldError(addr, false);
        next.disabled = !valid;
    };

    phone.oninput = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (!val.startsWith('998')) val = '998' + val;
        val = val.substring(0, 12);
        let res = '+998 ';
        if (val.length > 3) res += '(' + val.substring(3, 5) + ') ';
        if (val.length > 5) res += val.substring(5, 8) + ' ';
        if (val.length > 8) res += val.substring(8, 10) + ' ';
        if (val.length > 10) res += val.substring(10, 12);
        e.target.value = res;
        validate();
    };
    name.oninput = addr.oninput = validate;
    validate();
}

function setFieldError(el, isErr) {
    const gp = el.closest('.form-group');
    gp.classList.toggle('has-error', isErr);
    gp.classList.toggle('is-valid', !isErr);
}

function updateCheckoutUI(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    document.querySelectorAll('.step').forEach((s, i) => {
        s.classList.toggle('active', i + 1 === step);
        s.classList.toggle('completed', i + 1 < step);
    });
    document.getElementById('prev-step').style.display = step === 1 ? 'none' : 'block';
    document.getElementById('next-step').innerText = step === 3 ? 'Tasdiqlash' : 'Keyingisi';
    if (step === 3) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        document.getElementById('summary-count').innerText = `${cart.length} ta`;
        document.getElementById('summary-total').innerText = document.getElementById('cart-total-price').innerText;
        document.getElementById('preview-name').innerText = document.getElementById('checkout-name').value;
        document.getElementById('preview-phone').innerText = document.getElementById('checkout-phone').value;
        document.getElementById('preview-address').innerText = document.getElementById('checkout-address').value;
    }
}

function finalizeOrder() {
    document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = 'none');
    document.getElementById('checkout-success').style.display = 'flex';
    localStorage.removeItem('cart');
    updateCartUI();
    showToast("Buyurtma qabul qilindi!", "success");
}

// --- REMAINING UTILS (Cart, Wishlist, UI) ---

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

function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.querySelector('.cart-count');
    if (countEl) countEl.innerText = cart.reduce((s, i) => s + i.quantity, 0);
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    const shippingMsg = document.getElementById('shipping-msg');
    const shippingProgress = document.getElementById('shipping-progress');
    if (cart.length === 0) {
        if (container) container.innerHTML = `<div class="empty-cart-view"><i class="fas fa-shopping-basket"></i><p>Savatchangiz hozircha bo'sh</p></div>`;
        if (totalEl) totalEl.innerText = '$0';
        if (shippingProgress) shippingProgress.style.width = '0%';
        return;
    }
    container.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.setAttribute('data-id', item.id);
        div.innerHTML = `<img src="${item.mainImage}" alt="${item.name}" class="cart-item-img"><div class="cart-item-info"><h4>${item.name}</h4><p>$${item.price.toLocaleString()} x ${item.quantity}</p><div class="quantity-controls"><button onclick="changeQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button><span class="qty-num">${item.quantity}</span><button onclick="changeQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button></div></div><button class="remove-item" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>`;
        container.appendChild(div);
    });
    const total = subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);
    if (totalEl) totalEl.innerText = `$${total.toLocaleString()}`;
    if (shippingMsg && shippingProgress) {
        const percent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
        shippingProgress.style.width = `${percent}%`;
        shippingMsg.innerHTML = subtotal >= FREE_SHIPPING_THRESHOLD ? '<i class="fas fa-check-circle" style="color:var(--accent-color)"></i> Bepul yetkazib berish!' : `Bepul yetkazib berish uchun yana <span>$${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</span> xarid qiling`;
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

function toggleWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.includes(id)) { wishlist = wishlist.filter(x => x !== id); showToast("O'chirildi", "info"); } 
    else { wishlist.push(id); showToast("Sevimli mahsulotlarga qo'shildi"); }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderProducts(products);
    updateWishlistUI();
}

function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    document.querySelector('.wishlist-count').innerText = wishlist.length;
    const container = document.getElementById('wishlist-items');
    if (!container) return;
    if (wishlist.length === 0) { container.innerHTML = `<div class="empty-wishlist-view"><i class="fas fa-heart-broken"></i><p>Hozircha hech narsa yo'q</p></div>`; return; }
    container.innerHTML = '';
    wishlist.forEach(id => {
        const p = products.find(x => x.id === id);
        if (p) {
            const div = document.createElement('div');
            div.className = 'wishlist-item';
            div.innerHTML = `<img src="${p.mainImage}" alt="${p.name}" class="wishlist-item-img"><div class="wishlist-item-info"><h4>${p.name}</h4><p>$${p.price.toLocaleString()}</p></div><div class="wishlist-actions"><button class="add-from-wishlist" onclick="handleAddToCart(${p.id}); toggleWishlist(${p.id})"><i class="fas fa-cart-plus"></i></button><button class="remove-from-wishlist" onclick="toggleWishlist(${p.id})"><i class="fas fa-trash"></i></button></div>`;
            container.appendChild(div);
        }
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
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
        const target = parseInt(stat.innerText.replace(/\D/g, ''));
        let count = 0;
        const timer = setInterval(() => { count += target / 100; if (count >= target) { stat.innerText = target + (stat.innerText.includes('+') ? '+' : ''); clearInterval(timer); } else { stat.innerText = Math.floor(count) + (stat.innerText.includes('+') ? '+' : ''); } }, 20);
    });
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

function initHeaderScroll() {
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => { if (window.scrollY > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled'); });
}
