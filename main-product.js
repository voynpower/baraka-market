// main-product.js - Storefront product modal and reviews flow
(function () {
  const helpers = window.StorefrontHelpers;
  let currentModalQuantity = 1;

  function syncModalQuantityUI(product) {
    const qtyValue = document.getElementById('modal-qty-value');
    const decreaseBtn = document.getElementById('modal-qty-decrease');
    const increaseBtn = document.getElementById('modal-qty-increase');
    const addBtn = document.getElementById('modal-add-btn');
    const buyNowBtn = document.getElementById('modal-buy-now-btn');
    const isOutOfStock = !product || product.stock <= 0;

    if (qtyValue) qtyValue.innerText = String(isOutOfStock ? 0 : currentModalQuantity);
    if (decreaseBtn) decreaseBtn.disabled = isOutOfStock || currentModalQuantity <= 1;
    if (increaseBtn) increaseBtn.disabled = isOutOfStock || currentModalQuantity >= product.stock;
    if (addBtn) addBtn.disabled = isOutOfStock;
    if (buyNowBtn) buyNowBtn.disabled = isOutOfStock;
  }

  function changeModalQuantity(delta) {
    const modal = document.getElementById('product-modal');
    const productId = parseInt(modal?.dataset.productId || '0', 10);
    const product = window.StorefrontApp.getProducts().find((entry) => entry.id === productId);
    if (!product || product.stock <= 0) return;

    currentModalQuantity = Math.min(product.stock, Math.max(1, currentModalQuantity + delta));
    syncModalQuantityUI(product);
  }

  async function loadReviews(productId) {
    const list = document.getElementById('modal-review-list');
    if (!list) return;

    try {
      const { response, data } = await window.StorefrontApp.apiRequest(`/reviews/product/${productId}`);
      const reviews = response.ok && Array.isArray(data) ? data : [];
      list.innerHTML =
        reviews.length === 0
          ? '<p class="modal-review-empty">Sharhlar yo\'q</p>'
          : reviews
              .map(
                (review) =>
                  `<div class="review-card"><div class="review-user"><strong>${review.user?.name || 'Mijoz'}</strong><div class="stars">${window.StorefrontApp.generateStars(review.rating)}</div></div><p class="review-content">${review.comment}</p></div>`,
              )
              .join('');
    } catch (e) {
      list.innerHTML = 'Sharhlarni yuklashda xatolik.';
    }
  }

  function openQuickView(productId) {
    const product = window.StorefrontApp.getProducts().find((entry) => entry.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    modal.dataset.productId = productId;
    currentModalQuantity = product.stock > 0 ? 1 : 0;

    const modalAddBtn = document.getElementById('modal-add-btn');
    if (modalAddBtn) {
      modalAddBtn.dataset.id = productId;
      modalAddBtn.disabled = product.stock <= 0;
      modalAddBtn.classList.toggle('is-disabled', product.stock <= 0);
      modalAddBtn.innerText = product.stock <= 0 ? 'Tugagan' : "Savatga qo'shish";
    }
    const modalBuyNowBtn = document.getElementById('modal-buy-now-btn');
    if (modalBuyNowBtn) {
      modalBuyNowBtn.dataset.id = productId;
      modalBuyNowBtn.disabled = product.stock <= 0;
      modalBuyNowBtn.classList.toggle('is-disabled', product.stock <= 0);
    }

    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.description;
    const categoryBadge = document.getElementById('modal-category-badge');
    if (categoryBadge) categoryBadge.innerText = product.category || 'Mahsulot';
    const stockBadge = document.getElementById('modal-stock-badge');
    if (stockBadge) {
      stockBadge.innerText = product.stock <= 0 ? 'Tugagan' : `Zahira: ${product.stock}`;
      stockBadge.classList.toggle('is-empty', product.stock <= 0);
    }
    const ratingText = document.getElementById('modal-rating-text');
    if (ratingText) ratingText.innerText = `${Number(product.avgRating || 0).toFixed(1)} (${product.reviewCount || 0})`;
    const badgePill = document.getElementById('modal-badge-pill');
    if (badgePill) {
      if (product.badge) {
        badgePill.innerText = product.badge;
        badgePill.classList.remove('hidden');
      } else {
        badgePill.innerText = '';
        badgePill.classList.add('hidden');
      }
    }

    const priceVal = document.getElementById('modal-price-val');
    if (priceVal) priceVal.innerText = `$${product.price.toLocaleString()}`;
    const oldPrice = document.getElementById('modal-old-price');
    if (oldPrice) {
      if (product.oldPrice && product.oldPrice > product.price) {
        oldPrice.innerText = `$${Number(product.oldPrice).toLocaleString()}`;
        oldPrice.classList.remove('hidden');
      } else {
        oldPrice.innerText = '';
        oldPrice.classList.add('hidden');
      }
    }

    const mainImg = document.getElementById('modal-main-img');
    if (mainImg) {
      mainImg.src = product.mainImage;
      mainImg.classList.remove('hidden');
    }

    const gallery = document.getElementById('modal-gallery');
    if (gallery) {
      const images = helpers.parseJsonArray(product.images);
      const galleryImages = images.length > 0 ? images : [product.mainImage];
      gallery.innerHTML = galleryImages
        .map(
          (img, index) => `
            <button class="thumb-item ${index === 0 ? 'active' : ''}" type="button" onclick="switchModalImage('${img}', this)">
              <img src="${img}" alt="${product.name}" class="thumb-image">
            </button>
          `,
        )
        .join('');
    }

    const specsCont = document.getElementById('modal-specs');
    if (specsCont) {
      const specs = helpers.parseJsonArray(product.specs);
      specsCont.innerHTML = specs.map((spec) => `<div class="spec-item"><i class="fas ${spec.icon}"></i><span>${spec.val}</span></div>`).join('');
    }

    syncModalQuantityUI(product);

    const formCont = document.getElementById('review-form-container');
    const loginPrompt = document.getElementById('login-to-review');
    if (window.StorefrontApp.hasCurrentUser()) {
      if (formCont) formCont.style.display = 'block';
      if (loginPrompt) loginPrompt.style.display = 'none';
    } else {
      if (formCont) formCont.style.display = 'none';
      if (loginPrompt) loginPrompt.style.display = 'block';
    }

    loadReviews(productId);
    window.StorefrontApp.openSidebar('product-modal');
  }

  function switchModalImage(imgUrl, element) {
    const mainImg = document.getElementById('modal-main-img');
    if (!mainImg) return;

    mainImg.style.opacity = '0';
    mainImg.src = imgUrl;
    mainImg.onload = () => {
      mainImg.style.opacity = '1';
    };

    document.querySelectorAll('.thumb-item').forEach((thumb) => thumb.classList.remove('active'));
    element.classList.add('active');
  }

  function initReviewInteractions() {
    const decreaseBtn = document.getElementById('modal-qty-decrease');
    const increaseBtn = document.getElementById('modal-qty-increase');
    const addBtn = document.getElementById('modal-add-btn');
    const buyNowBtn = document.getElementById('modal-buy-now-btn');

    if (decreaseBtn) decreaseBtn.onclick = () => changeModalQuantity(-1);
    if (increaseBtn) increaseBtn.onclick = () => changeModalQuantity(1);
    if (addBtn) {
      addBtn.onclick = () => {
        const productId = parseInt(addBtn.dataset.id || '0', 10);
        if (!productId || addBtn.disabled) return;
        window.StorefrontCommerce.handleAddToCart(productId, currentModalQuantity);
      };
    }
    if (buyNowBtn) {
      buyNowBtn.onclick = () => {
        const productId = parseInt(buyNowBtn.dataset.id || '0', 10);
        if (!productId || buyNowBtn.disabled) return;
        window.StorefrontCommerce.handleAddToCart(productId, currentModalQuantity);
        window.StorefrontApp.openCheckoutFlow();
      };
    }

    const stars = document.querySelectorAll('#star-rating-input i');
    stars.forEach((star) => {
      star.onclick = () => {
        window.StorefrontApp.setSelectedRating(parseInt(star.dataset.rating, 10));
        stars.forEach((icon) => {
          const rating = parseInt(icon.dataset.rating, 10);
          icon.classList.toggle('fas', rating <= window.StorefrontApp.getSelectedRating());
          icon.classList.toggle('far', rating > window.StorefrontApp.getSelectedRating());
        });
      };
    });

    const submitBtn = document.getElementById('submit-review-btn');
    if (submitBtn) {
      submitBtn.onclick = async () => {
        if (!window.StorefrontApp.hasCurrentUser()) {
          window.StorefrontApp.showToast('Sharh qoldirish uchun tizimga kiring', 'error');
          return;
        }

        const modal = document.getElementById('product-modal');
        const productId = parseInt(modal?.dataset.productId || '0', 10);
        const commentEl = document.getElementById('review-comment');
        const comment = commentEl ? commentEl.value.trim() : '';

        if (!productId || comment.length < 5) {
          window.StorefrontApp.showToast('Sharh kamida 5 ta belgidan iborat bo\'lsin', 'error');
          return;
        }

        try {
          const { response, data } = await window.StorefrontApp.apiRequest('/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...helpers.getAuthHeaders(),
            },
            body: JSON.stringify({
              productId,
              rating: window.StorefrontApp.getSelectedRating(),
              comment,
            }),
          });

          if (!response.ok) {
            window.StorefrontApp.showToast(window.StorefrontApp.getErrorMessage(data, 'Sharh yuborilmadi'), 'error');
            return;
          }

          if (commentEl) commentEl.value = '';
          window.StorefrontApp.setSelectedRating(5);
          stars.forEach((icon) => {
            icon.classList.add('fas');
            icon.classList.remove('far');
          });
          await loadReviews(productId);
          await window.StorefrontApp.refreshProducts();
          window.StorefrontApp.showToast('Sharhingiz yuborildi');
        } catch (e) {
          window.StorefrontApp.showToast('Server bilan aloqa yo\'q', 'error');
        }
      };
    }
  }

  window.switchModalImage = switchModalImage;

  window.StorefrontProduct = {
    loadReviews,
    openQuickView,
    initReviewInteractions,
    changeModalQuantity,
  };
})();
