// main-auth.js - Storefront authentication flow
(function () {
  const helpers = window.StorefrontHelpers;

  function setCurrentUser(user) {
    window.StorefrontApp.setCurrentUserState(user || null);
    window.StorefrontApp.applyCurrentUserUI();
  }

  async function loginUser(email, password) {
    const { response, data } = await window.StorefrontApp.apiRequest('/auth/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(window.StorefrontApp.getErrorMessage(data, 'Kirishda xatolik'));
    }

    localStorage.setItem('user_token', data.access_token);
    setCurrentUser(data.user);
    await window.StorefrontApp.syncWishlistWithServer();
    await window.StorefrontApp.fetchUserOrders();
    window.StorefrontApp.closeAllModals();
  }

  async function initUserAuth() {
    const token = helpers.getUserToken();
    if (token) {
      try {
        const { response, data } = await window.StorefrontApp.apiRequest('/users/me', {
          headers: helpers.getAuthHeaders(),
        });
        if (response.ok && data) {
          setCurrentUser(data);
          await window.StorefrontApp.syncWishlistWithServer();
          await window.StorefrontApp.fetchUserOrders();
        } else {
          localStorage.removeItem('user_token');
          setCurrentUser(null);
        }
      } catch (e) {}
    } else {
      setCurrentUser(null);
    }

    const tl = document.getElementById('tab-login');
    const tr = document.getElementById('tab-register');
    const fl = document.getElementById('user-login-form');
    const fr = document.getElementById('user-register-form');

    if (tl) tl.onclick = () => {
      tl.classList.add('active');
      tr.classList.remove('active');
      fl.style.display = 'block';
      fr.style.display = 'none';
    };

    if (tr) tr.onclick = () => {
      tr.classList.add('active');
      tl.classList.remove('active');
      fr.style.display = 'block';
      fl.style.display = 'none';
    };

    if (fl) fl.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('user-email').value;
      const password = document.getElementById('user-password').value;
      try {
        await loginUser(email, password);
        window.StorefrontApp.showToast('Xush kelibsiz!');
      } catch (e) {
        window.StorefrontApp.showToast(e.message || 'Xatolik', 'error');
      }
    };

    if (fr) fr.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      try {
        const { response, data } = await window.StorefrontApp.apiRequest('/auth/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        if (!response.ok) {
          window.StorefrontApp.showToast(window.StorefrontApp.getErrorMessage(data, 'Ro\'yxatdan o\'tishda xatolik'), 'error');
          return;
        }

        await loginUser(email, password);
        window.StorefrontApp.showToast('Hisob yaratildi');
        fr.reset();
      } catch (e) {
        window.StorefrontApp.showToast(e.message || 'Server bilan aloqa yo\'q', 'error');
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('user_token');
      setCurrentUser(null);
      window.StorefrontApp.showToast('Tizimdan chiqildi', 'info');
    };

    const lo = document.getElementById('user-logout-btn');
    if (lo) lo.onclick = handleLogout;

    ['auth-back-from-login', 'auth-back-from-register', 'auth-back-from-profile'].forEach((id) => {
      const button = document.getElementById(id);
      if (button) button.onclick = () => window.StorefrontApp.closeAllModals();
    });
  }

  window.StorefrontAuth = {
    initUserAuth,
    setCurrentUser,
  };
})();
