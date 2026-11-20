/* GYMVERSE — UI primitives: icons, cards, modal, toast */
(function () {
  'use strict';
  var GY = (window.GY = window.GY || {});
  var U = GY.util;
  var esc = U.esc;

  var PATHS = {
    home: '<path d="M3.5 10.5 12 3.8l8.5 6.7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
    ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 6v2M13 11v2M13 16v2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    dumbbell: '<path d="M4 9.5v5M7 6.5v11M17 6.5v11M20 9.5v5M7 12h10"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6M17.4 14.4a6 6 0 0 1 3.8 5.6"/>',
    bell: '<path d="M18 8.6a6 6 0 1 0-12 0c0 5-2 6.4-2 6.4h16s-2-1.4-2-6.4"/><path d="M10.2 19a2 2 0 0 0 3.6 0"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    chevronLeft: '<path d="M14.5 6 8.5 12l6 6"/>',
    chevronRight: '<path d="M9.5 6l6 6-6 6"/>',
    chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/>',
    pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z"/>',
    star: '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.8l5.9-.8z"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    filter: '<path d="M3.5 6h17M6.5 12h11M10 18h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14.5 5.5 4 4"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    download: '<path d="M12 3.5v12M7.5 11 12 15.5 16.5 11"/><path d="M4 20h16"/>',
    share: '<circle cx="17.5" cy="6" r="2.6"/><circle cx="6.5" cy="12" r="2.6"/><circle cx="17.5" cy="18" r="2.6"/><path d="m8.8 10.7 6.4-3.3M8.8 13.3l6.4 3.3"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 4 3 19h18z"/><path d="M12 10v4M12 17h.01"/>',
    sparkle: '<path d="m12 3 1.9 5.3 5.3 1.9-5.3 1.9L12 17.4l-1.9-5.3L4.8 10.2l5.3-1.9z"/><path d="M18.5 15.5 19.4 18l2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z"/>',
    flame: '<path d="M12 21c4 0 6.5-2.6 6.5-6 0-4.4-4-6.4-4-10.5 0 0-3 1.2-3 4.5 0 1.6-1 2.4-2 2.4S8 10 8 8.5C6 10.3 5.5 12.4 5.5 15c0 3.4 2.5 6 6.5 6z"/>',
    water: '<path d="M12 3s6 6.4 6 10.4A6 6 0 0 1 6 13.4C6 9.4 12 3 12 3z"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.4"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.6a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    logout: '<path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/><path d="M16 8l4 4-4 4M20 12H9"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 5v6h-6"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h3"/>',
    trend: '<path d="m3 16 5.5-5.5 3.5 3.5L21 5"/><path d="M15.5 5H21v5.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    whistle: '<circle cx="12" cy="9.5" r="5.5"/><path d="M9.5 14.5 7.5 21l4.5-2.3L16.5 21l-2-6.5"/><path d="m10.3 9.4 1.4 1.4 2.3-2.6"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    map: '<path d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v14M15 6.5v14"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'
  };

  function icon(name, cls) {
    var p = PATHS[name] || PATHS.info;
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  function catIcon(cat, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (cat.icon || PATHS.sparkle) + '</svg>';
  }

  function avatar(name, color, cls) {
    return '<span class="av ' + (cls || '') + '" style="background:' + esc(color || '#8fe3c4') + '">' + esc(U.initials(name)) + '</span>';
  }

  function difficultyBadge(level) {
    var cls = level === 'Advanced' ? 'badge-advanced' : level === 'Intermediate' ? 'badge-intermediate' : 'badge-beginner';
    return '<span class="badge ' + cls + '">' + esc(level) + '</span>';
  }
  function membershipBadge(tier) {
    if (tier === 'Standard') return '';
    return '<span class="badge ' + (tier === 'Elite' ? 'badge-elite' : 'badge-ghost') + '">' + esc(tier) + '</span>';
  }
  function stars(avg) {
    var out = '<span class="stars-static" style="display:inline-flex;gap:2px">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg viewBox="0 0 24 24" fill="' + (i <= Math.round(avg) ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.4" style="width:12px;height:12px;color:' + (i <= Math.round(avg) ? 'var(--accent)' : '#41454d') + '">' + '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.8l5.9-.8z"/></svg>';
    }
    return out + '</span>';
  }

  function seats(session, compact) {
    var pct = Math.round((session.enrolled / session.capacity) * 100);
    var state = session.seats === 0 ? 'is-full' : session.seats <= 4 ? 'is-tight' : '';
    var label = session.seats === 0 ? 'Waitlist only' : session.seats + ' seat' + (session.seats === 1 ? '' : 's') + ' left';
    if (compact) {
      return '<span class="seats-text"><b class="' + state + '">' + (session.seats === 0 ? 'Full' : session.seats + ' left') + '</b> / ' + session.capacity + '</span>';
    }
    return '<div class="seats">' +
      '<div class="seats-bar"><div class="seats-fill ' + state + '" style="width:' + U.clamp(pct, 2, 100) + '%"></div></div>' +
      '<span class="seats-text">' + label + ' · ' + session.enrolled + '/' + session.capacity + '</span>' +
      '</div>';
  }

  function classCard(s) {
    var cat = s.category;
    var booked = s.myStatus === 'booked' ? 'booked' : s.myStatus === 'waitlisted' ? 'waitlisted' : '';
    var action = booked
      ? '<a class="btn btn-sm btn-outline" href="#/session/' + esc(s.id) + '">' + (booked === 'booked' ? 'View booking' : 'On waitlist') + '</a>'
      : '<a class="btn btn-sm btn-cat" href="#/session/' + esc(s.id) + '">' + (s.seats === 0 ? 'Join waitlist' : 'Book') + '</a>';
    return '<article class="class-card" data-cat="' + esc(s.categoryId) + '">' +
      '<a class="cc-media" href="#/session/' + esc(s.id) + '">' +
      '<img class="cc-img" src="' + esc(s.image) + '" alt="' + esc(s.name) + '" loading="lazy">' +
      '<span class="cc-scrim"></span>' +
      '<span class="cc-top">' +
      '<span class="cc-cat">' + esc(cat.short || cat.name) + '</span>' +
      '<button class="cc-fav ' + (s.fav ? 'is-on' : '') + '" data-act="fav" data-id="' + esc(s.id) + '" aria-label="Save class">' + icon('heart') + '</button>' +
      '</span>' +
      '<span class="cc-bottom">' +
      '<span class="cc-when"><b>' + esc(U.fmtTime(s.startIso)) + '</b><span>' + esc(U.relDay(s.date)) + ' · ' + esc(U.fmtDuration(s.duration)) + '</span></span>' +
      '<span class="badge badge-glass">' + (s.seats === 0 ? 'Waitlist' : s.seats + ' left') + '</span>' +
      '</span></a>' +
      '<div class="cc-body">' +
      '<div class="row" style="justify-content:space-between;gap:6px">' +
      '<h3 class="cc-title"><a href="#/session/' + esc(s.id) + '">' + esc(s.name) + '</a></h3>' +
      '<span class="rating">' + icon('star') + (s.rating.avg ? s.rating.avg.toFixed(1) : '—') + '<small>(' + s.rating.count + ')</small></span>' +
      '</div>' +
      '<div class="cc-trainer">' + avatar(s.trainer.name, s.trainer.accent, '') + '<span>' + esc(s.trainer.name) + '</span>' +
      '<span class="dot-sep">·</span>' + difficultyBadge(s.difficulty) + '</div>' +
      '<div class="cc-loc">' + icon('pin') + esc(s.branch.name) + ' · ' + esc(s.room.name) + '</div>' +
      '<div class="cc-foot">' +
      '<span class="cc-price">' + U.money(s.price) + '<small>/ class</small></span>' +
      action +
      '</div></div></article>';
  }

  function catTile(c, count) {
    return '<a class="cat-tile" data-cat="' + esc(c.id) + '" href="#/category/' + esc(c.id) + '">' +
      '<img src="' + esc(c.image) + '" alt="' + esc(c.name) + '" loading="lazy">' +
      '<span class="ct-icon">' + catIcon(c) + '</span>' +
      '<h3>' + esc(c.name) + '</h3>' +
      '<p>' + esc(c.tagline) + '</p>' +
      '<span class="ct-meta"><span>' + (count != null ? count : c.count) + ' formats</span><span>Explore ' + icon('arrowRight') + '</span></span>' +
      '</a>';
  }

  function empty(opts) {
    return '<div class="empty">' +
      '<div class="empty-icon">' + icon(opts.icon || 'search') + '</div>' +
      '<h4>' + esc(opts.title || 'Nothing here yet') + '</h4>' +
      '<p>' + esc(opts.text || '') + '</p>' +
      (opts.action || '') + '</div>';
  }

  /* ---------------------------------------------------------------- toast */
  function toast(title, text, type, ms) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    var ico = type === 'error' ? 'alert' : type === 'warn' ? 'alert' : type === 'success' ? 'check' : 'sparkle';
    el.innerHTML = '<div class="toast-ico">' + icon(ico) + '</div>' +
      '<div class="toast-body"><div class="toast-title">' + esc(title) + '</div>' +
      (text ? '<div class="toast-text">' + esc(text) + '</div>' : '') + '</div>' +
      '<button class="toast-x" aria-label="Dismiss">&times;</button>';
    root.appendChild(el);
    var timer = setTimeout(close, ms || 4600);
    function close() {
      clearTimeout(timer);
      el.classList.add('is-out');
      setTimeout(function () { el.remove(); }, 260);
    }
    el.querySelector('.toast-x').addEventListener('click', close);
  }

  /* ---------------------------------------------------------------- modal */
  var modalState = { onClose: null };
  function modal(opts) {
    var root = document.getElementById('modal-root');
    if (!root) return { close: function () {} };
    root.innerHTML = '<div class="modal-backdrop" data-modal-close></div>' +
      '<div class="modal-wrap"><div class="modal ' + (opts.size ? 'modal-' + opts.size : '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><div><h3>' + esc(opts.title || '') + '</h3>' +
      (opts.subtitle ? '<p>' + esc(opts.subtitle) + '</p>' : '') + '</div>' +
      '<button class="modal-x" data-modal-close aria-label="Close">' + icon('x') + '</button></div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '<div class="modal-foot">' + opts.footer + '</div>' : '') +
      '</div></div>';
    root.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modalState.onClose = opts.onClose || null;
    root.querySelectorAll('[data-modal-close]').forEach(function (b) {
      b.addEventListener('click', closeModal);
    });
    if (opts.onMount) opts.onMount(root.querySelector('.modal'));
    return { close: closeModal, root: root };
  }
  function closeModal() {
    var root = document.getElementById('modal-root');
    if (!root) return;
    root.classList.remove('is-open');
    root.innerHTML = '';
    document.body.style.overflow = '';
    if (modalState.onClose) { var fn = modalState.onClose; modalState.onClose = null; fn(); }
  }

  function confirm(opts) {
    var m = modal({
      title: opts.title,
      subtitle: opts.subtitle,
      size: 'sm',
      body: '<p class="lede" style="font-size:13px">' + esc(opts.message || '') + '</p>',
      footer: '<button class="btn btn-ghost" data-modal-close>Keep it</button>' +
        '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" id="confirm-yes">' + esc(opts.confirmLabel || 'Confirm') + '</button>',
      onMount: function (node) {
        node.querySelector('#confirm-yes').addEventListener('click', function () {
          closeModal();
          if (opts.onConfirm) opts.onConfirm();
        });
      }
    });
    return m;
  }

  function formatDateBadge(session) {
    return U.fmtDateShort(session.date) + ' · ' + U.fmtTime(session.startIso);
  }

  GY.ui = {
    icon: icon,
    catIcon: catIcon,
    avatar: avatar,
    difficultyBadge: difficultyBadge,
    membershipBadge: membershipBadge,
    stars: stars,
    seats: seats,
    classCard: classCard,
    catTile: catTile,
    empty: empty,
    toast: toast,
    modal: modal,
    closeModal: closeModal,
    confirm: confirm,
    formatDateBadge: formatDateBadge,
    esc: esc
  };
})();
