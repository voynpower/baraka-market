// Baraka Market - Final Ultra-Stable Integrated Script (v2.8 - Instant Validation Fix)

const API_BASE_URL = 'http://localhost:3000';
let allProducts = []; 
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentUser = null;
let selectedRating = 5;
let currentDiscount = 0;
let currentCheckoutStep = 1;

const getUserToken = () => window.StorefrontHelpers.getUserToken();
const getAuthHeaders = () => window.StorefrontHelpers.getAuthHeaders();
const getStoredArray = (key) => window.StorefrontHelpers.getStoredArray(key);
const setStoredArray = (key, value) => window.StorefrontHelpers.setStoredArray(key, value);
const parseJsonArray = (value) => window.StorefrontHelpers.parseJsonArray(value);
const getErrorMessage = (payload, fallback) => window.StorefrontHelpers.getErrorMessage(payload, fallback);
const apiRequest = (path, options = {}) => window.StorefrontHelpers.apiRequest(API_BASE_URL, path, options);
const updateCartUI = () => window.StorefrontCommerce.updateCartUI();
const animateCartClear = () => window.StorefrontCommerce.animateCartClear();
const handleAddToCart = (id) => window.StorefrontCommerce.handleAddToCart(id);
const toggleWishlist = (id) => window.StorefrontCommerce.toggleWishlist(id);
const updateWishlistUI = () => window.StorefrontCommerce.updateWishlistUI();
const loadReviews = (productId) => window.StorefrontProduct.loadReviews(productId);
const openQuickView = (productId) => window.StorefrontProduct.openQuickView(productId);
const initReviewInteractions = () => window.StorefrontProduct.initReviewInteractions();

// --- 1. GLOBAL UI HELPERS ---

function showToast(msg, type = 'success') { 
    const c = document.getElementById('toast-container');
    if(!c) return;
    const t = document.createElement('div'); 
    t.className = `toast ${type}`; 
    t.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i><span>${msg}</span>`;
    c.appendChild(t); 
    setTimeout(() => { if(t) { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); } }, 3000); 
}

function openSidebar(id) { 
    closeAllModals(); 
    const el = document.getElementById(id); 
    if(el) {
        el.classList.add('open');
        document.body.classList.add('modal-open');
        if(id === 'checkout-modal') {
            handleCheckoutNavigation(1);
            setTimeout(initCheckoutValidation, 50); // Small delay to ensure DOM is ready
        }
    }
    document.getElementById('cart-overlay').classList.add('open'); 
}

function closeAllModals() { 
    document.querySelectorAll('.cart-sidebar, .wishlist-sidebar, .product-modal, .cart-overlay, .checkout-modal, #auth-modal').forEach(el => el.classList.remove('open')); 
    document.body.classList.remove('modal-open');
}

// --- 2. CHECKOUT PRO ENGINE ---

function initCheckoutValidation() {
    const nameInp = document.getElementById('checkout-name');
    const phoneInp = document.getElementById('checkout-phone');
    const addrInp = document.getElementById('checkout-address');
    const nextBtn = document.getElementById('next-step');

    if (currentUser && nameInp && !nameInp.value) {
        nameInp.value = currentUser.name || '';
    }

    const validateStep1 = () => {
        const isNameValid = nameInp.value.trim().length >= 2;
        const isPhoneValid = phoneInp.value.replace(/\D/g, '').length >= 12; // 998 + 9 digits
        const isAddrValid = addrInp.value.trim().length >= 5;

        nameInp.classList.toggle('valid', isNameValid);
        phoneInp.classList.toggle('valid', isPhoneValid);
        addrInp.classList.toggle('valid', isAddrValid);

        return isNameValid && isPhoneValid && isAddrValid;
    };

    if (phoneInp) {
        phoneInp.onfocus = () => { if (!phoneInp.value) phoneInp.value = '+998 '; };
        phoneInp.oninput = () => {
            let val = phoneInp.value.replace(/\D/g, '');
            if (val.length > 12) val = val.substring(0, 12);
            let formatted = '+998 ';
            if (val.length > 3) {
                const area = val.substring(3, 5);
                const p1 = val.substring(5, 8);
                const p2 = val.substring(8, 10);
                const p3 = val.substring(10, 12);
                if (area) formatted += `(${area}) `;
                if (p1) formatted += `${p1} `;
                if (p2) formatted += `${p2} `;
                if (p3) formatted += `${p3}`;
            }
            phoneInp.value = formatted.trim();
            validateStep1();
            updateCheckoutSummary();
            updateCheckoutActions();
        };
    }

    if (nameInp) nameInp.oninput = validateStep1;
    if (addrInp) addrInp.oninput = validateStep1;

    const cardHolder = document.getElementById('card-holder');
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');
    const paymentInputs = document.querySelectorAll('input[name="payment"]');

    if (cardNumber) {
        cardNumber.oninput = () => {
            const raw = cardNumber.value.replace(/\D/g, '').slice(0, 16);
            cardNumber.value = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
            updatePaymentCardPreview();
            updateCheckoutActions();
        };
    }

    if (cardExpiry) {
        cardExpiry.oninput = () => {
            const raw = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
            const month = raw.slice(0, 2);
            const year = raw.slice(2, 4);
            cardExpiry.value = year ? `${month}/${year}` : month;
            updatePaymentCardPreview();
            updateCheckoutActions();
        };
    }

    if (cardCvv) {
        cardCvv.oninput = () => {
            cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 3);
            updateCheckoutActions();
        };
    }

    if (cardHolder) cardHolder.oninput = () => { updatePaymentCardPreview(); updateCheckoutActions(); };

    paymentInputs.forEach((input) => {
        input.onchange = () => {
            document.querySelectorAll('.payment-card').forEach((card) => {
                card.classList.toggle('active', card.dataset.payment === input.value);
            });
            document.getElementById('payment-cash-panel')?.classList.toggle('active', input.value === 'cash');
            document.getElementById('payment-card-panel')?.classList.toggle('active', input.value === 'card');
            updateCheckoutSummary();
            updateCheckoutActions();
        };
    });

    if (nameInp) nameInp.oninput = () => { validateStep1(); updateCheckoutSummary(); updateCheckoutActions(); };
    if (addrInp) addrInp.oninput = () => { validateStep1(); updateCheckoutSummary(); updateCheckoutActions(); };

    validateStep1();
    updatePaymentCardPreview();
    updateCheckoutSummary();
    updateCheckoutActions();
}

function getSelectedPaymentMethod() {
    return document.querySelector('input[name="payment"]:checked')?.value || 'cash';
}

function detectCardBrand(cardNumber) {
    const raw = cardNumber.replace(/\D/g, '');
    if (raw.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(raw)) return 'Mastercard';
    if (raw.startsWith('8600') || raw.startsWith('5614')) return 'Uzcard';
    if (raw.startsWith('9860')) return 'Humo';
    return 'Card';
}

function updatePaymentCardPreview() {
    const holder = document.getElementById('card-holder');
    const number = document.getElementById('card-number');
    const expiry = document.getElementById('card-expiry');
    const previewHolder = document.getElementById('payment-preview-holder');
    const previewNumber = document.getElementById('payment-preview-number');
    const previewExpiry = document.getElementById('payment-preview-expiry');
    const brandBadge = document.getElementById('payment-brand-badge');

    if (previewHolder) previewHolder.innerText = (holder?.value || 'HASANBOY HAKIMOV').toUpperCase();
    if (previewNumber) previewNumber.innerText = number?.value || '8600 1234 5678 9012';
    if (previewExpiry) previewExpiry.innerText = expiry?.value || 'MM/YY';
    if (brandBadge) brandBadge.innerText = detectCardBrand(number?.value || '');
}

function validatePaymentStep() {
    const paymentMethod = getSelectedPaymentMethod();
    if (paymentMethod === 'cash') return true;

    const cardHolder = document.getElementById('card-holder');
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');

    const holderValid = (cardHolder?.value || '').trim().length >= 3;
    const numberValid = (cardNumber?.value || '').replace(/\D/g, '').length === 16;
    const expiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry?.value || '');
    const cvvValid = (cardCvv?.value || '').replace(/\D/g, '').length === 3;

    if (cardHolder) cardHolder.classList.toggle('valid', holderValid);
    if (cardNumber) cardNumber.classList.toggle('valid', numberValid);
    if (cardExpiry) cardExpiry.classList.toggle('valid', expiryValid);
    if (cardCvv) cardCvv.classList.toggle('valid', cvvValid);

    return holderValid && numberValid && expiryValid && cvvValid;
}

function validateCurrentStep() {
    if (currentCheckoutStep === 1) {
        const nameInp = document.getElementById('checkout-name');
        const phoneInp = document.getElementById('checkout-phone');
        const addrInp = document.getElementById('checkout-address');
        const isNameValid = (nameInp?.value || '').trim().length >= 2;
        const isPhoneValid = (phoneInp?.value || '').replace(/\D/g, '').length >= 12;
        const isAddrValid = (addrInp?.value || '').trim().length >= 5;
        return isNameValid && isPhoneValid && isAddrValid;
    }

    if (currentCheckoutStep === 2) return validatePaymentStep();
    return true;
}

function updateCheckoutActions() {
    const nextBtn = document.getElementById('next-step');
    if (!nextBtn) return;

    const isValid = validateCurrentStep();
    nextBtn.classList.toggle('ready', isValid);
    nextBtn.disabled = !isValid;
}

function updateCheckoutSummary() {
    const cart = getStoredArray('cart');
    const summaryItems = document.getElementById('checkout-summary-items');
    const summaryTotal = document.getElementById('summary-total');
    const previewName = document.getElementById('preview-name');
    const previewPhone = document.getElementById('preview-phone');
    const previewAddress = document.getElementById('preview-address');
    const paymentChip = document.getElementById('summary-payment-chip');
    const paymentMethod = getSelectedPaymentMethod();

    if (previewName) previewName.innerText = document.getElementById('checkout-name')?.value || '-';
    if (previewPhone) previewPhone.innerText = document.getElementById('checkout-phone')?.value || '-';
    if (previewAddress) previewAddress.innerText = document.getElementById('checkout-address')?.value || '-';
    if (paymentChip) paymentChip.innerText = paymentMethod === 'card' ? 'Online karta' : 'Naqd pul';

    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (currentDiscount > 0) subtotal = subtotal * (1 - currentDiscount / 100);
    if (summaryTotal) summaryTotal.innerText = `$${subtotal.toLocaleString()}`;

    if (!summaryItems) return;
    summaryItems.innerHTML = cart.map((item) => `
        <div class="summary-item-row">
            <img src="${item.mainImage}" alt="${item.name}" class="summary-item-thumb">
            <div class="summary-item-copy">
                <strong>${item.name}</strong>
                <span>${item.quantity} x $${Number(item.price).toLocaleString()}</span>
            </div>
            <strong class="summary-item-price">$${Number(item.price * item.quantity).toLocaleString()}</strong>
        </div>
    `).join('');
}

function setCheckoutProcessing(isProcessing, message) {
    const processing = document.getElementById('checkout-processing');
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');
    const processingText = processing?.querySelector('p');

    if (processingText && message) processingText.innerText = message;
    if (processing) processing.style.display = isProcessing ? 'flex' : 'none';
    document.querySelectorAll('.checkout-step, .step-indicator').forEach((el) => {
        el.style.display = isProcessing ? 'none' : '';
    });
    if (prevBtn) prevBtn.style.display = isProcessing ? 'none' : (currentCheckoutStep === 1 ? 'none' : 'block');
    if (nextBtn) {
        nextBtn.disabled = isProcessing || !validateCurrentStep();
        nextBtn.innerText = isProcessing ? "Jarayonda..." : (currentCheckoutStep === 3 ? 'Tasdiqlash' : 'Keyingisi');
    }
}

function handleCheckoutNavigation(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.add('active');
    currentCheckoutStep = step;

    document.querySelectorAll('.step').forEach((s, i) => {
        s.classList.toggle('active', i + 1 === step);
        s.classList.toggle('completed', i + 1 < step);
    });

    const pb = document.getElementById('prev-step'), nb = document.getElementById('next-step');
    if(pb) pb.style.display = step === 1 ? 'none' : 'block';
    if(nb) {
        nb.innerText = step === 3 ? 'Tasdiqlash' : 'Keyingisi';
        updateCheckoutActions();
    }

    if (step === 3) {
        updateCheckoutSummary();
    }
}

function openCheckoutFlow() {
    const cart = getStoredArray('cart');
    if (cart.length > 0) {
        const success = document.getElementById('checkout-success');
        if (success) success.style.display = 'none';
        const processing = document.getElementById('checkout-processing');
        if (processing) processing.style.display = 'none';
        document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = '');
        openSidebar('checkout-modal');
        updateCheckoutSummary();
        updateCheckoutActions();
    } else {
        showToast("Savatcha bo'sh", "error");
    }
}

// --- 3. DATA FETCHING ---

async function fetchProducts() {
    try {
        const { response, data } = await apiRequest('/products');
        if (response.ok && Array.isArray(data)) {
            allProducts = data;
            applyFilters();
            updateWishlistUI();
        }
    } catch (e) { showToast('Server bilan aloqa yo\'q', 'error'); }
}

async function fetchUserOrders() {
    if (!currentUser) return;
    try {
        const { response, data } = await apiRequest('/users/me', { headers: getAuthHeaders() });
        const container = document.getElementById('order-list');
        if (response.ok && data?.orders && data.orders.length > 0) {
            container.innerHTML = data.orders.map(o => `
                <div class="order-history-card">
                    <div class="order-history-top">
                        <strong class="order-history-id">#${o.id}</strong>
                        <span class="order-history-status">${o.status}</span>
                    </div>
                    <div class="order-history-meta">
                        <span>$${o.totalAmount.toLocaleString()}</span>
                        <span>${new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        } else if (container) { container.innerHTML = '<div class="order-history-empty">Hozircha buyurtmalar yo\'q</div>'; }
    } catch (e) {}
}

// --- 4. CORE LOGIC ---

function applyFilters() {
    let filtered = [...allProducts];
    if (currentCategory !== 'all') filtered = filtered.filter(p => p.category === currentCategory);
    if (currentSearch) filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearch) || p.description.toLowerCase().includes(currentSearch));
    if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (currentSort === 'newest') filtered.sort((a, b) => b.id - a.id);
    renderProducts(filtered);
}

function renderProducts(items) {
    const grid = document.getElementById('products-grid');
    if (!grid) return; grid.innerHTML = '';
    if (items.length === 0) { grid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 5rem 0; opacity: 0.6;"><i class="fas fa-search" style="font-size: 4rem; margin-bottom: 1.5rem;"></i><h3>Mahsulot topilmadi</h3></div>`; return; }
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    items.forEach(product => {
        const isWished = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = `product-card reveal active ${product.stock <= 0 ? 'out-of-stock' : ''}`;
        card.dataset.id = product.id;
        card.innerHTML = `
            <button class="wishlist-toggle ${isWished ? 'active' : ''}" data-id="${product.id}"><i class="fas fa-heart"></i></button>
            <div class="product-image" style="${product.stock <= 0 ? 'filter: grayscale(1); opacity: 0.6;' : ''}">
                <img src="${product.mainImage}" alt="${product.name}" loading="lazy">
                ${product.stock <= 0 ? '<div class="product-badge out-of-stock-badge">Sotuvda yo\'q</div>' : (product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : '')}
            </div>
            <div class="product-info">
                <div class="product-meta-row">
                    <span class="product-category-pill">${product.category || 'Mahsulot'}</span>
                    <span class="product-stock-pill ${product.stock <= 0 ? 'is-empty' : ''}">${product.stock <= 0 ? 'Tugagan' : `${product.stock} ta`}</span>
                </div>
                <div class="product-rating"><div class="stars">${generateStars(Math.round(product.avgRating || 0))}</div><span class="rating-value">(${product.reviewCount || 0})</span></div>
                <h3>${product.name}</h3>
                <div class="product-price">
                    ${product.oldPrice && product.oldPrice > product.price ? `<span class="old-price">$${Number(product.oldPrice).toLocaleString()}</span>` : ''}
                    <span class="new-price">$${product.price.toLocaleString()}</span>
                </div>
                <button class="add-to-cart cta-btn" data-id="${product.id}" ${product.stock <= 0 ? 'disabled style="background: #ccc;"' : ''}>${product.stock <= 0 ? 'Tugagan' : 'Savatchaga'}</button>
            </div>`;
        grid.appendChild(card);
    });
}

function generateStars(rating) { let stars = ''; for (let i = 1; i <= 5; i++) { stars += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`; } return stars; }

// --- 5. FINAL STEPS ---

async function finalizeOrder() {
    const nextBtn = document.getElementById('next-step');
    if (!nextBtn.classList.contains('ready') || !validateCurrentStep()) { showToast('Iltimos, barcha maydonlarni to\'ldiring', 'error'); return; }
    const cart = getStoredArray('cart');
    const paymentMethod = getSelectedPaymentMethod();
    const orderData = { customerName: document.getElementById('checkout-name').value, customerPhone: document.getElementById('checkout-phone').value, customerAddress: document.getElementById('checkout-address').value, totalAmount: parseFloat(document.getElementById('summary-total').innerText.replace(/[^0-9.]/g, '')), paymentMethod, items: cart };
    if (currentUser) orderData.userId = currentUser.id;
    try {
        if (paymentMethod === 'card') {
            setCheckoutProcessing(true, "Karta ma'lumotlari bank bilan tekshirilmoqda.");
            await new Promise((resolve) => setTimeout(resolve, 1400));
        } else {
            nextBtn.disabled = true;
            nextBtn.innerText = "Yuborilmoqda...";
        }
        const { response, data } = await apiRequest('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            setCheckoutProcessing(false);
            nextBtn.innerText = 'Tasdiqlash';
            updateCheckoutActions();
            showToast(getErrorMessage(data, 'Buyurtma yuborilmadi'), 'error');
            return;
        }
        setCheckoutProcessing(false);
        document.querySelectorAll('.checkout-step, .step-indicator, .checkout-footer').forEach(el => el.style.display = 'none');
        const sv = document.getElementById('checkout-success');
        if(sv) sv.style.display = 'flex';
        const idv = document.getElementById('order-id-val');
        if(idv) idv.innerText = data?.id;
        await animateCartClear();
        localStorage.removeItem('cart');
        currentDiscount = 0;
        updateCartUI();
        showToast("Muvaffaqiyatli!");
    } catch (e) {
        setCheckoutProcessing(false);
        nextBtn.innerText = 'Tasdiqlash';
        updateCheckoutActions();
        showToast('Server bilan aloqa yo\'q', 'error');
    }
}

// --- 6. UTILS & INIT ---

function updateUserUI(isLoggedIn) {
    const loginForm = document.getElementById('user-login-form');
    const registerForm = document.getElementById('user-register-form');
    const profileView = document.getElementById('user-profile-view');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const authBtn = document.getElementById('user-auth-btn');
    const authIcon = authBtn ? authBtn.querySelector('i') : null;

    if (loginForm) loginForm.style.display = isLoggedIn ? 'none' : 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (profileView) profileView.style.display = isLoggedIn ? 'block' : 'none';

    if (profileName) profileName.innerText = currentUser?.name || 'Foydalanuvchi';
    if (profileEmail) profileEmail.innerText = currentUser?.email || '';

    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    if (loginTab) loginTab.style.display = isLoggedIn ? 'none' : 'inline-block';
    if (registerTab) registerTab.style.display = isLoggedIn ? 'none' : 'inline-block';

    if (authIcon) authIcon.className = isLoggedIn ? 'fas fa-user-check' : 'fas fa-user';
}

window.StorefrontApp = {
    apiRequest,
    getErrorMessage,
    syncWishlistWithServer,
    fetchUserOrders,
    closeAllModals,
    openSidebar,
    showToast,
    applyFilters,
    generateStars,
    openCheckoutFlow,
    refreshProducts: fetchProducts,
    getProducts() {
        return allProducts;
    },
    hasCurrentUser() {
        return Boolean(currentUser);
    },
    getCurrentDiscount() {
        return currentDiscount;
    },
    getSelectedRating() {
        return selectedRating;
    },
    setSelectedRating(value) {
        selectedRating = value;
    },
    setCurrentUserState(user) {
        currentUser = user || null;
    },
    applyCurrentUserUI() {
        updateUserUI(Boolean(currentUser));
    },
};

async function syncWishlistWithServer() {
    if (!currentUser) return;
    const localWishlist = getStoredArray('wishlist');

    try {
        const { response, data } = await apiRequest('/users/wishlist/sync', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ productIds: localWishlist }),
        });

        if (!response.ok || !data) return;

        const serverWishlist = (data.wishlist || []).map(item => item.productId);
        setStoredArray('wishlist', serverWishlist);
        currentUser = data;
        updateWishlistUI();
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme(); initUserAuth(); fetchProducts(); updateCartUI(); initScrollReveal(); initReviewInteractions();
    const searchInput = document.getElementById('search-input'), sortSelect = document.getElementById('sort-select');
    if (searchInput) searchInput.oninput = (e) => { currentSearch = e.target.value.toLowerCase(); applyFilters(); };
    if (sortSelect) sortSelect.onchange = (e) => { currentSort = e.target.value; if (document.getElementById('sort-badge-wrapper')) document.getElementById('sort-badge-wrapper').className = `sort-wrapper status-${currentSort}`; applyFilters(); };
    const ap = document.getElementById('apply-promo-btn'); if(ap) ap.onclick = () => { const c = { 'BARAKA10': 10, 'SAVE20': 20 }; const code = document.getElementById('promo-input').value.toUpperCase(); if(c[code]) { currentDiscount = c[code]; showToast(`Chegirma ${c[code]}%!`); updateCartUI(); } else showToast('Noto\'g\'ri kod', 'error'); };
    
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.cart-btn')) openSidebar('cart-sidebar');
        if (target.closest('.wishlist-btn') && !target.closest('#user-auth-btn')) openSidebar('wishlist-sidebar');
        if (target.closest('#user-auth-btn')) openSidebar('auth-modal');
        if (target.closest('.close-cart, .close-wishlist, .close-modal, .close-checkout, #close-auth-modal') || target.classList.contains('cart-overlay')) closeAllModals();
        if (target.closest('.wishlist-toggle')) { e.stopPropagation(); toggleWishlist(parseInt(target.closest('.wishlist-toggle').dataset.id)); }
        if (target.closest('.add-to-cart')) { e.stopPropagation(); handleAddToCart(parseInt(target.closest('.add-to-cart').dataset.id)); }
        if (target.closest('.product-card') && !target.closest('button')) { openQuickView(parseInt(target.closest('.product-card').dataset.id)); }
        if (target.closest('#next-step')) { const s = document.querySelector('.checkout-step.active'); const cur = s ? parseInt(s.id.split('-')[1]) : 1; if (cur < 3) handleCheckoutNavigation(cur + 1); else finalizeOrder(); }
        if (target.closest('#prev-step')) { const s = document.querySelector('.checkout-step.active'); const cur = s ? parseInt(s.id.split('-')[1]) : 1; handleCheckoutNavigation(cur - 1); }
    });

    const ock = document.getElementById('open-checkout-btn'); if(ock) ock.onclick = () => openCheckoutFlow();
});
const initUserAuth = () => window.StorefrontAuth.initUserAuth();

function initTheme() { const saved = localStorage.getItem('theme'); if (saved === 'dark') document.body.classList.add('dark-mode'); const btn = document.getElementById('theme-toggle'); if(btn) btn.onclick = () => { document.body.classList.toggle('dark-mode'); localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); }; }
function initScrollReveal() { const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); if (e.target.id === 'about') animateStats(); } }); }, { threshold: 0.1 }); document.querySelectorAll('.reveal').forEach(el => obs.observe(el)); }
function animateStats() { document.querySelectorAll('.stat-number').forEach(stat => { if (stat.classList.contains('animated')) return; stat.classList.add('animated'); const text = stat.innerText, target = parseInt(text.replace(/\D/g, '')), suffix = text.replace(/[0-9]/g, ''); let count = 0; const duration = 2000, startTime = performance.now(); const update = (currentTime) => { const elapsed = currentTime - startTime, progress = Math.min(elapsed / duration, 1), ease = progress * (2 - progress); count = Math.floor(ease * target); stat.innerText = count + suffix; if (progress < 1) requestAnimationFrame(update); else stat.innerText = text; }; requestAnimationFrame(update); }); }
