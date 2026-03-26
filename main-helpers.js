// main-helpers.js - Shared storefront helpers
(function () {
  function getUserToken() {
    return localStorage.getItem('user_token');
  }

  function getAuthHeaders() {
    const token = getUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function getStoredArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function setStoredArray(key, value) {
    localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
  }

  function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  async function parseApiResponse(res) {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  function getErrorMessage(payload, fallback) {
    if (Array.isArray(payload?.message)) return payload.message[0] || fallback;
    return payload?.message || fallback;
  }

  async function apiRequest(baseUrl, path, options) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const data = await parseApiResponse(response);
    return { response, data };
  }

  window.StorefrontHelpers = {
    getUserToken,
    getAuthHeaders,
    getStoredArray,
    setStoredArray,
    parseJsonArray,
    parseApiResponse,
    getErrorMessage,
    apiRequest,
  };
})();
