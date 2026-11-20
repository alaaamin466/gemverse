/* GYMVERSE — persistent data store + domain logic (bookings, waitlists, attendance, analytics) */
(function () {
  'use strict';
  var GY = (window.GY = window.GY || {});
  var U = GY.util;
  var KEY = 'gymverse.db.v4';
  var HOUR = 3600000;

  var db = null;
  var listeners = [];
  var storageAvailable = true;

  /* ---------------------------------------------------------------- storage */
  function persistNow() {
    if (!storageAvailable) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (err) {
      storageAvailable = false;
      console.warn('[GYMVERSE] local storage unavailable, running in-memory', err);
    }
  }
  var persist = U.debounce(persistNow, 180);

  function load() {
    var store = null;
    try { store = localStorage.getItem(KEY); } catch (e) { storageAvailable = false; }
    if (store) {
      try {
        var parsed = JSON.parse(store);
        if (parsed && parsed.version === 4 && parsed.generatorDay === U.dateKey(new Date()) && parsed.sessions && parsed.sessions.length) {
          db = parsed;
          return;
        }
      } catch (e2) { /* fall through to reseed */ }
    }
    db = GY.data.buildSeed();
    persistNow();
  }

  function emit(reason) {
    persist();
    listeners.forEach(function (fn) {
      try { fn(reason); } catch (e) { console.error(e); }
    });
  }

  /* ---------------------------------------------------------------- indexes */
  var index = { trainer: {}, room: {}, branch: {}, cat: {}, disc: {} };
  function buildIndexes() {
    index.trainer = {}; index.room = {}; index.branch = {}; index.cat = {}; index.disc = {};
    GY.data.trainers.forEach(function (t) { index.trainer[t.id] = t; });
    GY.data.rooms.forEach(function (r) { index.room[r.id] = r; });
    GY.data.branches.forEach(function (b) { index.branch[b.id] = b; });
    GY.data.categories.forEach(function (c) { index.cat[c.id] = c; });
    GY.data.disciplines.forEach(function (d) { index.disc[d.id] = d; });
  }

  /* ---------------------------------------------------------------- helpers */
  function rank(tier) { return GY.data.membershipRank[tier] == null ? 0 : GY.data.membershipRank[tier]; }
  function imageFor(discipline) {
    if (!discipline) return 'assets/img/hero.jpg';
    if (discipline.id === 'indoor-cycling' || discipline.id === 'spinning') return 'assets/img/cycling.jpg';
    if (discipline.id === 'bootcamp') return 'assets/img/outdoor.jpg';
    var cat = index.cat[discipline.category];
    return cat ? cat.image : 'assets/img/hero.jpg';
  }
  function rawById(id) {
    for (var i = 0; i < db.sessions.length; i++) if (db.sessions[i].id === id) return db.sessions[i];
    return null;
  }

  function bookingStats() {
    var map = {};
    db.bookings.forEach(function (b) {
      var slot = map[b.sessionId] || (map[b.sessionId] = { booked: 0, waitlisted: 0, mine: null });
      if (b.status === 'booked') slot.booked += 1;
      if (b.status === 'waitlisted') slot.waitlisted += 1;
      if (b.memberId === db.profile.id && (b.status === 'booked' || b.status === 'waitlisted')) slot.mine = b;
    });
    return map;
  }
  function reviewStats() {
    var map = {};
    db.reviews.forEach(function (r) {
      var slot = map[r.sessionId] || (map[r.sessionId] = { count: 0, sum: 0, trainerSum: 0 });
      slot.count += 1; slot.sum += r.rating; slot.trainerSum += (r.trainerRating || r.rating);
    });
    return map;
  }

  function hydrate(s, bStats, rStats) {
    if (!s) return null;
    var d = index.disc[s.disciplineId] || { name: 'Session', duration: 60, equipment: [], difficulty: 'Beginner', membership: 'Standard', price: s.price, category: 'yoga', intensity: 3 };
    var trainer = index.trainer[s.trainerId] || { name: 'GYMVERSE Coach', title: '' };
    var room = index.room[s.roomId] || { name: 'Studio', capacity: s.capacity };
    var branch = index.branch[s.branchId] || { name: 'GYMVERSE' };
    var category = index.cat[d.category] || { id: 'yoga', name: 'Classes', short: 'Class', accent: '#8fe3c4', image: 'assets/img/hero.jpg' };
    var bs = (bStats || {})[s.id] || { booked: 0, waitlisted: 0, mine: null };
    var rs = (rStats || {})[s.id] || { count: 0, sum: 0, trainerSum: 0 };

    var enrolled = s.baseEnrolled + bs.booked;
    var seats = Math.max(0, s.capacity - enrolled);
    var waitlistCount = (s.waitlistSeed || 0) + bs.waitlisted;

    var start = U.toDate(s.startIso);
    var end = U.toDate(s.endIso);
    var now = new Date();
    var bookBy = new Date(start.getTime() - (s.bookingDeadlineHours || 2) * HOUR);
    var cancelBy = new Date(start.getTime() - (s.cancelDeadlineHours || 6) * HOUR);
    var started = now >= start;
    var ended = now >= end;

    var reviews = rs.count;
    var totalCount = (s.seedReviews || 0) + reviews;
    var totalSum = (s.seedRating || 0) * (s.seedReviews || 0) + rs.sum;
    var ratingAvg = totalCount ? Math.round((totalSum / totalCount) * 10) / 10 : 0;

    return {
      raw: s,
      id: s.id,
      name: d.name,
      description: d.description,
      focus: d.focus,
      disciplineId: d.id,
      categoryId: d.category,
      category: category,
      trainer: trainer,
      room: room,
      branch: branch,
      image: imageFor(d),
      date: s.date,
      start: s.start,
      end: s.end,
      startIso: s.startIso,
      endIso: s.endIso,
      dayStart: start,
      dayEnd: end,
      duration: s.duration,
      difficulty: d.difficulty,
      intensity: d.intensity,
      intensityLabel: GY.data.intensityLabel[d.intensity] || 'Moderate',
      equipment: d.equipment || [],
      membership: d.membership,
      price: s.price,
      capacity: s.capacity,
      enrolled: Math.min(enrolled, s.capacity),
      seats: seats,
      waitlistCount: waitlistCount,
      waitlistSeed: s.waitlistSeed || 0,
      status: s.status,
      isFeatured: !!s.isFeatured,
      isVirtual: !!d.virtual,
      rating: { avg: ratingAvg, count: totalCount },
      myBooking: bs.mine,
      myStatus: bs.mine ? bs.mine.status : null,
      fav: db.favorites.indexOf(s.id) > -1,
      started: started,
      ended: ended,
      past: ended,
      deadline: {
        bookBy: bookBy,
        cancelBy: cancelBy,
        bookOpen: s.status === 'scheduled' && !started && now < bookBy,
        cancelOpen: s.status === 'scheduled' && !started && now < cancelBy,
        hoursToStart: Math.round((start - now) / HOUR),
        bookInHours: Math.round((bookBy - now) / HOUR)
      },
      seriesId: s.seriesId
    };
  }

  function hydrateAll(list) {
    var bStats = bookingStats();
    var rStats = reviewStats();
    return list.map(function (s) { return hydrate(s, bStats, rStats); });
  }

  /* ---------------------------------------------------------------- queries */
  function allSessions() { return db.sessions.slice(); }
  function sessionById(id) {
    var s = rawById(id);
    return s ? hydrate(s, bookingStats(), reviewStats()) : null;
  }

  function query(opts) {
    opts = opts || {};
    var now = new Date();
    var todayKey = U.dateKey(now);
    var results = db.sessions.filter(function (s) {
      if (opts.includeCancelled ? false : s.status !== 'scheduled') return false;
      if (opts.includeCancelled && s.status !== 'cancelled' && opts.onlyCancelled) return false;
      if (opts.date) {
        if (s.date !== opts.date) return false;
      } else if (!opts.includePast) {
        if (U.toDate(s.endIso) < now) return false;
      }
      if (opts.from && s.date < opts.from) return false;
      if (opts.to && s.date > opts.to) return false;
      if (opts.category && s.disciplineId && index.disc[s.disciplineId] && index.disc[s.disciplineId].category !== opts.category) return false;
      if (opts.category && s.disciplineId && !index.disc[s.disciplineId]) return false;
      if (opts.trainerId && s.trainerId !== opts.trainerId) return false;
      if (opts.branchId && s.branchId !== opts.branchId) return false;
      if (opts.roomId && s.roomId !== opts.roomId) return false;
      if (opts.disciplineId && s.disciplineId !== opts.disciplineId) return false;
      if (opts.favoritesOnly && db.favorites.indexOf(s.id) === -1) return false;
      var d = index.disc[s.disciplineId];
      if (!d) return false;
      if (opts.difficulty && d.difficulty !== opts.difficulty) return false;
      if (opts.membership && d.membership !== opts.membership) return false;
      if (opts.maxPrice != null && s.price > opts.maxPrice) return false;
      if (opts.minDuration != null && d.minutes < opts.minDuration) return false;
      if (opts.maxDuration != null && d.minutes > opts.maxDuration) return false;
      if (opts.timeOfDay) {
        var h = U.toDate(s.startIso).getHours();
        if (U.timeOfDay(h) !== opts.timeOfDay) return false;
      }
      if (opts.minSeats) {
        var bs = null;
        var booked = 0;
        for (var i = 0; i < db.bookings.length; i++) {
          if (db.bookings[i].sessionId === s.id && db.bookings[i].status === 'booked') booked += 1;
        }
        var seats = s.capacity - (s.baseEnrolled + booked);
        if (seats < opts.minSeats) return false;
      }
      if (opts.search) {
        var q = String(opts.search).toLowerCase();
        var trainerName = (index.trainer[s.trainerId] || {}).name || '';
        var branchName = (index.branch[s.branchId] || {}).name || '';
        var hay = (d.name + ' ' + d.focus + ' ' + d.category + ' ' + trainerName + ' ' + branchName).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      if (opts.dayOfWeek != null && U.toDate(s.date).getDay() !== opts.dayOfWeek) return false;
      if (opts.afterHour != null && U.toDate(s.startIso).getHours() < opts.afterHour) return false;
      if (opts.beforeHour != null && U.toDate(s.startIso).getHours() >= opts.beforeHour) return false;
      return true;
    });

    var out = hydrateAll(results);
    out = sortSessions(out, opts.sort || 'soonest');
    if (opts.limit) out = out.slice(0, opts.limit);
    return out;
  }

  function sortSessions(list, sort) {
    var copy = list.slice();
    if (sort === 'price-low') copy.sort(function (a, b) { return a.price - b.price; });
    else if (sort === 'price-high') copy.sort(function (a, b) { return b.price - a.price; });
    else if (sort === 'popular') copy.sort(function (a, b) { return (b.rating.avg * b.rating.count + b.enrolled * 2) - (a.rating.avg * a.rating.count + a.enrolled * 2); });
    else if (sort === 'seats') copy.sort(function (a, b) { return b.seats - a.seats || a.startIso.localeCompare(b.startIso); });
    else if (sort === 'rating') copy.sort(function (a, b) { return b.rating.avg - a.rating.avg || b.rating.count - a.rating.count; });
    else copy.sort(function (a, b) { return a.startIso.localeCompare(b.startIso); });
    return copy;
  }

  function todaySessions() {
    return query({ date: U.dateKey(new Date()), includePast: true, sort: 'soonest' });
  }

  /* ---------------------------------------------------------------- deadlines */
  function canBook(v) {
    if (!v) return { ok: false, message: 'Session not found.' };
    if (v.status !== 'scheduled') return { ok: false, message: 'This session has been cancelled.' };
    if (v.myStatus === 'booked') return { ok: false, message: 'You already have a spot in this class.' };
    if (v.myStatus === 'waitlisted') return { ok: false, message: 'You are already on the waitlist.' };
    if (v.started) return { ok: false, message: 'This class has already started.' };
    if (!v.deadline.bookOpen) {
      return { ok: false, message: 'Booking closed ' + U.fmtTime(v.deadline.bookBy) + '. Contact the studio to be added manually.' };
    }
    if (rank(db.profile.membership) < rank(v.membership)) {
      return { ok: false, code: 'membership', message: v.name + ' requires a ' + v.membership + ' membership.' };
    }
    return { ok: true };
  }

  function conflicts(v) {
    var mine = db.bookings.filter(function (b) {
      return b.memberId === db.profile.id && b.status === 'booked' && b.sessionId !== v.id;
    });
    for (var i = 0; i < mine.length; i++) {
      var other = rawById(mine[i].sessionId);
      if (!other || other.status !== 'scheduled') continue;
      if (U.overlap(other.startIso, other.endIso, v.startIso, v.endIso)) {
        return hydrate(other, bookingStats(), reviewStats());
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------- booking */
  function notify(title, body, type) {
    db.notifications.unshift({
      id: U.uid('nt'), type: type || 'booking', title: title, body: body,
      createdAt: new Date().toISOString(), read: false
    });
  }

  function book(sessionId) {
    var v = sessionById(sessionId);
    var check = canBook(v);
    if (!check.ok) return check;
    var warn = conflicts(v);
    var seat = v.seats > 0;
    var booking = {
      id: U.uid('bk'),
      sessionId: sessionId,
      memberId: db.profile.id,
      status: seat ? 'booked' : 'waitlisted',
      createdAt: new Date().toISOString(),
      seat: seat ? v.enrolled + 1 : null
    };
    db.bookings.push(booking);
    if (seat) {
      notify('Spot confirmed', v.name + ' · ' + U.relDay(v.date) + ' at ' + U.fmtTime(v.startIso) + ' with ' + v.trainer.name + '.', 'booking');
    } else {
      booking.waitlistPosition = v.waitlistCount + 1;
      notify('Added to the waitlist', 'You are #' + booking.waitlistPosition + ' for ' + v.name + ' on ' + U.relDay(v.date) + '. We will promote you automatically when a seat opens.', 'waitlist');
    }
    emit('booking');
    return {
      ok: true,
      status: booking.status,
      booking: booking,
      session: sessionById(sessionId),
      warning: warn ? 'Overlaps with ' + warn.name + ' at ' + U.fmtTime(warn.startIso) + '.' : null,
      position: booking.waitlistPosition
    };
  }

  function cancelBooking(bookingId, opts) {
    var booking = null;
    for (var i = 0; i < db.bookings.length; i++) if (db.bookings[i].id === bookingId) booking = db.bookings[i];
    if (!booking) return { ok: false, message: 'Booking not found.' };
    if (booking.status !== 'booked' && booking.status !== 'waitlisted') return { ok: false, message: 'This booking is no longer active.' };
    var v = sessionById(booking.sessionId);
    if (!opts || !opts.force) {
      if (v.started) return { ok: false, message: 'This class has already started.' };
      if (booking.status === 'booked' && !v.deadline.cancelOpen) {
        return { ok: false, message: 'The cancellation window closed at ' + U.fmtTime(v.deadline.cancelBy) + '. Late cancellations are treated as no-shows.' };
      }
    }
    var wasWaitlist = booking.status === 'waitlisted';
    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    notify(wasWaitlist ? 'Waitlist spot released' : 'Booking cancelled',
      wasWaitlist ? 'You left the waitlist for ' + v.name + '.' : 'Your spot in ' + v.name + ' on ' + U.relDay(v.date) + ' was released.', 'booking');

    var promoted = null;
    if (!wasWaitlist) promoted = promoteWaitlist(booking.sessionId);
    emit('cancel');
    return { ok: true, promoted: promoted, session: v };
  }

  function promoteWaitlist(sessionId) {
    var list = db.bookings.filter(function (b) { return b.sessionId === sessionId && b.status === 'waitlisted'; });
    list.sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
    var v = sessionById(sessionId);
    if (!list.length || !v || v.seats <= 0) return null;
    var next = list[0];
    next.status = 'booked';
    next.promotedAt = new Date().toISOString();
    db.attendance[sessionId] = db.attendance[sessionId] || {};
    if (next.memberId === db.profile.id) {
      notify('You are off the waitlist', 'A seat opened in ' + v.name + ' on ' + U.relDay(v.date) + '. Your booking is confirmed.', 'waitlist');
    }
    return next;
  }

  function waitlistInfo(sessionId) {
    var v = sessionById(sessionId);
    if (!v) return { count: 0, position: null };
    var mine = v.myStatus === 'waitlisted' ? v.myBooking : null;
    if (!mine) return { count: v.waitlistCount, position: null };
    var list = db.bookings.filter(function (b) { return b.sessionId === sessionId && b.status === 'waitlisted'; });
    list.sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
    return { count: v.waitlistCount, position: list.indexOf(mine) + 1 + (v.waitlistSeed || 0) };
  }

  /* ---------------------------------------------------------------- roster + attendance */
  function rosterFor(sessionId) {
    var v = sessionById(sessionId);
    if (!v) return [];
    var guests = [];
    var pool = GY.data.memberPool;
    var offset = U.hash(v.id) % pool.length;
    var marks = db.attendance[v.id] || {};
    for (var i = 0; i < v.raw.baseEnrolled; i++) {
      var key = 'g' + i;
      guests.push({
        key: key,
        name: pool[(offset + i * 7) % pool.length],
        guest: true,
        status: marks[key] || 'expected'
      });
    }
    var members = db.bookings.filter(function (b) {
      return b.sessionId === v.id && (b.status === 'booked' || b.status === 'attended' || b.status === 'no-show');
    }).map(function (b) {
      var mine = b.memberId === db.profile.id;
      var status = marks[mine ? db.profile.id : b.id] || (b.status === 'attended' ? 'attended' : b.status === 'no-show' ? 'no-show' : 'expected');
      return {
        key: mine ? db.profile.id : b.id,
        name: mine ? db.profile.name : 'Member ' + String(b.id).slice(-4).toUpperCase(),
        guest: false, mine: mine, status: status, bookingId: b.id
      };
    });
    return members.concat(guests);
  }

  function attendanceSummary(sessionId) {
    var roster = rosterFor(sessionId);
    var marked = roster.filter(function (r) { return r.status !== 'expected'; });
    var attended = marked.filter(function (r) { return r.status === 'attended'; }).length;
    var noShow = marked.filter(function (r) { return r.status === 'no-show'; }).length;
    return {
      roster: roster,
      attended: attended,
      noShow: noShow,
      marked: marked.length,
      expected: roster.length,
      rate: roster.length ? Math.round((attended / roster.length) * 100) : 0
    };
  }

  function markAttendance(sessionId, memberKey, status) {
    db.attendance[sessionId] = db.attendance[sessionId] || {};
    db.attendance[sessionId][memberKey] = status;
    var b = db.bookings.filter(function (x) { return x.sessionId === sessionId && (x.id === memberKey || (x.memberId === db.profile.id && memberKey === db.profile.id)); })[0];
    if (b) b.status = status === 'attended' ? 'attended' : status === 'no-show' ? 'no-show' : b.status;
    emit('attendance');
    return { ok: true, summary: attendanceSummary(sessionId) };
  }

  function markAll(sessionId, status) {
    var roster = rosterFor(sessionId);
    db.attendance[sessionId] = db.attendance[sessionId] || {};
    roster.forEach(function (r) { db.attendance[sessionId][r.key] = status; });
    db.bookings.forEach(function (b) {
      if (b.sessionId === sessionId && (b.status === 'booked' || b.status === 'attended' || b.status === 'no-show')) {
        b.status = status === 'attended' ? 'attended' : 'no-show';
      }
    });
    emit('attendance');
    return { ok: true, summary: attendanceSummary(sessionId) };
  }

  /* Release a synthetic participant spot (trainer action) so waitlists promote. */
  function releaseSpot(sessionId, memberKey) {
    var s = rawById(sessionId);
    if (!s || s.baseEnrolled <= 0) return { ok: false, message: 'No guest spot to release.' };
    s.baseEnrolled -= 1;
    var promoted = promoteWaitlist(sessionId);
    emit('release');
    return { ok: true, promoted: promoted ? { member: 'a waitlisted member' } : null };
  }

  /* ---------------------------------------------------------------- reviews */
  function reviewsFor(sessionId) {
    return db.reviews.filter(function (r) { return r.sessionId === sessionId; })
      .sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
  }

  function canReview(sessionId) {
    var v = sessionById(sessionId);
    if (!v) return false;
    var mine = db.bookings.filter(function (b) {
      return b.sessionId === sessionId && b.memberId === db.profile.id && b.status !== 'cancelled' && b.status !== 'waitlisted';
    })[0];
    if (!mine) return false;
    return v.ended || mine.status === 'attended';
  }

  function addReview(payload) {
    if (!canReview(payload.sessionId)) return { ok: false, message: 'You can review a class once it has finished.' };
    var rating = U.clamp(parseInt(payload.rating, 10) || 5, 1, 5);
    var existing = db.reviews.filter(function (r) {
      return r.sessionId === payload.sessionId && r.memberId === db.profile.id;
    })[0];
    if (existing) {
      existing.rating = rating;
      existing.trainerRating = rating;
      existing.comment = payload.comment || existing.comment;
      existing.createdAt = new Date().toISOString();
    } else {
      db.reviews.push({
        id: U.uid('rv'),
        sessionId: payload.sessionId,
        memberId: db.profile.id,
        memberName: db.profile.name,
        rating: rating,
        trainerRating: rating,
        comment: payload.comment || '',
        createdAt: new Date().toISOString()
      });
    }
    notify('Thanks for the review', 'Your feedback helps trainers sharpen their classes.', 'review');
    emit('review');
    return { ok: true };
  }

  function trainerRating(trainerId) {
    var t = index.trainer[trainerId];
    if (!t) return { avg: 0, count: 0 };
    var ids = {};
    db.sessions.forEach(function (s) { if (s.trainerId === trainerId) ids[s.id] = true; });
    var sum = t.baseRating * t.baseReviews, count = t.baseReviews;
    db.reviews.forEach(function (r) {
      if (!r.memberId || !ids[r.sessionId]) return;
      sum += r.trainerRating || r.rating; count += 1;
    });
    return { avg: count ? Math.round((sum / count) * 10) / 10 : 0, count: count };
  }

  /* ---------------------------------------------------------------- session management */
  function overlapsExisting(payload, ignoreId) {
    return db.sessions.some(function (s) {
      if (s.id === ignoreId) return false;
      if (s.status === 'cancelled') return false;
      if (s.date !== payload.date) return false;
      if (U.overlap(s.startIso, s.endIso, payload.startIso, payload.endIso)) {
        return s.trainerId === payload.trainerId || s.roomId === payload.roomId;
      }
      return false;
    });
  }

  function createSession(payload) {
    var d = index.disc[payload.disciplineId];
    if (!d) return { ok: false, message: 'Choose a class format.' };
    var trainer = index.trainer[payload.trainerId];
    var room = index.room[payload.roomId];
    if (!trainer || !room) return { ok: false, message: 'Choose a trainer and a studio.' };
    if (!payload.date || !payload.start) return { ok: false, message: 'Choose a date and a start time.' };
    var weeks = payload.recurrence === 'weekly' ? U.clamp(parseInt(payload.weeks, 10) || 4, 1, 12) : 1;
    var startMin = U.parseHM(payload.start);
    var end = U.timeKey(U.addMinutes(new Date(2020, 0, 6, Math.floor(startMin / 60), startMin % 60), d.minutes));
    var capacity = U.clamp(parseInt(payload.capacity, 10) || Math.min(room.capacity, d.capacity), 1, Math.min(room.capacity, d.capacity));
    var price = U.clamp(parseInt(payload.price, 10) || d.price, 0, 500);
    var created = [];
    var seriesId = 'sr_new_' + Date.now().toString(36);
    for (var i = 0; i < weeks; i++) {
      var date = U.addDays(payload.date, i * 7);
      var dateKey = U.dateKey(date);
      if (U.toDate(dateKey + 'T' + payload.start) < new Date()) {
        if (weeks === 1) return { ok: false, message: 'That start time is in the past.' };
        continue;
      }
      var startIso = dateKey + 'T' + payload.start;
      var endIso = dateKey + 'T' + end;
      if (overlapsExisting({ date: dateKey, startIso: startIso, endIso: endIso, trainerId: trainer.id, roomId: room.id })) {
        if (weeks === 1) return { ok: false, message: 'That trainer or studio is already booked at this time.' };
        continue;
      }
      var s = {
        id: U.uid('s'), seriesId: seriesId, disciplineId: d.id, trainerId: trainer.id,
        branchId: room.branchId, roomId: room.id, date: dateKey, start: payload.start, end: end,
        startIso: startIso, endIso: endIso, duration: d.minutes, capacity: capacity, price: price,
        status: 'scheduled', baseEnrolled: 0, pastAttended: 0, pastNoShow: 0,
        seedRating: 0, seedReviews: 0, waitlistSeed: 0, isFeatured: false,
        bookingDeadlineHours: d.category === 'personal' ? 4 : 2,
        cancelDeadlineHours: d.category === 'personal' ? 12 : 6,
        createdAt: new Date().toISOString(),
        recurrence: weeks > 1 ? { frequency: 'weekly', weeks: weeks } : null
      };
      db.sessions.push(s);
      created.push(s);
    }
    if (!created.length) return { ok: false, message: 'Nothing could be scheduled — check for conflicts.' };
    db.sessions.sort(function (a, b) { return a.startIso < b.startIso ? -1 : 1; });
    notify('Session published', created.length + ' session' + (created.length > 1 ? 's' : '') + ' of ' + d.name + ' added to the timetable.', 'system');
    emit('session-created');
    return { ok: true, created: created.map(function (s) { return sessionById(s.id); }) };
  }

  function updateSession(sessionId, payload) {
    var s = rawById(sessionId);
    if (!s) return { ok: false, message: 'Session not found.' };
    var d = index.disc[s.disciplineId];
    var date = payload.date || s.date;
    var start = payload.start || s.start;
    var roomId = payload.roomId || s.roomId;
    var trainerId = payload.trainerId || s.trainerId;
    var capacity = payload.capacity != null ? parseInt(payload.capacity, 10) : s.capacity;
    var price = payload.price != null ? parseInt(payload.price, 10) : s.price;
    var startMin = U.parseHM(start);
    var end = U.timeKey(U.addMinutes(new Date(2020, 0, 6, Math.floor(startMin / 60), startMin % 60), d.minutes));
    var startIso = date + 'T' + start;
    var endIso = date + 'T' + end;
    var v = sessionById(sessionId);
    if (capacity < v.enrolled) return { ok: false, message: 'Capacity cannot be lower than the ' + v.enrolled + ' people already booked.' };
    if (overlapsExisting({ date: date, startIso: startIso, endIso: endIso, trainerId: trainerId, roomId: roomId }, sessionId)) {
      return { ok: false, message: 'That trainer or studio is already booked at this time.' };
    }
    s.date = date; s.start = start; s.end = end; s.startIso = startIso; s.endIso = endIso;
    s.roomId = roomId; s.trainerId = trainerId;
    s.branchId = (index.room[roomId] || {}).branchId || s.branchId;
    s.capacity = U.clamp(capacity, 1, (index.room[roomId] || {}).capacity || capacity);
    s.price = U.clamp(price, 0, 500);
    emit('session-updated');
    return { ok: true, session: sessionById(sessionId) };
  }

  function cancelSession(sessionId, reason) {
    var s = rawById(sessionId);
    if (!s) return { ok: false, message: 'Session not found.' };
    s.status = 'cancelled';
    s.cancelReason = reason || 'Cancelled by the studio';
    var affected = 0;
    db.bookings.forEach(function (b) {
      if (b.sessionId === sessionId && (b.status === 'booked' || b.status === 'waitlisted')) {
        b.status = 'cancelled';
        b.cancelledAt = new Date().toISOString();
        affected += 1;
      }
    });
    notify('Session cancelled', sessionById(sessionId).name + ' was cancelled. ' + affected + ' member' + (affected === 1 ? '' : 's') + ' notified.', 'system');
    emit('session-cancelled');
    return { ok: true, affected: affected };
  }

  /* ---------------------------------------------------------------- profile / role */
  function setRole(role, trainerId) {
    db.role = role;
    if (trainerId) db.activeTrainerId = trainerId;
    emit('role');
  }
  function setTrainer(trainerId) {
    db.activeTrainerId = trainerId;
    if (db.role !== 'trainer') db.role = 'trainer';
    emit('role');
  }
  function upgradeMembership(tier) {
    if (!(tier in GY.data.membershipRank)) return { ok: false };
    db.profile.membership = tier;
    notify('Membership updated', 'You are now on ' + tier + '. Elite studios and personal training are unlocked.', 'system');
    emit('profile');
    return { ok: true };
  }
  function toggleFavorite(sessionId) {
    var i = db.favorites.indexOf(sessionId);
    if (i > -1) db.favorites.splice(i, 1); else db.favorites.push(sessionId);
    emit('favorite');
    return db.favorites.indexOf(sessionId) > -1;
  }

  /* ---------------------------------------------------------------- notifications */
  function notifications() { return db.notifications.slice(0, 40); }
  function unreadCount() { return db.notifications.filter(function (n) { return !n.read; }).length; }
  function markAllRead() { db.notifications.forEach(function (n) { n.read = true; }); emit('notifications'); }

  /* ---------------------------------------------------------------- my activity */
  function myBookings() {
    var bStats = bookingStats(), rStats = reviewStats();
    var list = db.bookings.filter(function (b) { return b.memberId === db.profile.id; })
      .map(function (b) {
        var raw = rawById(b.sessionId);
        if (!raw) return null;
        var v = hydrate(raw, bStats, rStats);
        return { booking: b, session: v, seat: b.seat, status: b.status };
      }).filter(Boolean);
    list.sort(function (a, b) { return a.session.startIso.localeCompare(b.session.startIso); });
    return list;
  }

  function myStats() {
    var all = myBookings();
    var attended = all.filter(function (x) { return x.status === 'attended'; }).length;
    var upcoming = all.filter(function (x) { return x.status === 'booked' && !x.session.ended; });
    var noShows = all.filter(function (x) { return x.status === 'no-show'; }).length;
    var wait = all.filter(function (x) { return x.status === 'waitlisted'; });
    var minutes = U.sum(all.filter(function (x) { return x.status === 'attended'; }), function (x) { return x.session.duration; });
    var cats = {};
    all.filter(function (x) { return x.status === 'attended'; }).forEach(function (x) {
      cats[x.session.categoryId] = (cats[x.session.categoryId] || 0) + 1;
    });
    var topCat = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; })[0];
    return {
      attended: attended, upcoming: upcoming.length, waitlisted: wait.length,
      noShows: noShows, minutes: minutes, topCategory: topCat || db.profile.goal,
      categoryCounts: cats,
      streak: db.profile.streak
    };
  }

  /* ---------------------------------------------------------------- trainer dashboards */
  function trainerSessions(trainerId, opts) {
    opts = opts || {};
    var list = db.sessions.filter(function (s) {
      if (s.trainerId !== trainerId) return false;
      if (opts.status && s.status !== opts.status) return false;
      if (opts.from && s.date < opts.from) return false;
      if (opts.to && s.date > opts.to) return false;
      return true;
    });
    var out = hydrateAll(list);
    return sortSessions(out, opts.sort || 'soonest');
  }

  function trainerStats(trainerId) {
    var weekStart = U.dateKey(U.startOfWeek(new Date()));
    var weekEnd = U.dateKey(U.addDays(U.startOfWeek(new Date()), 6));
    var upcoming = trainerSessions(trainerId, { from: U.dateKey(new Date()) });
    var week = trainerSessions(trainerId, { from: weekStart, to: weekEnd });
    var all = trainerSessions(trainerId, {});
    var enrolled = U.sum(all, function (s) { return s.enrolled; });
    var capacity = U.sum(all, function (s) { return s.capacity; });
    var rating = trainerRating(trainerId);
    var past = all.filter(function (s) { return s.past && s.status === 'scheduled'; });
    var attended = U.sum(past, function (s) { return s.raw.pastAttended || 0; });
    var noShow = U.sum(past, function (s) { return s.raw.pastNoShow || 0; });
    var revenue = U.sum(all.filter(function (s) { return s.status === 'scheduled'; }), function (s) { return s.price * s.enrolled; });
    return {
      weekSessions: week.length,
      upcoming: upcoming.length,
      totalStudents: enrolled,
      fillRate: capacity ? Math.round((enrolled / capacity) * 100) : 0,
      rating: rating.avg,
      reviewCount: rating.count,
      attendanceRate: (attended + noShow) ? Math.round((attended / (attended + noShow)) * 100) : 96,
      noShowRate: (attended + noShow) ? Math.round((noShow / (attended + noShow)) * 100) : 4,
      revenue: revenue
    };
  }

  function trainerWeek(trainerId, weekOf) {
    var monday = U.startOfWeek(weekOf || new Date());
    var out = [];
    for (var i = 0; i < 7; i++) {
      var key = U.dateKey(U.addDays(monday, i));
      var sessions = trainerSessions(trainerId, { from: key, to: key, sort: 'soonest' });
      out.push({ date: key, sessions: sessions });
    }
    return out;
  }

  /* ---------------------------------------------------------------- analytics */
  function analytics(opts) {
    opts = opts || {};
    var days = opts.days || 30;
    var from = U.dateKey(U.addDays(new Date(), -days));
    var to = U.dateKey(U.addDays(new Date(), 14));
    var sessions = hydrateAll(db.sessions.filter(function (s) {
      return s.date >= from && s.date <= to && s.status === 'scheduled';
    }));
    var past = sessions.filter(function (s) { return s.ended; });
    var future = sessions.filter(function (s) { return !s.ended; });

    var enrolledTotal = U.sum(sessions, function (s) { return s.enrolled; });
    var capacityTotal = U.sum(sessions, function (s) { return s.capacity; });
    var revenue = U.sum(sessions, function (s) { return s.enrolled * s.price; });
    var attendedTotal = U.sum(past, function (s) { return s.raw.pastAttended || 0; });
    var noShowTotal = U.sum(past, function (s) { return s.raw.pastNoShow || 0; });
    var waitlistTotal = U.sum(sessions, function (s) { return s.waitlistCount; });

    var cats = {};
    GY.data.categories.forEach(function (c) {
      cats[c.id] = { id: c.id, name: c.short, full: c.name, accent: c.accent, accent2: c.accent2, image: c.image, sessions: 0, enrolled: 0, capacity: 0, revenue: 0, ratingSum: 0, ratingN: 0 };
    });
    sessions.forEach(function (s) {
      var c = cats[s.categoryId];
      if (!c) return;
      c.sessions += 1; c.enrolled += s.enrolled; c.capacity += s.capacity; c.revenue += s.enrolled * s.price;
      if (s.rating.count) { c.ratingSum += s.rating.avg * s.rating.count; c.ratingN += s.rating.count; }
    });
    var categoryStats = Object.keys(cats).map(function (k) {
      var c = cats[k];
      c.fill = c.capacity ? Math.round((c.enrolled / c.capacity) * 100) : 0;
      c.rating = c.ratingN ? Math.round((c.ratingSum / c.ratingN) * 10) / 10 : 0;
      return c;
    }).sort(function (a, b) { return b.enrolled - a.enrolled; });

    var hours = GY.util.range(24).map(function (h) { return { hour: h, enrolled: 0, sessions: 0 }; });
    sessions.forEach(function (s) {
      var h = U.toDate(s.startIso).getHours();
      hours[h].enrolled += s.enrolled; hours[h].sessions += 1;
    });
    var weekday = GY.util.range(7).map(function (i) { return { dow: i, enrolled: 0, sessions: 0 }; });
    sessions.forEach(function (s) {
      var d = U.toDate(s.date).getDay();
      weekday[d].enrolled += s.enrolled; weekday[d].sessions += 1;
    });

    var trainers = GY.data.trainers.map(function (t) {
      var list = sessions.filter(function (s) { return s.trainerId === t.id; });
      var enrolled = U.sum(list, function (s) { return s.enrolled; });
      var capacity = U.sum(list, function (s) { return s.capacity; });
      var rating = trainerRating(t.id);
      return {
        id: t.id, name: t.name, category: t.category, accent: t.accent, title: t.title,
        sessions: list.length, enrolled: enrolled, fill: capacity ? Math.round((enrolled / capacity) * 100) : 0,
        rating: rating.avg, reviews: rating.count
      };
    }).filter(function (t) { return t.sessions > 0; }).sort(function (a, b) { return b.enrolled - a.enrolled; });

    var topSessions = sessions.slice().sort(function (a, b) {
      return (b.enrolled / b.capacity) - (a.enrolled / a.capacity) || b.enrolled - a.enrolled;
    }).slice(0, 8);

    var daily = [];
    for (var i = days - 1; i >= 0; i--) {
      var key = U.dateKey(U.addDays(new Date(), -i));
      var daySessions = past.filter(function (s) { return s.date === key; });
      daily.push({
        date: key,
        attended: U.sum(daySessions, function (s) { return s.raw.pastAttended || 0; }),
        enrolled: U.sum(daySessions, function (s) { return s.enrolled; }),
        sessions: daySessions.length
      });
    }

    var difficulty = ['Beginner', 'Intermediate', 'Advanced'].map(function (level) {
      var list = sessions.filter(function (s) { return s.difficulty === level; });
      return { level: level, sessions: list.length, enrolled: U.sum(list, function (s) { return s.enrolled; }) };
    });

    var membership = ['Standard', 'Plus', 'Elite'].map(function (tier) {
      var list = sessions.filter(function (s) { return s.membership === tier; });
      return { tier: tier, sessions: list.length, enrolled: U.sum(list, function (s) { return s.enrolled; }) };
    });

    var branchStats = GY.data.branches.map(function (b) {
      var list = sessions.filter(function (s) { return s.branchId === b.id; });
      var enrolled = U.sum(list, function (s) { return s.enrolled; });
      var capacity = U.sum(list, function (s) { return s.capacity; });
      return { id: b.id, name: b.name, sessions: list.length, enrolled: enrolled, capacity: capacity, fill: capacity ? Math.round((enrolled / capacity) * 100) : 0 };
    });

    return {
      days: days,
      from: from, to: to,
      totals: {
        sessions: sessions.length,
        upcoming: future.length,
        enrolled: enrolledTotal,
        capacity: capacityTotal,
        fillRate: capacityTotal ? Math.round((enrolledTotal / capacityTotal) * 100) : 0,
        revenue: revenue,
        attendanceRate: (attendedTotal + noShowTotal) ? Math.round((attendedTotal / (attendedTotal + noShowTotal)) * 100) : 0,
        noShowRate: (attendedTotal + noShowTotal) ? Math.round((noShowTotal / (attendedTotal + noShowTotal)) * 100) : 0,
        waitlisted: waitlistTotal,
        avgRating: U.avg(sessions.filter(function (s) { return s.rating.count; }), function (s) { return s.rating.avg; }) || 0
      },
      categoryStats: categoryStats,
      topSessions: topSessions,
      trainers: trainers,
      hours: hours,
      weekday: weekday,
      daily: daily,
      difficulty: difficulty,
      membership: membership,
      branches: branchStats
    };
  }

  /* ---------------------------------------------------------------- filters options */
  function filterOptions() {
    return {
      categories: GY.data.categories,
      trainers: GY.data.trainers,
      branches: GY.data.branches,
      difficulties: ['Beginner', 'Intermediate', 'Advanced'],
      memberships: ['Standard', 'Plus', 'Elite'],
      durations: [
        { id: 'short', label: 'Under 45 min', max: 44 },
        { id: 'mid', label: '45 – 60 min', min: 45, max: 60 },
        { id: 'long', label: 'Over 60 min', min: 61 }
      ],
      times: [
        { id: 'morning', label: 'Morning · before 12' },
        { id: 'afternoon', label: 'Afternoon · 12 – 5' },
        { id: 'evening', label: 'Evening · after 5' }
      ],
      prices: [0, 20, 25, 30, 40, 50, 100]
    };
  }

  /* ---------------------------------------------------------------- calendar */
  function calendar(opts) {
    var view = opts.view || 'week';
    var anchor = U.toDate(opts.date || new Date());
    var rangeStart, rangeEnd;
    if (view === 'day') { rangeStart = rangeEnd = U.dateKey(anchor); }
    else if (view === 'month') {
      var first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      var start = U.startOfWeek(first);
      rangeStart = U.dateKey(start);
      rangeEnd = U.dateKey(U.addDays(start, 41));
    } else {
      var mon = U.startOfWeek(anchor);
      rangeStart = U.dateKey(mon);
      rangeEnd = U.dateKey(U.addDays(mon, 6));
    }
    var sessions = query({
      from: rangeStart, to: rangeEnd, includePast: true,
      category: opts.category, trainerId: opts.trainerId, branchId: opts.branchId,
      difficulty: opts.difficulty, minSeats: opts.minSeats ? 1 : null
    });
    var byDate = {};
    sessions.forEach(function (s) { (byDate[s.date] = byDate[s.date] || []).push(s); });
    return {
      view: view, anchor: anchor, rangeStart: rangeStart, rangeEnd: rangeEnd,
      byDate: byDate,
      days: buildDays(rangeStart, rangeEnd),
      counts: { total: sessions.length }
    };
  }
  function buildDays(from, to) {
    var out = [], d = U.toDate(from), end = U.toDate(to), guard = 0;
    while (d <= end && guard < 60) { out.push({ key: U.dateKey(d), date: new Date(d.getTime()) }); d = U.addDays(d, 1); guard += 1; }
    return out;
  }

  /* ---------------------------------------------------------------- ics export */
  function toICS(sessionId) {
    var v = sessionById(sessionId);
    if (!v) return '';
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GYMVERSE//Classes//EN',
      'BEGIN:VEVENT',
      'UID:' + v.id + '@gymverse.fit',
      'DTSTAMP:' + U.icsDate(new Date()),
      'DTSTART:' + U.icsDate(v.startIso),
      'DTEND:' + U.icsDate(v.endIso),
      'SUMMARY:' + v.name + ' with ' + v.trainer.name,
      'LOCATION:' + v.branch.name + ' · ' + v.room.name,
      'DESCRIPTION:' + String(v.description).replace(/[,;]/g, ' '),
      'END:VEVENT', 'END:VCALENDAR'
    ];
    return lines.join('\r\n');
  }

  /* ---------------------------------------------------------------- seed control */
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    db = GY.data.buildSeed();
    persistNow();
    emit('reset');
  }

  function init() {
    buildIndexes();
    load();
    return api;
  }

  var api = {
    init: init,
    subscribe: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; },
    get db() { return db; },
    get profile() { return db.profile; },
    get role() { return db.role; },
    get activeTrainerId() { return db.activeTrainerId; },
    get storageAvailable() { return storageAvailable; },
    categories: function () { return GY.data.categories; },
    trainers: function () { return GY.data.trainers; },
    branches: function () { return GY.data.branches; },
    rooms: function () { return GY.data.rooms; },
    trainerById: function (id) { return index.trainer[id]; },
    branchById: function (id) { return index.branch[id]; },
    roomById: function (id) { return index.room[id]; },
    disciplineById: function (id) { return index.disc[id]; },
    allSessions: allSessions,
    sessionById: sessionById,
    query: query,
    todaySessions: todaySessions,
    canBook: canBook,
    conflicts: conflicts,
    book: book,
    cancelBooking: cancelBooking,
    waitlistInfo: waitlistInfo,
    promoteWaitlist: promoteWaitlist,
    rosterFor: rosterFor,
    attendanceSummary: attendanceSummary,
    markAttendance: markAttendance,
    markAll: markAll,
    releaseSpot: releaseSpot,
    reviewsFor: reviewsFor,
    canReview: canReview,
    addReview: addReview,
    trainerRating: trainerRating,
    createSession: createSession,
    updateSession: updateSession,
    cancelSession: cancelSession,
    setRole: setRole,
    setTrainer: setTrainer,
    upgradeMembership: upgradeMembership,
    toggleFavorite: toggleFavorite,
    notifications: notifications,
    unreadCount: unreadCount,
    markAllRead: markAllRead,
    myBookings: myBookings,
    myStats: myStats,
    trainerSessions: trainerSessions,
    trainerStats: trainerStats,
    trainerWeek: trainerWeek,
    analytics: analytics,
    filterOptions: filterOptions,
    calendar: calendar,
    toICS: toICS,
    reset: reset,
    imageFor: imageFor,
    hydrateAll: hydrateAll
  };
  GY.store = api;
})();
