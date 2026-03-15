// Onlayn Market - Premium Dynamic Products, Cart & Dark Mode System

// Configuration
const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 15;

// Premium Product Data
const products = [
    {
        id: 1,
        name: 'iPhone 15 Pro',
        category: 'phones',
        price: 999,
        oldPrice: 1199,
        badge: 'Yangi',
        badgeClass: '',
        icon: 'fa-mobile-alt',
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
    console.log('Premium Market System Initialized');
    
    // 1. Theme Logic
    initTheme();

    // 2. Initial Render & UI Setup
    renderProducts(products);
    updateCartUI();
    initScrollReveal();
    initTestimonialSlider();

    // 3. Elements
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const searchToggle = document.getElementById('search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');

    // 4. Theme Toggle Event
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // 5. Search & Filter Logic
    searchToggle.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) searchInput.focus();
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    });

    const categoryCards = document.querySelectorAll('.floating-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoryMap = { 'Telefonlar': 'phones', 'Noutbuklar': 'laptops', 'Aksessuarlar': 'accessories' };
            const categoryText = card.querySelector('span').innerText;
            const category = categoryMap[categoryText];
            if (category) {
                const filtered = products.filter(p => p.category === category);
                renderProducts(filtered);
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 6. UI Toggles
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.querySelector('.close-checkout');
    
    // Cart Sidebar Open
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    });

    // Checkout Initialization
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                showToast("Savatchangiz bo'sh!", "error");
                return;
            }
            openCheckout();
        });
    }

    const closeAll = () => {
        [cartSidebar, productModal, checkoutModal, cartOverlay].forEach(el => el && el.classList.remove('open'));
    };

    [closeCartBtn, closeModalBtn, closeCheckoutBtn, cartOverlay].forEach(btn => btn && btn.addEventListener('click', closeAll));

    // Checkout Step Logic
    let currentCheckoutStep = 1;
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentCheckoutStep)) {
                if (currentCheckoutStep < 3) {
                    currentCheckoutStep++;
                    updateCheckoutUI();
                } else {
                    finalizeOrder();
                }
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentCheckoutStep > 1) {
                currentCheckoutStep--;
                updateCheckoutUI();
            }
        });
    }

    function openCheckout() {
        currentCheckoutStep = 1;
        cartSidebar.classList.remove('open');
        checkoutModal.classList.add('open');
        cartOverlay.classList.add('open');
        updateCheckoutUI();
    }

    function updateCheckoutUI() {
        // Update Steps
        document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${currentCheckoutStep}`).classList.add('active');

        // Update Indicator
        document.querySelectorAll('.step').forEach((s, i) => {
            s.classList.toggle('active', i + 1 === currentCheckoutStep);
            s.classList.toggle('completed', i + 1 < currentCheckoutStep);
        });

        // Button Control
        prevBtn.style.display = currentCheckoutStep === 1 ? 'none' : 'block';
        nextBtn.innerText = currentCheckoutStep === 3 ? 'Tasdiqlash' : 'Keyingisi';

        // Summary Data
        if (currentCheckoutStep === 3) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
            
            document.getElementById('summary-count').innerText = `${cart.length} ta`;
            document.getElementById('summary-total').innerText = `$${(total + shipping).toLocaleString()}`;
            document.getElementById('preview-name').innerText = document.getElementById('checkout-name').value;
            document.getElementById('preview-phone').innerText = document.getElementById('checkout-phone').value;
            document.getElementById('preview-address').innerText = document.getElementById('checkout-address').value;
        }
    }

    function validateStep(step) {
        if (step === 1) {
            const name = document.getElementById('checkout-name').value;
            const phone = document.getElementById('checkout-phone').value;
            const address = document.getElementById('checkout-address').value;
            if (!name || !phone || !address) {
                showToast("Iltimos, barcha maydonlarni to'ldiring", "error");
                return false;
            }
        }
        return true;
    }

    function finalizeOrder() {
        // Hide UI elements
        document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = 'none');
        document.getElementById('checkout-success').style.display = 'flex';
        document.getElementById('order-id-val').innerText = Math.floor(10000 + Math.random() * 90000);
        
        // Clear Cart
        localStorage.removeItem('cart');
        updateCartUI();
        showToast("Buyurtma qabul qilindi!", "success");
    }

    // Payment Card Select
    document.querySelectorAll('.payment-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input').checked = true;
        });
    });

    // 7. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

/**
 * Initialize Theme from LocalStorage
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

/**
 * Premium Scroll Reveal Logic
 */
function initScrollReveal() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.id === 'about') animateStats();
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Animate numbers in About section
 */
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        if (stat.classList.contains('animated')) return;
        stat.classList.add('animated');
        const target = parseInt(stat.innerText.replace(/\D/g, ''));
        let count = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                stat.innerText = target + (stat.innerText.includes('+') ? '+' : '');
                clearInterval(timer);
            } else {
                stat.innerText = Math.floor(count) + (stat.innerText.includes('+') ? '+' : '');
            }
        }, 16);
    });
}

/**
 * Premium Testimonial Slider Logic
 */
function initTestimonialSlider() {
    const track = document.querySelector('.testimonial-track');
    const slides = Array.from(document.querySelectorAll('.testimonial-card'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    let currentIdx = 0;

    function updateSlider(index) {
        if (!track) return;
        track.style.transform = `translateX(-${index * 100}%)`;
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        currentIdx = index;
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => updateSlider(i));
    });

    setInterval(() => {
        let next = (currentIdx + 1) % slides.length;
        updateSlider(next);
    }, 5000);
}

/**
 * Dynamically Renders Products
 */
function renderProducts(items) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (items.length === 0) {
        productsGrid.innerHTML = `<div class="no-results"><i class="fas fa-search-minus"></i><h3>Mahsulot topilmadi</h3><p>Qidiringizga mos mahsulot mavjud emas.</p></div>`;
        return;
    }

    items.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.onclick = () => openQuickView(product.id);
        let badgeHtml = product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : '';
        productCard.innerHTML = `
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

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price-val').innerText = `$${product.price.toLocaleString()}`;
    document.getElementById('modal-icon').className = `fas ${product.icon}`;
    const specsContainer = document.getElementById('modal-specs');
    specsContainer.innerHTML = product.specs.map(spec => `<div class="spec-item"><i class="fas ${spec.icon}"></i><span>${spec.text}</span></div>`).join('');
    
    // Update Modal Add Button with Premium Feedback
    const modalAddBtn = document.getElementById('modal-add-btn');
    modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`;
    modalAddBtn.classList.remove('success');

    modalAddBtn.onclick = () => {
        handleAddToCart(product.id);
        
        // Success Feedback
        modalAddBtn.classList.add('success');
        modalAddBtn.innerHTML = `<span>Savatchaga qo'shildi!</span><i class="fas fa-check"></i>`;
        
        setTimeout(() => {
            modalAddBtn.classList.remove('success');
            modalAddBtn.innerHTML = `<span>Savatchaga qo'shish</span><i class="fas fa-shopping-cart"></i>`;
        }, 2000);
    };

    document.getElementById('product-modal').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
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

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'info') icon = 'fa-info-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.classList.add('fade-out'); 
        setTimeout(() => toast.remove(), 400); 
    }, 3000);
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
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div class="empty-cart-view"><i class="fas fa-shopping-basket"></i><p>Savatchangiz hozircha bo'sh</p></div>`;
        totalPriceElement.innerText = '$0';
        if (shippingMsg) shippingMsg.innerHTML = `Bepul yetkazib berish uchun yana <span>$${FREE_SHIPPING_THRESHOLD}</span> xarid qiling`;
        if (shippingProgress) shippingProgress.style.width = '0%';
        return;
    }
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
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    totalPriceElement.innerText = `$${(subtotal + shipping).toLocaleString()}`;
    if (shippingMsg && shippingProgress) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            shippingMsg.innerHTML = '<i class="fas fa-check-circle" style="color:var(--accent-color)"></i> Siz uchun yetkazib berish bepul!';
            shippingProgress.style.width = '100%';
        } else {
            const percent = (subtotal / FREE_SHIPPING_THRESHOLD) * 100;
            shippingMsg.innerHTML = `Bepul yetkazib berish uchun yana <span>$${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</span> xarid qiling`;
            shippingProgress.style.width = `${percent}%`;
        }
    }
}

function changeQuantity(productId, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === productId);
    if (item) { 
        item.quantity += delta; 
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== productId); 
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();

    // Trigger bounce animation on the specific item's number
    setTimeout(() => {
        const itemElement = document.querySelector(`.cart-item[data-id="${productId}"] span`);
        if (itemElement) {
            itemElement.classList.add('quantity-bounce');
            setTimeout(() => itemElement.classList.remove('quantity-bounce'), 400);
        }
    }, 10);
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function clearCart() {
    if (confirm('Savatchani butunlay bo\'shatmoqchimisiz?')) { localStorage.removeItem('cart'); updateCartUI(); }
}
