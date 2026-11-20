/* GYMVERSE — session detail + booking panel + reviews */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;

  function render(ctx) {
    var S = GY.store;
    var s = S.sessionById(ctx.params.id);
    if (!s) {
      return ui.empty({ icon: 'alert', title: 'Session not found', text: 'This class may have been removed from the timetable.', action: '<a class="btn btn-sm btn-outline mt-8" href="#/classes">Browse classes</a>' });
    }
    var cat = s.category;
    var locked = GY.data.membershipRank[S.profile.membership] < GY.data.membershipRank[s.membership];
    var reviews = S.reviewsFor(s.id);
    var canReview = S.canReview(s.id);
    var wait = S.waitlistInfo(s.id);
    var similar = S.query({ category: s.categoryId, limit: 4 }).filter(function (x) { return x.id !== s.id; }).slice(0, 3);

    var h = '<div class="row" style="gap:6px;margin-bottom:14px;flex-wrap:wrap">' +
      '<a class="tiny muted" href="#/classes">Classes</a><span class="tiny" style="color:var(--ink-4)">/</span>' +
      '<a class="tiny" style="color:' + cat.accent + '" href="#/category/' + esc(cat.id) + '">' + esc(cat.name) + '</a>' +
      '<span class="tiny" style="color:var(--ink-4)">/</span><span class="tiny muted">' + esc(s.name) + '</span></div>';

    h += '<div class="detail-grid" data-cat="' + esc(s.categoryId) + '"><div class="detail-body">';

    /* cover */
    h += '<div class="detail-cover">' +
      '<img src="' + esc(s.image) + '" alt="' + esc(s.name) + '">' +
      '<div class="detail-cover-inner">' +
      '<div class="detail-tags">' +
      '<span class="badge" style="background:var(--cat);color:var(--cat-ink)">' + esc(cat.name) + '</span>' +
      ui.difficultyBadge(s.difficulty) +
      (s.membership !== 'Standard' ? '<span class="badge badge-elite">' + esc(s.membership) + '</span>' : '') +
      (s.isFeatured ? '<span class="badge badge-warn">Featured</span>' : '') +
      (s.status === 'cancelled' ? '<span class="badge badge-danger">Cancelled</span>' : '') +
      '</div>' +
      '<h1>' + esc(s.name) + '</h1>' +
      '<div class="row" style="gap:14px;flex-wrap:wrap">' +
      '<span class="rating" style="color:#fff">' + ui.icon('star') + (s.rating.avg ? s.rating.avg.toFixed(1) : 'New') +
      (s.rating.count ? '<small style="color:rgba(255,255,255,.6)">(' + s.rating.count + ' reviews)</small>' : '') + '</span>' +
      '<span class="tiny" style="color:rgba(255,255,255,.65)">' + esc(U.fmtDateLong(s.date)) + ' · ' + esc(U.fmtRange(s.startIso, s.endIso)) + '</span>' +
      '</div></div></div>';

    /* meta */
    h += '<div class="meta-grid mt-16">' +
      metaCell('calendar', 'Date', U.fmtDateLong(s.date)) +
      metaCell('clock', 'Time', U.fmtRange(s.startIso, s.endIso)) +
      metaCell('target', 'Duration', U.fmtDuration(s.duration) + ' · ' + s.intensityLabel) +
      metaCell('user', 'Trainer', s.trainer.name) +
      metaCell('pin', 'Studio', s.branch.name + ' · ' + s.room.name) +
      metaCell('users', 'Capacity', s.enrolled + ' / ' + s.capacity + ' booked') +
      '</div>';

    /* about */
    h += '<section class="section"><h2>About this session</h2>' +
      '<p class="mt-8">' + esc(s.description) + '</p>' +
      '<div class="row-wrap mt-16">' +
      '<span class="pill">' + ui.icon('flame') + esc(s.intensityLabel) + ' intensity</span>' +
      '<span class="pill">' + ui.icon('target') + esc(s.difficulty) + '</span>' +
      '<span class="pill">' + ui.icon('users') + 'Max ' + s.capacity + '</span>' +
      '<span class="pill">' + ui.icon('card') + esc(s.membership) + ' +</span>' +
      (s.isVirtual ? '<span class="pill">' + ui.icon('eye') + 'Live online</span>' : '') +
      '</div></section>';

    /* equipment */
    h += '<section class="section"><div class="row-between"><h2>What you need</h2>' +
      '<span class="tiny muted">Bring your own or borrow at the studio desk</span></div>' +
      '<div class="equipment-list mt-12">' + s.equipment.map(function (e) {
        return '<span class="equip-tag">' + ui.icon('check') + esc(e) + '</span>';
      }).join('') + '</div>' +
      (s.categoryId === 'aquatic' ? '<div class="info-note mt-12">' + ui.icon('water') + '<span>Pool is heated to 28°C. Towels and lockers are included with every aquatic session.</span></div>' : '') +
      '</section>';

    /* trainer */
    h += '<section class="section"><h2>Your trainer</h2>' +
      '<div class="trainer-block mt-12">' + ui.avatar(s.trainer.name, s.trainer.accent, 'av-lg') +
      '<div class="grow"><div class="row-between"><div><h4>' + esc(s.trainer.name) + '</h4>' +
      '<p class="role">' + esc(s.trainer.title) + '</p></div>' +
      '<span class="rating">' + ui.icon('star') + S.trainerRating(s.trainer.id).avg.toFixed(1) + '</span></div>' +
      '<p class="bio">' + esc(s.trainer.bio) + '</p>' +
      '<div class="row-wrap mt-8">' + s.trainer.disciplines.slice(0, 4).map(function (d) {
        return '<span class="badge badge-ghost">' + esc(d) + '</span>';
      }).join('') + '</div></div></div></section>';

    /* reviews */
    h += '<section class="section"><div class="row-between"><h2>Member reviews</h2>' +
      '<span class="tiny muted">' + reviews.length + ' written · ' + s.rating.count + ' total</span></div>' +
      '<div class="rating-summary mt-12">' +
      '<div><div class="rating-score">' + (s.rating.avg ? s.rating.avg.toFixed(1) : '—') + '</div>' + ui.stars(s.rating.avg) +
      '<p class="tiny muted mt-4">' + s.rating.count + ' ratings</p></div>' +
      '<div class="rating-bars">' + [5, 4, 3, 2, 1].map(function (star) {
        var n = reviews.filter(function (r) { return r.rating === star; }).length;
        var p = reviews.length ? Math.round((n / reviews.length) * 100) : 0;
        return '<div class="rating-bar-row"><span style="width:8px">' + star + '</span><div class="bar-track"><div class="bar-fill" style="width:' + p + '%"></div></div><span>' + n + '</span></div>';
      }).join('') + '</div></div>' +
      (canReview ? reviewForm(s) : '') +
      '<div class="mt-8">' + (reviews.length ? reviews.map(function (r) {
        return '<div class="review"><span class="av">' + esc(U.initials(r.memberName)) + '</span>' +
          '<div class="grow"><div class="review-head"><span class="review-name">' + esc(r.memberName) + '</span>' +
          ui.stars(r.rating) + '<span class="review-date">' + esc(U.fmtDateNumeric(r.createdAt)) + '</span></div>' +
          '<p class="review-text">' + esc(r.comment) + '</p></div></div>';
      }).join('') : '<p class="tiny muted mt-12">No written reviews for this session yet — ratings are collected from every attendee.</p>') + '</div>' +
      '</section>';

    /* similar */
    if (similar.length) {
      h += '<section class="section"><div class="section-head"><div><h2>More ' + esc(cat.short.toLowerCase()) + ' sessions</h2></div>' +
        '<a class="section-link" href="#/classes?category=' + esc(cat.id) + '">View all ' + ui.icon('arrowRight') + '</a></div>' +
        '<div class="card-grid-3">' + similar.map(ui.classCard).join('') + '</div></section>';
    }

    h += '</div>';

    /* booking panel */
    h += '<aside class="booking-panel">' + bookingPanel(s, locked, wait) + '</aside></div>';
    return h;
  }

  function metaCell(icon, k, v) {
    return '<div class="meta-cell">' + ui.icon(icon) + '<div><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + '</div></div></div>';
  }

  function bookingPanel(s, locked, wait) {
    var S = GY.store;
    var dots = '';
    var shown = Math.min(s.capacity, 28);
    var taken = Math.round((s.enrolled / s.capacity) * shown);
    for (var i = 0; i < shown; i++) dots += '<span class="seat-dot ' + (i < taken ? 'taken' : '') + '"></span>';

    var action = '';
    var note = '';
    if (s.status === 'cancelled') {
      action = '<button class="btn btn-outline btn-block btn-lg" disabled>Session cancelled</button>';
      note = s.raw.cancelReason || 'This session was cancelled by the studio.';
    } else if (s.myStatus === 'booked') {
      action = (s.deadline.cancelOpen
        ? '<button class="btn btn-danger btn-block btn-lg" data-act="cancel-booking" data-id="' + esc(s.myBooking.id) + '">Cancel booking</button>'
        : '<button class="btn btn-outline btn-block btn-lg" disabled>Seat confirmed</button>');
      note = s.deadline.cancelOpen
        ? 'Free cancellation until ' + U.fmtTime(s.deadline.cancelBy) + ' on ' + U.fmtDateShort(s.date) + '.'
        : 'Cancellation window closed · late cancellations count as no-shows.';
    } else if (s.myStatus === 'waitlisted') {
      action = '<button class="btn btn-outline btn-block btn-lg" data-act="cancel-booking" data-id="' + esc(s.myBooking.id) + '">Leave waitlist</button>';
      note = 'You are #' + (wait.position || 1) + ' on the waitlist · ' + wait.count + ' waiting.';
    } else if (s.started) {
      action = '<button class="btn btn-outline btn-block btn-lg" disabled>Class already started</button>';
      note = 'Booking for this session is closed.';
    } else if (!s.deadline.bookOpen) {
      action = '<button class="btn btn-outline btn-block btn-lg" disabled>Booking closed</button>';
      note = 'Booking closed at ' + U.fmtTime(s.deadline.bookBy) + '.';
    } else if (locked) {
      action = '<button class="btn btn-primary btn-block btn-lg" data-act="upgrade">' + ui.icon('lock') + ' Requires ' + esc(s.membership) + '</button>';
      note = 'Upgrade to ' + s.membership + ' to book this class. Instant, no contract.';
    } else if (s.seats === 0) {
      action = '<button class="btn btn-cat btn-block btn-lg" data-act="book" data-id="' + esc(s.id) + '">Join the waitlist</button>';
      note = wait.count + ' people waiting · auto-promotion when a seat opens.';
    } else {
      action = '<button class="btn btn-cat btn-block btn-lg" data-act="book" data-id="' + esc(s.id) + '">Book this class</button>';
      note = 'Booking closes ' + U.fmtTime(s.deadline.bookBy) + ' · free cancellation until ' + U.fmtTime(s.deadline.cancelBy) + '.';
    }

    return '<div class="bp-card">' +
      '<div class="bp-top"><div><div class="bp-price">' + U.money(s.price) + '<small>/ class</small></div>' +
      '<p class="tiny muted mt-4">Included in ' + esc(s.membership) + ' membership</p></div>' +
      '<span class="badge badge-cat">' + esc(s.category.short) + '</span></div>' +
      '<div class="bp-rows">' +
      '<div class="bp-row"><span class="k">' + ui.icon('calendar') + 'Date</span><span class="v">' + esc(U.relDay(s.date)) + ' · ' + esc(U.fmtDateShort(s.date)) + '</span></div>' +
      '<div class="bp-row"><span class="k">' + ui.icon('clock') + 'Time</span><span class="v">' + esc(U.fmtRange(s.startIso, s.endIso)) + '</span></div>' +
      '<div class="bp-row"><span class="k">' + ui.icon('target') + 'Duration</span><span class="v">' + esc(U.fmtDuration(s.duration)) + '</span></div>' +
      '<div class="bp-row"><span class="k">' + ui.icon('user') + 'Trainer</span><span class="v">' + esc(s.trainer.name) + '</span></div>' +
      '<div class="bp-row"><span class="k">' + ui.icon('pin') + 'Studio</span><span class="v">' + esc(s.room.name) + '</span></div>' +
      '<div class="bp-row"><span class="k">' + ui.icon('map') + 'Branch</span><span class="v">' + esc(s.branch.name) + '</span></div>' +
      '</div>' +
      '<div class="bp-seats"><div><div class="seat-dots">' + dots + '</div>' +
      '<p class="tiny muted mt-6">' + (s.seats === 0 ? 'Sold out · ' + wait.count + ' on the waitlist' : s.seats + ' of ' + s.capacity + ' seats available') + '</p></div>' +
      ui.seats(s) + '</div>' +
      '<div class="bp-action">' + action +
      '<p class="bp-note">' + esc(note) + '</p>' +
      '<div class="row" style="gap:8px">' +
      '<button class="btn btn-outline btn-sm grow" data-act="fav" data-id="' + esc(s.id) + '">' + ui.icon('heart') + (s.fav ? 'Saved' : 'Save') + '</button>' +
      '<button class="btn btn-outline btn-sm grow" data-act="ics" data-id="' + esc(s.id) + '">' + ui.icon('download') + 'Calendar</button>' +
      '</div></div></div>' +
      '<div class="panel panel-pad"><h4 style="font-size:12px">Session details</h4>' +
      '<div class="info-grid mt-12" style="gap:12px 14px">' +
      '<div class="kv"><dt>Difficulty</dt><dd>' + esc(s.difficulty) + '</dd></div>' +
      '<div class="kv"><dt>Intensity</dt><dd>' + esc(s.intensityLabel) + '</dd></div>' +
      '<div class="kv"><dt>Booking deadline</dt><dd>' + esc(U.fmtTime(s.deadline.bookBy)) + '</dd></div>' +
      '<div class="kv"><dt>Cancellation deadline</dt><dd>' + esc(U.fmtTime(s.deadline.cancelBy)) + '</dd></div>' +
      '<div class="kv"><dt>Series</dt><dd>' + esc(s.raw.recurrence ? 'Recurring weekly' : 'Weekly class') + '</dd></div>' +
      '<div class="kv"><dt>Session ID</dt><dd class="mono">' + esc(s.id) + '</dd></div>' +
      '</div></div>' +
      '<div class="info-note">' + ui.icon('info') + '<span>Arrive 10 minutes early for check-in. Trainers release unclaimed seats at the start time.</span></div>';
  }

  function reviewForm(s) {
    return '<div class="review-form mt-12" data-review-form="' + esc(s.id) + '">' +
      '<div class="row-between"><h4 style="font-size:13px">Rate this class</h4><span class="tiny muted">Your review is public</span></div>' +
      '<div class="row" style="gap:10px"><div class="stars" id="star-picker">' +
      [1, 2, 3, 4, 5].map(function (i) {
        return '<button type="button" data-star="' + i + '" aria-label="' + i + ' stars">' + starSvg() + '</button>';
      }).join('') + '</div><span class="tiny muted" id="star-label">Select a rating</span></div>' +
      '<textarea class="textarea" id="review-comment" placeholder="What worked? What could be better?"></textarea>' +
      '<div class="row-between"><span class="tiny muted">Reviews help trainers improve every week.</span>' +
      '<button class="btn btn-primary btn-sm" id="review-submit">Publish review</button></div>' +
      '</div>';
  }
  function starSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.8l5.9-.8z"/></svg>';
  }

  function mount(root, ctx) {
    var form = root.querySelector('[data-review-form]');
    if (!form) return;
    var rating = 0;
    var picker = form.querySelector('#star-picker');
    var label = form.querySelector('#star-label');
    var labels = ['', 'Poor', 'Below average', 'Good', 'Great', 'Outstanding'];
    picker.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        rating = Number(btn.getAttribute('data-star'));
        picker.querySelectorAll('button').forEach(function (b) {
          b.classList.toggle('is-on', Number(b.getAttribute('data-star')) <= rating);
        });
        label.textContent = labels[rating] || '';
      });
    });
    form.querySelector('#review-submit').addEventListener('click', function () {
      if (!rating) { ui.toast('Pick a rating', 'Select between one and five stars before publishing.', 'warn'); return; }
      var comment = form.querySelector('#review-comment').value.trim();
      var res = GY.store.addReview({ sessionId: ctx.params.id, rating: rating, comment: comment });
      if (res.ok) ui.toast('Review published', 'Thanks — your feedback is now on this session.', 'success');
      else ui.toast('Could not publish', res.message, 'error');
    });
  }

  GY.views = GY.views || {};
  GY.views.session = { render: render, mount: mount, title: 'Session' };
})();
