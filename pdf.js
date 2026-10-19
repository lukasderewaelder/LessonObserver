/* PDF-Berichte für „Mitarbeit“ – rein lokal im Browser (jsPDF + AutoTable aus lib/), es werden keine Daten gesendet. */
(function (root) {
  'use strict';

  var C = {
    r2: [15, 122, 99], r1: [47, 143, 106], r0: [110, 121, 140], rm1: [184, 101, 26], rm2: [192, 57, 43],
    ink: [23, 32, 47], muted: [88, 98, 117], line: [213, 219, 228], soft: [243, 245, 248], brand: [37, 64, 107]
  };
  var KEYS = ['r2', 'r1', 'r0', 'rm1', 'rm2'];
  var VALS = [2, 1, 0, -1, -2];
  var NAMES = ['sehr gut', 'gut', 'mittel', 'schwach', 'sehr schwach'];
  var SYMS = ['++', '+', 'o', '–', '––'];
  var NOTE = 'Ø Tendenz: ++ = 1, + = 2, o = 3, – = 4, –– = 5. Das ist eine Orientierung zum Mitarbeitsverhalten, keine automatische Zeugnisnote.';

  /* ── Text: nur Zeichen, die die Standardschrift darstellen kann ── */
  var bad = 0;
  var WIN = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  var MAP = { '−': '–', '○': 'o', '★': '*', '☆': '*', '✓': 'v', '→': '->', '←': '<-', '≥': '>=', '≤': '<=', ' ': ' ', '​': '', '\t': ' ', '\r': '', '✎': '' };
  function clean(s) {
    s = String(s == null ? '' : s);
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), code = ch.charCodeAt(0);
      if (MAP[ch] !== undefined) { out += MAP[ch]; continue; }
      if (ch === '\n' || (code >= 32 && code < 127) || (code >= 160 && code < 256) || WIN.indexOf(ch) >= 0) { out += ch; continue; }
      if (code >= 0xD800 && code <= 0xDBFF) { i++; }
      if (code >= 0xFE00 && code <= 0xFE0F || code === 0x200D) continue;
      bad++; out += '?';
    }
    return out;
  }
  function num(x, dec) { return x == null ? '–' : x.toFixed(dec == null ? 1 : dec).replace('.', ','); }
  function day(s) { return s ? s.split('-').reverse().join('.') : 'ohne Datum'; }

  /* ── Auswertung der Ereignisse ── */
  function inRange(e, b) { return e.date ? (e.date >= b[0] && e.date <= b[1]) : (b[0] === '0000-00-00' && b[1] === '9999-99-99'); }
  function cmpEv(a, b) {
    if (a.date !== b.date) { if (!a.date) return 1; if (!b.date) return -1; return a.date < b.date ? -1 : 1; }
    return a.ts - b.ts;
  }
  function stats(evs, b) {
    var o = { n: 0, sum: 0, dist: [0, 0, 0, 0, 0], tags: {}, avg: null };
    evs.forEach(function (e) {
      if (!inRange(e, b)) return;
      if (e.type === 'rate') { o.n++; o.sum += 3 - e.val; o.dist[2 - e.val]++; }
      else if (e.type === 'tag') o.tags[e.tag] = (o.tags[e.tag] || 0) + 1;
    });
    o.avg = o.n ? o.sum / o.n : null;
    return o;
  }
  function joker(evs, every) {
    var pts = 0, red = 0;
    evs.forEach(function (e) { if (e.type === 'joker') pts += (e.n || 1); else if (e.type === 'redeem') red++; });
    var earned = Math.floor(pts / every);
    return { pts: pts, red: red, avail: Math.max(0, earned - red), prog: pts % every, every: every };
  }
  function tagName(tags, id, evs) {
    var t = tags.filter(function (x) { return x.id === id; })[0];
    if (t) return t.name;
    var e = evs.filter(function (x) { return x.tag === id; })[0];
    return (e && e.tn) || id;
  }
  function evLabel(e) {
    if (e.type === 'rate') { var i = 2 - e.val; return { art: 'Mitarbeit', txt: NAMES[i] + ' (' + SYMS[i] + ')', rate: i }; }
    if (e.type === 'joker') return { art: 'Joker-Punkt', txt: ((e.n || 1) > 1 ? e.n + ' Punkte' : '1 Punkt') + (e.reason ? ' – ' + e.reason : '') };
    if (e.type === 'redeem') return { art: 'Joker', txt: 'eingelöst' };
    if (e.type === 'tag') return { art: 'Marker', txt: e.tn || 'Marker' };
    if (e.type === 'note') return { art: 'Bemerkung', txt: e.note || '' };
    return { art: e.type, txt: '' };
  }

  /* ── Zeichenhilfen ── */
  function glyph(doc, i, x, y, w, h) {
    doc.setFillColor.apply(doc, C[KEYS[i]]);
    doc.roundedRect(x, y, w, h, 1.2, 1.2, 'F');
    doc.setTextColor(255, 255, 255);
    if (i === 2) {
      doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.5);
      doc.circle(x + w / 2, y + h / 2, h * 0.26, 'S');
    } else {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text(SYMS[i], x + w / 2, y + h * 0.72, { align: 'center' });
    }
    doc.setTextColor.apply(doc, C.ink);
  }
  function heading(doc, text, x, y, w) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor.apply(doc, C.ink);
    doc.text(clean(text), x, y);
    doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.3);
    doc.line(x, y + 1.6, x + w, y + 1.6);
  }

  /* ── Haupteinstieg ── */
  function build(ctx) {
    bad = 0;
    var jsPDF = root.jspdf.jsPDF;
    var landscape = ctx.type === 'course';
    var doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
    var W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    var M = 15, TOP = 24, BOT = H - 17, CW = W - 2 * M;
    var pageCtx = {};
    var courseLabel = clean(ctx.courseName + (ctx.subject ? ' · ' + ctx.subject : ''));
    var meta = clean('Kurs ' + courseLabel + '   |   Zeitraum: ' + ctx.rangeText + '   |   Erstellt am ' + ctx.created);
    var stuName = function (s) { return clean((s.first + ' ' + s.last).trim()); };
    var title = ctx.type === 'student' ? 'Schülerbericht' : ctx.type === 'course' ? 'Kursübersicht' : 'Beobachtungsprotokoll';
    doc.setProperties({ title: 'Mitarbeit – ' + title + ' – ' + courseLabel, subject: 'Mitarbeitsübersicht', author: 'LessonObserver', creator: 'LessonObserver' });

    var evsOf = function (sid) { return ctx.events.filter(function (e) { return e.sid === sid; }); };
    var page = function () { return doc.getNumberOfPages(); };

    /* ─ A: Schülerbericht (Hochformat) ─ */
    function studentReport(s, first) {
      var label = stuName(s) + ' · ' + courseLabel;
      if (!first) doc.addPage();
      pageCtx[page()] = label;
      var all = evsOf(s.id), evs = all.filter(function (e) { return inRange(e, ctx.bounds); }).sort(cmpEv);
      var st = stats(all, ctx.bounds), jk = joker(all, ctx.every);
      var y = TOP;
      var need = function (h) { if (y + h > BOT) { doc.addPage(); pageCtx[page()] = label; y = TOP; } };

      doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.setTextColor.apply(doc, C.ink);
      doc.text(stuName(s), M, y + 5); y += 11;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.muted);
      doc.splitTextToSize(meta, CW).forEach(function (l) { doc.text(l, M, y); y += 4.4; });
      y += 3;

      var bw = (CW - 8) / 3, bh = 21;
      [['Bewertungen', String(st.n), ''], ['Ø Tendenz', num(st.avg), 'Orientierung'], ['Joker-Punkte', String(jk.pts), jk.avail + ' Joker verfügbar']].forEach(function (b, i) {
        var x = M + i * (bw + 4);
        doc.setFillColor.apply(doc, C.soft); doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.3);
        doc.roundedRect(x, y, bw, bh, 2, 2, 'FD');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, C.muted); doc.text(clean(b[0]), x + 4, y + 6);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor.apply(doc, C.ink); doc.text(clean(b[1]), x + 4, y + 14.5);
        if (b[2]) { doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor.apply(doc, C.muted); doc.text(clean(b[2]), x + 4, y + 18.8); }
      });
      y += bh + 4;
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, C.muted);
      doc.splitTextToSize(NOTE, CW).forEach(function (l) { doc.text(l, M, y); y += 4; });
      y += 4;

      if (!evs.length) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor.apply(doc, C.ink);
        doc.text('Keine Einträge im gewählten Zeitraum.', M, y + 4);
        return;
      }

      if (ctx.opt.dist) {
        need(52); heading(doc, 'Verteilung der Bewertungen', M, y, CW); y += 7;
        var max = Math.max.apply(null, st.dist.concat([1])), bx = M + 42, bwid = CW - 42 - 30;
        for (var i = 0; i < 5; i++) {
          glyph(doc, i, M, y - 3.8, 13, 5.6);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.ink);
          doc.text(NAMES[i], M + 16, y);
          doc.setFillColor.apply(doc, C.soft); doc.rect(bx, y - 3.6, bwid, 4.6, 'F');
          if (st.dist[i]) { doc.setFillColor.apply(doc, C[KEYS[i]]); doc.rect(bx, y - 3.6, Math.max(0.8, bwid * st.dist[i] / max), 4.6, 'F'); }
          doc.setFont('helvetica', 'bold'); doc.text(String(st.dist[i]), bx + bwid + 4, y);
          doc.setFont('helvetica', 'normal'); doc.setTextColor.apply(doc, C.muted);
          doc.text(st.n ? Math.round(st.dist[i] / st.n * 100) + ' %' : '–', bx + bwid + 13, y);
          y += 7.4;
        }
        y += 4;
      }

      if (ctx.opt.trend) {
        var rs = evs.filter(function (e) { return e.type === 'rate'; }).slice(-40);
        need(60); heading(doc, 'Zeitlicher Verlauf', M, y, CW); y += 5;
        if (rs.length < 3) {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.muted);
          doc.text('Zu wenige Bewertungen für einen Verlauf (mindestens 3 nötig).', M, y + 5); y += 12;
        } else {
          var cx = M + 22, cw = CW - 22, ch = 40, mid = y + ch / 2;
          doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.25);
          [-2, -1, 0, 1, 2].forEach(function (v) { doc.line(cx, mid - v * 8, cx + cw, mid - v * 8); });
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor.apply(doc, C.muted);
          doc.text('sehr gut', cx - 2, mid - 16 + 1, { align: 'right' }); doc.text('mittel', cx - 2, mid + 1, { align: 'right' }); doc.text('sehr schwach', cx - 2, mid + 16 + 1, { align: 'right' });
          var slot = cw / rs.length, bwd = Math.min(5, slot * 0.7);
          rs.forEach(function (e, k) {
            var h = e.val === 0 ? 1.4 : Math.abs(e.val) * 8, x = cx + k * slot + (slot - bwd) / 2;
            doc.setFillColor.apply(doc, C[KEYS[2 - e.val]]);
            doc.rect(x, e.val >= 0 ? mid - h - (e.val === 0 ? 0.7 : 0) : mid, bwd, h, 'F');
          });
          doc.setTextColor.apply(doc, C.muted);
          doc.text(day(rs[0].date), cx, y + ch + 5);
          doc.text(day(rs[rs.length - 1].date), cx + cw, y + ch + 5, { align: 'right' });
          doc.text('Letzte ' + rs.length + ' Bewertungen, chronologisch', cx + cw / 2, y + ch + 5, { align: 'center' });
          y += ch + 12;
        }
      }

      if (ctx.opt.jm) {
        var rows = [['Joker-Punkte gesamt', String(jk.pts)], ['Joker eingelöst', String(jk.red)], ['Joker verfügbar', String(jk.avail)]];
        Object.keys(st.tags).forEach(function (id) { rows.push([clean(tagName(ctx.tags, id, evs)), String(st.tags[id])]); });
        need(10 + rows.length * 6); heading(doc, 'Joker und Marker', M, y, CW); y += 7;
        rows.forEach(function (r) {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.ink);
          doc.text(r[0], M, y); doc.setFont('helvetica', 'bold'); doc.text(r[1], M + 70, y, { align: 'right' }); y += 6;
        });
        y += 4;
      }

      if (ctx.opt.notes) {
        var notes = evs.filter(function (e) { return e.type === 'note'; });
        need(18); heading(doc, 'Bemerkungen', M, y, CW); y += 7;
        if (!notes.length) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.muted); doc.text('Keine Bemerkungen im Zeitraum.', M, y); y += 8; }
        notes.forEach(function (e) {
          doc.setFontSize(9.5); doc.setFont('helvetica', 'normal');
          var lines = doc.splitTextToSize(clean(e.note), CW - 4);
          need(7 + lines.length * 4.4);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, C.muted); doc.text(day(e.date), M, y); y += 4.2;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.ink);
          lines.forEach(function (l) { doc.text(l, M + 2, y); y += 4.4; });
          y += 2.4;
        });
        y += 2;
      }

      if (ctx.opt.detail) {
        need(20); heading(doc, 'Einzelne Ereignisse', M, y, CW); y += 4;
        doc.autoTable({
          startY: y, margin: { left: M, right: M, top: TOP - 2, bottom: 17 },
          head: [['Datum', 'Art', 'Wertung / Details']],
          body: evs.map(function (e) { var l = evLabel(e); return [day(e.date), l.art, clean(l.txt)]; }),
          styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 1.7, textColor: C.ink, lineColor: C.line, lineWidth: 0.1, overflow: 'linebreak' },
          headStyles: { fillColor: C.brand, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: C.soft },
          columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 28 } },
          rowPageBreak: 'avoid',
          didDrawPage: function () { pageCtx[page()] = label; }
        });
      }
    }

    /* ─ B: Kursübersicht (Querformat) ─ */
    function courseReport() {
      pageCtx[1] = courseLabel;
      var rows = ctx.students.map(function (s) {
        var all = evsOf(s.id), st = stats(all, ctx.bounds), jk = joker(all, ctx.every);
        return { s: s, st: st, jk: jk };
      });
      var tot = 0, sum = 0; rows.forEach(function (r) { tot += r.st.n; sum += r.st.sum; });
      var y = TOP;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor.apply(doc, C.ink);
      doc.text('Kursübersicht – ' + courseLabel, M, y + 5); y += 11;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.muted);
      doc.text(clean('Zeitraum: ' + ctx.rangeText + '   |   Erstellt am ' + ctx.created + '   |   ' + rows.length + ' Schüler:innen, ' + tot + ' Bewertungen, Ø Tendenz Kurs: ' + num(tot ? sum / tot : null)), M, y); y += 6;
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5);
      doc.text(NOTE, M, y); y += 5;
      var head = ['Schüler:in', 'Wertungen', 'Ø Tendenz'], cs = { 0: { cellWidth: 52, fontStyle: 'bold' }, 1: { cellWidth: 22, halign: 'center' }, 2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' } };
      var col = 3, distStart = -1, barCol = -1;
      if (ctx.opt.dist) {
        distStart = col; SYMS.forEach(function (sy) { head.push(sy); cs[col] = { cellWidth: 13, halign: 'center' }; col++; });
        barCol = col; head.push('Verteilung'); cs[col] = { cellWidth: 44 }; col++;
      }
      var jmCol = -1;
      if (ctx.opt.jm) { jmCol = col; head.push('Joker-P.', 'Joker', 'Marker'); cs[col] = { cellWidth: 20, halign: 'center' }; cs[col + 1] = { cellWidth: 16, halign: 'center' }; cs[col + 2] = { cellWidth: 'auto' }; col += 3; }
      var body = rows.map(function (r) {
        var line = [stuName(r.s), String(r.st.n), r.st.avg == null ? '–' : num(r.st.avg)];
        if (ctx.opt.dist) { r.st.dist.forEach(function (n) { line.push(n ? String(n) : '–'); }); line.push(''); }
        if (ctx.opt.jm) {
          line.push(String(r.jk.pts), r.jk.avail ? String(r.jk.avail) : '–',
            clean(Object.keys(r.st.tags).map(function (id) { var t = ctx.tags.filter(function (x) { return x.id === id; })[0]; return (t ? (t.short || t.name) : id) + ' ' + r.st.tags[id]; }).join(', ')) || '–');
        }
        return line;
      });
      var foot = ['Kurs gesamt', String(tot), num(tot ? sum / tot : null)];
      if (ctx.opt.dist) { var dsum = [0, 0, 0, 0, 0]; rows.forEach(function (r) { r.st.dist.forEach(function (n, i) { dsum[i] += n; }); }); dsum.forEach(function (n) { foot.push(String(n)); }); foot.push(''); }
      if (ctx.opt.jm) foot.push('', '', '');
      if (!rows.length) { doc.setFontSize(11); doc.setTextColor.apply(doc, C.ink); doc.text('Der Kurs hat keine Schüler:innen.', M, y + 6); return; }
      doc.autoTable({
        startY: y, margin: { left: M, right: M, top: TOP - 2, bottom: 17 },
        head: [head], body: body, foot: [foot], showHead: 'everyPage', showFoot: 'lastPage',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 1.9, textColor: C.ink, lineColor: C.line, lineWidth: 0.1, overflow: 'linebreak' },
        headStyles: { fillColor: C.brand, textColor: 255, fontStyle: 'bold', halign: 'center' },
        footStyles: { fillColor: C.soft, textColor: C.ink, fontStyle: 'bold', halign: 'center' },
        alternateRowStyles: { fillColor: [250, 251, 253] },
        columnStyles: cs, rowPageBreak: 'avoid',
        didParseCell: function (d) {
          if (d.section === 'head' && distStart >= 0 && d.column.index >= distStart && d.column.index < distStart + 5) d.cell.styles.fillColor = C[KEYS[d.column.index - distStart]];
          if (d.section === 'head' && d.column.index === 0) d.cell.styles.halign = 'left';
          if (d.section === 'foot' && d.column.index === 0) d.cell.styles.halign = 'left';
          if (d.section === 'body' && d.column.index === 0) d.cell.styles.halign = 'left';
          if (d.section === 'body' && d.column.index === 2 && rows[d.row.index].st.avg != null) {
            var k = Math.min(5, Math.max(1, Math.round(rows[d.row.index].st.avg))) - 1;
            d.cell.styles.textColor = C[KEYS[k]];
          }
        },
        didDrawCell: function (d) {
          if (d.section !== 'body' || d.column.index !== barCol || barCol < 0) return;
          var r = rows[d.row.index], n = r.st.n;
          var x = d.cell.x + 2, y2 = d.cell.y + d.cell.height / 2 - 2, w = d.cell.width - 4;
          if (!n) { doc.setDrawColor.apply(doc, C.line); doc.rect(x, y2, w, 4); return; }
          r.st.dist.forEach(function (c2, i) { if (!c2) return; var ww = w * c2 / n; doc.setFillColor.apply(doc, C[KEYS[i]]); doc.rect(x, y2, ww, 4, 'F'); x += ww; });
        },
        didDrawPage: function () { pageCtx[page()] = courseLabel; }
      });
    }

    /* ─ C: Beobachtungsprotokoll (Hochformat) ─ */
    function logReport() {
      pageCtx[1] = courseLabel;
      var single = ctx.students.length === 1;
      var y = TOP;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor.apply(doc, C.ink);
      doc.text('Beobachtungsprotokoll', M, y + 5); y += 11;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, C.muted);
      var who = single ? stuName(ctx.students[0]) + ' · ' : '';
      doc.splitTextToSize(clean(who + 'Kurs ' + courseLabel + '   |   Zeitraum: ' + ctx.rangeText + '   |   Erstellt am ' + ctx.created), CW).forEach(function (l) { doc.text(l, M, y); y += 4.4; });
      y += 3;
      var ids = {}; ctx.students.forEach(function (s) { ids[s.id] = s; });
      var keep = function (e) {
        if (!ids[e.sid] || !inRange(e, ctx.bounds)) return false;
        if (e.type === 'rate') return !!ctx.opt.rates;
        if (e.type === 'note') return !!ctx.opt.notes;
        return !!ctx.opt.jm;
      };
      var evs = ctx.events.filter(keep).sort(cmpEv);
      if (!evs.length) { doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor.apply(doc, C.ink); doc.text('Keine Einträge im gewählten Zeitraum.', M, y + 5); return; }
      var head = single ? ['Datum', 'Art', 'Wertung / Bemerkung'] : ['Datum', 'Schüler:in', 'Art', 'Wertung / Bemerkung'];
      var line = function (e) {
        var l = evLabel(e), r = [day(e.date)];
        if (!single && !ctx.group) r.push(stuName(ids[e.sid]));
        r.push(l.art, clean(l.txt));
        return r;
      };
      var cols = single || ctx.group ? ['Datum', 'Art', 'Wertung / Bemerkung'] : head;
      var body = [];
      if (ctx.group && !single) {
        ctx.students.forEach(function (s) {
          var mine = evs.filter(function (e) { return e.sid === s.id; });
          if (!mine.length) return;
          body.push([{ content: stuName(s) + '  (' + mine.length + ' Einträge)', colSpan: 3, styles: { fillColor: C.soft, fontStyle: 'bold', textColor: C.brand } }]);
          mine.forEach(function (e) { body.push(line(e)); });
        });
      } else evs.forEach(function (e) { body.push(line(e)); });
      var cstyle = cols.length === 3 ? { 0: { cellWidth: 26 }, 1: { cellWidth: 28 } } : { 0: { cellWidth: 26 }, 1: { cellWidth: 38 }, 2: { cellWidth: 28 } };
      doc.autoTable({
        startY: y, margin: { left: M, right: M, top: TOP - 2, bottom: 17 },
        head: [cols], body: body,
        styles: { font: 'helvetica', fontSize: 8.8, cellPadding: 1.9, textColor: C.ink, lineColor: C.line, lineWidth: 0.1, overflow: 'linebreak', valign: 'top' },
        headStyles: { fillColor: C.brand, textColor: 255, fontStyle: 'bold' },
        columnStyles: cstyle, rowPageBreak: 'avoid', showHead: 'everyPage',
        didDrawPage: function () { pageCtx[page()] = courseLabel; }
      });
    }

    if (ctx.type === 'student') ctx.students.forEach(function (s, i) { studentReport(s, i === 0); });
    else if (ctx.type === 'course') courseReport();
    else logReport();

    /* Kopf- und Fußzeile auf allen Seiten, Seitenzahlen */
    var n = page();
    for (var p = 1; p <= n; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, C.brand);
      doc.text('LessonObserver – Mitarbeitsübersicht', M, 11);
      doc.setFont('helvetica', 'normal'); doc.setTextColor.apply(doc, C.muted);
      doc.text(clean(pageCtx[p] || courseLabel), W - M, 11, { align: 'right' });
      doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.3); doc.line(M, 13.5, W - M, 13.5);
      doc.line(M, H - 13, W - M, H - 13);
      doc.setFontSize(7.5);
      doc.text('Ø Tendenz ist eine Orientierung, keine Zeugnisnote.  Erstellt am ' + ctx.created, M, H - 8.5);
      doc.text('Seite ' + p + ' von ' + n, W - M, H - 8.5, { align: 'right' });
    }
    var blob = doc.output('blob');
    return { blob: blob, pages: n, bytes: blob.size, bad: bad };
  }

  root.MitarbeitPdf = { build: build, clean: clean };
})(window);
