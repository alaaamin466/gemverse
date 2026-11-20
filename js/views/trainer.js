/* GYMVERSE — trainer dashboard: schedule, roster, attendance, session authoring */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;

  function render() {
    var S = GY.store;
    var trainerId = GY.state.trainerId || S.activeTrainerId;
    var trainer = S.trainerById(trainerId) || S.trainers()[0];
    var stats = S.trainerStats(trainer.id);
    var today = S.trainerSessions(trainer.id, { from: U.dateKey(new Date()), to: U.dateKey(new Date()), sort: 'soonest' })
      .filter(function (s) { return s.status !== 'cancelled'; });
    var week = S.trainerWeek(trainer.id);
    var upcoming = S.trainerSessions(trainer.id, { from: U.dateKey(new Date()) })
      .filter(function (s) { return s.status !== 'cancelled'; }).slice(0, 14);
    var past = S.trainerSessions(trainer.id, { from: U.dateKey(U.addDays(new Date(), -28)), to: U.dateKey(U.addDays(new Date(), -1)) })
      .filter(function (s) { return s.status === 'scheduled'; }).reverse().slice(0, 8);
    var cat = GY.data.categoryById(trainer.category);
    var reviews = S.db.reviews.filter(function (r) {
      var rs = S.sessionById(r.sessionId);
      return rs && rs.trainerId === trainer.id;
    }).slice(0, 4);

    var h = '<div class="row-between" style="flex-wrap:wrap;gap:14px;margin-bottom:18px">' +
      '<div class="row" style="gap:14px">' + ui.avatar(trainer.name, trainer.accent, 'av-xl') +
      '<div><span class="eyebrow"><span class="dot"></span>Trainer dashboard</span>' +
      '<h1 style="font-size:clamp(24px,2.8vw,34px);margin-top:4px">' + esc(trainer.name) + '</h1>' +
      '<p class="tiny muted mt-4">' + esc(trainer.title) + ' · ' + esc(cat ? cat.name : '') + '</p></div></div>' +
      '<div class="row" style="gap:8px;flex-wrap:wrap">' +
      '<select class="select" style="width:auto;height:38px;font-size:12px" onchange="GY.app.setTrainer(this.value)">' +
      S.trainers().map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === trainer.id ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-primary btn-sm" data-act="new-session">' + ui.icon('plus') + 'New session</button></div></div>';

    if (S.role !== 'trainer') {
      h += '<div class="info-note mb-16">' + ui.icon('info') +
        '<span>You are viewing the trainer workspace as <b>' + esc(S.role) + '</b>. Actions here change the live timetable and member bookings.</span></div>';
    }

    h += '<div class="stat-grid stagger">' +
      stat('Sessions this week', stats.weekSessions, stats.upcoming + ' upcoming total') +
      stat('Fill rate', stats.fillRate + '%', stats.totalStudents + ' seats filled') +
      stat('Rating', stats.rating ? stats.rating.toFixed(1) : '—', stats.reviewCount + ' reviews') +
      stat('Attendance', stats.attendanceRate + '%', stats.noShowRate + '% no-shows') +
      '</div>';

    h += '<div class="dash-grid mt-24"><div class="dash-col">';

    /* today */
    h += '<div class="panel"><div class="panel-head"><div><h3>Today · ' + U.fmtDateLong(new Date()) + '</h3>' +
      '<p class="tiny">' + today.length + ' session' + (today.length === 1 ? '' : 's') + ' scheduled at your studios</p></div>' +
      '<span class="badge badge-ghost">' + esc(trainer.branches.map(function (b) { return (S.branchById(b) || {}).name || b; }).join(' · ')) + '</span></div>' +
      '<div class="panel-flush">' + (today.length ? today.map(function (s) { return sessionRow(s); }).join('')
        : '<div style="padding:26px">' + ui.empty({ icon: 'calendar', title: 'No sessions today', text: 'Your next scheduled class is ' + (upcoming[0] ? U.relDay(upcoming[0].date) + ' at ' + U.fmtTime(upcoming[0].startIso) : 'not yet published') + '.' }) + '</div>') +
      '</div></div>';

    /* upcoming management */
    h += '<div class="panel"><div class="panel-head"><div><h3>Session management</h3>' +
      '<p class="tiny">Edit, cancel or open the attendance roster for any upcoming class</p></div>' +
      '<span class="badge badge-ghost">' + upcoming.length + ' upcoming</span></div>' +
      '<div class="panel-flush" style="max-height:420px;overflow:auto">' +
      (upcoming.length ? upcoming.map(function (s) { return sessionRow(s, true); }).join('')
        : '<div style="padding:20px"><p class="tiny muted">No upcoming sessions. Publish one to open bookings.</p></div>') +
      '</div></div>';

    /* attendance tracking */
    h += '<div class="panel"><div class="panel-head"><div><h3>Attendance &amp; no-show tracking</h3>' +
      '<p class="tiny">Last 28 days · mark attendance from the roster</p></div>' +
      '<span class="badge ' + (stats.noShowRate > 8 ? 'badge-warn' : 'badge-beginner') + '">' + stats.noShowRate + '% no-show</span></div>' +
      '<div class="panel-flush"><table class="table"><thead><tr><th>Session</th><th>Date</th><th>Booked</th><th>Attended</th><th>No-show</th><th></th></tr></thead><tbody>' +
      past.map(function (s) {
        var sum = S.attendanceSummary(s.id);
        var attended = Math.max(sum.attended, s.raw.pastAttended || 0);
        var noShow = Math.max(sum.noShow, s.raw.pastNoShow || 0);
        return '<tr><td class="strong">' + esc(s.name) + '</td><td>' + esc(U.fmtDateShort(s.date)) + '</td>' +
          '<td>' + s.enrolled + '</td><td style="color:#8bf0bd">' + attended + '</td><td style="color:#ff9c9c">' + noShow + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm btn-outline" data-act="roster" data-id="' + esc(s.id) + '">Roster</button></td></tr>';
      }).join('') +
      '</tbody></table>' + (past.length ? '' : '<p class="tiny muted" style="padding:18px">No past sessions in the window.</p>') + '</div></div>';

    h += '</div><div class="dash-col">';

    /* weekly calendar */
    h += '<div class="panel panel-pad"><div class="row-between"><h3>This week</h3>' +
      '<a class="tiny" style="color:var(--ink-3)" href="#/calendar">Open calendar</a></div>' +
      '<div class="mini-week mt-12">' + week.map(function (d) {
        var dd = U.toDate(d.date);
        var isToday = d.date === U.dateKey(new Date());
        return '<div class="mini-day ' + (isToday ? 'is-today' : '') + '"><div class="d">' + U.DAYS_SHORT[dd.getDay()] + '</div>' +
          '<div class="n">' + dd.getDate() + '</div>' +
          d.sessions.filter(function (s) { return s.status !== 'cancelled'; }).slice(0, 3).map(function (s) {
            return '<div class="mini-slot" data-cat="' + esc(s.categoryId) + '" title="' + esc(s.name + ' · ' + U.fmtTime(s.startIso)) + '">' +
              esc(U.fmtTime(s.startIso).replace(' ', '')) + ' ' + esc(s.name) + '</div>';
          }).join('') +
          (d.sessions.length > 3 ? '<div class="tiny" style="color:var(--ink-4)">+' + (d.sessions.length - 3) + '</div>' : '') +
          '</div>';
      }).join('') + '</div>' +
      '<div class="row mt-12" style="gap:14px;flex-wrap:wrap">' +
      '<div class="kv"><dt>Published</dt><dd>' + U.sum(week, function (d) { return d.sessions.length; }) + ' sessions</dd></div>' +
      '<div class="kv"><dt>Students</dt><dd>' + U.sum(week, function (d) { return U.sum(d.sessions, function (s) { return s.enrolled; }); }) + '</dd></div>' +
      '<div class="kv"><dt>Revenue</dt><dd>' + U.money(stats.revenue) + '</dd></div></div></div>';

    /* roster quick access */
    h += '<div class="panel"><div class="panel-head"><h3>Next class roster</h3><span class="badge badge-live"><span class="dot"></span>Live</span></div>' +
      '<div class="panel-body">' +
      (today[0] || upcoming[0] ? (function () {
        var s = today[0] || upcoming[0];
        var sum = S.attendanceSummary(s.id);
        return '<div class="row-between"><div><div style="font-size:13.5px;font-weight:650">' + esc(s.name) + '</div>' +
          '<p class="tiny muted mt-2">' + esc(U.relDay(s.date)) + ' · ' + esc(U.fmtTime(s.startIso)) + ' · ' + esc(s.room.name) + '</p></div>' +
          '<span class="badge badge-cat">' + esc(s.category.short) + '</span></div>' +
          '<div class="row mt-12" style="gap:16px"><div class="kv"><dt>Booked</dt><dd>' + sum.expected + '</dd></div>' +
          '<div class="kv"><dt>Marked</dt><dd>' + sum.marked + '</dd></div>' +
          '<div class="kv"><dt>Attendance</dt><dd>' + sum.rate + '%</dd></div></div>' +
          '<button class="btn btn-cat btn-block mt-12" data-act="roster" data-id="' + esc(s.id) + '">' + ui.icon('users') + 'Open roster</button>';
      })() : '<p class="tiny muted">No sessions scheduled.</p>') +
      '</div></div>';

    /* availability */
    h += '<div class="panel panel-pad"><div class="row-between"><h3>Weekly availability</h3><span class="tiny muted">From published series</span></div>' +
      '<div class="stack gap-8 mt-12">' + availability(trainer).map(function (a) {
        return '<div class="row-between" style="font-size:11.5px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
          '<span class="muted">' + a.day + '</span><span style="color:var(--ink-2)">' + a.slots.join(' · ') + '</span></div>';
      }).join('') + '</div>' +
      '<p class="tiny muted mt-12">Room and trainer conflicts are validated before any new session is published.</p></div>';

    /* recent reviews */
    h += '<div class="panel"><div class="panel-head"><h3>Recent reviews</h3><span class="rating">' + ui.icon('star') + (stats.rating || 0).toFixed(1) + '</span></div>' +
      '<div class="panel-body">' + (reviews.length ? reviews.map(function (r) {
        var s = S.sessionById(r.sessionId);
        if (!s || s.trainerId !== trainer.id) return '';
        return '<div class="review" style="padding:10px 0"><span class="av">' + esc(U.initials(r.memberName)) + '</span>' +
          '<div class="grow"><div class="review-head"><span class="review-name">' + esc(r.memberName) + '</span>' + ui.stars(r.rating) + '</div>' +
          '<p class="review-text" style="font-size:11.5px">' + esc(r.comment) + '</p></div></div>';
      }).join('') : '<p class="tiny muted">Member reviews for your sessions will appear here.</p>') + '</div></div>';

    h += '</div></div>';

    /* trainer profile */
    h += '<div class="panel panel-pad mt-20"><div class="row-between" style="flex-wrap:wrap;gap:14px">' +
      '<div class="row" style="gap:14px">' + ui.avatar(trainer.name, trainer.accent, 'av-lg') +
      '<div><h3 style="font-size:14px">' + esc(trainer.name) + '</h3><p class="tiny muted">' + esc(trainer.bio) + '</p></div></div>' +
      '<div class="row-wrap">' + trainer.disciplines.map(function (d) { return '<span class="badge badge-ghost">' + esc(d) + '</span>'; }).join('') + '</div></div></div>';

    return h;
  }

  function stat(label, value, foot) {
    return '<div class="stat"><span class="stat-label">' + esc(label) + '</span>' +
      '<span class="stat-value">' + esc(String(value)) + '</span>' +
      '<span class="stat-foot">' + esc(foot) + '</span></div>';
  }

  function sessionRow(s, manage) {
    var cat = s.category;
    var sum = GY.store.attendanceSummary(s.id);
    var stateBadge = s.status === 'cancelled' ? '<span class="badge badge-danger">Cancelled</span>'
      : s.started ? '<span class="badge badge-ghost">' + (s.ended ? 'Completed' : 'Live') + '</span>'
        : '<span class="badge badge-ghost">' + esc(U.relDay(s.date)) + '</span>';
    var actions = '<button class="btn btn-sm btn-outline" data-act="roster" data-id="' + esc(s.id) + '" title="Attendance">' + ui.icon('users') + 'Roster</button>';
    if (manage) {
      actions += '<button class="btn btn-sm btn-ghost btn-icon" data-act="edit-session" data-id="' + esc(s.id) + '" title="Edit">' + ui.icon('edit') + '</button>';
      actions += '<button class="btn btn-sm btn-ghost btn-icon" data-act="cancel-session" data-id="' + esc(s.id) + '" title="Cancel session">' + ui.icon('trash') + '</button>';
    }
    return '<div class="sess-row" data-cat="' + esc(s.categoryId) + '">' +
      '<div class="sess-time">' + esc(U.fmtTime(s.startIso)) + '<span>' + esc(U.fmtDuration(s.duration)) + '</span></div>' +
      '<div class="sess-main"><div class="t">' + esc(s.name) + stateBadge + '</div>' +
      '<div class="m">' + esc(s.branch.name) + ' · ' + esc(s.room.name) + ' · ' + s.enrolled + '/' + s.capacity + ' booked · ' + sum.marked + ' marked</div></div>' +
      '<div class="sess-actions">' + actions + '</div></div>';
  }

  function availability(trainer) {
    var S = GY.store;
    var map = {};
    S.allSessions().forEach(function (raw) {
      if (raw.trainerId !== trainer.id || raw.status === 'cancelled') return;
      var dow = U.toDate(raw.startIso).getDay();
      if (!map[dow]) map[dow] = {};
      map[dow][raw.start] = true;
    });
    var out = [];
    for (var d = 1; d <= 7; d++) {
      var day = d % 7;
      var times = map[day] ? Object.keys(map[day]).sort() : [];
      out.push({
        day: U.DAYS[day],
        slots: times.length ? times.map(function (t) { return U.fmtTime('2000-01-01T' + t); }) : ['No sessions']
      });
    }
    return out;
  }

  /* ---------------------------------------------------------------- rosters */
  function openRoster(sessionId) {
    var S = GY.store;
    var session = S.sessionById(sessionId);
    if (!session) return;

    var m = ui.modal({
      title: session.name,
      subtitle: U.fmtDateLong(session.date) + ' · ' + U.fmtRange(session.startIso, session.endIso) + ' · ' + session.room.name,
      size: 'lg',
      body: '<div id="roster-body"></div>',
      footer: '<button class="btn btn-ghost" data-modal-close>Close</button>' +
        '<button class="btn btn-outline" id="mark-all-present">Mark all attended</button>' +
        '<button class="btn btn-primary" id="release-seat">Free a seat</button>',
      onMount: function () {
        draw();
        document.getElementById('mark-all-present').addEventListener('click', function () {
          S.markAll(sessionId, 'attended');
          ui.toast('Attendance saved', 'All participants marked as attended.', 'success');
          draw();
        });
        document.getElementById('release-seat').addEventListener('click', function () {
          var res = S.releaseSpot(sessionId);
          if (res.ok) {
            ui.toast('Seat released', res.promoted ? 'A waitlisted member was promoted automatically.' : 'Guest spot removed from the roster.', 'success');
            draw();
          } else ui.toast('Cannot release', res.message, 'warn');
        });
      }
    });

    function draw() {
      var body = document.getElementById('roster-body');
      if (!body) return;
      var sum = S.attendanceSummary(sessionId);
      var wait = S.waitlistInfo(sessionId);
      body.innerHTML = '<div class="row" style="gap:18px;flex-wrap:wrap;margin-bottom:12px">' +
        '<div class="kv"><dt>Booked</dt><dd>' + sum.expected + '</dd></div>' +
        '<div class="kv"><dt>Attended</dt><dd style="color:#8bf0bd">' + sum.attended + '</dd></div>' +
        '<div class="kv"><dt>No-show</dt><dd style="color:#ff9c9c">' + sum.noShow + '</dd></div>' +
        '<div class="kv"><dt>Waitlist</dt><dd>' + wait.count + '</dd></div>' +
        '<div class="kv"><dt>Capacity</dt><dd>' + session.enrolled + '/' + session.capacity + '</dd></div></div>' +
        (session.seats === 0 && wait.count ? '<div class="warn-note mb-16">' + ui.icon('info') +
          '<span>Session is full with ' + wait.count + ' member(s) waiting. Freeing a seat promotes the first person on the list automatically.</span></div>' : '') +
        '<div>' + sum.roster.map(function (r) {
          return '<div class="roster-row"><span class="av">' + esc(U.initials(r.name)) + '</span>' +
            '<div class="grow"><div class="name">' + esc(r.name) + (r.mine ? ' <span class="badge badge-cat" style="height:16px">You</span>' : '') + '</div>' +
            '<div class="tag">' + (r.guest ? 'Member booking' : 'Portal booking') + ' · seat confirmed</div></div>' +
            '<div class="roster-toggle">' +
            '<button data-status="attended" data-key="' + esc(r.key) + '" class="' + (r.status === 'attended' ? 'is-on' : '') + '">Present</button>' +
            '<button data-status="no-show" data-key="' + esc(r.key) + '" class="' + (r.status === 'no-show' ? 'is-on' : '') + '">No-show</button>' +
            '</div></div>';
        }).join('') + '</div>';
      body.querySelectorAll('.roster-toggle button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          S.markAttendance(sessionId, btn.getAttribute('data-key'), btn.getAttribute('data-status'));
          draw();
        });
      });
    }
  }

  /* ---------------------------------------------------------------- authoring */
  function roomOptions(disciplineId, trainerId, selected) {
    var S = GY.store;
    var d = GY.data.disciplineById(disciplineId);
    var trainer = S.trainerById(trainerId);
    if (!d || !trainer) return '';
    return S.rooms().filter(function (r) {
      if (trainer.branches.indexOf(r.branchId) === -1) return false;
      if (r.supports.indexOf(d.category) === -1) return false;
      if (d.requirements.indexOf('reformer') > -1 && r.flags.indexOf('reformer') === -1) return false;
      if (d.requirements.indexOf('bikes') > -1 && r.flags.indexOf('bikes') === -1) return false;
      if (d.requirements.indexOf('pool') > -1 && r.flags.indexOf('pool') === -1) return false;
      if (d.requirements.indexOf('outdoor') > -1 && r.flags.indexOf('outdoor') === -1) return false;
      if (r.flags.indexOf('reformer') > -1 && d.requirements.indexOf('reformer') === -1) return false;
      return true;
    }).map(function (r) {
      var b = S.branchById(r.branchId);
      return '<option value="' + esc(r.id) + '"' + (selected === r.id ? ' selected' : '') + '>' + esc(b.name) + ' · ' + esc(r.name) + ' (' + r.capacity + ')</option>';
    }).join('');
  }

  function disciplineOptions(trainerId) {
    var trainer = GY.store.trainerById(trainerId);
    var allowed = {};
    trainer.disciplines.forEach(function (n) { allowed[n] = true; });
    return GY.data.categories.map(function (c) {
      var list = GY.data.disciplines.filter(function (d) { return d.category === c.id && allowed[d.name]; });
      if (!list.length) return '';
      return '<optgroup label="' + esc(c.name) + '">' + list.map(function (d) {
        return '<option value="' + esc(d.id) + '">' + esc(d.name) + ' · ' + d.minutes + ' min · $' + d.price + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  function timeOptions(selected) {
    var out = '';
    for (var m = 6 * 60; m <= 21 * 60; m += 30) {
      var hm = U.pad(Math.floor(m / 60)) + ':' + U.pad(m % 60);
      out += '<option value="' + hm + '"' + (selected === hm ? ' selected' : '') + '>' + U.fmtTime('2000-01-01T' + hm) + '</option>';
    }
    return out;
  }

  function openCreate(trainerId) {
    var S = GY.store;
    var trainer = S.trainerById(trainerId);
    var firstDiscipline = GY.data.disciplines.filter(function (d) { return trainer.disciplines.indexOf(d.name) > -1; })[0];
    var todayKey = U.dateKey(new Date());
    ui.modal({
      title: 'Publish a new session',
      subtitle: 'Conflicts with trainers, studios and room capacity are validated on save.',
      size: 'lg',
      body: '<form id="session-form" class="stack gap-12">' +
        '<div class="info-grid">' +
        '<div class="field"><label>Class format</label><select class="select" name="disciplineId" id="f-discipline">' + disciplineOptions(trainerId) + '</select></div>' +
        '<div class="field"><label>Trainer</label><input class="input" value="' + esc(trainer.name) + '" disabled></div>' +
        '<div class="field"><label>Date</label><input class="input" type="date" name="date" id="f-date" min="' + todayKey + '" value="' + U.dateKey(U.addDays(new Date(), 1)) + '"></div>' +
        '<div class="field"><label>Start time</label><select class="select" name="start" id="f-start">' + timeOptions('18:00') + '</select></div>' +
        '<div class="field"><label>Studio</label><select class="select" name="roomId" id="f-room">' + roomOptions(firstDiscipline.id, trainerId) + '</select></div>' +
        '<div class="field"><label>Capacity</label><input class="input" type="number" name="capacity" id="f-capacity" min="1" max="60" value="' + Math.min(firstDiscipline.capacity, 16) + '"></div>' +
        '<div class="field"><label>Price per seat ($)</label><input class="input" type="number" name="price" id="f-price" min="0" max="500" value="' + firstDiscipline.price + '"></div>' +
        '<div class="field"><label>Repeat</label><select class="select" name="recurrence" id="f-rec"><option value="none">One-off session</option><option value="weekly">Weekly recurring</option></select></div>' +
        '<div class="field" id="weeks-field" style="display:none"><label>Number of weeks</label><select class="select" name="weeks"><option value="4">4 weeks</option><option value="6">6 weeks</option><option value="8">8 weeks</option><option value="12">12 weeks</option></select></div>' +
        '</div>' +
        '<p class="tiny muted" id="duration-note"></p>' +
        '<div class="warn-note" id="form-error" style="display:none"></div>' +
        '</form>',
      footer: '<button class="btn btn-ghost" data-modal-close>Cancel</button>' +
        '<button class="btn btn-primary" id="publish">' + ui.icon('check') + 'Publish session</button>',
      onMount: function (node) {
        var disc = node.querySelector('#f-discipline');
        var room = node.querySelector('#f-room');
        var capacity = node.querySelector('#f-capacity');
        var price = node.querySelector('#f-price');
        var note = node.querySelector('#duration-note');
        var rec = node.querySelector('#f-rec');
        var weeksField = node.querySelector('#weeks-field');

        function sync() {
          var d = GY.data.disciplineById(disc.value);
          room.innerHTML = roomOptions(disc.value, trainerId);
          capacity.value = Math.min(d.capacity, (S.roomById(room.value) || { capacity: 10 }).capacity);
          capacity.max = Math.min(d.capacity, (S.roomById(room.value) || { capacity: 10 }).capacity);
          price.value = d.price;
          note.textContent = d.name + ' runs ' + d.minutes + ' minutes · ' + d.difficulty + ' · ' + d.membership + ' membership required.';
        }
        disc.addEventListener('change', sync);
        room.addEventListener('change', function () {
          var d = GY.data.disciplineById(disc.value);
          capacity.max = Math.min(d.capacity, (S.roomById(room.value) || { capacity: 10 }).capacity);
          if (Number(capacity.value) > Number(capacity.max)) capacity.value = capacity.max;
        });
        rec.addEventListener('change', function () {
          weeksField.style.display = rec.value === 'weekly' ? '' : 'none';
        });
        sync();

        node.querySelector('#publish').addEventListener('click', function () {
          var err = node.querySelector('#form-error');
          var payload = {
            disciplineId: disc.value,
            trainerId: trainerId,
            roomId: room.value,
            date: node.querySelector('#f-date').value,
            start: node.querySelector('#f-start').value,
            capacity: capacity.value,
            price: price.value,
            recurrence: rec.value,
            weeks: node.querySelector('.select[name="weeks"]').value
          };
          var res = S.createSession(payload);
          if (!res.ok) {
            err.style.display = '';
            err.innerHTML = ui.icon('alert') + '<span>' + esc(res.message) + '</span>';
            return;
          }
          ui.closeModal();
          ui.toast('Session published', res.created.length + ' session' + (res.created.length > 1 ? 's' : '') + ' added to the timetable.', 'success');
        });
      }
    });
  }

  function openEdit(sessionId) {
    var S = GY.store;
    var s = S.sessionById(sessionId);
    if (!s) return;
    ui.modal({
      title: 'Edit session',
      subtitle: s.name + ' · ' + U.fmtDateLong(s.date),
      body: '<form class="stack gap-12">' +
        '<div class="info-grid">' +
        '<div class="field"><label>Date</label><input class="input" type="date" id="e-date" value="' + esc(s.date) + '"></div>' +
        '<div class="field"><label>Start time</label><select class="select" id="e-start">' + timeOptions(s.start) + '</select></div>' +
        '<div class="field"><label>Studio</label><select class="select" id="e-room">' +
        S.rooms().filter(function (r) { return r.branchId === s.branchId || true; }).map(function (r) {
          var b = S.branchById(r.branchId);
          return '<option value="' + esc(r.id) + '"' + (r.id === s.roomId ? ' selected' : '') + '>' + esc(b.name) + ' · ' + esc(r.name) + '</option>';
        }).join('') + '</select></div>' +
        '<div class="field"><label>Capacity</label><input class="input" type="number" id="e-capacity" min="' + s.enrolled + '" value="' + s.capacity + '"></div>' +
        '<div class="field"><label>Price ($)</label><input class="input" type="number" id="e-price" min="0" max="500" value="' + s.price + '"></div>' +
        '</div><div class="warn-note" id="e-error" style="display:none"></div></form>',
      footer: '<button class="btn btn-ghost" data-modal-close>Cancel</button><button class="btn btn-primary" id="save">Save changes</button>',
      onMount: function (node) {
        node.querySelector('#save').addEventListener('click', function () {
          var res = S.updateSession(sessionId, {
            date: node.querySelector('#e-date').value,
            start: node.querySelector('#e-start').value,
            roomId: node.querySelector('#e-room').value,
            capacity: node.querySelector('#e-capacity').value,
            price: node.querySelector('#e-price').value
          });
          if (!res.ok) {
            var err = node.querySelector('#e-error');
            err.style.display = '';
            err.innerHTML = ui.icon('alert') + '<span>' + esc(res.message) + '</span>';
            return;
          }
          ui.closeModal();
          ui.toast('Session updated', 'Members keep their seats and are notified of the change.', 'success');
        });
      }
    });
  }

  GY.views = GY.views || {};
  GY.views.trainer = {
    render: render,
    openRoster: openRoster,
    openCreate: openCreate,
    openEdit: openEdit,
    title: 'Trainer'
  };
})();
