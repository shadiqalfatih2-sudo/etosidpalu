(function () {
  'use strict';

  var TOKEN_KEY = 'etos_admin_session_token';

  function clearAdminToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  }

  function endpointFor(prop) {
    prop = String(prop);
    if (prop === 'loginAdmin') return '/api/admin/login';
    if (prop === 'uploadImageToDrive') return '/api/upload';
    return '/api/rpc';
  }

  function readToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }

  function request(prop, args, success, failure) {
    var token = readToken();
    fetch(endpointFor(prop), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Etos-Admin-Token': token
      },
      body: JSON.stringify({ fn: String(prop), args: Array.isArray(args) ? args : [] })
    }).then(function (r) {
      return r.json().then(function (body) {
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) clearAdminToken();
          throw new Error(body.error || body.message || 'Request gagal');
        }
        return body;
      });
    }).then(function (body) {
      if (String(prop) === 'loginAdmin' && body && typeof body.result === 'string') {
        try {
          var parsed = JSON.parse(body.result);
          if (parsed && parsed.status === 'success' && parsed.token) {
            localStorage.setItem(TOKEN_KEY, parsed.token);
          }
        } catch (e) {}
      }
      if (typeof success === 'function') success(body ? body.result : null);
    }).catch(function (err) {
      if (typeof failure === 'function') failure(err);
      else console.error(err);
    });
  }

  function chain() {
    var success = function () {};
    var failure = function (err) { console.error(err); };
    var api = {
      withSuccessHandler: function (fn) {
        success = typeof fn === 'function' ? fn : success;
        return api;
      },
      withFailureHandler: function (fn) {
        failure = typeof fn === 'function' ? fn : failure;
        return api;
      }
    };

    return new Proxy(api, {
      get: function (target, prop) {
        if (prop in target) return target[prop];
        return function () {
          request(String(prop), Array.prototype.slice.call(arguments), success, failure);
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  Object.defineProperty(window.google.script, 'run', { get: chain });

  function parseJson(value, fallback) {
    try {
      if (typeof value === 'string') return JSON.parse(value);
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function callIfAvailable(name) {
    try {
      if (typeof window[name] === 'function') window[name]();
    } catch (e) {
      console.error('[Etos bootstrap] ' + name + ' gagal:', e);
    }
  }

  function bootstrapPublicHome() {
    if (window.__etosPublicBootstrapStarted) return;
    window.__etosPublicBootstrapStarted = true;

    request('getPublicData', ['program', 0, 100], function (result) {
      var data = parseJson(result, []);
      if (!Array.isArray(data)) data = [];
      window.programCache = data;
      window.programsReady = true;
      window.programsLoading = false;
      callIfAvailable('storeProgramCache');
      callIfAvailable('renderHomePrograms');
      try {
        if (window.currentView === 'programs') callIfAvailable('renderPrograms');
      } catch (e) {}
      callIfAvailable('initRevealObserver');
    }, function (err) {
      window.programsLoading = false;
      console.error('[Etos bootstrap] program gagal:', err);
    });

    request('getPublicData', ['awardee', 0, 200], function (result) {
      var data = parseJson(result, []);
      if (!Array.isArray(data)) data = [];
      window.awardeeCache = data;
      window.awardeesReady = true;
      window.awardeesLoading = false;
      callIfAvailable('renderHomeAwardees');
      if (window.currentView === 'awardees') callIfAvailable('renderAwardees');
      callIfAvailable('initRevealObserver');
    }, function (err) {
      window.awardeesLoading = false;
      console.error('[Etos bootstrap] awardee gagal:', err);
    });

    request('getPublicData', ['hero', Date.now(), 6], function (result) {
      var data = parseJson(result, []);
      if (Array.isArray(data) && data.length) {
        window.heroSlidesCache = data.slice(0, 6);
        window.heroSliderIndex = 0;
        callIfAvailable('renderHeroSlides');
        callIfAvailable('restartHeroAutoplay');
      }
    }, function (err) {
      console.error('[Etos bootstrap] hero gagal:', err);
    });

    request('getPublicData', ['berita_opini', 0, 12], function (result) {
      var payload = parseJson(result, { data: [], hasMore: false });
      if (payload && Array.isArray(payload.data)) {
        window.homePublicationCache = payload.data;
        window.embeddedPublicationsHasMore = !!payload.hasMore;
        callIfAvailable('renderHomePublications');
        callIfAvailable('initRevealObserver');
      }
    }, function (err) {
      console.error('[Etos bootstrap] publikasi gagal:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapPublicHome, { once: true });
  } else {
    window.setTimeout(bootstrapPublicHome, 0);
  }

  window.__etosCloseAdminSession = function () {
    var token = readToken();
    clearAdminToken();
    if (!token) return;
    fetch('/api/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Etos-Admin-Token': token
      },
      body: '{}',
      keepalive: true
    }).catch(function () {});
  };
})();
