/* GYMVERSE — popular class analytics: attendance, utilisation, trainers, no-shows */
(function () {
  'use strict';
  var GY = window.GY, U = GY.util, ui = GY.ui, esc = U.esc;
  var WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

  function render() {
    var S = GY.store;
    var days = GY.state.analyticsDays || 30;
    var A = S.analytics({ days: days });
    var t = A.totals;
    var cats = A.categoryStats.filter(function (c) { return c.sessions > 0; });
    var topCat = cats.slice().sort(function (a, b) { return b.enrolled - a.enrolled; })[0];
    var peak = A.hours.slice().sort(function (a, b) { return b.enrolled - a.enrolled; })[0];
    var busiest = A.weekday.slice().sort(function (a, b) { return b.enrolled - a.enrolled; })[0];
    var past = S.query({ from: A.from, to: U.dateKey(new Date()), includePast: true })
      .filter(function (s) { return s.ended; })
      .sort(function (a, b) { return b.startIso.localeCompare(a.startIso); })
      .slice(0, 8);

    var h = '<div class="row-between" style="flex-wrap:wrap;gap:14px;margin-bottom:18px">' +
      '<div><span class="eyebrow"><span class="dot"></span>Studio intelligence</span>' +
      '<h1 style="font-size:clamp(25px,3vw,36px);margin-top:5px">Class analytics</h1>' +
      '<p class="tiny muted mt-4">Rolling ' + days + ' days · ' + esc(U.fmtDateShort(A.from)) + ' → today · 3 branches, ' + cats.length + ' disciplines active</p></div>' +
      '<div class="row" style="gap:8px;flex-wrap:wrap">' +
      '<div class="tabs">' + [7, 30, 90].map(function (d) {
        return '<button class="tab ' + (days === d ? 'is-on' : '') + '" data-act="analytics-range" data-days="' + d + '">' + d + ' days</button>';
      }).join('') + '</div>' +
      '<button class="btn btn-outline btn-sm" data-act="export-analytics">' + ui.icon('download') + 'Export CSV</button></div></div>';

    /* highlights */
    h += '<div class="panel panel-pad mb-16" data-cat="' + esc(topCat ? topCat.id : 'yoga') + '">' +
      '<div class="row-between" style="flex-wrap:wrap;gap:16px">' +
      '<div><span class="eyebrow" style="color:var(--cat)"><span class="dot" style="background:var(--cat)"></span>Most booked discipline</span>' +
      '<h2 style="font-size:22px;margin-top:6px">' + esc(topCat ? topCat.full : 'No data') + '</h2>' +
      '<p class="tiny muted mt-4">' + (topCat ? topCat.sessions + ' sessions · ' + topCat.enrolled + ' seats filled · ' + topCat.fill + '% capacity used' : '') + '</p></div>' +
      '<div class="row" style="gap:26px;flex-wrap:wrap">' +
      '<div class="kv"><dt>Busiest day</dt><dd>' + esc(busiest ? U.DAYS[busiest.dow] : '—') + '</dd></div>' +
      '<div class="kv"><dt>Peak hour</dt><dd>' + esc(peak ? U.fmtTime('2000-01-01T' + U.pad(peak.hour) + ':00') : '—') + '</dd></div>' +
      '<div class="kv"><dt>Avg. rating</dt><dd>' + t.avgRating.toFixed(1) + ' / 5</dd></div>' +
      '<div class="kv"><dt>Waitlisted</dt><dd>' + t.waitlisted + ' members</dd></div>' +
      '</div></div></div>';

    /* KPI */
    h += '<div class="stat-grid stagger">' +
      stat('Sessions delivered', t.sessions, t.upcoming + ' still scheduled') +
      stat('Seats filled', t.enrolled, 'out of ' + t.capacity + ' capacity') +
      stat('Average fill rate', t.fillRate + '%', 'across every discipline') +
      stat('Class revenue', U.money(t.revenue), 'at ' + U.money(t.enrolled ? Math.round(t.revenue / t.enrolled) : 0) + ' avg / seat') +
      stat('Attendance rate', t.attendanceRate + '%', t.noShowRate + '% no-show rate') +
      '</div>';

    h += '<div class="analytics-grid mt-20">';

    /* attendance trend */
    h += panel('Attendance trend', 'Completed sessions per day · seats actually used', sparkline(A.daily), 'span-2',
      '<div class="row" style="gap:18px;flex-wrap:wrap">' +
      '<div class="kv"><dt>Attended</dt><dd>' + U.sum(A.daily, function (d) { return d.attended; }) + '</dd></div>' +
      '<div class="kv"><dt>Avg / day</dt><dd>' + Math.round(U.avg(A.daily, function (d) { return d.attended; })) + '</dd></div>' +
      '<div class="kv"><dt>Sessions</dt><dd>' + U.sum(A.daily, function (d) { return d.sessions; }) + '</dd></div></div>');

    /* category donut */
    h += panel('Category mix', 'Share of filled seats by discipline', donut(cats), '',
      legend(cats));

    /* peak hours */
    h += panel('Peak booking hours', 'Filled seats by start time', barChart(
      A.hours.filter(function (x) { return x.hour >= 6 && x.hour <= 21; }).map(function (x) {
        return { label: hourLabel(x.hour), value: x.enrolled, tip: x.sessions + ' sessions' };
      }), 'cardio'), '',
      '<p class="tiny muted mt-8">' + ui.icon('info') + ' Evenings dominate weekday demand — the 6–8 PM band is where waitlists form first.</p>');

    /* weekdays */
    h += panel('Busiest weekdays', 'Filled seats by day of week', barChart(
      WEEK_ORDER.map(function (d) {
        var row = A.weekday.filter(function (x) { return x.dow === d; })[0] || { enrolled: 0, sessions: 0 };
        return { label: U.DAYS_SHORT[d], value: row.enrolled, tip: row.sessions + ' sessions' };
      }), 'dance'), '',
      '<p class="tiny muted mt-8">' + esc(busiest ? U.DAYS[busiest.dow] : 'Monday') + ' carries the heaviest load at ' + (busiest ? busiest.enrolled : 0) + ' seats.</p>');

    /* top sessions */
    h += '<div class="panel span-2"><div class="panel-head"><div><h3>Top performing sessions</h3>' +
      '<p class="tiny">Ranked by fill rate before session start</p></div>' +
      '<a class="section-link" href="#/classes?sort=popular">Full catalogue ' + ui.icon('arrowRight') + '</a></div>' +
      '<div class="panel-body" style="padding-top:4px">' + (A.topSessions.length ? A.topSessions.map(function (s, i) {
        var pct = Math.round((s.enrolled / s.capacity) * 100);
        return '<a class="top-row" data-act="open-session" data-id="' + esc(s.id) + '" href="#/session/' + esc(s.id) + '" data-cat="' + esc(s.categoryId) + '">' +
          '<span class="top-rank">' + (i + 1) + '</span>' +
          '<span class="top-main"><span class="t">' + esc(s.name) + '</span>' +
          '<span class="m">' + esc(U.relDay(s.date)) + ' · ' + esc(U.fmtTime(s.startIso)) + ' · ' + esc(s.trainer.name) + ' · ' + esc(s.category.short) + '</span></span>' +
          '<span class="top-bar"><span class="bar-track"><span class="bar-fill" style="width:' + U.clamp(pct, 3, 100) + '%"></span></span></span>' +
          '<span class="tiny mono" style="width:78px;text-align:right;color:var(--ink-2)">' + s.enrolled + '/' + s.capacity + ' · ' + pct + '%</span></a>';
      }).join('') : '<p class="tiny muted" style="padding:14px 0">No sessions in this window.</p>') + '</div></div>';

    /* trainers */
    h += '<div class="panel"><div class="panel-head"><div><h3>Trainer leaderboard</h3>' +
      '<p class="tiny">Students coached in the window</p></div><span class="badge badge-ghost">' + A.trainers.length + ' coaches</span></div>' +
      '<div class="panel-flush"><table class="table"><thead><tr><th>Trainer</th><th>Classes</th><th>Students</th><th>Fill</th><th>Rating</th></tr></thead><tbody>' +
      A.trainers.slice(0, 8).map(function (tr) {
        return '<tr><td><div class="row" style="gap:8px"><span class="av" style="width:24px;height:24px;font-size:9px;border-radius:7px;background:' + esc(tr.accent) + '">' + esc(U.initials(tr.name)) + '</span>' +
          '<span class="strong">' + esc(tr.name) + '</span></div></td>' +
          '<td>' + tr.sessions + '</td><td>' + tr.enrolled + '</td>' +
          '<td><span class="mono">' + tr.fill + '%</span></td>' +
          '<td><span class="rating">' + ui.icon('star') + tr.rating.toFixed(1) + '</span></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    /* branches */
    h += '<div class="panel panel-pad"><div class="row-between"><h3>Branch utilisation</h3>' +
      '<span class="tiny muted">Seats / capacity</span></div>' +
      '<div class="hbars mt-16">' + A.branches.map(function (b) {
        return '<div class="hbar"><span class="lab">' + esc(b.name) + '</span>' +
          '<span class="bar-track"><span class="bar-fill" style="width:' + U.clamp(b.fill, 2, 100) + '%"></span></span>' +
          '<span class="val">' + b.fill + '%</span></div>';
      }).join('') + '</div>' +
      '<div class="row mt-16" style="gap:18px;flex-wrap:wrap">' + A.branches.map(function (b) {
        return '<div class="kv"><dt>' + esc(b.name.split(' ')[0]) + '</dt><dd>' + b.sessions + ' classes</dd></div>';
      }).join('') + '</div></div>';

    /* split panels */
    h += '<div class="panel panel-pad"><div class="row-between"><h3>Difficulty &amp; access split</h3>' +
      '<span class="tiny muted">Seats filled</span></div>' +
      splitBars('Difficulty', A.difficulty, 'level') +
      splitBars('Membership', A.membership, 'tier') + '</div>';

    /* no-shows */
    h += '<div class="panel span-2"><div class="panel-head"><div><h3>Attendance &amp; no-show history</h3>' +
      '<p class="tiny">Every completed session keeps its roster, attendance and no-show record</p></div>' +
      '<span class="badge ' + (t.noShowRate > 8 ? 'badge-warn' : 'badge-beginner') + '">' + t.noShowRate + '% no-show</span></div>' +
      '<div class="panel-flush"><table class="table"><thead><tr><th>Session</th><th>Date</th><th>Trainer</th><th>Booked</th><th>Attended</th><th>No-show</th><th>Rate</th></tr></thead><tbody>' +
      (past.length ? past.map(function (s) {
        var sum = GY.store.attendanceSummary(s.id);
        var attended = Math.max(sum.attended, s.raw.pastAttended || 0);
        var noShow = Math.max(sum.noShow, s.raw.pastNoShow || 0);
        var rate = attended + noShow ? Math.round((attended / (attended + noShow)) * 100) : 100;
        return '<tr><td><a class="strong" href="#/session/' + esc(s.id) + '">' + esc(s.name) + '</a></td>' +
          '<td>' + esc(U.fmtDateShort(s.date)) + '</td><td>' + esc(s.trainer.name) + '</td>' +
          '<td>' + s.enrolled + '</td><td style="color:#8bf0bd">' + attended + '</td>' +
          '<td style="color:#ff9c9c">' + noShow + '</td><td class="mono">' + rate + '%</td></tr>';
      }).join('') : '<tr><td colspan="7" class="tiny muted" style="padding:18px">No completed sessions in this window.</td></tr>') +
      '</tbody></table></div></div>';

    h += '</div>';
    return h;
  }

  function stat(label, value, foot) {
    return '<div class="stat"><span class="stat-label">' + esc(label) + '</span>' +
      '<span class="stat-value">' + esc(String(value)) + '</span>' +
      '<span class="stat-foot">' + esc(foot) + '</span></div>';
  }

  function panel(title, sub, body, cls, foot) {
    return '<div class="panel ' + (cls || '') + '"><div class="panel-head"><div><h3>' + esc(title) + '</h3>' +
      '<p class="tiny">' + esc(sub) + '</p></div></div>' +
      '<div class="panel-body">' + body + (foot || '') + '</div></div>';
  }

  function hourLabel(hour) {
    var suffix = hour >= 12 ? 'pm' : 'am';
    var hr = hour % 12; if (hr === 0) hr = 12;
    return hr + suffix;
  }

  function barChart(points, catId) {
    var max = Math.max.apply(null, points.map(function (p) { return p.value; }).concat([1]));
    return '<div class="chart" data-cat="' + catId + '">' + points.map(function (p) {
      var hgt = Math.max(3, Math.round((p.value / max) * 100));
      return '<div class="chart-col" title="' + esc(p.label + ' · ' + p.value + ' seats' + (p.tip ? ' · ' + p.tip : '')) + '">' +
        '<span class="chart-val">' + p.value + '</span>' +
        '<div class="chart-bar" style="height:' + hgt + '%"></div>' +
        '<span class="chart-lab">' + esc(p.label) + '</span></div>';
    }).join('') + '</div>';
  }

  function donut(cats) {
    var total = U.sum(cats, function (c) { return c.enrolled; }) || 1;
    var acc = 0;
    var stops = cats.filter(function (c) { return c.enrolled > 0; }).map(function (c) {
      var a = (acc / total) * 360;
      acc += c.enrolled;
      var b = (acc / total) * 360;
      return c.accent + ' ' + a.toFixed(1) + 'deg ' + b.toFixed(1) + 'deg';
    });
    return '<div class="donut-wrap"><div class="donut" style="background:conic-gradient(' + stops.join(',') + ')">' +
      '<div class="donut-center"><div><b>' + total + '</b><span>seats</span></div></div></div>' +
      '<div class="stack gap-6 grow">' + cats.slice(0, 5).map(function (c) {
        return '<div class="row-between" style="font-size:11.5px">' +
          '<span class="row" style="gap:7px"><span style="width:8px;height:8px;border-radius:2px;background:' + c.accent + '"></span>' + esc(c.name) + '</span>' +
          '<span class="mono muted">' + Math.round((c.enrolled / total) * 100) + '%</span></div>';
      }).join('') + '</div></div>';
  }

  function legend(cats) {
    return '<div class="legend mt-16">' + cats.map(function (c) {
      return '<a class="legend-item" data-cat="' + esc(c.id) + '" href="#/classes?category=' + esc(c.id) + '">' +
        '<span class="legend-swatch"></span>' + esc(c.name) + '<span class="tiny muted">' + c.fill + '%</span></a>';
    }).join('') + '</div>';
  }

  function splitBars(title, rows, key) {
    var total = U.sum(rows, function (r) { return r.enrolled; }) || 1;
    var max = Math.max.apply(null, rows.map(function (r) { return r.enrolled; }).concat([1]));
    return '<p class="tiny" style="color:var(--ink-4);margin:16px 0 8px;letter-spacing:.1em;text-transform:uppercase">' + esc(title) + '</p>' +
      '<div class="hbars">' + rows.map(function (r) {
        return '<div class="hbar"><span class="lab">' + esc(r[key]) + '</span>' +
          '<span class="bar-track"><span class="bar-fill" style="width:' + U.clamp(Math.round((r.enrolled / max) * 100), 2, 100) + '%"></span></span>' +
          '<span class="val">' + r.enrolled + '</span></div>';
      }).join('') + '</div>' +
      '<p class="tiny muted mt-8">' + rows.map(function (r) { return esc(r[key]) + ' ' + Math.round((r.enrolled / total) * 100) + '%'; }).join(' · ') + '</p>';
  }

  function sparkline(daily) {
    if (!daily.length) return '';
    var w = 320, hgt = 92;
    var max = Math.max.apply(null, daily.map(function (d) { return d.attended; }).concat([1]));
    var step = daily.length > 1 ? w / (daily.length - 1) : w;
    var pts = daily.map(function (d, i) {
      return [i * step, hgt - 8 - (d.attended / max) * (hgt - 20)];
    });
    var line = pts.map(function (p, i) {
      return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }).join(' ');
    var area = line + ' L' + w + ' ' + hgt + ' L0 ' + hgt + ' Z';
    var last = pts[pts.length - 1];
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + hgt + '" preserveAspectRatio="none" role="img" aria-label="Attendance trend">' +
      '<defs><linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(215,255,79,.42)"/><stop offset="100%" stop-color="rgba(215,255,79,0)"/></linearGradient></defs>' +
      '<path class="area" d="' + area + '"/><path class="line" d="' + line + '" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="3" vector-effect="non-scaling-stroke"/></svg>';
  }

  GY.views = GY.views || {};
  GY.views.analytics = { render: render, title: 'Analytics' };
})();
