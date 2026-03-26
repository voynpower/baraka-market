(function () {
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
  const isLocal = LOCAL_HOSTS.has(window.location.hostname);
  const apiBaseUrl = isLocal
    ? 'http://localhost:3000'
    : 'https://baraka-market.onrender.com';

  window.BarakaConfig = {
    apiBaseUrl,
  };
})();
