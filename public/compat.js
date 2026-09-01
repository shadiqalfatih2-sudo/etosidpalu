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
      body: JSON.stringify({ fn: String(prop), args: Array.isArray(args) ? args : [] }),
      cache: 'no-store'
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
  Object.defineProperty(window.google.script, 'run', { configurable: true, get: chain });

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
      if (typeof window[name] === 'function') {
        return window[name].apply(window, Array.isArray(args) ? args : []);
      }
    } catch (e) {
      console.error('[Etos compat] ' + name + ' gagal:', e);
    }
  }

  function cleanupLegacyBrowserState() {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
          regs.forEach(function (reg) { reg.unregister().catch(function () {}); });
        }).catch(function () {});
      }
    } catch (e) {}

    try {
      if ('caches' in window && caches.keys) {
        caches.keys().then(function (keys) {
          keys.forEach(function (key) { caches.delete(key).catch(function () {}); });
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function syncRuntimeOrigin() {
    try {
      if (window.location && /^https?:$/.test(window.location.protocol)) {
        window.PUBLIC_SITE_BASE_URL = window.location.origin;
      }
    } catch (e) {}
  }

  function normalizeJenis(value) {
    return String(value || '').toLowerCase() === 'berita' ? 'Berita' : 'Opini';
  }

  function publicationPath(jenis, slug) {
    var segment = normalizeJenis(jenis) === 'Berita' ? 'berita' : 'opini';
    return '/' + segment + '/' + encodeURIComponent(String(slug || '').trim());
  }

  function isPublicationRoute() {
    var parts = String(window.location.pathname || '/').split('/').filter(Boolean);
    return parts.length >= 2 && (parts[0] === 'berita' || parts[0] === 'opini');
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
        if (typeof window.saveDashboardReturnState === 'function') window.saveDashboardReturnState();
      } catch (e) {}
      window.location.assign(publicationPath(jenis, cleanSlug));
      return false;
    };

    if (!window.__etosPublicationCaptureInstalled) {
      window.__etosPublicationCaptureInstalled = true;
      document.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        var target = event.target;
        var link = target && target.closest ? target.closest('a[href]') : null;
        if (!link) return;
        try {
          var url = new URL(link.getAttribute('href') || '', window.location.href);
          if (url.origin !== window.location.origin) return;
          if (url.pathname.indexOf('/berita/') !== 0 && url.pathname.indexOf('/opini/') !== 0) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.assign(url.pathname + url.search + url.hash);
        } catch (e) {}
      }, true);
    }
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

  function setHidden(id, hidden) {
    var el = document.getElementById(id);
    if (!el) return;
    if (hidden) el.classList.add('hidden');
    else el.classList.remove('hidden');
  }

  function showDetailError(message) {
    setHidden('read-loader', true);
    var content = document.getElementById('read-content');
    if (!content) return;
    content.innerHTML = '<p class="text-center text-amber-700 font-bold py-10"></p>';
    var p = content.querySelector('p');
    if (p) p.textContent = message || 'Tulisan belum dapat dimuat. Silakan coba lagi.';
    content.classList.remove('hidden');
  }

  function renderPublicationDetail(data, cleanSlug, requestedJenis) {
    if (!data) {
      showDetailError('Konten tidak ditemukan atau belum diterbitkan.');
      return;
    }

    try { callIfAvailable('navigate', ['article-detail']); } catch (e) {}
    setHidden('read-loader', true);

    data.slug = data.slug || cleanSlug;
    data.jenis = normalizeJenis(data.jenis || requestedJenis);
    data.url = data.url || (window.location.origin + publicationPath(data.jenis, cleanSlug));
    window.currentPublication = data;
    window.passedSlug = cleanSlug;
    window.passedJenis = data.jenis;

    var pageTitle = (data.judul || 'Publikasi') + ' | Etos ID Palu';
    document.title = pageTitle;
    try {
      if (typeof window.syncPublicRoute === 'function') {
        window.syncPublicRoute(publicationPath(data.jenis, cleanSlug), pageTitle, true);
      }
    } catch (e) {}

    var badge = document.getElementById('read-badge');
    var title = document.getElementById('read-title');
    var author = document.getElementById('read-author');
    var date = document.getElementById('read-date');
    var image = document.getElementById('read-img');
    var body = document.getElementById('read-body');
    var content = document.getElementById('read-content');

    if (badge) badge.innerText = data.jenis;
    if (title) title.innerText = data.judul || '';
    if (author) {
      var authorText = data.penulis || 'Etos ID Palu';
      if (data.aktivitas) authorText += ' (' + data.aktivitas + ')';
      author.innerText = authorText;
    }
    if (date) date.innerText = data.tanggal || '';
    if (image) {
      image.src = data.thumb || '';
      image.alt = data.judul || 'Thumbnail publikasi Etos ID Palu';
      image.style.objectPosition = data.thumbPosition || '50% 50%';
      if (data.thumb) image.classList.remove('hidden');
      else image.classList.add('hidden');
    }
    if (body) {
      try {
        body.innerHTML = typeof window.renderArticleContent === 'function'
          ? window.renderArticleContent(data.isi || '')
          : String(data.isi || '');
      } catch (e) {
        body.textContent = String(data.isi || '');
      }
    }
    if (content) content.classList.remove('hidden');
    setHidden('read-loader', true);
  }

  function directLoadArticleDetail(slug, jenis, options) {
    options = options || {};
    var cleanSlug = String(slug || '').trim();
    if (!cleanSlug) return;
    var cleanJenis = normalizeJenis(jenis || window.passedJenis || 'Opini');

    callIfAvailable('navigate', ['article-detail']);
    setHidden('read-content', true);
    setHidden('read-loader', false);

    var embedded = window.__ETOS_PUBLICATION_DETAIL__;
    if (embedded && String(embedded.slug || '') === cleanSlug) {
      renderPublicationDetail(embedded, cleanSlug, cleanJenis);
      return;
    }

    request('getDetailBySlug', [cleanSlug], function (resStr) {
      var data = parseJson(resStr, null);
      renderPublicationDetail(data, cleanSlug, cleanJenis);
    }, function (err) {
      console.error('[Etos detail] gagal:', err);
      showDetailError('Tulisan belum dapat dimuat. Silakan coba lagi.');
    });
  }

  function installDirectPublicationLoader() {
    window.loadArticleDetail = directLoadArticleDetail;
  }

  function openDirectPublicationRoute() {
    syncRuntimeOrigin();
    try {
      var parts = String(window.location.pathname || '/').split('/').filter(Boolean);
      if (parts.length < 2 || (parts[0] !== 'berita' && parts[0] !== 'opini')) return;
      var slug = decodeURIComponent(parts.slice(1).join('/'));
      var jenis = parts[0] === 'berita' ? 'Berita' : 'Opini';
      if (!slug) return;
      window.passedSlug = slug;
      window.passedJenis = jenis;
      directLoadArticleDetail(slug, jenis, { replaceUrl: true });
    } catch (e) {
      console.error('[Etos route] direct publication gagal:', e);
      showDetailError('Tulisan belum dapat dimuat. Silakan coba lagi.');
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
    cleanupLegacyBrowserState();
    syncRuntimeOrigin();
    installPublicationNavigationFix();
    installDirectPublicationLoader();
    rewriteLegacyPublicationLinks(document);

    if (isPublicationRoute()) {
      openDirectPublicationRoute();
    } else {
      bootstrapPublicHome();
    }
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
