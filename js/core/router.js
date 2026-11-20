/* GYMVERSE — hash router (history-free so the app runs from any static host) */
(function () {
  'use strict';
  var GY = (window.GY = window.GY || {});

  function decode(value) {
    try { return decodeURIComponent(String(value).replace(/\+/g, ' ')); }
    catch (err) { return String(value); }
  }

  function parse(input) {
    var raw = String(input == null ? window.location.hash : input).replace(/^#/, '');
    var frag = '';
    var hi = raw.indexOf('#');
    if (hi > -1) { frag = raw.slice(hi + 1); raw = raw.slice(0, hi); }
    if (!raw) raw = '/';
    var qi = raw.indexOf('?');
    var path = qi > -1 ? raw.slice(0, qi) : raw;
    var search = qi > -1 ? raw.slice(qi + 1) : '';
    var query = {};
    search.split('&').forEach(function (pair) {
      if (!pair) return;
      var eq = pair.indexOf('=');
      var key = eq > -1 ? pair.slice(0, eq) : pair;
      var value = eq > -1 ? pair.slice(eq + 1) : '';
      query[decode(key)] = decode(value);
    });
    var parts = path.split('/').filter(Boolean);
    return {
      name: 'home',
      path: '/' + parts.join('/'),
      parts: parts,
      params: {},
      query: query,
      frag: frag
    };
  }

  function resolve(route) {
    var p = route.parts;
    if (!p.length || p[0] === 'home') return route;
    if (p[0] === 'classes') { route.name = 'catalog'; return route; }
    if (p[0] === 'category' && p[1]) { route.name = 'category'; route.params.cat = p[1]; return route; }
    if (p[0] === 'session' && p[1]) { route.name = 'session'; route.params.id = p[1]; return route; }
    if (p[0] === 'calendar') { route.name = 'calendar'; return route; }
    if (p[0] === 'bookings') { route.name = 'bookings'; return route; }
    if (p[0] === 'trainer') { route.name = 'trainer'; return route; }
    if (p[0] === 'analytics') { route.name = 'analytics'; return route; }
    route.name = 'notfound';
    return route;
  }

  var current = resolve(parse());
  var listeners = [];

  function notify() {
    current = resolve(parse());
    listeners.forEach(function (fn) {
      try { fn(current); } catch (err) { console.error('[GYMVERSE] route handler failed', err); }
    });
  }

  function start(fn) {
    if (fn) listeners.push(fn);
    window.addEventListener('hashchange', notify);
    notify();
  }

  function go(path) {
    var next = String(path).charAt(0) === '#' ? String(path) : '#' + path;
    if (window.location.hash === next) notify();
    else window.location.hash = next;
  }

  GY.router = {
    start: start,
    go: go,
    parse: parse,
    current: function () { return current; }
  };
})();
