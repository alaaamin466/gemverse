/* GYMVERSE — member portal: bookings, waitlist, history, saved classes */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;

  function render() {
    var S = GY.store;
    var tab = GY.state.bookingsTab || 'upcoming';
    var all = S.myBookings();
    var stats = S.myStats();

    var upcoming = all.filter(function (b) {
      return (b.status === 'booked' || b.status === 'waitlisted') && !b.session.ended && b.session.status === 'scheduled';
    });
    var history = all.filter(function (b) {
      return b.status === 'attended' || b.status === 'no-show' || b.status === 'cancelled' || b.session.ended;
    }).sort(function (a, b) { return b.session.startIso.localeCompare(a.session.startIso); });
    var saved = S.db.favorites.map(function (id) { return S.sessionById(id); }).filter(Boolean);

    var h = '<div class="row-between" style="flex-wrap:wrap;gap:12px;margin-bottom:18px">' +
      '<div><span class="eyebrow"><span class="dot"></span>Member portal</span>' +
      '<h1 style="font-size:clamp(25px,3vw,36px);margin-top:5px">My sessions</h1>' +
      '<p class="tiny muted mt-4">' + S.profile.name + ' · ' + esc(S.profile.membership) + ' member since ' + esc(U.MONTHS_SHORT[U.toDate(S.profile.memberSince).getMonth()] + ' ' + U.toDate(S.profile.memberSince).getFullYear()) + '</p></div>' +
      '<a class="btn btn-primary btn-sm" href="#/classes">' + ui.icon('plus') + 'Book another class</a></div>';

    h += '<div class="stat-grid stagger">' +
      stat('Attended', stats.attended, stats.minutes ? U.fmtDuration(stats.minutes) + ' trained' : 'Your first class is waiting') +
      stat('Upcoming', stats.upcoming, stats.waitlisted ? stats.waitlisted + ' on waitlist' : 'All confirmations active') +
      stat('No-shows', stats.noShows, 'Late cancels count as no-shows') +
      stat('Streak', stats.streak + ' weeks', 'Consistency score') +
      '</div>';

    h += '<div class="row-between mt-24" style="flex-wrap:wrap;gap:12px">' +
      '<div class="tabs">' +
      [['upcoming', 'Upcoming', upcoming.length], ['history', 'History', history.length], ['saved', 'Saved', saved.length]].map(function (t) {
        return '<button class="tab ' + (tab === t[0] ? 'is-on' : '') + '" data-act="booking-tab" data-tab="' + t[0] + '">' + t[1] + '<span class="n">' + t[2] + '</span></button>';
      }).join('') + '</div>' +
      '<span class="tiny muted">Cancellation windows are shown in local time.</span></div>';

    h += '<div class="mt-16">';
    if (tab === 'upcoming') {
      h += upcoming.length ? '<div class="bk-list">' + upcoming.map(function (b) { return bookingRow(b, 'upcoming'); }).join('') + '</div>'
        : ui.empty({ icon: 'ticket', title: 'No upcoming sessions', text: 'Reserve a class and your confirmation, studio and check-in details appear here.', action: '<a class="btn btn-sm btn-primary mt-8" href="#/classes">Find a class</a>' });
    } else if (tab === 'history') {
      h += history.length ? '<div class="bk-list">' + history.map(function (b) { return bookingRow(b, 'history'); }).join('') + '</div>'
        : ui.empty({ icon: 'clock', title: 'No history yet', text: 'Attended, cancelled and no-show sessions are archived here for your records.' });
    } else {
      h += saved.length ? '<div class="card-grid stagger">' + saved.map(ui.classCard).join('') + '</div>'
        : ui.empty({ icon: 'heart', title: 'Nothing saved yet', text: 'Tap the heart on any class card to keep it here for later.', action: '<a class="btn btn-sm btn-outline mt-8" href="#/classes">Browse classes</a>' });
    }
    h += '</div>';

    return h;
  }

  function stat(label, value, foot) {
    return '<div class="stat"><span class="stat-label">' + esc(label) + '</span>' +
      '<span class="stat-value">' + esc(String(value)) + '</span>' +
      '<span class="stat-foot">' + esc(foot) + '</span></div>';
  }

  function bookingRow(entry, mode) {
    var b = entry.booking, s = entry.session;
    var S = GY.store;
    var status = entry.status;
    var badge = '';
    if (status === 'booked') badge = '<span class="badge badge-live"><span class="dot"></span>Confirmed</span>';
    else if (status === 'waitlisted') badge = '<span class="badge badge-warn">Waitlist #' + (S.waitlistInfo(s.id).position || 1) + '</span>';
    else if (status === 'attended') badge = '<span class="badge badge-beginner">Attended</span>';
    else if (status === 'no-show') badge = '<span class="badge badge-danger">No-show</span>';
    else if (status === 'cancelled') badge = '<span class="badge badge-ghost">Cancelled</span>';

    var actions = '';
    if (mode === 'upcoming') {
      actions += '<button class="btn btn-sm btn-outline" data-act="ics" data-id="' + esc(s.id) + '">' + ui.icon('download') + 'Calendar</button>';
      actions += '<button class="btn btn-sm btn-danger" data-act="cancel-booking" data-id="' + esc(b.id) + '">' + (status === 'waitlisted' ? 'Leave waitlist' : 'Cancel') + '</button>';
    } else {
      if (S.canReview(s.id) && !S.reviewsFor(s.id).some(function (r) { return r.memberId === S.profile.id; })) {
        actions += '<a class="btn btn-sm btn-primary" href="#/session/' + esc(s.id) + '#review">Rate class</a>';
      }
      actions += '<a class="btn btn-sm btn-outline" href="#/session/' + esc(s.id) + '">Details</a>';
      actions += '<a class="btn btn-sm btn-ghost" href="#/classes?category=' + esc(s.categoryId) + '">Rebook</a>';
    }

    return '<article class="bk-row" data-cat="' + esc(s.categoryId) + '">' +
      '<div class="bk-thumb"><img src="' + esc(s.image) + '" alt="' + esc(s.name) + '" loading="lazy"></div>' +
      '<div class="bk-info"><div class="t">' + esc(s.name) + ' ' + badge + '</div>' +
      '<div class="m">' + ui.icon('calendar') + esc(U.relDay(s.date)) + ' · ' + esc(U.fmtTime(s.startIso)) +
      '<span class="dot-sep">·</span>' + esc(s.trainer.name) +
      '<span class="dot-sep">·</span>' + esc(s.branch.name) + ' · ' + esc(s.room.name) + '</div>' +
      '<div class="m">' + ui.icon('ticket') + 'Seat ' + (entry.seat || '—') + '<span class="dot-sep">·</span>' + esc(U.fmtDuration(s.duration)) +
      '<span class="dot-sep">·</span>' + esc(s.category.short) + '</div></div>' +
      '<div class="bk-side"><div class="bk-actions">' + actions + '</div>' +
      '<span class="tiny" style="color:var(--ink-4)">' + (mode === 'upcoming' && status === 'booked'
        ? 'Cancel by ' + esc(U.fmtTime(s.deadline.cancelBy))
        : esc(U.fmtDateNumeric(s.date))) + '</span></div>' +
      '</article>';
  }

  GY.views = GY.views || {};
  GY.views.bookings = { render: render, title: 'My sessions' };
})();
