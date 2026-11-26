// charts.js — menggambar chart SVG dari data, tanpa library.
// Semua chart digambar sebagai SVG inline dengan grid, label sumbu, dan
// nilai pada titik/batang, supaya terbaca juga di screenshot.

const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, text = null) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== null) node.textContent = text;
  return node;
}

function niceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const step = span / count;
  const mag = 10 ** Math.floor(Math.log10(step));
  const norm = step / mag;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  const s = nice * mag;
  const start = Math.floor(min / s) * s;
  const ticks = [];
  for (let v = start; v <= max + s * 0.5; v += s) ticks.push(v);
  return ticks;
}

function fmt(v, decimals = 2) {
  return v.toFixed(decimals).replace('.', ',').replace(/,?0+$/, '').replace(/,$/, '');
}

// Nilai persen selalu dua desimal, sesuai penulisan sumber BPS (3,70%).
function fmtPct(v) {
  return v.toFixed(2).replace('.', ',');
}

// Chart garis atau batang untuk deret tahunan {year: value}.
export function seriesChart({ values, years, unit, color = '#f6b73c', type = 'line', height = 260, highlightYear = null, title = '' }) {
  const W = 640;
  const H = height;
  const padL = 52;
  const padR = 16;
  const padT = 18;
  const padB = 34;
  const nums = years.map((y) => values[y]);
  let min = Math.min(...nums);
  let max = Math.max(...nums);
  if (min > 0) min = Math.min(0, min - (max - min) * 0.15);
  else min -= (max - min) * 0.15;
  max += (max - min) * 0.12;
  const ticks = niceTicks(min, max, 4);
  const fmtVal = (v) => (unit === '%' ? fmtPct(v) : fmt(v));
  const x = (i) => padL + (i * (W - padL - padR)) / (years.length - 1);
  const y = (v) => padT + ((max - v) * (H - padT - padB)) / (max - min);

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': title || `Chart ${unit}`,
    class: 'chart-svg', preserveAspectRatio: 'xMidYMid meet',
  });
  if (title) svg.appendChild(el('title', {}, title));

  // Garis grid + label sumbu Y.
  for (const t of ticks) {
    svg.appendChild(el('line', { x1: padL, x2: W - padR, y1: y(t), y2: y(t), class: 'grid-line' }));
    svg.appendChild(el('text', { x: padL - 8, y: y(t) + 4, class: 'axis-label', 'text-anchor': 'end' }, fmt(t)));
  }
  // Garis nol yang lebih tegas bila rentang melewati nol.
  if (min < 0 && max > 0) {
    svg.appendChild(el('line', { x1: padL, x2: W - padR, y1: y(0), y2: y(0), class: 'zero-line' }));
  }

  if (type === 'bar') {
    const bw = ((W - padL - padR) / years.length) * 0.58;
    years.forEach((yr, i) => {
      const v = values[yr];
      const isHi = highlightYear === yr;
      const top = y(Math.max(v, 0));
      const bot = y(Math.min(v, 0));
      svg.appendChild(el('rect', {
        x: x(i) - bw / 2, y: top, width: bw, height: Math.max(2, bot - top),
        rx: 4, class: isHi ? 'bar bar-hi' : 'bar', fill: isHi ? '#38d6e8' : color,
      }));
      svg.appendChild(el('text', {
        x: x(i), y: (v >= 0 ? top : bot) + (v >= 0 ? -6 : 16), class: 'value-label', 'text-anchor': 'middle',
      }, fmtVal(v) + (unit ? ' ' + unit : '')));
    });
  } else {
    const pts = years.map((yr, i) => `${x(i)},${y(values[yr])}`).join(' ');
    // Area di bawah garis, samar.
    const area = `${padL},${y(0)} ` + pts + ` ${x(years.length - 1)},${y(0)}`;
    svg.appendChild(el('polygon', { points: area, class: 'area-fill', fill: color }));
    svg.appendChild(el('polyline', { points: pts, class: 'line-path', stroke: color, fill: 'none' }));
    years.forEach((yr, i) => {
      const isHi = highlightYear === yr;
      svg.appendChild(el('circle', {
        cx: x(i), cy: y(values[yr]), r: isHi ? 6.5 : 4.5,
        class: isHi ? 'dot dot-hi' : 'dot', fill: isHi ? '#38d6e8' : color,
      }));
      svg.appendChild(el('text', {
        x: x(i), y: y(values[yr]) - 12, class: 'value-label', 'text-anchor': 'middle',
      }, fmtVal(values[yr]) + (unit ? ' ' + unit : '')));
    });
  }

  // Label tahun di sumbu X.
  years.forEach((yr, i) => {
    svg.appendChild(el('text', {
      x: x(i), y: H - 10, class: 'axis-label year-label', 'text-anchor': 'middle',
      'font-weight': highlightYear === yr ? '700' : '400',
      fill: highlightYear === yr ? '#f6b73c' : '',
    }, String(yr)));
  });
  return svg;
}

// Donut pangsa sektor.
export function donutChart(segments, { size = 260, colors = ['#f6b73c', '#38d6e8', '#7dd87d', '#c792ea', '#ff8a7a', '#4d6fa8'] } = {}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const rIn = r * 0.62;
  const svg = el('svg', {
    viewBox: `0 0 ${size} ${size}`, role: 'img', class: 'chart-svg donut',
    'aria-label': 'Donut pangsa sektor PDB 2024',
  });
  svg.appendChild(el('title', {}, 'Pangsa PDB menurut lapangan usaha, 2024'));
  let acc = 0;
  segments.forEach((seg, i) => {
    const a0 = (acc / 100) * Math.PI * 2 - Math.PI / 2;
    acc += seg.share;
    const a1 = (acc / 100) * Math.PI * 2 - Math.PI / 2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + rIn * Math.cos(a1);
    const y2 = cy + rIn * Math.sin(a1);
    const x3 = cx + rIn * Math.cos(a0);
    const y3 = cy + rIn * Math.sin(a0);
    svg.appendChild(el('path', {
      d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${rIn} ${rIn} 0 ${large} 0 ${x3} ${y3} Z`,
      fill: colors[i % colors.length], class: 'donut-slice',
    }));
  });
  const total = el('text', { x: cx, y: cy - 4, class: 'donut-center', 'text-anchor': 'middle' }, 'PDB 2024');
  const total2 = el('text', { x: cx, y: cy + 20, class: 'donut-center-sub', 'text-anchor': 'middle' }, '100%');
  svg.appendChild(total);
  svg.appendChild(total2);
  return svg;
}

// Batang horizontal untuk struktur umur.
export function hbarChart(rows, { color = '#38d6e8' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'hbars';
  const max = Math.max(...rows.map((r) => r.share));
  for (const row of rows) {
    const item = document.createElement('div');
    item.className = 'hbar-row';
    const label = document.createElement('div');
    label.className = 'hbar-label';
    label.textContent = row.group;
    const track = document.createElement('div');
    track.className = 'hbar-track';
    const fill = document.createElement('div');
    fill.className = 'hbar-fill';
    fill.style.width = `${(row.share / max) * 100}%`;
    fill.style.background = color;
    const val = document.createElement('span');
    val.className = 'hbar-value';
    val.textContent = String(row.share).replace('.', ',') + '%';
    fill.appendChild(val);
    track.appendChild(fill);
    const note = document.createElement('div');
    note.className = 'hbar-note';
    note.textContent = row.note;
    item.append(label, track, note);
    wrap.appendChild(item);
  }
  return wrap;
}
