/* GYMVERSE — shared utilities (dates, formatting, DOM, randomness) */
(function () {
  'use strict';
  var GY = (window.GY = window.GY || {});

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYS_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  /* Parse "2026-11-20" or "2026-11-20T07:30" as local time. */
  function toDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value === 'number') return new Date(value);
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(String(value));
    if (!m) return new Date(value);
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), 0, 0);
  }
  function dateKey(d) { d = toDate(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function timeKey(d) { d = toDate(d); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function isoAt(dayKey, hm) { return dayKey + 'T' + hm; }
  function addDays(d, n) { d = toDate(d); var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function addMinutes(d, n) { return new Date(toDate(d).getTime() + n * 60000); }
  function addMonths(d, n) { d = toDate(d); var x = new Date(d.getFullYear(), d.getMonth() + n, 1); return x; }
  function startOfDay(d) { d = toDate(d); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function startOfWeek(d) {
    d = startOfDay(d);
    var day = d.getDay();             // 0 = Sunday
    var diff = (day + 6) % 7;         // Monday-first
    return addDays(d, -diff);
  }
  function sameDay(a, b) { return dateKey(a) === dateKey(b); }
  function minutesBetween(a, b) { return Math.round((toDate(b) - toDate(a)) / 60000); }
  function parseHM(hm) { var p = String(hm).split(':'); return +p[0] * 60 + (+p[1] || 0); }

  function fmtTime(value) {
    var d = toDate(value); var h = d.getHours(); var m = d.getMinutes();
    var ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h === 0) h = 12;
    return h + ':' + pad(m) + ' ' + ap;
  }
  function fmtTime24(value) { return timeKey(value); }
  function fmtDateLong(value) {
    var d = toDate(value);
    return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
  }
  function fmtDateShort(value) {
    var d = toDate(value);
    return DAYS_SHORT[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()];
  }
  function fmtDateNumeric(value) {
    var d = toDate(value); return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtMonthYear(value) {
    var d = toDate(value); return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function weekdayShort(value) { return DAYS_SHORT[toDate(value).getDay()]; }
  function fmtRange(startIso, endIso) {
    return fmtTime(startIso) + ' – ' + fmtTime(endIso);
  }
  function fmtDuration(mins) {
    mins = +mins;
    if (mins < 60) return mins + ' min';
    var h = Math.floor(mins / 60), m = mins % 60;
    return m ? h + 'h ' + m + 'm' : h + 'h';
  }
  function relDay(value) {
    var d = startOfDay(value), today = startOfDay(new Date());
    var diff = Math.round((d - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 1 && diff < 7) return DAYS[d.getDay()];
    return fmtDateShort(d);
  }
  function timeOfDay(hour) {
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
  function timeOfDayLabel(hour) {
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  function money(n) {
    n = Number(n) || 0;
    return '$' + (Number.isInteger(n) ? n : n.toFixed(2));
  }
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join('');
  }
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  var uidCounter = 0;
  function uid(prefix) {
    uidCounter += 1;
    return (prefix || 'id') + '_' + Date.now().toString(36) + uidCounter.toString(36);
  }

  /* Deterministic PRNG so demo data is stable for a given seed. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function debounce(fn, wait) {
    var t; return function () {
      var ctx = this, args = arguments;
      clearTimeout(t); t = setTimeout(function () { fn.apply(ctx, args); }, wait || 120);
    };
  }
  function range(n) { var out = []; for (var i = 0; i < n; i++) out.push(i); return out; }
  function sum(arr, fn) { return arr.reduce(function (a, b) { return a + (fn ? fn(b) : b); }, 0); }
  function avg(arr, fn) { return arr.length ? sum(arr, fn) / arr.length : 0; }
  function pct(part, total) { return total ? Math.round((part / total) * 100) : 0; }
  function overlap(aStart, aEnd, bStart, bEnd) {
    return toDate(aStart) < toDate(bEnd) && toDate(bStart) < toDate(aEnd);
  }

  function el(html) {
    var tpl = document.createElement('template');
    tpl.innerHTML = String(html).trim();
    return tpl.content.firstElementChild;
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function icsDate(value) {
    var d = toDate(value);
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }
  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
  }
  function durationToEnd(startIso, minutes) { return timeKey(addMinutes(toDate(startIso), minutes)); }

  GY.util = {
    MONTHS: MONTHS, MONTHS_SHORT: MONTHS_SHORT, DAYS: DAYS, DAYS_SHORT: DAYS_SHORT, DAYS_MIN: DAYS_MIN,
    pad: pad, clamp: clamp, toDate: toDate, dateKey: dateKey, timeKey: timeKey, isoAt: isoAt,
    addDays: addDays, addMinutes: addMinutes, addMonths: addMonths, startOfDay: startOfDay,
    startOfWeek: startOfWeek, sameDay: sameDay, minutesBetween: minutesBetween, parseHM: parseHM,
    fmtTime: fmtTime, fmtTime24: fmtTime24, fmtDateLong: fmtDateLong, fmtDateShort: fmtDateShort,
    fmtDateNumeric: fmtDateNumeric, fmtMonthYear: fmtMonthYear, weekdayShort: weekdayShort,
    fmtRange: fmtRange, fmtDuration: fmtDuration, relDay: relDay, timeOfDay: timeOfDay,
    timeOfDayLabel: timeOfDayLabel, money: money, initials: initials, esc: esc, slug: slug,
    uid: uid, rng: rng, hash: hash, pick: pick, debounce: debounce, range: range,
    sum: sum, avg: avg, pct: pct, overlap: overlap, el: el, qs: qs, qsa: qsa,
    icsDate: icsDate, download: download, durationToEnd: durationToEnd
  };
})();
