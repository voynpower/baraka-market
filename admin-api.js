// admin-api.js - Shared admin-side API helpers
(function () {
  function getAdminToken() {
    return localStorage.getItem('admin_token');
  }

  function getAuthHeader() {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function parseResponse(res) {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function request(url, options) {
    const response = await fetch(url, options);
    const data = await parseResponse(response);
    return { response, data };
  }

  function getErrorMessage(payload, fallbackMessage) {
    if (Array.isArray(payload?.message)) return payload.message[0] || fallbackMessage;
    return payload?.message || fallbackMessage;
  }

  function handleAuthError(res, onError) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('admin_token');
      if (typeof onError === 'function') onError();
      return true;
    }
    return false;
  }

  window.AdminApi = {
    getAdminToken,
    getAuthHeader,
    parseResponse,
    request,
    getErrorMessage,
    handleAuthError,
  };
})();
