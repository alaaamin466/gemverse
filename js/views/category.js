/* GYMVERSE — category landing pages with per-discipline identity */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;

  function render(ctx) {
    var cat = GY.data.categoryById(ctx.params.cat);
    if (!cat) {
      return ui.empty({ icon: 'alert', title: 'Category not found', text: 'That discipline does not exist in this studio group.', action: '<a class="btn btn-sm btn-outline mt-8" href="#/classes">Browse all classes</a>' });
    }
    var S = GY.store;
    var week = S.query({ category: cat.id, from: U.dateKey(new Date()), to: U.dateKey(U.addDays(new Date(), 6)) });
    var upcoming = S.query({ category: cat.id, limit: 9 });
    var allCat = S.query({ category: cat.id, includePast: true });
    var coaches = S.trainers().filter(function (t) {
      return (t.disciplineList || t.disciplines).some(function (n) {
        var d = GY.data.disciplines.filter(function (x) { return x.name === n; })[0];
        return d && d.category === cat.id;
      });
    });
    var formats = GY.data.disciplinesByCategory(cat.id);
    var rooms = S.rooms().filter(function (r) { return r.supports.indexOf(cat.id) > -1; });
    var rating = U.avg(allCat, function (s) { return s.rating.avg; });
    var counts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    formats.forEach(function (d) { counts[d.difficulty] += 1; });

    var h = '<div class="cat-nav">' + GY.data.categories.map(function (c) {
      return '<a data-cat="' + esc(c.id) + '" href="#/category/' + esc(c.id) + '" class="' + (c.id === cat.id ? 'is-on' : '') + '"><span class="dot"></span>' + esc(c.name) + '</a>';
    }).join('') + '</div>';

    h += '<section class="cat-hero" data-cat="' + esc(cat.id) + '">' +
      '<img src="' + esc(cat.image) + '" alt="' + esc(cat.name) + '">' +
      '<span class="cat-principle">' + esc(cat.principle) + '</span>' +
      '<div class="cat-hero-inner">' +
      '<span class="cat-kicker"><span class="line"></span>' + esc(cat.tagline) + '</span>' +
      '<h1>' + esc(cat.name) + '</h1>' +
      '<p class="lede">' + esc(cat.blurb) + '</p>' +
      '<div class="cat-stats">' +
      '<div class="cat-stat"><b>' + formats.length + '</b><span>Formats</span></div>' +
      '<div class="cat-stat"><b>' + week.length + '</b><span>This week</span></div>' +
      '<div class="cat-stat"><b>' + coaches.length + '</b><span>Coaches</span></div>' +
      '<div class="cat-stat"><b>' + (rating ? rating.toFixed(1) : '—') + '</b><span>Avg. rating</span></div>' +
      '</div>' +
      '<div class="row-wrap mt-12">' +
      '<a class="btn btn-cat" href="#/classes?category=' + esc(cat.id) + '">Book ' + esc(cat.short) + ' ' + ui.icon('arrowRight') + '</a>' +
      '<a class="btn btn-outline" href="#/calendar?category=' + esc(cat.id) + '">' + ui.icon('calendar') + 'View schedule</a>' +
      '</div></div></section>';

    /* formats */
    h += '<section class="section" style="margin-top:0"><div class="section-head"><div>' +
      '<span class="eyebrow"><span class="dot" style="background:var(--cat)"></span>The full menu</span>' +
      '<h2>' + formats.length + ' ' + esc(cat.short) + ' formats</h2>' +
      '<p class="lede">Every format is scheduled weekly. Select one to see live sessions, trainers and seats.</p></div>' +
      '<div class="row-wrap"><span class="badge badge-beginner">' + counts.Beginner + ' beginner</span>' +
      '<span class="badge badge-intermediate">' + counts.Intermediate + ' intermediate</span>' +
      '<span class="badge badge-advanced">' + counts.Advanced + ' advanced</span></div></div>' +
      '<div class="discipline-cloud">' + formats.map(function (d) {
        return '<button class="discipline-chip" data-act="find-discipline" data-name="' + esc(d.name) + '">' +
          '<span class="lvl ' + esc(d.difficulty) + '"></span>' + esc(d.name) +
          '<span class="tiny" style="color:var(--ink-4)">' + d.minutes + '′</span></button>';
      }).join('') + '</div></section>';

    /* signatures */
    h += '<div class="card-grid-3 mt-24">' + cat.themes.map(function (theme, i) {
      return '<div class="panel panel-pad" data-cat="' + esc(cat.id) + '">' +
        '<div class="row-between"><span class="badge badge-cat">0' + (i + 1) + '</span><span class="sig-ico">' + ui.catIcon(cat) + '</span></div>' +
        '<h3 class="mt-12">' + esc(theme) + '</h3>' +
        '<p class="tiny muted mt-6">' + esc(signatureCopy(cat.id, i)) + '</p></div>';
    }).join('') + '</div>';

    /* upcoming */
    h += '<section class="section"><div class="section-head"><div><span class="eyebrow"><span class="dot" style="background:var(--cat)"></span>Next up</span>' +
      '<h2>Upcoming ' + esc(cat.short.toLowerCase()) + ' sessions</h2></div>' +
      '<a class="section-link" href="#/classes?category=' + esc(cat.id) + '">All sessions ' + ui.icon('arrowRight') + '</a></div>' +
      (upcoming.length ? '<div class="card-grid stagger">' + upcoming.map(ui.classCard).join('') + '</div>'
        : ui.empty({ icon: 'calendar', title: 'No sessions scheduled', text: 'New sessions are published weekly — check the full timetable.', action: '<a class="btn btn-sm btn-outline mt-8" href="#/calendar">Open calendar</a>' })) +
      '</section>';

    /* coaches */
    h += '<section class="section"><div class="section-head"><div><span class="eyebrow"><span class="dot" style="background:var(--cat)"></span>Your coaches</span>' +
      '<h2>Specialists in ' + esc(cat.short.toLowerCase()) + '</h2></div></div>' +
      '<div class="card-grid-3">' + coaches.map(function (t) {
        var next = S.query({ trainerId: t.id, limit: 1 })[0];
        return '<div class="panel panel-pad" data-cat="' + esc(cat.id) + '">' +
          '<div class="row" style="gap:12px">' + ui.avatar(t.name, t.accent, 'av-lg') +
          '<div class="grow"><h3 style="font-size:14px">' + esc(t.name) + '</h3>' +
          '<p class="tiny muted">' + esc(t.title) + '</p>' +
          '<div class="row mt-4" style="gap:8px"><span class="rating">' + ui.icon('star') + t.baseRating.toFixed(1) + '<small>(' + t.baseReviews + ')</small></span>' +
          '<span class="tiny muted">' + t.years + ' yrs</span></div></div></div>' +
          '<p class="tiny muted mt-12" style="line-height:1.55">' + esc(t.bio) + '</p>' +
          '<div class="row-between mt-12"><span class="tiny" style="color:var(--ink-4)">' + (next ? 'Next: ' + U.relDay(next.date) + ' · ' + U.fmtTime(next.startIso) : 'No upcoming sessions') + '</span>' +
          '<a class="btn btn-sm btn-outline" href="#/classes?trainer=' + esc(t.id) + '">Sessions</a></div></div>';
      }).join('') + '</div></section>';

    /* studios */
    h += '<section class="section"><div class="section-head"><div><span class="eyebrow"><span class="dot" style="background:var(--cat)"></span>Where it happens</span>' +
      '<h2>Studios for ' + esc(cat.short.toLowerCase()) + '</h2></div></div>' +
      '<div class="card-grid-3">' + rooms.map(function (r) {
        var b = S.branchById(r.branchId);
        var nextHere = S.query({ roomId: r.id, limit: 1 })[0];
        return '<div class="panel panel-pad" data-cat="' + esc(cat.id) + '">' +
          '<div class="row-between"><span class="badge badge-ghost">' + esc(b ? b.name : 'Studio') + '</span>' +
          '<span class="tiny muted">' + r.capacity + ' capacity</span></div>' +
          '<h3 class="mt-12" style="font-size:14px">' + esc(r.name) + '</h3>' +
          '<p class="tiny muted mt-4">' + esc(r.note) + '</p>' +
          '<p class="tiny mt-12" style="color:var(--cat)">' + (nextHere ? 'Next session ' + U.relDay(nextHere.date) + ' at ' + U.fmtTime(nextHere.startIso) : 'No sessions in the next 30 days') + '</p></div>';
      }).join('') + '</div></section>';

    return h;
  }

  function signatureCopy(catId, i) {
    var copy = {
      yoga: ['Every class starts with breath and a clear intention, so the body has time to open safely.',
        'Teachers adjust with hands-on cues and props — nobody is left guessing where they should be.',
        'Sessions close with a deliberate downshift: long exhales, supported rest, and time to land.'],
      pilates: ['Springs and bodyweight replace momentum; every rep is slow enough to feel the target.',
        'Clinical sessions begin with a movement screen so loading matches your current capacity.',
        'Mobility work pairs end-range strength with controlled stretching instead of passive hanging.'],
      dance: ['Choreography is broken into repeatable blocks — learn it once, then perform it full-out.',
        'No previous dance experience is assumed. The front row and the back row get the same class.',
        'Playlists are built live by your instructor, so energy tracks the room.'],
      cardio: ['Heart-rate zones drive the session, so effort is measured rather than guessed.',
        'Every interval has a scaled option — the work stays hard, the risk stays low.',
        'Coaches track your outputs across visits so progress is visible week to week.'],
      strength: ['Technique standards come before load — every lift is screened before it gets heavy.',
        'Programmes follow a written block, so you know exactly what week four looks like.',
        'Racks, platforms and calibrated plates mean you are never waiting for equipment.'],
      combat: ['Stance, guard and footwork are drilled first; power is added only once they hold.',
        'Bag and pad rounds are scaled to experience, with contact always optional.',
        'Conditioning mirrors a real fight camp: roadwork, core circuits, and controlled sparring.'],
      aquatic: ['The pool is heated to 28°C and lanes are grouped by ability, not age.',
        'Water resistance loads every direction, giving strength work with zero joint impact.',
        'Coaches stand in the water with you, correcting movement in real time.'],
      specialized: ['Every exercise is offered with a regression and a progression on the spot.',
        'Coaches check in on outcomes — not just attendance — every four weeks.',
        'Groups stay small so nobody disappears at the back of the room.'],
      personal: ['Your first session includes a full assessment and a written plan.',
        'Programming is reviewed weekly and adjusted to sleep, stress and travel.',
        'Body composition scans are explained by a coach, never just handed over.']
    };
    return (copy[catId] || ['', '', ''])[i] || '';
  }

  GY.views = GY.views || {};
  GY.views.category = { render: render, title: 'Category' };
})();
