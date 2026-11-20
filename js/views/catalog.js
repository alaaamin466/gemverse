/* GYMVERSE — class catalogue with full filtering */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;

  function f() { return GY.state.filters; }

  function buildQuery() {
    var flt = f();
    var q = {
      category: flt.category || null,
      trainerId: flt.trainerId || null,
      branchId: flt.branchId || null,
      difficulty: flt.difficulty || null,
      membership: flt.membership || null,
      timeOfDay: flt.timeOfDay || null,
      maxPrice: flt.maxPrice ? Number(flt.maxPrice) : null,
      minSeats: flt.minSeats ? 1 : null,
      search: flt.search || '',
      sort: flt.sort || 'soonest',
      favoritesOnly: !!flt.favoritesOnly
    };
    if (flt.duration === 'short') q.maxDuration = 44;
    if (flt.duration === 'mid') { q.minDuration = 45; q.maxDuration = 60; }
    if (flt.duration === 'long') q.minDuration = 61;
    if (flt.date === 'today') q.date = U.dateKey(new Date());
    else if (flt.date === 'tomorrow') q.date = U.dateKey(U.addDays(new Date(), 1));
    else if (flt.date === 'week') {
      q.from = U.dateKey(new Date());
      q.to = U.dateKey(U.addDays(new Date(), 6));
    } else if (flt.date === 'month') {
      q.from = U.dateKey(new Date());
      q.to = U.dateKey(U.addDays(new Date(), 29));
    }
    return q;
  }

  function render(ctx) {
    var flt = f();
    var S = GY.store;
    var all = S.query({});
    var results = S.query(buildQuery());
    var limit = GY.state.catalogLimit || 24;
    var visible = results.slice(0, limit);

    var catCounts = {}, trainerCounts = {};
    all.forEach(function (s) {
      catCounts[s.categoryId] = (catCounts[s.categoryId] || 0) + 1;
      trainerCounts[s.trainerId] = (trainerCounts[s.trainerId] || 0) + 1;
    });

    var html = '<div class="row-between" style="margin-bottom:18px;align-items:flex-end;flex-wrap:wrap;gap:12px">' +
      '<div><span class="eyebrow"><span class="dot"></span>Class catalogue</span>' +
      '<h1 style="font-size:clamp(26px,3vw,38px);margin-top:6px">Find your next session</h1>' +
      '<p class="lede" style="margin-top:6px;font-size:13.5px">' + GY.data.disciplines.length + ' formats · ' + S.branches().length + ' branches · live seat counts and waitlists.</p></div>' +
      '<div class="row" style="gap:8px"><a class="btn btn-outline btn-sm" href="#/calendar">' + ui.icon('calendar') + 'Calendar view</a>' +
      '<a class="btn btn-outline btn-sm" href="#/bookings">' + ui.icon('ticket') + 'My bookings</a></div></div>';

    html += '<div class="cat-nav">' + GY.data.categories.map(function (c) {
      return '<a data-cat="' + esc(c.id) + '" href="#/category/' + esc(c.id) + '"><span class="dot"></span>' + esc(c.name) + '</a>';
    }).join('') + '</div>';

    html += '<div class="catalog-layout">' + renderFilters(flt, catCounts, trainerCounts) + '<div>' +
      renderResultsBar(results.length, flt) +
      renderActiveFilters(flt) +
      (visible.length ? renderGroups(visible) : ui.empty({
        icon: 'filter', title: 'No sessions match those filters',
        text: 'Try widening the price range, choosing another day or clearing the trainer filter.',
        action: '<button class="btn btn-outline btn-sm mt-8" data-act="clear-filters">Clear all filters</button>'
      })) +
      (results.length > visible.length ? '<div class="load-more"><button class="btn btn-outline" data-act="load-more">Load ' + Math.min(24, results.length - visible.length) + ' more <span class="tiny muted">(' + (results.length - visible.length) + ' left)</span></button></div>' : '') +
      '</div></div>';

    return html;
  }

  function renderFilters(flt, catCounts, trainerCounts) {
    var S = GY.store;
    var h = '<aside class="filters" id="filters-panel">' +
      '<div class="filters-head"><h3 class="row" style="gap:8px">' + ui.icon('filter') + 'Filters</h3>' +
      '<button class="tiny muted" data-act="clear-filters" style="color:var(--ink-3)">Reset</button></div>' +
      '<div class="filters-body">';

    /* category */
    h += '<div class="filter-group"><h4>Category</h4><div class="filter-list">' +
      '<button class="filter-opt ' + (!flt.category ? 'is-on' : '') + '" data-act="set-filter" data-key="category" data-value="">' +
      tick() + '<span>All disciplines</span><span class="n">' + Object.keys(catCounts).reduce(function (a, k) { return a + catCounts[k]; }, 0) + '</span></button>' +
      GY.data.categories.map(function (c) {
        return '<button class="filter-opt ' + (flt.category === c.id ? 'is-on' : '') + '" data-cat="' + esc(c.id) + '" data-act="set-filter" data-key="category" data-value="' + esc(c.id) + '">' +
          tick() + '<span class="filter-dot"></span><span>' + esc(c.short) + '</span><span class="n">' + (catCounts[c.id] || 0) + '</span></button>';
      }).join('') + '</div></div>';

    /* date + time */
    h += '<div class="filter-group"><h4>When</h4>' +
      '<select class="select" onchange="GY.app.setFilter(\'date\', this.value)">' +
      [['any', 'Any upcoming date'], ['today', 'Today'], ['tomorrow', 'Tomorrow'], ['week', 'Next 7 days'], ['month', 'Next 30 days']].map(function (o) {
        return '<option value="' + o[0] + '"' + (flt.date === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>' +
      '<div class="row-wrap mt-8">' + [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']].map(function (t) {
        return '<button class="chip ' + (flt.timeOfDay === t[0] ? 'is-on' : '') + '" data-act="set-filter" data-key="timeOfDay" data-value="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div></div>';

    /* difficulty */
    h += '<div class="filter-group"><h4>Difficulty</h4><div class="filter-list">' +
      ['Beginner', 'Intermediate', 'Advanced'].map(function (d) {
        return '<button class="filter-opt ' + (flt.difficulty === d ? 'is-on' : '') + '" data-act="set-filter" data-key="difficulty" data-value="' + d + '">' + tick() + '<span>' + d + '</span></button>';
      }).join('') + '</div></div>';

    /* trainer */
    h += '<div class="filter-group"><h4>Trainer</h4><div class="filter-list">' +
      '<button class="filter-opt ' + (!flt.trainerId ? 'is-on' : '') + '" data-act="set-filter" data-key="trainerId" data-value="">' + tick() + '<span>Any trainer</span></button>' +
      S.trainers().map(function (t) {
        return '<button class="filter-opt ' + (flt.trainerId === t.id ? 'is-on' : '') + '" data-cat="' + esc(t.category) + '" data-act="set-filter" data-key="trainerId" data-value="' + esc(t.id) + '">' +
          tick() + '<span>' + esc(t.name) + '</span><span class="n">' + (trainerCounts[t.id] || 0) + '</span></button>';
      }).join('') + '</div></div>';

    /* branch */
    h += '<div class="filter-group"><h4>Branch</h4><div class="filter-list">' +
      '<button class="filter-opt ' + (!flt.branchId ? 'is-on' : '') + '" data-act="set-filter" data-key="branchId" data-value="">' + tick() + '<span>All branches</span></button>' +
      S.branches().map(function (b) {
        return '<button class="filter-opt ' + (flt.branchId === b.id ? 'is-on' : '') + '" data-act="set-filter" data-key="branchId" data-value="' + esc(b.id) + '">' + tick() + '<span>' + esc(b.name) + '</span></button>';
      }).join('') + '</div></div>';

    /* duration + price */
    h += '<div class="filter-group"><h4>Duration</h4>' +
      '<select class="select" onchange="GY.app.setFilter(\'duration\', this.value)">' +
      [['', 'Any length'], ['short', 'Under 45 min'], ['mid', '45 – 60 min'], ['long', 'Over 60 min']].map(function (o) {
        return '<option value="' + o[0] + '"' + (flt.duration === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>';

    h += '<div class="filter-group"><h4>Price</h4>' +
      '<select class="select" onchange="GY.app.setFilter(\'maxPrice\', this.value)">' +
      [[0, 'Any price'], [20, 'Up to $20'], [25, 'Up to $25'], [30, 'Up to $30'], [40, 'Up to $40'], [100, 'Up to $100']].map(function (o) {
        return '<option value="' + o[0] + '"' + (Number(flt.maxPrice) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>';

    /* membership + seats */
    h += '<div class="filter-group"><h4>Access</h4>' +
      '<select class="select" onchange="GY.app.setFilter(\'membership\', this.value)">' +
      [['', 'Any membership'], ['Standard', 'Standard'], ['Plus', 'Plus'], ['Elite', 'Elite']].map(function (o) {
        return '<option value="' + o[0] + '"' + (flt.membership === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>' +
      '<label class="check mt-12"><input type="checkbox" ' + (flt.minSeats ? 'checked' : '') + ' onchange="GY.app.setFilter(\'minSeats\', this.checked)"> Only sessions with open seats</label>' +
      '<label class="check mt-8"><input type="checkbox" ' + (flt.favoritesOnly ? 'checked' : '') + ' onchange="GY.app.setFilter(\'favoritesOnly\', this.checked)"> Saved classes only</label>' +
      '</div>';

    h += '</div></aside>';
    return h;
  }

  function tick() {
    return '<span class="tick">' + ui.icon('check') + '</span>';
  }

  function renderResultsBar(count, flt) {
    return '<div class="results-bar">' +
      '<span class="results-count"><b>' + count + '</b> session' + (count === 1 ? '' : 's') + ' found</span>' +
      '<span class="tiny muted" style="margin-left:auto">Sorted by</span>' +
      '<select class="select" style="width:auto;height:36px;font-size:12px" onchange="GY.app.setFilter(\'sort\', this.value)">' +
      [['soonest', 'Soonest first'], ['popular', 'Most popular'], ['rating', 'Top rated'], ['price-low', 'Price: low to high'], ['price-high', 'Price: high to low'], ['seats', 'Most seats left']].map(function (o) {
        return '<option value="' + o[0] + '"' + (flt.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>';
  }

  function renderActiveFilters(flt) {
    var chips = [];
    if (flt.category) {
      var c = GY.data.categoryById(flt.category);
      chips.push(chip('category', c ? c.name : flt.category));
    }
    if (flt.trainerId) {
      var t = GY.store.trainerById(flt.trainerId);
      chips.push(chip('trainerId', t ? t.name : flt.trainerId));
    }
    if (flt.branchId) {
      var b = GY.store.branchById(flt.branchId);
      chips.push(chip('branchId', b ? b.name : flt.branchId));
    }
    if (flt.difficulty) chips.push(chip('difficulty', flt.difficulty));
    if (flt.timeOfDay) chips.push(chip('timeOfDay', flt.timeOfDay));
    if (flt.membership) chips.push(chip('membership', flt.membership));
    if (flt.duration) chips.push(chip('duration', 'Duration filter'));
    if (Number(flt.maxPrice)) chips.push(chip('maxPrice', 'Under $' + flt.maxPrice));
    if (flt.date && flt.date !== 'any') chips.push(chip('date', 'Date: ' + flt.date));
    if (flt.minSeats) chips.push(chip('minSeats', 'Seats available'));
    if (flt.favoritesOnly) chips.push(chip('favoritesOnly', 'Saved only'));
    if (flt.search) chips.push(chip('search', '"' + flt.search + '"'));
    if (!chips.length) return '';
    return '<div class="active-filters">' + chips.join('') +
      '<button class="active-filter" style="padding-left:10px" data-act="clear-filters">Clear all <span style="opacity:.5">×</span></button></div>';
  }
  function chip(key, label) {
    return '<span class="active-filter">' + esc(label) + '<button data-act="clear-filter" data-key="' + key + '" aria-label="Remove">&times;</button></span>';
  }

  function renderGroups(list) {
    var groups = {};
    list.forEach(function (s) { (groups[s.date] = groups[s.date] || []).push(s); });
    return Object.keys(groups).sort().map(function (date) {
      var sessions = groups[date];
      return '<div class="group-head"><span>' + esc(U.relDay(date)) + ' · ' + esc(U.fmtDateShort(date)) + '</span>' +
        '<span class="badge badge-ghost">' + sessions.length + ' session' + (sessions.length === 1 ? '' : 's') + '</span></div>' +
        '<div class="card-grid stagger">' + sessions.map(ui.classCard).join('') + '</div>';
    }).join('');
  }

  function mount(root) {
    var panel = root.querySelector('#filters-panel');
    /* collapse filter panel on mobile by default */
    if (panel && window.innerWidth <= 900) panel.classList.remove('is-open');
  }

  GY.views = GY.views || {};
  GY.views.catalog = { render: render, mount: mount, title: 'Classes' };
})();
