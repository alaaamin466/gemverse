/* GYMVERSE — daily / weekly / monthly class calendar */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;
  var START_H = 6, END_H = 23, HOUR_H = 46;

  function cal() { return GY.state.calendar; }

  function render() {
    var c = cal();
    var S = GY.store;
    var data = S.calendar({
      view: c.view, date: c.date, category: c.category, branchId: c.branchId,
      trainerId: c.trainerId, difficulty: c.difficulty, minSeats: c.seatsOnly
    });
    var anchor = U.toDate(c.date);

    var h = '<div class="row-between" style="flex-wrap:wrap;gap:12px;margin-bottom:16px">' +
      '<div><span class="eyebrow"><span class="dot"></span>Class scheduling</span>' +
      '<h1 style="font-size:clamp(25px,3vw,36px);margin-top:5px">' + titleFor(c.view, anchor) + '</h1>' +
      '<p class="tiny muted mt-4">' + data.counts.total + ' sessions in view · recurring classes roll forward automatically</p></div>' +
      '<div class="row" style="gap:8px"><button class="btn btn-outline btn-sm" data-act="ics-day">' + ui.icon('download') + 'Export day</button>' +
      '<a class="btn btn-primary btn-sm" href="#/classes">' + ui.icon('grid') + 'Catalogue</a></div></div>';

    h += '<div class="cal-toolbar">' +
      '<div class="tabs">' + [['day', 'Day'], ['week', 'Week'], ['month', 'Month']].map(function (v) {
        return '<button class="tab ' + (c.view === v[0] ? 'is-on' : '') + '" data-act="cal-view" data-view="' + v[0] + '">' + v[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="cal-nav">' +
      '<button class="icon-btn" data-act="cal-nav" data-dir="-1" aria-label="Previous">' + ui.icon('chevronLeft') + '</button>' +
      '<button class="btn btn-outline btn-sm" data-act="cal-nav" data-dir="today">Today</button>' +
      '<button class="icon-btn" data-act="cal-nav" data-dir="1" aria-label="Next">' + ui.icon('chevronRight') + '</button>' +
      '</div>' +
      '<div class="cal-filters">' +
      '<select class="select" onchange="GY.app.setCal(\'category\', this.value)"><option value="">All categories</option>' +
      GY.data.categories.map(function (x) { return '<option value="' + esc(x.id) + '"' + (c.category === x.id ? ' selected' : '') + '>' + esc(x.short) + '</option>'; }).join('') + '</select>' +
      '<select class="select" onchange="GY.app.setCal(\'branchId\', this.value)"><option value="">All branches</option>' +
      S.branches().map(function (b) { return '<option value="' + esc(b.id) + '"' + (c.branchId === b.id ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('') + '</select>' +
      '<select class="select" onchange="GY.app.setCal(\'trainerId\', this.value)"><option value="">All trainers</option>' +
      S.trainers().map(function (t) { return '<option value="' + esc(t.id) + '"' + (c.trainerId === t.id ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') + '</select>' +
      '<select class="select" onchange="GY.app.setCal(\'difficulty\', this.value)"><option value="">Any level</option>' +
      ['Beginner', 'Intermediate', 'Advanced'].map(function (d) { return '<option value="' + d + '"' + (c.difficulty === d ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select>' +
      '</div></div>';

    if (c.view === 'month') h += monthView(data, anchor);
    else if (c.view === 'week') h += weekView(data, anchor);
    else h += dayView(data, anchor);

    return h;
  }

  function titleFor(view, anchor) {
    if (view === 'month') return U.fmtMonthYear(anchor);
    if (view === 'day') return U.fmtDateLong(anchor);
    var mon = U.startOfWeek(anchor);
    var sun = U.addDays(mon, 6);
    return U.MONTHS_SHORT[mon.getMonth()] + ' ' + mon.getDate() + ' – ' + (sun.getMonth() !== mon.getMonth() ? U.MONTHS_SHORT[sun.getMonth()] + ' ' : '') + sun.getDate();
  }

  function monthView(data, anchor) {
    var first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    var start = U.startOfWeek(first);
    var todayKey = U.dateKey(new Date());
    var cells = '';
    for (var i = 0; i < 42; i++) {
      var d = U.addDays(start, i);
      var key = U.dateKey(d);
      var out = d.getMonth() !== anchor.getMonth();
      var list = data.byDate[key] || [];
      cells += '<div class="cal-cell ' + (out ? 'is-out' : '') + ' ' + (key === todayKey ? 'is-today' : '') + '" data-act="cal-day" data-date="' + key + '">' +
        '<div class="cal-date"><span>' + (out ? U.MONTHS_SHORT[d.getMonth()] : '') + '</span><b>' + d.getDate() + '</b></div>' +
        '<div class="cal-items">' + list.slice(0, 3).map(function (s) {
          return '<span class="cal-item" data-cat="' + esc(s.categoryId) + '" data-act="open-session" data-id="' + esc(s.id) + '" title="' + esc(s.name + ' · ' + U.fmtTime(s.startIso)) + '">' +
            '<b>' + esc(U.fmtTime(s.startIso).replace(':00', '')) + '</b>' + esc(s.name) + '</span>';
        }).join('') +
        (list.length > 3 ? '<span class="cal-more">+' + (list.length - 3) + ' more</span>' : '') +
        '</div></div>';
    }
    return '<div class="cal-month">' + U.DAYS_SHORT.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('') + cells + '</div>' +
      '<p class="tiny muted mt-12">' + ui.icon('info') + ' Click any day to open the agenda, or any session to book. Session colours match their discipline.</p>';
  }

  function weekView(data, anchor) {
    var monday = U.startOfWeek(anchor);
    var todayKey = U.dateKey(new Date());
    var now = new Date();
    var height = (END_H - START_H) * HOUR_H;

    var head = '<div class="week-corner"></div>';
    for (var i = 0; i < 7; i++) {
      var d = U.addDays(monday, i);
      var key = U.dateKey(d);
      head += '<div class="week-cell-head ' + (key === todayKey ? 'is-today' : '') + '"><div class="dow">' + U.DAYS_SHORT[d.getDay()] + '</div><div class="dom">' + d.getDate() + '</div></div>';
    }

    var axis = '<div class="week-timeaxis" style="height:' + height + 'px">';
    for (var h = START_H; h <= END_H; h++) {
      axis += '<div class="week-hour-label" style="top:' + ((h - START_H) * HOUR_H) + 'px">' + formatHour(h) + '</div>';
    }
    axis += '</div>';

    var cols = '';
    for (var j = 0; j < 7; j++) {
      var day = U.addDays(monday, j);
      var dayKey = U.dateKey(day);
      var list = data.byDate[dayKey] || [];
      var col = '<div class="week-col ' + (dayKey === todayKey ? 'is-today' : '') + '" style="height:' + height + 'px">';
      list.forEach(function (s) {
        var st = U.toDate(s.startIso);
        var mins = st.getHours() * 60 + st.getMinutes();
        var top = ((mins - START_H * 60) / 60) * HOUR_H;
        var hgt = Math.max(24, (s.duration / 60) * HOUR_H - 3);
        if (top < 0) return;
        col += '<button class="week-slot" data-cat="' + esc(s.categoryId) + '" data-act="open-session" data-id="' + esc(s.id) + '" style="top:' + top + 'px;height:' + hgt + 'px" title="' + esc(s.name + ' · ' + U.fmtTime(s.startIso) + ' · ' + s.trainer.name) + '">' +
          '<b>' + esc(s.name) + '</b><span>' + esc(U.fmtTime(s.startIso)) + ' · ' + esc(s.branch.name.split(' ')[0]) + '</span></button>';
      });
      if (dayKey === todayKey) {
        var nowMin = now.getHours() * 60 + now.getMinutes();
        if (nowMin > START_H * 60 && nowMin < END_H * 60) {
          col += '<div class="week-now" style="top:' + (((nowMin - START_H * 60) / 60) * HOUR_H) + 'px"></div>';
        }
      }
      col += '</div>';
      cols += col;
    }

    return '<div class="week-wrap"><div class="week-view">' + head + axis + cols + '</div></div>' +
      '<div class="legend mt-12">' + GY.data.categories.map(function (c) {
        return '<span class="legend-item" data-cat="' + esc(c.id) + '"><span class="legend-swatch"></span>' + esc(c.short) + '</span>';
      }).join('') + '</div>';
  }

  function dayView(data, anchor) {
    var key = U.dateKey(anchor);
    var list = data.byDate[key] || [];
    if (!list.length) {
      return ui.empty({
        icon: 'calendar', title: 'No classes scheduled',
        text: 'Nothing matches the current filters for ' + U.fmtDateLong(anchor) + '.',
        action: '<div class="row mt-8"><button class="btn btn-sm btn-outline" data-act="cal-nav" data-dir="1">Next day</button>' +
          '<a class="btn btn-sm btn-primary" href="#/classes">Browse catalogue</a></div>'
      });
    }
    var groups = {};
    list.forEach(function (s) {
      var hh = U.toDate(s.startIso).getHours();
      var block = hh < 12 ? 'Morning' : hh < 17 ? 'Afternoon' : 'Evening';
      (groups[block] = groups[block] || []).push(s);
    });
    return ['Morning', 'Afternoon', 'Evening'].filter(function (b) { return groups[b]; }).map(function (block) {
      return '<div class="group-head"><span>' + block + ' · ' + groups[block].length + ' sessions</span></div>' +
        '<div class="day-agenda">' + groups[block].map(function (s) {
          var mine = s.myStatus === 'booked' ? '<span class="badge badge-live"><span class="dot"></span>Booked</span>' : '';
          return '<div class="agenda-row" data-cat="' + esc(s.categoryId) + '">' +
            '<div class="agenda-time"><b>' + esc(U.fmtTime(s.startIso)) + '</b><span>' + esc(U.fmtDuration(s.duration)) + ' · ' + esc(U.fmtTime(s.endIso)) + '</span></div>' +
            '<div class="agenda-main"><div class="t">' + esc(s.name) + mine + ui.difficultyBadge(s.difficulty) + '</div>' +
            '<div class="m">' + esc(s.trainer.name) + ' · ' + esc(s.branch.name) + ' · ' + esc(s.room.name) + ' · ' + esc(s.category.short) + '</div></div>' +
            '<div class="agenda-right"><div class="tiny" style="text-align:right">' + ui.seats(s) + '</div>' +
            '<a class="btn btn-sm btn-cat" href="#/session/' + esc(s.id) + '">' + (s.seats === 0 ? 'Waitlist' : 'Book') + '</a></div></div>';
        }).join('') + '</div>';
    }).join('');
  }

  function formatHour(h) {
    var suffix = h >= 12 ? 'pm' : 'am';
    var hr = h % 12; if (hr === 0) hr = 12;
    return hr + suffix;
  }

  GY.views = GY.views || {};
  GY.views.calendar = { render: render, title: 'Calendar' };
})();
