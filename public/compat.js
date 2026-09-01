(function () {
  'use strict';
  var TOKEN_KEY = 'etos_admin_session_token';

  function chain() {
    var success = function () {};
    var failure = function (err) { console.error(err); };
    var api = {
      withSuccessHandler: function (fn) { success = typeof fn === 'function' ? fn : success; return api; },
      withFailureHandler: function (fn) { failure = typeof fn === 'function' ? fn : failure; return api; }
    };
    return new Proxy(api, {
      get: function (target, prop) {
        if (prop in target) return target[prop];
        return function () {
          var args = Array.prototype.slice.call(arguments);
          var token = localStorage.getItem(TOKEN_KEY) || '';
          fetch('/api/rpc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Etos-Admin-Token': token },
            body: JSON.stringify({ fn: String(prop), args: args })
          })
          .then(function (r) { return r.json().then(function (body) { if (!r.ok) throw new Error(body.error || 'Request gagal'); return body; }); })
          .then(function (body) {
            if (String(prop) === 'loginAdmin' && body && typeof body.result === 'string') {
              try {
                var parsed = JSON.parse(body.result);
                if (parsed && parsed.status === 'success' && parsed.token) localStorage.setItem(TOKEN_KEY, parsed.token);
              } catch (e) {}
            }
            success(body ? body.result : null);
          })
          .catch(failure);
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  Object.defineProperty(window.google.script, 'run', { get: chain });
  window.__etosCloseAdminSession = function () {
    var token = localStorage.getItem(TOKEN_KEY) || '';
    localStorage.removeItem(TOKEN_KEY);
    if (!token) return;
    fetch('/api/rpc', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Etos-Admin-Token': token },
      body: JSON.stringify({ fn: 'logoutAdmin', args: [] }), keepalive: true
    }).catch(function () {});
  };
})();
