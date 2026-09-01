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

  function callIfAvailable(name, args) {
    try {
      if (typeof window[name] === 'function') window[name].apply(window, Array.isArray(args) ? args : []);
    } catch (e) {
      console.error('[Etos bootstrap] ' + name + ' gagal:', e);
    }
  }

  function syncRuntimeOrigin() {
    try {
      if (window.location && /^https?:$/.test(window.location.protocol)) {
        window.PUBLIC_SITE_BASE_URL = window.location.origin;
      }
    } catch (e) {}
  }

  function publicationPath(jenis, slug) {
    var segment = String(jenis || '').toLowerCase() === 'berita' ? 'berita' : 'opini';
    return '/' + segment + '/' + encodeURIComponent(String(slug || '').trim());
  }

  function installPublicationNavigationFix() {
    syncRuntimeOrigin();

    window.getPublicationPublicUrl = function (jenis, slug) {
      return window.location.origin + publicationPath(jenis, slug);
    };

    window.openPublication = function (event, slug, jenis) {
      if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1)) {
        return true;
      }

      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      var cleanSlug = String(slug || '').trim();
      if (!cleanSlug) return false;

      try {
        if (typeof window.saveDashboardReturnState === 'function') {
          window.saveDashboardReturnState();
        }
      } catch (e) {}

      // Use a real top-level same-origin navigation. The Next.js catch-all route
      // renders the publication URL directly, so legacy SPA/iframe handlers can
      // no longer reset the view to the homepage.
      window.location.assign(publicationPath(jenis, cleanSlug));
      return false;
    };
  }

  function rewriteLegacyPublicationLinks(root) {
    try {
      var scope = root && root.querySelectorAll ? root : document;
      var links = scope.querySelectorAll('a[href*="/berita/"],a[href*="/opini/"]');
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href') || '';
        try {
          var parsed = new URL(href, window.location.href);
          if (parsed.pathname.indexOf('/berita/') === 0 || parsed.pathname.indexOf('/opini/') === 0) {
            links[i].setAttribute('href', window.location.origin + parsed.pathname + parsed.search + parsed.hash);
            links[i].removeAttribute('target');
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  function openDirectPublicationRoute() {
    syncRuntimeOrigin();
    try {
      var parts = String(window.location.pathname || '/').split('/').filter(Boolean);
      if (parts.length < 2 || (parts[0] !== 'berita' && parts[0] !== 'opini')) return;
      var slug = decodeURIComponent(parts.slice(1).join('/'));
      var jenis = parts[0] === 'berita' ? 'Berita' : 'Opini';
      if (!slug || typeof window.loadArticleDetail !== 'function') return;
      if (window.currentPublication && window.currentPublication.slug === slug) return;
      window.passedSlug = slug;
      window.passedJenis = jenis;
      window.loadArticleDetail(slug, jenis, { replaceUrl: true });
    } catch (e) {
      console.error('[Etos route] direct publication gagal:', e);
    }
  }

  function bootstrapPublicHome() {
    if (window.__etosPublicBootstrapStarted) return;
    window.__etosPublicBootstrapStarted = true;
    syncRuntimeOrigin();

    request('getPublicData', ['program', 0, 100], function (result) {
      var data = parseJson(result, []);
      if (!Array.isArray(data)) data = [];
      window.programCache = data;
      window.programsReady = true;
      window.programsLoading = false;
      callIfAvailable('storeProgramCache', [data]);
      callIfAvailable('renderHomePrograms');
      if (window.currentView === 'programs') callIfAvailable('renderPrograms', [data]);
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
        rewriteLegacyPublicationLinks(document);
        callIfAvailable('initRevealObserver');
      }
    }, function (err) {
      console.error('[Etos bootstrap] publikasi gagal:', err);
    });
  }

  function afterDomReady() {
    syncRuntimeOrigin();
    installPublicationNavigationFix();
    bootstrapPublicHome();
    window.setTimeout(function () {
      syncRuntimeOrigin();
      installPublicationNavigationFix();
      rewriteLegacyPublicationLinks(document);
      openDirectPublicationRoute();
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDomReady, { once: true });
  } else {
    window.setTimeout(afterDomReady, 0);
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
