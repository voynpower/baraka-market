// main-commerce.js - Storefront cart and wishlist flow
(function () {
  const helpers = window.StorefrontHelpers;

  function updateCartUI() {
    const cart = helpers.getStoredArray('cart');
    const countEl = document.querySelector('.cart-count');
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    const originalEl = document.getElementById('cart-original-price');
    const currentDiscount = window.StorefrontApp.getCurrentDiscount();

    if (countEl) countEl.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `<div class="empty-cart-view"><i class="fas fa-shopping-basket"></i><p>Bo'sh</p></div>`;
      if (totalEl) totalEl.innerText = '$0';
      if (originalEl) originalEl.style.display = 'none';
      return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item) => {
      subtotal += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `<img src="${item.mainImage}" alt="${item.name}" class="cart-item-img"><div class="cart-item-info"><h4>${item.name}</h4><p>$${item.price.toLocaleString()} x ${item.quantity}</p><div class="quantity-controls"><button class="qty-btn qty-btn-minus" onclick="changeQuantity(${item.id}, -1)" aria-label="Miqdorni kamaytirish"><i class="fas fa-minus"></i></button><span class="qty-num quantity-bounce">${item.quantity}</span><button class="qty-btn qty-btn-plus" onclick="changeQuantity(${item.id}, 1)" aria-label="Miqdorni oshirish"><i class="fas fa-plus"></i></button></div></div><button class="cart-remove-btn remove-item" onclick="removeFromCart(${item.id})" aria-label="Mahsulotni olib tashlash"><i class="fas fa-trash"></i></button>`;
      container.appendChild(div);
    });

    if (currentDiscount > 0) {
      const discountedTotal = subtotal * (1 - currentDiscount / 100);
      if (originalEl) {
        originalEl.innerText = `$${subtotal.toLocaleString()}`;
        originalEl.style.display = 'inline';
      }
      if (totalEl) totalEl.innerText = `$${discountedTotal.toLocaleString()}`;
    } else {
      if (originalEl) originalEl.style.display = 'none';
      if (totalEl) totalEl.innerText = `$${subtotal.toLocaleString()}`;
    }
  }

  function animateCartClear() {
    const container = document.getElementById('cart-items');
    if (!container || container.children.length === 0) return Promise.resolve();

    container.classList.add('is-clearing');
    return new Promise((resolve) => {
      setTimeout(() => {
        container.classList.remove('is-clearing');
        resolve();
      }, 360);
    });
  }

  function changeQuantity(id, delta) {
    let cart = helpers.getStoredArray('cart');
    const item = cart.find((entry) => entry.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
    }
    helpers.setStoredArray('cart', cart);
    updateCartUI();
  }

  function removeFromCart(id) {
    const cart = helpers.getStoredArray('cart');
    helpers.setStoredArray('cart', cart.filter((entry) => entry.id !== id));
    updateCartUI();
  }

  function handleAddToCart(id, quantity = 1) {
    const products = window.StorefrontApp.getProducts();
    const product = products.find((entry) => entry.id === id);
    if (!product) return;
    if (product.stock <= 0) {
      window.StorefrontApp.showToast('Mahsulot tugagan', 'error');
      return;
    }

    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

    const cart = helpers.getStoredArray('cart');
    const existing = cart.find((entry) => entry.id === id);
    const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + safeQuantity);

    if (existing) existing.quantity = nextQuantity;
    else cart.push({ ...product, quantity: Math.min(product.stock, safeQuantity) });

    helpers.setStoredArray('cart', cart);
    updateCartUI();
    window.StorefrontApp.showToast(`${product.name} qo'shildi!`);
  }

  function removeWishlistItem(id) {
    const wishlist = helpers.getStoredArray('wishlist').filter((entry) => entry !== id);
    helpers.setStoredArray('wishlist', wishlist);
    updateWishlistUI();
    window.StorefrontApp.applyFilters();
    window.StorefrontApp.showToast('Saralanganlardan olib tashlandi', 'info');
  }

  function addWishlistToCart(id) {
    handleAddToCart(id);
  }

  async function toggleWishlist(id) {
    let wishlist = helpers.getStoredArray('wishlist');

    if (window.StorefrontApp.hasCurrentUser()) {
      try {
        const { response, data } = await window.StorefrontApp.apiRequest(`/users/wishlist/${id}`, {
          method: 'POST',
          headers: helpers.getAuthHeaders(),
        });

        if (!response.ok) {
          window.StorefrontApp.showToast(window.StorefrontApp.getErrorMessage(data, 'Saralanganlarni yangilab bo\'lmadi'), 'error');
          return;
        }

        if (data.wished) wishlist = [...new Set([...wishlist, id])];
        else wishlist = wishlist.filter((entry) => entry !== id);
      } catch (e) {
        window.StorefrontApp.showToast('Server bilan aloqa yo\'q', 'error');
        return;
      }
    } else {
      if (wishlist.includes(id)) wishlist = wishlist.filter((entry) => entry !== id);
      else wishlist.push(id);
    }

    helpers.setStoredArray('wishlist', wishlist);
    updateWishlistUI();
    window.StorefrontApp.applyFilters();
  }

  function updateWishlistUI() {
    const wishlist = helpers.getStoredArray('wishlist');
    const countEl = document.querySelector('.wishlist-count');
    const container = document.getElementById('wishlist-items');
    const products = window.StorefrontApp.getProducts();

    if (countEl) countEl.innerText = wishlist.length;
    if (!container) return;

    container.innerHTML =
      wishlist.length === 0
        ? '<p style="text-align:center; padding:2rem; opacity:0.5;">Bo\'sh</p>'
        : wishlist
            .map((id) => {
              const product = products.find((entry) => entry.id === id);
              return product
                ? `<div class="wishlist-item">
                    <div class="wishlist-thumb-wrap">
                      <img src="${product.mainImage}" alt="${product.name}" class="wishlist-thumb">
                    </div>
                    <div class="wishlist-item-info">
                      <h4>${product.name}</h4>
                      <p class="wishlist-item-meta">${product.category || 'Mahsulot'}</p>
                      <div class="wishlist-item-price-row">
                        <span class="wishlist-item-price">$${Number(product.price || 0).toLocaleString()}</span>
                        <span class="wishlist-item-stock ${product.stock <= 0 ? 'is-empty' : ''}">${product.stock <= 0 ? 'Tugagan' : 'Mavjud'}</span>
                      </div>
                    </div>
                    <div class="wishlist-item-actions">
                      <button class="wishlist-action-btn wishlist-cart-btn" onclick="addWishlistToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-bag"></i>
                        <span>Savatga</span>
                      </button>
                      <button class="wishlist-action-btn wishlist-remove-btn" onclick="removeWishlistItem(${product.id})">
                        <i class="fas fa-trash-alt"></i>
                        <span>O'chirish</span>
                      </button>
                    </div>
                  </div>`
                : '';
            })
            .join('');
  }

  window.changeQuantity = changeQuantity;
  window.removeFromCart = removeFromCart;
  window.removeWishlistItem = removeWishlistItem;
  window.addWishlistToCart = addWishlistToCart;

  window.StorefrontCommerce = {
    updateCartUI,
    animateCartClear,
    handleAddToCart,
    toggleWishlist,
    updateWishlistUI,
    removeWishlistItem,
    addWishlistToCart,
  };
})();
