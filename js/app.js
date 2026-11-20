/* GYMVERSE — application shell, routing glue, global actions */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;
  var store = GY.store;

  function defaultFilters() {
    return {
      category: '', trainerId: '', branchId: '', difficulty: '', membership: '',
      timeOfDay: '', maxPrice: '', duration: '', date: 'any', minSeats: false,
      favoritesOnly: false, search: '', sort: 'soonest'
    };
  }

  GY.state = {
    filters: defaultFilters(),
    calendar: {
      view: 'week', date: U.dateKey(new Date()),
      category: '', branchId: '', trainerId: '', difficulty: '', seatsOnly: false
    },
    bookingsTab: 'upcoming',
    catalogLimit: 24,
    trainerId: null,
    analyticsDays: 30,
    route: null
  };

  var NAV = [
    { path: '#/', label: 'Overview', icon: 'home', match: ['home'] },
    { path: '#/classes', label: 'Class catalogue', icon: 'grid', match: ['catalog', 'category'] },
    { path: '#/calendar', label: 'Timetable', icon: 'calendar', match: ['calendar'] },
    { path: '#/bookings', label: 'My sessions', icon: 'ticket', match: ['bookings'], badge: 'bookings' },
    { path: '#/trainer', label: 'Trainer studio', icon: 'dumbbell', match: ['trainer'] },
    { path: '#/analytics', label: 'Analytics', icon: 'chart', match: ['analytics'] }
  ];

  /* ================================================================ shell */
  function shellHTML() {
    return '<div class="app" id="app-shell">' +
      '<aside class="sidebar">' +
      '<a class="brand" href="#/">' +
      '<span class="brand-mark">' + ui.icon('dumbbell') + '</span>' +
      '<span class="brand-text"><span class="brand-name">GYMVERSE</span><span class="brand-sub">TRAIN DIFFERENT</span></span>' +
      '</a>' +
      '<nav class="side-nav" id="side-nav"></nav>' +
      '<div class="nav-label">Disciplines</div>' +
      '<nav class="side-nav" id="cat-nav"></nav>' +
      '<div class="sidebar-foot">' +
      '<div class="side-card" id="tier-card"></div>' +
      '<div class="side-foot-links"><button data-act="reset-demo">Reset demo</button>' +
      '<a href="#/analytics">Studio reports</a></div>' +
      '</div></aside>' +
      '<div class="main">' +
      '<header class="topbar">' +
      '<button class="icon-btn menu-btn" data-act="toggle-nav" aria-label="Open navigation">' + ui.icon('menu') + '</button>' +
      '<div class="topbar-left"><span class="topbar-title" id="topbar-title"></span></div>' +
      '<label class="search">' + ui.icon('search') +
      '<input id="global-search" type="search" placeholder="Search ' + GY.data.disciplines.length + ' class formats, trainers, studios" autocomplete="off" aria-label="Search classes">' +
      '<kbd>/</kbd></label>' +
      '<div class="topbar-right">' +
      '<div class="role-switch"><span class="tiny muted">View as</span>' +
      '<select id="role-select" aria-label="Switch role"><option value="member">Member</option><option value="trainer">Trainer</option></select></div>' +
      '<div class="dropdown" id="notif-wrap">' +
      '<button class="icon-btn" data-act="notif-toggle" aria-label="Notifications">' + ui.icon('bell') +
      '<span class="icon-dot hidden" id="notif-dot"></span></button></div>' +
      '<button class="avatar" id="profile-btn" data-act="profile" aria-label="Open profile"></button>' +
      '</div></header>' +
      '<main class="view" id="view"></main>' +
      '</div>' +
      '<div class="scrim" data-act="close-nav"></div>' +
      '<nav class="bottom-nav" id="bottom-nav"></nav>' +
      '</div>';
  }

  function navHTML(route) {
    var upcoming = store.myBookings().filter(function (b) {
      return (b.status === 'booked' || b.status === 'waitlisted') && !b.session.ended && b.session.status === 'scheduled';
    }).length;
    return NAV.map(function (item) {
      var active = item.match.indexOf(route.name) > -1;
      var count = item.badge === 'bookings' ? upcoming : 0;
      return '<a class="nav-item ' + (active ? 'is-active' : '') + '" href="' + item.path + '">' +
        ui.icon(item.icon) + '<span>' + esc(item.label) + '</span>' +
        (count ? '<span class="nav-badge">' + count + '</span>' : '') + '</a>';
    }).join('');
  }

  function catNavHTML(route) {
    return GY.data.categories.map(function (c) {
      var active = route.name === 'category' && route.params.cat === c.id;
      return '<a class="nav-item ' + (active ? 'is-active' : '') + '" data-cat="' + esc(c.id) + '" href="#/category/' + esc(c.id) + '">' +
        '<span style="width:7px;height:7px;border-radius:50%;flex:0 0 7px;background:' + esc(c.accent) + '"></span>' +
        '<span>' + esc(c.short) + '</span>' +
        '<span class="nav-badge soft">' + c.count + '</span></a>';
    }).join('');
  }

  function bottomNavHTML(route) {
    return [
      { path: '#/', label: 'Home', icon: 'home', match: ['home'] },
      { path: '#/classes', label: 'Classes', icon: 'grid', match: ['catalog', 'category'] },
      { path: '#/calendar', label: 'Schedule', icon: 'calendar', match: ['calendar'] },
      { path: '#/bookings', label: 'Bookings', icon: 'ticket', match: ['bookings'] },
      { path: '#/trainer', label: 'Studio', icon: 'dumbbell', match: ['trainer', 'analytics'] }
    ].map(function (item) {
      return '<a class="' + (item.match.indexOf(route.name) > -1 ? 'is-active' : '') + '" href="' + item.path + '">' +
        ui.icon(item.icon) + '<span>' + esc(item.label) + '</span></a>';
    }).join('');
  }

  function tierCardHTML() {
    var p = store.profile;
    return '<div class="side-card"><div class="row-between"><span class="tier">' + ui.icon('sparkle') +
      esc(p.membership) + ' member</span><span class="tiny muted">' + p.points + ' pts</span></div>' +
      '<h4 class="mt-8">' + esc(p.name) + '</h4>' +
      '<p>' + (p.membership === 'Elite' ? 'Elite studios and personal training are unlocked.' : 'Upgrade to unlock Elite-only formats and personal training.') + '</p>' +
      (p.membership !== 'Elite' ? '<button class="btn btn-primary btn-sm btn-block mt-12" data-act="upgrade">Upgrade plan</button>' : '') +
      '</div>';
  }

  function refreshChrome() {
    var route = GY.state.route || { name: 'home', params: {} };
    var set = function (id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; };
    set('side-nav', navHTML(route));
    set('cat-nav', catNavHTML(route));
    set('tier-card', tierCardHTML());
    var bottom = document.getElementById('bottom-nav');
    if (bottom) bottom.innerHTML = bottomNavHTML(route);

    var roleSelect = document.getElementById('role-select');
    if (roleSelect) roleSelect.value = store.role;

    var dot = document.getElementById('notif-dot');
    if (dot) dot.classList.toggle('hidden', store.unreadCount() === 0);

    var profile = document.getElementById('profile-btn');
    if (profile) {
      profile.textContent = U.initials(store.profile.name);
      profile.style.background = store.profile.avatarColor || 'var(--accent)';
    }

    var title = document.getElementById('topbar-title');
    if (title) title.innerHTML = '<strong>' + esc(titleFor(route)) + '</strong> <span style="opacity:.45">·</span> ' +
      esc(route.name === 'home' ? 'Studio overview' : 'Live timetable');
  }

  function titleFor(route) {
    if (!route) return 'GYMVERSE';
    if (route.name === 'category') {
      var c = GY.data.categoryById(route.params.cat);
      return c ? c.name : 'Category';
    }
    if (route.name === 'session') {
      var s = store.sessionById(route.params.id);
      return s ? s.name : 'Session';
    }
    var v = GY.views[route.name];
    return v && v.title ? v.title : 'GYMVERSE';
  }

  /* ================================================================ view */
  function renderView() {
    var route = GY.state.route || GY.router.current();
    var host = document.getElementById('view');
    if (!host) return;
    var view = GY.views[route.name];
    var ctx = { name: route.name, params: route.params || {}, query: route.query || {} };
    var html;
    if (!view) {
      html = ui.empty({
        icon: 'search', title: 'Page not found',
        text: 'The route "' + route.path + '" is not part of GYMVERSE.',
        action: '<a class="btn btn-sm btn-primary mt-8" href="#/">Back to overview</a>'
      });
    } else {
      try {
        html = view.render(ctx);
      } catch (err) {
        console.error('[GYMVERSE] view failed to render', err);
        html = '<div class="panel panel-pad"><h3>This view could not load</h3>' +
          '<p class="tiny muted mt-8">' + esc(err && err.message ? err.message : 'Unexpected error') + '</p>' +
          '<a class="btn btn-sm btn-outline mt-12" href="#/">Back to overview</a></div>';
      }
    }
    host.innerHTML = html;
    if (view && view.mount) {
      try { view.mount(host, ctx); } catch (err) { console.error('[GYMVERSE] view mount failed', err); }
    }
  }

  function refresh() {
    renderView();
    refreshChrome();
  }

  /* ================================================================ routing */
  function onRoute(route) {
    GY.state.route = route;
    applyQuery(route);
    closeNotifs();
    closeNav();
    refresh();
    var frag = route.frag;
    if (frag === 'review') {
      var form = document.querySelector('[data-review-form]');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo(0, 0);
    }
    document.title = titleFor(route) + ' · GYMVERSE';
  }

  function applyQuery(route) {
    var q = route.query || {};
    var state = GY.state;
    if (route.name === 'catalog') {
      var f = state.filters;
      if ('category' in q) f.category = q.category || '';
      if ('trainer' in q) f.trainerId = q.trainer || q.trainerId || '';
      if ('branch' in q) f.branchId = q.branch || '';
      if ('difficulty' in q) f.difficulty = q.difficulty || '';
      if ('q' in q) f.search = q.q || '';
      if ('sort' in q) f.sort = q.sort || 'soonest';
      if ('price' in q) f.maxPrice = q.price || '';
      if ('date' in q) f.date = q.date || 'any';
      if ('seats' in q) f.minSeats = true;
      if ('saved' in q) f.favoritesOnly = true;
      state.catalogLimit = 24;
      var input = document.getElementById('global-search');
      if (input) input.value = f.search || '';
    } else if (route.name === 'calendar') {
      if ('category' in q) state.calendar.category = q.category || '';
      if ('branch' in q) state.calendar.branchId = q.branch || '';
      if ('trainer' in q) state.calendar.trainerId = q.trainer || '';
      if ('date' in q) state.calendar.date = q.date || state.calendar.date;
      if ('view' in q) state.calendar.view = (q.view === 'day' || q.view === 'month') ? q.view : 'week';
    } else if (route.name === 'bookings') {
      if ('tab' in q) state.bookingsTab = q.tab || 'upcoming';
    } else if (route.name === 'trainer') {
      if ('t' in q) state.trainerId = q.t;
    } else if (route.name === 'analytics') {
      if ('days' in q) state.analyticsDays = parseInt(q.days, 10) || 30;
    }
  }

  /* ================================================================ state helpers */
  function go(path) { GY.router.go(path); }

  function setFilter(key, value) {
    var f = GY.state.filters;
    if (typeof value === 'boolean') {
      f[key] = value;
    } else {
      var next = value == null ? '' : String(value);
      if (key !== 'search' && key !== 'sort' && key !== 'date' && f[key] === next) next = '';
      f[key] = next;
    }
    GY.state.catalogLimit = 24;
    if (GY.state.route && GY.state.route.name === 'catalog') refresh();
    else go('/classes');
  }

  function clearFilter(key) {
    var f = GY.state.filters;
    var defaults = { date: 'any', sort: 'soonest', minSeats: false, favoritesOnly: false };
    f[key] = Object.prototype.hasOwnProperty.call(defaults, key) ? defaults[key] : '';
    GY.state.catalogLimit = 24;
    refresh();
  }

  function clearFilters() {
    GY.state.filters = defaultFilters();
    GY.state.catalogLimit = 24;
    var input = document.getElementById('global-search');
    if (input) input.value = '';
    refresh();
  }

  function setCal(key, value) {
    GY.state.calendar[key] = value;
    refresh();
  }

  function navCal(dir) {
    var c = GY.state.calendar;
    if (dir === 'today') {
      c.date = U.dateKey(new Date());
    } else if (c.view === 'month') {
      var anchor = U.toDate(c.date);
      var month = new Date(anchor.getFullYear(), anchor.getMonth() + Number(dir), 1);
      c.date = U.dateKey(month);
    } else {
      var step = c.view === 'day' ? 1 : 7;
      c.date = U.dateKey(U.addDays(c.date, step * Number(dir)));
    }
    refresh();
  }

  function pickDay(date) {
    GY.state.calendar.date = date;
    GY.state.calendar.view = 'day';
    refresh();
  }

  function setBookingTab(tab) {
    GY.state.bookingsTab = tab;
    refresh();
  }

  function setTrainer(id) {
    GY.state.trainerId = id;
    store.setTrainer(id);
    refresh();
  }

  function setRole(role) {
    store.setRole(role, role === 'trainer' ? (GY.state.trainerId || store.activeTrainerId) : null);
    refreshChrome();
    if (role === 'trainer') {
      ui.toast('Trainer workspace', 'You are now managing sessions as ' + (store.trainerById(store.activeTrainerId) || {}).name + '.', 'success');
      if (!GY.state.route || GY.state.route.name !== 'trainer') go('/trainer');
      else refresh();
    } else {
      ui.toast('Member view', 'Bookings, waitlists and reviews are live again.', 'success');
      refresh();
    }
  }

  function setAnalyticsRange(days) {
    GY.state.analyticsDays = Number(days) || 30;
    refresh();
  }

  /* ================================================================ booking flows */
  function book(sessionId) {
    var v = store.sessionById(sessionId);
    if (!v) { ui.toast('Session unavailable', 'This class is no longer in the timetable.', 'error'); return; }
    var check = store.canBook(v);
    if (!check.ok) {
      if (check.code === 'membership') { openUpgrade(v.membership); return; }
      ui.toast('Cannot book', check.message, 'warn');
      return;
    }
    var clash = store.conflicts(v);
    var res = store.book(sessionId);
    if (!res.ok) { ui.toast('Cannot book', res.message, 'error'); return; }
    openConfirmation(res, clash);
  }

  function openConfirmation(res, clash) {
    var s = res.session;
    var wait = res.status === 'waitlisted';
    var rows = [
      ['Date', U.fmtDateLong(s.date)],
      ['Time', U.fmtRange(s.startIso, s.endIso)],
      ['Trainer', s.trainer.name],
      ['Studio', s.branch.name + ' · ' + s.room.name],
      [wait ? 'Waitlist' : 'Seat', wait ? '#' + (res.position || 1) + ' in line' : 'Seat ' + (res.booking.seat || s.enrolled) + ' of ' + s.capacity],
      ['Access', s.membership + ' · ' + U.money(s.price)]
    ];
    var body = '<div class="info-grid">' + rows.map(function (r) {
      return '<div class="kv"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
    }).join('') + '</div>' +
      '<div class="' + (wait ? 'warn-note' : 'info-note') + ' mt-16">' + ui.icon(wait ? 'clock' : 'check') +
      '<span>' + (wait
        ? 'You are on the list. We promote you automatically and send a confirmation the moment a seat opens.'
        : 'Free cancellation until ' + U.fmtTime(s.deadline.cancelBy) + ' on ' + U.fmtDateShort(s.date) + '. Arrive 10 minutes early to check in.') +
      '</span></div>' +
      (clash ? '<div class="warn-note mt-12">' + ui.icon('alert') +
        '<span>Heads up — this overlaps with ' + esc(clash.name) + ' at ' + esc(U.fmtTime(clash.startIso)) + '.</span></div>' : '');

    ui.modal({
      title: wait ? 'You are on the waitlist' : 'Spot confirmed',
      subtitle: s.name + ' · ' + U.fmtDateLong(s.date),
      size: 'sm',
      body: body,
      footer: '<button class="btn btn-ghost" data-modal-close>Keep browsing</button>' +
        (wait ? '' : '<button class="btn btn-outline" id="confirm-ics">' + ui.icon('download') + 'Calendar</button>') +
        '<a class="btn btn-primary" href="#/bookings" data-modal-close>My sessions</a>',
      onMount: function (node) {
        var ics = node.querySelector('#confirm-ics');
        if (ics) ics.addEventListener('click', function () { downloadICS(s.id); ui.closeModal(); });
      }
    });
  }

  function cancelBooking(bookingId) {
    var entry = store.myBookings().filter(function (b) { return b.booking.id === bookingId; })[0];
    var wait = entry && entry.status === 'waitlisted';
    var name = entry ? entry.session.name : 'this class';
    ui.confirm({
      title: wait ? 'Leave the waitlist?' : 'Cancel this booking?',
      message: wait ? 'You will lose your place in line for ' + name + '.'
        : 'Your seat for ' + name + ' will be released to the waitlist. Late cancellations count as no-shows.',
      confirmLabel: wait ? 'Leave waitlist' : 'Cancel booking',
      danger: true,
      onConfirm: function () {
        var res = store.cancelBooking(bookingId);
        if (!res.ok) { ui.toast('Cannot cancel', res.message, 'warn'); return; }
        ui.toast(wait ? 'Waitlist left' : 'Booking cancelled',
          res.promoted ? 'A waitlisted member was promoted automatically.' : 'Your spot has been released.', 'success');
      }
    });
  }

  function downloadICS(sessionId) {
    var s = store.sessionById(sessionId);
    if (!s) return;
    U.download('gymverse-' + U.slug(s.name) + '-' + s.date + '.ics', store.toICS(sessionId), 'text/calendar');
    ui.toast('Calendar file ready', s.name + ' · ' + U.fmtDateLong(s.date), 'success');
  }

  function exportDay() {
    var c = GY.state.calendar;
    var data = store.calendar({
      view: 'day', date: c.date, category: c.category, branchId: c.branchId,
      trainerId: c.trainerId, difficulty: c.difficulty, minSeats: c.seatsOnly
    });
    var list = (data.byDate || {})[c.date] || [];
    if (!list.length) { ui.toast('Nothing to export', 'No sessions match this day.', 'warn'); return; }
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GYMVERSE//Day//EN'];
    list.forEach(function (s) {
      lines.push('BEGIN:VEVENT',
        'UID:' + s.id + '@gymverse.fit',
        'DTSTAMP:' + U.icsDate(new Date()),
        'DTSTART:' + U.icsDate(s.startIso),
        'DTEND:' + U.icsDate(s.endIso),
        'SUMMARY:' + s.name + ' with ' + s.trainer.name,
        'LOCATION:' + s.branch.name + ' · ' + s.room.name,
        'DESCRIPTION:' + s.category.name + ' · ' + s.difficulty + ' · ' + s.capacity + ' spots',
        'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    U.download('gymverse-day-' + c.date + '.ics', lines.join('\r\n'), 'text/calendar');
    ui.toast('Day exported', list.length + ' sessions written to ' + c.date + '.ics', 'success');
  }

  /* ================================================================ modals */
  function openUpgrade(target) {
    var tiers = [
      { id: 'Standard', price: 49, blurb: 'All group classes across every branch with standard booking windows.' },
      { id: 'Plus', price: 79, blurb: 'Advanced formats, reformer beds, aquatic lanes and priority waitlist promotion.' },
      { id: 'Elite', price: 119, blurb: 'Everything in Plus, Elite-only sessions, personal training credits and guest passes.' }
    ];
    var current = store.profile.membership;
    ui.modal({
      title: 'Choose your membership',
      subtitle: 'Every plan includes booking, waitlists, attendance history and class reviews.',
      size: 'lg',
      body: '<div class="card-grid-3">' + tiers.map(function (t) {
        var isCurrent = t.id === current;
        return '<div class="panel panel-pad" data-cat="personal" style="' + (isCurrent ? 'border-color:rgba(215,255,79,.35)' : '') + '">' +
          '<div class="row-between"><h3 style="font-size:15px">' + esc(t.id) + '</h3>' +
          (isCurrent ? '<span class="badge badge-live"><span class="dot"></span>Current</span>' : '') + '</div>' +
          '<div style="font-size:26px;font-weight:800;margin-top:10px">$' + t.price +
          '<small style="font-size:11px;color:var(--ink-3)"> / month</small></div>' +
          '<p class="tiny muted mt-8" style="line-height:1.5">' + esc(t.blurb) + '</p>' +
          '<button class="btn ' + (isCurrent ? 'btn-outline' : 'btn-primary') + ' btn-sm btn-block mt-12" data-tier="' + esc(t.id) + '"' +
          (isCurrent ? ' disabled' : '') + '>' + (isCurrent ? 'Current plan' : 'Switch to ' + esc(t.id)) + '</button></div>';
      }).join('') + '</div>' +
        (target ? '<div class="info-note mt-16">' + ui.icon('lock') +
          '<span>This class currently requires a ' + esc(target) + ' membership. Upgrades apply instantly in the demo.</span></div>' : ''),
      footer: '<button class="btn btn-ghost" data-modal-close>Not now</button>',
      onMount: function (node) {
        node.querySelectorAll('[data-tier]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var tier = btn.getAttribute('data-tier');
            var res = store.upgradeMembership(tier);
            if (!res.ok) { ui.toast('Upgrade failed', 'That plan is not available.', 'error'); return; }
            ui.closeModal();
            ui.toast('Membership updated', 'You are now on ' + tier + '.', 'success');
            refresh();
          });
        });
      }
    });
  }

  function openProfile() {
    var p = store.profile;
    var stats = store.myStats();
    var saved = store.db.favorites.length;
    var branch = store.branchById(p.homeBranch);
    ui.modal({
      title: 'Your profile',
      subtitle: p.email,
      size: 'sm',
      body: '<div class="row" style="gap:14px">' + ui.avatar(p.name, p.avatarColor, 'av-xl') +
        '<div><h3 style="font-size:16px">' + esc(p.name) + '</h3>' +
        '<p class="tiny muted mt-4">' + esc(p.membership) + ' member · ' + esc(branch ? branch.name : 'GYMVERSE') + '</p>' +
        '<p class="tiny muted">Goal: ' + esc(p.goal) + '</p></div></div>' +
        '<div class="info-grid mt-20">' +
        '<div class="kv"><dt>Attended</dt><dd>' + stats.attended + ' classes</dd></div>' +
        '<div class="kv"><dt>Upcoming</dt><dd>' + stats.upcoming + ' booked</dd></div>' +
        '<div class="kv"><dt>Waitlisted</dt><dd>' + stats.waitlisted + '</dd></div>' +
        '<div class="kv"><dt>No-shows</dt><dd>' + stats.noShows + '</dd></div>' +
        '<div class="kv"><dt>Saved classes</dt><dd>' + saved + '</dd></div>' +
        '<div class="kv"><dt>Streak</dt><dd>' + stats.streak + ' weeks</dd></div>' +
        '</div>' +
        '<div class="info-note mt-16">' + ui.icon('info') +
        '<span>This demo stores everything in your browser. Bookings, reviews and attendance persist across reloads.</span></div>',
      footer: '<button class="btn btn-ghost" data-modal-close>Close</button>' +
        '<button class="btn btn-outline" id="profile-reset">Reset demo</button>' +
        (p.membership !== 'Elite' ? '<button class="btn btn-primary" id="profile-upgrade">Upgrade plan</button>' : ''),
      onMount: function (node) {
        var upgrade = node.querySelector('#profile-upgrade');
        if (upgrade) upgrade.addEventListener('click', function () { ui.closeModal(); openUpgrade(); });
        node.querySelector('#profile-reset').addEventListener('click', function () { ui.closeModal(); resetDemo(); });
      }
    });
  }

  function resetDemo() {
    ui.confirm({
      title: 'Reset demo data?',
      message: 'A fresh 70-day timetable, bookings, reviews and attendance records will be generated. This cannot be undone.',
      confirmLabel: 'Reset everything',
      danger: true,
      onConfirm: function () {
        store.reset();
        GY.state.filters = defaultFilters();
        GY.state.catalogLimit = 24;
        GY.state.bookingsTab = 'upcoming';
        GY.state.calendar.date = U.dateKey(new Date());
        GY.state.calendar.view = 'week';
        var input = document.getElementById('global-search');
        if (input) input.value = '';
        refresh();
        ui.toast('Demo reset', 'A new timetable with live seats and waitlists is ready.', 'success');
      }
    });
  }

  /* ================================================================ notifications */
  function notifPanel() {
    var list = store.notifications();
    return '<div class="dropdown-panel" id="notif-panel">' +
      '<div class="dropdown-head"><h4>Notifications</h4>' +
      (store.unreadCount()
        ? '<button class="tiny" style="color:var(--accent)" data-act="mark-read">Mark all read</button>'
        : '<span class="tiny muted">All caught up</span>') + '</div>' +
      '<div class="dropdown-body">' + (list.length ? list.map(function (n) {
        return '<div class="notice ' + (n.read ? '' : 'unread') + '">' +
          '<span class="notice-ico">' + ui.icon(iconFor(n.type)) + '</span>' +
          '<div><div class="notice-title">' + esc(n.title) + '</div>' +
          '<div class="notice-text">' + esc(n.body) + '</div>' +
          '<div class="notice-time">' + esc(ago(n.createdAt)) + '</div></div></div>';
      }).join('') : '<p class="tiny muted" style="padding:18px">No notifications yet.</p>') +
      '</div></div>';
  }

  function iconFor(type) {
    if (type === 'waitlist') return 'clock';
    if (type === 'review') return 'star';
    if (type === 'promo') return 'sparkle';
    if (type === 'system') return 'bell';
    return 'ticket';
  }

  function ago(value) {
    var mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
    if (!isFinite(mins) || mins < 1) return 'Just now';
    if (mins < 60) return mins + ' min ago';
    var hours = Math.round(mins / 60);
    if (hours < 24) return hours + ' h ago';
    var days = Math.round(hours / 24);
    if (days < 7) return days + ' d ago';
    return U.fmtDateShort(value);
  }

  function toggleNotifs() {
    var wrap = document.getElementById('notif-wrap');
    if (!wrap) return;
    if (wrap.querySelector('#notif-panel')) { closeNotifs(); return; }
    wrap.insertAdjacentHTML('beforeend', notifPanel());
  }

  function closeNotifs() {
    var wrap = document.getElementById('notif-wrap');
    if (!wrap) return;
    var panel = wrap.querySelector('#notif-panel');
    if (panel) panel.remove();
  }

  function closeNav() {
    var shell = document.getElementById('app-shell');
    if (shell) shell.classList.remove('nav-open');
  }

  /* ================================================================ global events */
  function onGlobalClick(e) {
    var target = e.target;
    if (!target || !target.closest) return;
    if (!target.closest('#notif-wrap')) closeNotifs();
    var el = target.closest('[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');

    switch (act) {
      case 'book':
        e.preventDefault(); book(id); break;
      case 'cancel-booking':
        e.preventDefault(); cancelBooking(id); break;
      case 'fav':
        e.preventDefault();
        if (id) {
          var on = store.toggleFavorite(id);
          ui.toast(on ? 'Saved to your list' : 'Removed from saved', on ? 'Find it under My sessions → Saved.' : 'You can save it again any time.', on ? 'success' : '');
        }
        break;
      case 'ics':
        e.preventDefault(); downloadICS(id); break;
      case 'ics-day':
        e.preventDefault(); exportDay(); break;
      case 'open-session':
        e.preventDefault(); e.stopPropagation();
        if (id) go('/session/' + id);
        break;
      case 'cal-view':
        setCal('view', el.getAttribute('data-view')); break;
      case 'cal-nav':
        navCal(el.getAttribute('data-dir')); break;
      case 'cal-day':
        pickDay(el.getAttribute('data-date')); break;
      case 'set-filter':
        setFilter(el.getAttribute('data-key'), el.getAttribute('data-value')); break;
      case 'clear-filter':
        clearFilter(el.getAttribute('data-key')); break;
      case 'clear-filters':
        clearFilters(); break;
      case 'load-more':
        GY.state.catalogLimit = (GY.state.catalogLimit || 24) + 24;
        refresh(); break;
      case 'booking-tab':
        setBookingTab(el.getAttribute('data-tab')); break;
      case 'find-discipline':
        setFilter('search', el.getAttribute('data-name'));
        if (!GY.state.route || GY.state.route.name !== 'catalog') go('/classes');
        break;
      case 'roster':
        e.preventDefault(); GY.views.trainer.openRoster(id); break;
      case 'new-session':
        e.preventDefault(); GY.views.trainer.openCreate(GY.state.trainerId || store.activeTrainerId); break;
      case 'edit-session':
        e.preventDefault(); GY.views.trainer.openEdit(id); break;
      case 'cancel-session':
        e.preventDefault(); cancelSession(id); break;
      case 'upgrade':
        e.preventDefault(); openUpgrade(); break;
      case 'profile':
        e.preventDefault(); openProfile(); break;
      case 'notif-toggle':
        e.preventDefault(); toggleNotifs(); break;
      case 'mark-read':
        e.preventDefault(); store.markAllRead(); closeNotifs(); refreshChrome(); break;
      case 'toggle-nav':
        e.preventDefault();
        var shell = document.getElementById('app-shell');
        if (shell) shell.classList.toggle('nav-open');
        break;
      case 'close-nav':
        closeNav(); break;
      case 'analytics-range':
        setAnalyticsRange(el.getAttribute('data-days')); break;
      case 'export-analytics':
        e.preventDefault(); exportAnalytics(); break;
      case 'reset-demo':
        e.preventDefault(); resetDemo(); break;
      default:
        break;
    }
  }

  function cancelSession(id) {
    var s = store.sessionById(id);
    if (!s) return;
    ui.confirm({
      title: 'Cancel this session?',
      message: s.name + ' on ' + U.fmtDateLong(s.date) + ' at ' + U.fmtTime(s.startIso) +
        ' will be removed from the timetable. All ' + s.enrolled + ' booked members are notified and their seats released.',
      confirmLabel: 'Cancel session',
      danger: true,
      onConfirm: function () {
        var res = store.cancelSession(id);
        if (!res.ok) { ui.toast('Cannot cancel', res.message, 'error'); return; }
        ui.toast('Session cancelled', res.affected + ' booking' + (res.affected === 1 ? '' : 's') + ' released.', 'warn');
      }
    });
  }

  function exportAnalytics() {
    var days = GY.state.analyticsDays || 30;
    var A = store.analytics({ days: days });
    var rows = [['Discipline', 'Sessions', 'Seats filled', 'Capacity', 'Fill %', 'Revenue', 'Rating']];
    A.categoryStats.forEach(function (c) {
      rows.push([c.full, c.sessions, c.enrolled, c.capacity, c.fill, c.revenue, c.rating]);
    });
    var csv = rows.map(function (row) {
      return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    U.download('gymverse-analytics-' + days + 'd.csv', csv, 'text/csv;charset=utf-8');
    ui.toast('Report exported', 'Category performance for the last ' + days + ' days.', 'success');
  }

  function onKeydown(e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
      e.preventDefault();
      var input = document.getElementById('global-search');
      if (input) input.focus();
    }
    if (e.key === 'Escape') {
      closeNotifs();
      closeNav();
      var modal = document.getElementById('modal-root');
      if (modal && modal.classList.contains('is-open')) ui.closeModal();
    }
  }

  function bindShell() {
    document.addEventListener('click', onGlobalClick);
    document.addEventListener('keydown', onKeydown);

    var search = document.getElementById('global-search');
    if (search) {
      var run = U.debounce(function () {
        GY.state.filters.search = search.value.trim();
        GY.state.catalogLimit = 24;
        if (GY.state.route && GY.state.route.name === 'catalog') refresh();
        else go('/classes');
      }, 300);
      search.addEventListener('input', run);
      search.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); run(); }
      });
    }

    var roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', function () { setRole(this.value); });
    }
  }

  /* ================================================================ boot */
  function boot() {
    store.init();
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = shellHTML();
    bindShell();
    refreshChrome();
    store.subscribe(function () {
      if (GY.state.suspendRender) return;
      setTimeout(refresh, 30);
    });
    GY.router.start(onRoute);
  }

  GY.app = {
    refresh: refresh,
    go: go,
    setFilter: setFilter,
    clearFilter: clearFilter,
    clearFilters: clearFilters,
    setCal: setCal,
    navCal: navCal,
    setTrainer: setTrainer,
    setRole: setRole,
    setBookingTab: setBookingTab,
    setAnalyticsRange: setAnalyticsRange,
    book: book,
    cancelBooking: cancelBooking,
    openUpgrade: openUpgrade,
    openProfile: openProfile,
    toast: ui.toast
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
