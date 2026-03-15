// Onlayn Market - Premium System (Icon Gallery Edition)

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 15;

const products = [
    {
        id: 1,
        name: 'iPhone 15 Pro',
        category: 'phones',
        price: 999,
        oldPrice: 1199,
        badge: 'Yangi',
        icon: 'fa-mobile-alt',
        images: ['fa-mobile-alt', 'fa-camera', 'fa-battery-full', 'fa-microchip'],
        description: 'Titan dizayn, A17 Pro chip va professional kamera tizimi. Eng kuchli iPhone tajribasi.',
        specs: [
            { icon: 'fa-microchip', text: 'A17 Pro Bionic' },
            { icon: 'fa-camera', text: '48MP Main' },
            { icon: 'fa-battery-full', text: '24 soat+ batareya' },
            { icon: 'fa-mobile-alt', text: '6.1" OLED Display' }
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
        icon: 'fa-laptop',
        images: ['fa-laptop', 'fa-desktop', 'fa-keyboard', 'fa-bolt'],
        description: 'Professional ishlar va ijod uchun yaratilgan qudrat. M3 chipi bilan yangi bosqichga chiqing.',
        specs: [
            { icon: 'fa-microchip', text: 'Apple M3 Pro' },
            { icon: 'fa-memory', text: '18GB Unified Memory' },
            { icon: 'fa-desktop', text: '14.2" Liquid Retina' },
            { icon: 'fa-bolt', text: 'Thunderbolt 4 portlar' }
        ]
    },
    {
        id: 3,
        name: 'AirPods Pro',
        category: 'accessories',
        price: 249,
        icon: 'fa-headphones',
        images: ['fa-headphones', 'fa-bluetooth', 'fa-volume-up', 'fa-tint'],
        description: 'Musiqa va ovozning yangi darajasi. Active Noise Cancellation va Spatial Audio tajribasi.',
        specs: [
            { icon: 'fa-volume-up', text: 'Active Noise Canceling' },
            { icon: 'fa-bluetooth', text: 'Bluetooth 5.3' },
            { icon: 'fa-tint', text: 'IPX4 Water Resistant' },
            { icon: 'fa-clock', text: '6 soat tinglash vaqti' }
        ]
    },
    {
        id: 4,
        name: 'iPad Air',
        category: 'tablets',
        price: 599,
        icon: 'fa-tablet-alt',
        images: ['fa-tablet-alt', 'fa-pencil-alt', 'fa-video', 'fa-wifi'],
        description: 'Kreativ ishlar va o\'yinlar uchun mukammal hamroh. M2 chipi bilan yanada tezroq va kuchliroq.',
        specs: [
            { icon: 'fa-microchip', text: 'Apple M2 Chip' },
            { icon: 'fa-pencil-alt', text: 'Apple Pencil support' },
            { icon: 'fa-tablet-alt', text: '10.9" Liquid Retina' },
            { icon: 'fa-video', text: '12MP Front Camera' }
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

    // DOM Elements
    const cartBtn = document.querySelector('.cart-btn');
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const closeCartBtn = document.querySelector('.close-cart');
    const closeWishlistBtn = document.querySelector('.close-wishlist');
    const cartSidebar = document.getElementById('cart-sidebar');
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const themeToggle = document.getElementById('theme-toggle');
    const searchToggle = document.getElementById('search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('search-input');

    const closeAll = () => { [cartSidebar, wishlistSidebar, productModal, document.getElementById('checkout-modal'), cartOverlay].forEach(el => el && el.classList.remove('open')); };

    cartBtn.addEventListener('click', () => { closeAll(); cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); });
    wishlistBtn.addEventListener('click', () => { closeAll(); wishlistSidebar.classList.add('open'); cartOverlay.classList.add('open'); });
    [closeCartBtn, closeWishlistBtn, closeModalBtn, cartOverlay].forEach(btn => btn && btn.addEventListener('click', closeAll));

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

    const categoryCards = document.querySelectorAll('.floating-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoryMap = { 'Telefonlar': 'phones', 'Noutbuklar': 'laptops', 'Aksessuarlar': 'accessories' };
            const category = categoryMap[card.querySelector('span').innerText];
            if (category) { renderProducts(products.filter(p => p.category === category)); document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) openCheckout(); else showToast("Savatchangiz bo'sh!", "error");
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

function switchModalImage(iconClass, element) {
    const mainIcon = document.getElementById('modal-icon');
    mainIcon.style.opacity = '0';
    mainIcon.style.transform = 'scale(0.8)';
    setTimeout(() => {
        mainIcon.className = `fas ${iconClass}`;
        mainIcon.style.opacity = '1';
        mainIcon.style.transform = 'scale(1)';
    }, 200);
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price-val').innerText = `$${product.price.toLocaleString()}`;
    const mainIcon = document.getElementById('modal-icon');
    mainIcon.className = `fas ${product.icon}`;
    const galleryContainer = document.getElementById('modal-gallery');
    if (galleryContainer) {
        galleryContainer.innerHTML = product.images.map((img, idx) => `
            <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="switchModalImage('${img}', this)">
                <i class="fas ${img}"></i>
            </div>
        `).join('');
    }
    const specsContainer = document.getElementById('modal-specs');
    specsContainer.innerHTML = product.specs.map(spec => `<div class="spec-item"><i class="fas ${spec.icon}"></i><span>${spec.text}</span></div>`).join('');
    const modalAddBtn = document.getElementById('modal-add-btn');
    modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`;
    modalAddBtn.classList.remove('success');
    modalAddBtn.onclick = () => {
        handleAddToCart(product.id);
        modalAddBtn.classList.add('success');
        modalAddBtn.innerHTML = `<span>Savatchaga qo'shildi!</span><i class="fas fa-check"></i>`;
        setTimeout(() => { modalAddBtn.classList.remove('success'); modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`; }, 2000);
    };
    document.getElementById('product-modal').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
}

function renderProducts(items) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    if (items.length === 0) { productsGrid.innerHTML = `<div class="no-results"><i class="fas fa-search-minus"></i><h3>Mahsulot topilmadi</h3></div>`; return; }
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    items.forEach(product => {
        const isWished = wishlist.some(id => id === product.id);
        const productCard = document.createElement('div');
        productCard.className = 'product-card reveal';
        productCard.onclick = () => openQuickView(product.id);
        let badgeHtml = product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : '';
        productCard.innerHTML = `
            <button class="wishlist-toggle ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
                <i class="fas fa-heart"></i>
            </button>
            <div class="product-image"><i class="fas ${product.icon}"></i>${badgeHtml}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 40)}...</p>
                <div class="product-price"><span class="new-price">$${product.price.toLocaleString()}</span></div>
                <button class="add-to-cart" onclick="event.stopPropagation(); handleAddToCart(${product.id})">Savatchaga qo'shish</button>
            </div>`;
        productsGrid.appendChild(productCard);
    });
}

function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);
    if (index === -1) { wishlist.push(productId); showToast("Sevimli mahsulotlarga qo'shildi"); } else { wishlist.splice(index, 1); showToast("Sevimli mahsulotlardan o'chirildi", "info"); }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderProducts(products);
    updateWishlistUI();
}

function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const countElement = document.querySelector('.wishlist-count');
    if (countElement) countElement.innerText = wishlist.length;
    const container = document.getElementById('wishlist-items');
    if (!container) return;
    if (wishlist.length === 0) { container.innerHTML = `<div class="empty-wishlist-view"><i class="fas fa-heart-broken"></i><p>Hozircha hech narsa yo'q</p></div>`; return; }
    container.innerHTML = '';
    wishlist.forEach(id => {
        const product = products.find(p => p.id === id);
        if (product) {
            const div = document.createElement('div');
            div.className = 'wishlist-item';
            div.innerHTML = `<i class="fas ${product.icon} main-icon"></i><div class="wishlist-item-info"><h4>${product.name}</h4><p>$${product.price.toLocaleString()}</p></div><div class="wishlist-actions"><button class="add-from-wishlist" onclick="handleAddToCart(${product.id}); toggleWishlist(${product.id})"><i class="fas fa-cart-plus"></i></button><button class="remove-from-wishlist" onclick="toggleWishlist(${product.id})"><i class="fas fa-trash"></i></button></div>`;
            container.appendChild(div);
        }
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

function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.innerText = totalItems;
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('cart-total-price');
    const shippingMsg = document.getElementById('shipping-msg');
    const shippingProgress = document.getElementById('shipping-progress');
    if (cart.length === 0) { cartItemsContainer.innerHTML = `<div class="empty-cart-view"><i class="fas fa-shopping-basket"></i><p>Savatchangiz hozircha bo'sh</p></div>`; totalPriceElement.innerText = '$0'; if (shippingMsg) shippingMsg.innerHTML = `Bepul yetkazib berish uchun yana <span>$${FREE_SHIPPING_THRESHOLD}</span> xarid qiling`; if (shippingProgress) shippingProgress.style.width = '0%'; return; }
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.setAttribute('data-id', item.id);
        itemDiv.innerHTML = `<i class="fas ${item.icon}"></i><div class="cart-item-info"><h4>${item.name}</h4><p>$${item.price.toLocaleString()} x ${item.quantity}</p><div class="quantity-controls"><button onclick="changeQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button><span>${item.quantity}</span><button onclick="changeQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button></div></div><button class="remove-item" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>`;
        cartItemsContainer.appendChild(itemDiv);
    });
    totalPriceElement.innerText = `$${(subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE)).toLocaleString()}`;
    if (shippingMsg && shippingProgress) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) { shippingMsg.innerHTML = '<i class="fas fa-check-circle" style="color:var(--accent-color)"></i> Siz uchun yetkazib berish bepul!'; shippingProgress.style.width = '100%'; }
        else { const percent = (subtotal / FREE_SHIPPING_THRESHOLD) * 100; shippingMsg.innerHTML = `Bepul yetkazib berish uchun yana <span>$${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</span> xarid qiling`; shippingProgress.style.width = `${percent}%`; }
    }
}

function changeQuantity(productId, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === productId);
    if (item) { item.quantity += delta; if (item.quantity <= 0) cart = cart.filter(i => i.id !== productId); }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    setTimeout(() => { const el = document.querySelector(`.cart-item[data-id="${productId}"] span`); if (el) { el.classList.add('quantity-bounce'); setTimeout(() => el.classList.remove('quantity-bounce'), 400); } }, 10);
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function clearCart() { if (confirm('Savatchani butunlay bo\'shatmoqchimisiz?')) { localStorage.removeItem('cart'); updateCartUI(); } }

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'error' ? 'fa-exclamation-circle' : (type === 'info' ? 'fa-info-circle' : 'fa-check-circle');
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 400); }, 3000);
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const btn = document.getElementById('theme-toggle');
    if (saved === 'dark') { document.body.classList.add('dark-mode'); if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>'; }
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('active'); if (entry.target.id === 'about') animateStats(); } }); }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        if (stat.classList.contains('animated')) return;
        stat.classList.add('animated');
        const target = parseInt(stat.innerText.replace(/\D/g, ''));
        let count = 0;
        const timer = setInterval(() => { count += target / 120; if (count >= target) { stat.innerText = target + (stat.innerText.includes('+') ? '+' : ''); clearInterval(timer); } else { stat.innerText = Math.floor(count) + (stat.innerText.includes('+') ? '+' : ''); } }, 16);
    });
}

function initTestimonialSlider() {
    const track = document.querySelector('.testimonial-track');
    const slides = Array.from(document.querySelectorAll('.testimonial-card'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    if (!track || slides.length === 0) return;
    let idx = 0;
    function update(index) { track.style.transform = `translateX(-${index * 100}%)`; slides.forEach((s, i) => s.classList.toggle('active', i === index)); dots.forEach((d, i) => d.classList.toggle('active', i === index)); idx = index; }
    dots.forEach((dot, i) => dot.addEventListener('click', () => update(i)));
    setInterval(() => { idx = (idx + 1) % slides.length; update(idx); }, 5000);
}

function openCheckout() {
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('cart-overlay');
    document.getElementById('cart-sidebar').classList.remove('open');
    modal.classList.add('open');
    overlay.classList.add('open');
}
