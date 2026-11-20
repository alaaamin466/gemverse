/* GYMVERSE — home view */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;

  function render() {
    var S = GY.store;
    var now = new Date();
    var weekFrom = U.dateKey(now);
    var weekTo = U.dateKey(U.addDays(now, 6));
    var weekSessions = S.query({ from: weekFrom, to: weekTo, includePast: true });
    var upcoming = S.query({});
    var today = S.todaySessions().filter(function (s) { return !s.ended && s.status === 'scheduled'; }).slice(0, 6);
    var popular = S.query({ sort: 'popular', limit: 4 });
    var bookings = S.myBookings();
    var next = bookings.filter(function (b) { return b.status === 'booked' && !b.session.ended; })[0];
    var stats = S.myStats();
    var trainers = S.trainers();
    var avgRating = (U.avg(trainers, function (t) { return t.baseRating; })).toFixed(2);
    var formats = GY.data.disciplines.length;
    var todayAll = S.todaySessions().filter(function (s) { return !s.ended && s.status === 'scheduled'; });
    var firstPersonal = S.query({ category: 'personal', limit: 1 })[0];

    var html = '';

    /* hero */
    html += '<section class="hero anim-in">' +
      '<div class="hero-bg"><img src="assets/img/hero.jpg" alt="GYMVERSE training floor"></div>' +
      '<div class="hero-flag"><span class="dot"></span>' + todayAll.length + ' classes today · 3 studios open</div>' +
      '<div class="hero-inner">' +
      '<span class="eyebrow"><span class="dot"></span>Expanded fitness sessions &amp; classes</span>' +
      '<h1>Every discipline.<br>One <em>membership</em>.</h1>' +
      '<p class="lede">Nine training worlds — yoga to combat, reformer to rooftop bootcamp — with live availability, waitlists and coaching that actually knows your name.</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary btn-lg" href="#/classes">' + ui.icon('grid') + 'Browse ' + formats + ' class formats</a>' +
      '<a class="btn btn-outline btn-lg" href="#/calendar">' + ui.icon('calendar') + 'Open the timetable</a>' +
      '</div>' +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><b>' + upcoming.length + '</b><span>Bookable sessions</span></div>' +
      '<div class="hero-stat"><b>' + weekSessions.length + '</b><span>This week</span></div>' +
      '<div class="hero-stat"><b>' + trainers.length + '</b><span>Coaches</span></div>' +
      '<div class="hero-stat"><b>' + avgRating + '</b><span>Avg. rating</span></div>' +
      '</div></div></section>';

    /* quick stats */
    html += '<div class="stat-grid mt-16 stagger">' +
      statCard('Your next class', next ? U.relDay(next.session.date) : '—', next ? U.fmtTime(next.session.startIso) + ' · ' + next.session.name : 'Browse the timetable to reserve a spot', 'sparkle') +
      statCard('Classes attended', stats.attended, stats.minutes ? U.fmtDuration(stats.minutes) + ' of training' : 'Start your history', 'check') +
      statCard('Current streak', stats.streak + ' weeks', 'Keep the rhythm going', 'flame') +
      statCard('Waitlisted', stats.waitlisted, stats.waitlisted ? 'Auto-promotion is on' : 'No waitlists right now', 'clock') +
      '</div>';

    /* categories */
    html += '<section class="section">' +
      '<div class="section-head"><div><span class="eyebrow"><span class="dot"></span>Nine training worlds</span>' +
      '<h2>Choose your discipline</h2>' +
      '<p class="lede">Each category has its own coaching team, studio and session design. Filter by everything — intensity, price, seats or branch.</p></div>' +
      '<a class="section-link" href="#/classes">All classes ' + ui.icon('arrowRight') + '</a></div>' +
      '<div class="cat-grid stagger">' + GY.data.categories.map(function (c) { return ui.catTile(c); }).join('') + '</div>' +
      '</section>';

    /* today + side */
    html += '<section class="section"><div class="dash-grid">' +
      '<div class="panel"><div class="panel-head"><div><h3>Today at GYMVERSE</h3>' +
      '<p class="tiny">' + U.fmtDateLong(now) + ' · ' + todayAll.length + ' sessions across 3 branches</p></div>' +
      '<a class="section-link" href="#/calendar">Full day ' + ui.icon('arrowRight') + '</a></div>' +
      '<div class="panel-body" style="padding-top:8px">' +
      (today.length ? '<div class="timeline">' + today.map(function (s) {
        return '<a class="tl-item" data-cat="' + esc(s.categoryId) + '" href="#/session/' + esc(s.id) + '" style="padding:11px 0">' +
          '<span class="tl-time">' + esc(U.fmtTime(s.startIso)) + '</span>' +
          '<span class="grow"><span class="row" style="gap:7px;flex-wrap:wrap"><b style="font-size:13px">' + esc(s.name) + '</b>' +
          '<span class="badge badge-cat">' + esc(s.category.short) + '</span>' +
          (s.isFeatured ? '<span class="badge badge-warn">Featured</span>' : '') + '</span>' +
          '<span class="tiny muted" style="display:block;margin-top:2px">' + esc(s.trainer.name) + ' · ' + esc(s.room.name) + ' · ' + esc(U.fmtDuration(s.duration)) + '</span></span>' +
          '<span class="row" style="gap:8px">' + ui.seats(s, true) + ui.icon('chevronRight') + '</span></a>';
      }).join('') + '</div>' : ui.empty({ icon: 'calendar', title: 'No more classes today', text: 'Tomorrow is already loaded — take a look at the week view.', action: '<a class="btn btn-sm btn-outline mt-8" href="#/calendar">Open calendar</a>' })) +
      '</div></div>' +
      '<div class="dash-col">' +
      (next ? '<a class="next-class" data-cat="' + esc(next.session.categoryId) + '" href="#/session/' + esc(next.session.id) + '">' +
        '<img src="' + esc(next.session.image) + '" alt="">' +
        '<span class="badge badge-live" style="align-self:flex-start"><span class="dot"></span>Your next session</span>' +
        '<h3 class="mt-8">' + esc(next.session.name) + '</h3>' +
        '<p class="nc-meta">' + esc(U.relDay(next.session.date)) + ' · ' + esc(U.fmtTime(next.session.startIso)) + ' – ' + esc(U.fmtTime(next.session.endIso)) + '</p>' +
        '<p class="nc-meta">' + esc(next.session.trainer.name) + ' · ' + esc(next.session.branch.name) + '</p>' +
        '<div class="row mt-12" style="gap:8px">' + ui.icon('check') + '<span class="tiny">Seat confirmed · ' + esc(next.session.room.name) + '</span></div>' +
        '</a>'
        : '<div class="panel panel-pad"><h3>No upcoming bookings</h3><p class="tiny muted mt-6">Reserve a class and it will appear here with your seat, studio and check-in details.</p><a class="btn btn-primary btn-sm mt-12" href="#/classes">Find a class</a></div>') +
      '<div class="panel panel-pad"><div class="row-between"><h3>Your week</h3><span class="badge badge-ghost">Plus member</span></div>' +
      '<div class="row mt-16" style="gap:18px">' +
      '<div class="kv"><dt>Reserved</dt><dd>' + stats.upcoming + ' classes</dd></div>' +
      '<div class="kv"><dt>Attended</dt><dd>' + stats.attended + '</dd></div>' +
      '<div class="kv"><dt>No-shows</dt><dd>' + stats.noShows + '</dd></div>' +
      '</div>' +
      '<div class="bar-track mt-16"><div class="bar-fill" style="width:' + U.clamp(stats.attended * 12, 6, 100) + '%"></div></div>' +
      '<p class="tiny muted mt-8">Goal: ' + esc(S.profile.goal) + '</p>' +
      '<a class="btn btn-outline btn-sm btn-block mt-12" href="#/bookings">Manage bookings</a></div>' +
      '</div></div></section>';

    /* popular */
    html += '<section class="section">' +
      '<div class="section-head"><div><span class="eyebrow"><span class="dot"></span>Most booked</span>' +
      '<h2>Popular this week</h2><p class="lede">Ranked by fill rate, ratings and repeat bookings across all branches.</p></div>' +
      '<a class="section-link" href="#/classes?sort=popular">See ranking ' + ui.icon('arrowRight') + '</a></div>' +
      '<div class="card-grid-4 stagger">' + popular.map(ui.classCard).join('') + '</div></section>';

    /* trainers */
    html += '<section class="section">' +
      '<div class="section-head"><div><span class="eyebrow"><span class="dot"></span>The coaching team</span>' +
      '<h2>Trainers who specialise</h2><p class="lede">Eighteen specialists across nine disciplines — every format is led by a certified coach in that field.</p></div>' +
      '<a class="section-link" href="#/classes">Filter by trainer ' + ui.icon('arrowRight') + '</a></div>' +
      '<div class="trainer-strip">' + trainers.slice(0, 10).map(function (t) {
        var cat = GY.data.categoryById(t.category);
        return '<a class="trainer-card-mini" data-cat="' + esc(t.category) + '" href="#/classes?trainer=' + esc(t.id) + '">' +
          ui.avatar(t.name, t.accent) +
          '<span class="grow"><span class="tc-name">' + esc(t.name) + '</span>' +
          '<span class="tc-role">' + esc(cat ? cat.short : 'Coach') + ' · ' + t.baseRating.toFixed(1) + ' ★</span></span>' +
          '</a>';
      }).join('') + '</div></section>';

    /* personal training band */
    html += '<section class="section"><div class="panel promo-band" data-cat="personal">' +
      '<div class="promo-copy"><span class="eyebrow" style="color:var(--cat)"><span class="dot" style="background:var(--cat)"></span>Personal training &amp; coaching</span>' +
      '<h2 class="mt-8">A plan that adapts every single week.</h2>' +
      '<p class="lede mt-8" style="max-width:440px">Body composition scans, movement screening, partner sessions and remote coaching — all inside your membership portal.</p>' +
      '<div class="row-wrap mt-16"><a class="btn btn-primary" href="#/category/personal">Explore coaching</a>' +
      '<a class="btn btn-outline" href="' + (firstPersonal ? '#/session/' + esc(firstPersonal.id) : '#/category/personal') + '">Book an assessment</a></div></div>' +
      '<div class="promo-media"><img src="assets/img/personal.jpg" alt="Personal training"></div>' +
      '</div></section>';

    return html;
  }

  function statCard(label, value, foot, iconName) {
    return '<div class="stat"><span class="stat-label">' + esc(label) + '</span>' +
      '<span class="stat-value">' + esc(String(value)) + '</span>' +
      '<span class="stat-foot">' + esc(foot) + '</span></div>';
  }

  GY.views = GY.views || {};
  GY.views.home = { render: render, title: 'Overview' };
})();
