// views.js — delapan halaman portal, dirender dari data.js + charts.js.
// Setiap view menerima (state, actions): state memegang tahun terpilih,
// jenis chart, urutan tabel, provinsi terpilih, dan tab sosial; actions
// menyediakan rerender() agar kontrol langsung memperbarui halaman.

import {
  YEARS, SERIES, KPI_2024, TRADE_2024, SECTORS_2024, AGE_2024,
  PROVINCES, PROVINCE_SOURCE, TERRITORY, LABOUR_2024, RELEASES,
  PAGES, fmtNum,
} from './data.js';
import { seriesChart, donutChart, hbarChart } from './charts.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function sourceLine(source, year) {
  return `<p class="source">Sumber: ${esc(source)}${year ? ', ' + year : ''}</p>`;
}

function sectionHead(title, sub, source, year) {
  return `<div class="section-head"><h2>${esc(title)}</h2>${sub ? `<p class="section-sub">${esc(sub)}</p>` : ''}${source ? sourceLine(source, year) : ''}</div>`;
}

// Pemilih tahun 2019-2024; mengubah angka dan chart di halaman.
function yearPicker(state, actions, label = 'Tahun data') {
  const wrap = document.createElement('div');
  wrap.className = 'year-picker';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', label);
  const lab = document.createElement('span');
  lab.className = 'year-picker-label';
  lab.textContent = label + ':';
  wrap.appendChild(lab);
  for (const y of YEARS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'year-btn' + (state.year === y ? ' active' : '');
    b.textContent = String(y);
    b.setAttribute('aria-pressed', state.year === y ? 'true' : 'false');
    b.addEventListener('click', () => { state.year = y; actions.rerender(); });
    wrap.appendChild(b);
  }
  return wrap;
}

function kpiCard(kpi) {
  return `<article class="kpi-card">
    <div class="kpi-label">${esc(kpi.label)}</div>
    <div class="kpi-value">${esc(kpi.value)} <span class="kpi-unit">${esc(kpi.unit)}</span></div>
    <div class="kpi-note">${esc(kpi.note)}</div>
    <div class="kpi-source">Sumber: ${esc(kpi.source)}, ${kpi.year}</div>
  </article>`;
}

function fmtPct2(v) {
  return v.toFixed(2).replace('.', ',');
}

// Kartu angka untuk tahun terpilih (berubah saat pemilih tahun dipakai).
function yearKpiRow(state) {
  const y = state.year;
  const items = [
    { label: 'Pertumbuhan PDB', value: fmtPct2(SERIES.pertumbuhanPdb.values[y]) + '%', source: 'BPS' },
    { label: 'Inflasi Desember', value: fmtPct2(SERIES.inflasi.values[y]) + '%', source: 'BPS' },
    { label: 'Pengangguran (Agu)', value: fmtPct2(SERIES.tpt.values[y]) + '%', source: 'BPS/Sakernas' },
    { label: 'Kemiskinan (Sep)', value: fmtPct2(SERIES.kemiskinan.values[y]) + '%', source: 'BPS' },
    { label: 'Penduduk', value: fmtNum(SERIES.penduduk.values[y]) + ' juta', source: 'BPS' },
  ];
  return `<div class="year-kpis"><h3>Angka tahun ${y}</h3><div class="mini-kpis">` +
    items.map((i) => `<div class="mini-kpi"><span class="mini-kpi-label">${esc(i.label)}</span><span class="mini-kpi-value">${esc(i.value)}</span><span class="mini-kpi-source">${esc(i.source)}, ${y}</span></div>`).join('') +
    `</div></div>`;
}

function chartCard(title, chartNode, caption, controls = null) {
  const card = document.createElement('section');
  card.className = 'chart-card';
  const h = document.createElement('h3');
  h.textContent = title;
  card.appendChild(h);
  if (controls) card.appendChild(controls);
  card.appendChild(chartNode);
  if (caption) {
    const p = document.createElement('p');
    p.className = 'chart-caption';
    p.textContent = caption;
    card.appendChild(p);
  }
  return card;
}

function toggleChartType(state, actions) {
  const wrap = document.createElement('div');
  wrap.className = 'chart-toggle';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Jenis chart');
  for (const [type, label] of [['line', 'Garis'], ['bar', 'Batang']]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toggle-btn' + (state.chartType === type ? ' active' : '');
    b.textContent = label;
    b.setAttribute('aria-pressed', state.chartType === type ? 'true' : 'false');
    b.addEventListener('click', () => { state.chartType = type; actions.rerender(); });
    wrap.appendChild(b);
  }
  return wrap;
}

// ---- Tabel provinsi yang bisa diurutkan (klik header kolom) ----
function provinceTable(state, actions) {
  const key = state.sortKey;
  const dir = state.sortDir;
  const rows = [...PROVINCES].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp = typeof av === 'string' ? av.localeCompare(bv, 'id') : av - bv;
    return dir === 'asc' ? cmp : -cmp;
  });
  const table = document.createElement('table');
  table.className = 'data-table';
  const arrow = (k) => (key === k ? (dir === 'asc' ? ' ▲' : ' ▼') : '');
  table.innerHTML = `<caption>10 provinsi berpenduduk terbesar, 2024</caption>
    <thead><tr>
      <th><button type="button" data-sort="name">Provinsi${arrow('name')}</button></th>
      <th><button type="button" data-sort="pop">Penduduk (juta)${arrow('pop')}</button></th>
      <th><button type="button" data-sort="poverty">Kemiskinan (%)${arrow('poverty')}</button></th>
    </tr></thead>
    <tbody>${rows.map((p) => `<tr><td>${esc(p.name)}</td><td>${fmtNum(p.pop)}</td><td>${fmtNum(p.poverty)}</td></tr>`).join('')}</tbody>`;
  table.querySelectorAll('button[data-sort]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.sort;
      if (state.sortKey === k) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortKey = k; state.sortDir = k === 'name' ? 'asc' : 'desc'; }
      actions.rerender();
    });
  });
  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  wrap.appendChild(table);
  const src = document.createElement('p');
  src.className = 'source';
  src.textContent = 'Sumber: ' + PROVINCE_SOURCE;
  wrap.appendChild(src);
  return wrap;
}

// ================= BERANDA =================
export function viewHome(state, actions) {
  const root = document.createElement('div');
  root.className = 'page home';
  root.innerHTML = `
    <section class="hero">
      <p class="hero-eyebrow">Portal Statistik Indonesia &middot; Data resmi ${'2024'}</p>
      <h1>Angka resmi Indonesia,<br><span class="hero-accent">dijelajahi.</span></h1>
      <p class="hero-lede">Arunika menghimpun angka-angka resmi Indonesia — penduduk, ekonomi,
      harga, tenaga kerja, dan sosial — dari Badan Pusat Statistik, lengkap dengan
      sumber dan tahunnya, dalam satu observatorium data.</p>
      <div class="hero-stats">
        <div><strong>281,6 jt</strong><span>penduduk (BPS, 2024)</span></div>
        <div><strong>5,03%</strong><span>pertumbuhan PDB (BPS, 2024)</span></div>
        <div><strong>38</strong><span>provinsi (BPS, 2024)</span></div>
      </div>
    </section>
    <section class="kpi-grid" aria-label="Angka utama 2024">
      ${KPI_2024.map(kpiCard).join('')}
    </section>`;
  const chartSec = document.createElement('section');
  chartSec.className = 'home-chart';
  chartSec.appendChild(sectionHeadEl('Pertumbuhan ekonomi 2019–2024', 'PDB tumbuh di atas 5% sejak 2022, setelah kontraksi pada 2020.', 'BPS', '2019–2024'));
  chartSec.appendChild(yearPicker(state, actions));
  chartSec.appendChild(chartCard(
    'Pertumbuhan PDB (% yoy)',
    seriesChart({ values: SERIES.pertumbuhanPdb.values, years: YEARS, unit: '%', color: '#f6b73c', type: state.chartType, highlightYear: state.year, title: 'Pertumbuhan PDB 2019-2024' }),
    'Pilih tahun di atas untuk menyorot titiknya dan melihat angka tahun itu di bawah.',
    toggleChartType(state, actions),
  ));
  const yk = document.createElement('div');
  yk.innerHTML = yearKpiRow(state);
  chartSec.appendChild(yk.firstElementChild);
  root.appendChild(chartSec);

  const glance = document.createElement('section');
  glance.className = 'glance';
  glance.innerHTML = `
    <h2>Indonesia sekilas</h2>
    <div class="glance-grid">
      <div><strong>${esc(TERRITORY.area)}</strong><span>luas wilayah</span></div>
      <div><strong>${TERRITORY.provinces} provinsi</strong><span>di seluruh nusantara</span></div>
      <div><strong>${esc(TERRITORY.islands)}</strong><span>pulau</span></div>
      <div><strong>US$4.942</strong><span>PDB per kapita (BPS, 2024)</span></div>
      <div><strong>US$4,67 triliun</strong><span>PDB PPP (World Bank, 2024)</span></div>
      <div><strong>68,0%</strong><span>penduduk usia produktif (BPS, 2024)</span></div>
    </div>
    <p class="source">Sumber: BPS, 2024; PDB PPP: World Bank, 2024.</p>`;
  root.appendChild(glance);

  const rel = document.createElement('section');
  rel.className = 'releases';
  rel.innerHTML = `<h2>Rilis terbaru</h2><ul class="release-list">` +
    RELEASES.map((r) => `<li><time>${esc(r.date)}</time><div><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p><span class="source">BPS</span></div></li>`).join('') +
    `</ul>`;
  root.appendChild(rel);

  const nav = document.createElement('nav');
  nav.className = 'quick-links';
  nav.setAttribute('aria-label', 'Jelajahi bagian');
  nav.innerHTML = `<h2>Jelajahi statistik</h2><div class="quick-grid">` +
    PAGES.slice(1).map((p) => `<a href="${p.route}" class="quick-card"><strong>${esc(p.title)}</strong><span>${esc(p.blurb)}</span></a>`).join('') +
    `</div>`;
  root.appendChild(nav);
  return root;
}

function sectionHeadEl(title, sub, source, year) {
  const div = document.createElement('div');
  div.innerHTML = sectionHead(title, sub, source, year);
  return div.firstElementChild;
}

// ================= EKONOMI =================
export function viewEkonomi(state, actions) {
  const root = document.createElement('div');
  root.className = 'page';
  root.innerHTML = `
    <header class="page-head"><p class="page-eyebrow">Bagian</p><h1>Ekonomi</h1>
    <p class="page-lede">PDB, pertumbuhan, struktur sektor, dan perdagangan luar negeri Indonesia.</p></header>
    <div class="kpi-grid small">
      <article class="kpi-card"><div class="kpi-label">PDB 2024</div><div class="kpi-value">US$1.396,3 <span class="kpi-unit">miliar</span></div><div class="kpi-note">PDB per kapita US$4.942; PDB PPP US$4,67 triliun</div><div class="kpi-source">Sumber: BPS; PPP: World Bank, 2024</div></article>
      <article class="kpi-card"><div class="kpi-label">Pertumbuhan 2024</div><div class="kpi-value">5,03 <span class="kpi-unit">%</span></div><div class="kpi-note">Tumbuh di atas 5% tiga tahun berturut-turut</div><div class="kpi-source">Sumber: BPS, 2024</div></article>
      <article class="kpi-card"><div class="kpi-label">Ekspor 2024</div><div class="kpi-value">US$264,70 <span class="kpi-unit">miliar</span></div><div class="kpi-note">Impor US$233,66 miliar; surplus US$31,04 miliar</div><div class="kpi-source">Sumber: BPS, 2024</div></article>
    </div>`;
  const chartSec = document.createElement('section');
  chartSec.appendChild(sectionHeadEl('Pertumbuhan PDB 2019–2024', 'Kontraksi 2020, lalu pulih di atas 5% sejak 2022.', 'BPS', '2019–2024'));
  chartSec.appendChild(yearPicker(state, actions));
  chartSec.appendChild(chartCard(
    'Pertumbuhan PDB (% yoy) — garis atau batang',
    seriesChart({ values: SERIES.pertumbuhanPdb.values, years: YEARS, unit: '%', color: '#f6b73c', type: state.chartType, highlightYear: state.year, title: 'Pertumbuhan PDB 2019-2024' }),
    'Gunakan tombol Garis/Batang untuk mengganti jenis chart; pemilih tahun menyorot satu tahun.',
    toggleChartType(state, actions),
  ));
  const yk = document.createElement('div');
  yk.innerHTML = yearKpiRow(state);
  chartSec.appendChild(yk.firstElementChild);
  root.appendChild(chartSec);

  const donutSec = document.createElement('section');
  donutSec.className = 'donut-sec';
  donutSec.appendChild(sectionHeadEl('Pangsa PDB menurut lapangan usaha', 'Industri pengolahan adalah penyumbang terbesar.', 'BPS', '2024'));
  const donutWrap = document.createElement('div');
  donutWrap.className = 'donut-wrap';
  donutWrap.appendChild(donutChart(SECTORS_2024));
  const legend = document.createElement('ul');
  legend.className = 'donut-legend';
  const colors = ['#f6b73c', '#38d6e8', '#7dd87d', '#c792ea', '#ff8a7a', '#4d6fa8'];
  legend.innerHTML = SECTORS_2024.map((s, i) => `<li><span class="swatch" style="background:${colors[i]}"></span>${esc(s.name)}<strong>${fmtNum(s.share)}%</strong></li>`).join('');
  donutWrap.appendChild(legend);
  donutSec.appendChild(donutWrap);
  root.appendChild(donutSec);

  const trade = document.createElement('section');
  trade.appendChild(sectionHeadEl('Perdagangan luar negeri', 'Neraca perdagangan surplus US$31,04 miliar pada 2024.', 'BPS', '2024'));
  trade.innerHTML += `<div class="trade-grid">
    <div class="trade-card export"><span>Ekspor</span><strong>US$264,70 miliar</strong></div>
    <div class="trade-card import"><span>Impor</span><strong>US$233,66 miliar</strong></div>
    <div class="trade-card surplus"><span>Surplus</span><strong>US$31,04 miliar</strong></div>
  </div><p class="source">Sumber: BPS, 2024.</p>`;
  root.appendChild(trade);
  return root;
}

// ================= PENDUDUK =================
export function viewPenduduk(state, actions) {
  const root = document.createElement('div');
  root.className = 'page';
  root.innerHTML = `
    <header class="page-head"><p class="page-eyebrow">Bagian</p><h1>Penduduk</h1>
    <p class="page-lede">Indonesia adalah negara ke-4 terpadat di dunia, dengan 281,6 juta jiwa pada 2024.</p></header>`;
  const trend = document.createElement('section');
  trend.appendChild(sectionHeadEl('Tren penduduk 2019–2024', 'Penduduk bertambah sekitar 2–3 juta jiwa setiap tahun.', 'BPS', '2019–2024'));
  trend.appendChild(yearPicker(state, actions));
  trend.appendChild(chartCard(
    'Penduduk (juta jiwa)',
    seriesChart({ values: SERIES.penduduk.values, years: YEARS, unit: 'jt', color: '#38d6e8', type: state.chartType, highlightYear: state.year, title: 'Penduduk Indonesia 2019-2024' }),
    'Pemilih tahun menyorot satu tahun pada chart.',
    toggleChartType(state, actions),
  ));
  root.appendChild(trend);

  const age = document.createElement('section');
  age.appendChild(sectionHeadEl('Struktur umur', 'Dua dari tiga penduduk berada di usia produktif — jendela bonus demografi.', 'BPS', '2024 (perkiraan)'));
  age.appendChild(hbarChart(AGE_2024));
  age.insertAdjacentHTML('beforeend', '<p class="source">Sumber: BPS, 2024 (perkiraan).</p>');
  root.appendChild(age);

  const prov = document.createElement('section');
  prov.appendChild(sectionHeadEl('Provinsi berpenduduk terbesar', 'Klik header kolom untuk mengurutkan tabel.', PROVINCE_SOURCE, null));
  prov.appendChild(provinceTable(state, actions));
  prov.insertAdjacentHTML('beforeend', `<p>Lihat detail tiap provinsi di halaman <a href="#/daerah">Daerah</a>.</p>`);
  root.appendChild(prov);
  return root;
}

// ================= HARGA =================
export function viewHarga(state, actions) {
  const root = document.createElement('div');
  root.className = 'page';
  root.innerHTML = `
    <header class="page-head"><p class="page-eyebrow">Bagian</p><h1>Harga</h1>
    <p class="page-lede">Inflasi Indonesia — laju kenaikan harga barang dan jasa yang diukur BPS lewat Indeks Harga Konsumen (IHK).</p></header>
    <div class="kpi-grid small">
      <article class="kpi-card"><div class="kpi-label">Inflasi Desember 2024</div><div class="kpi-value">1,57 <span class="kpi-unit">% yoy</span></div><div class="kpi-note">Terendah dalam enam tahun terakhir</div><div class="kpi-source">Sumber: BPS, 2024</div></article>
      <article class="kpi-card"><div class="kpi-label">Inflasi tertinggi 2019–2024</div><div class="kpi-value">5,51 <span class="kpi-unit">% (Des 2022)</span></div><div class="kpi-note">Puncak pasca-pandemi, lalu melandai</div><div class="kpi-source">Sumber: BPS, 2022</div></article>
    </div>`;
  const chartSec = document.createElement('section');
  chartSec.appendChild(sectionHeadEl('Inflasi Desember, year-on-year', 'Inflasi tahunan (Desember terhadap Desember tahun sebelumnya).', 'BPS', '2019–2024'));
  chartSec.appendChild(yearPicker(state, actions));
  chartSec.appendChild(chartCard(
    'Inflasi (% yoy, Desember)',
    seriesChart({ values: SERIES.inflasi.values, years: YEARS, unit: '%', color: '#ff8a7a', type: state.chartType, highlightYear: state.year, title: 'Inflasi Desember 2019-2024' }),
    'Pemilih tahun menyorot satu tahun pada chart.',
    toggleChartType(state, actions),
  ));
  root.appendChild(chartSec);

  const tableSec = document.createElement('section');
  tableSec.appendChild(sectionHeadEl('Tabel inflasi tahunan', 'Angka Desember setiap tahun; IHK bulanan lengkap tersedia lewat rilis BPS.', 'BPS', '2019–2024'));
  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  wrap.innerHTML = `<table class="data-table"><caption>Inflasi Desember yoy, 2019–2024</caption>
    <thead><tr><th>Tahun</th><th>Inflasi (%)</th><th>Catatan</th></tr></thead>
    <tbody>${YEARS.map((y) => `<tr><td>${y}</td><td>${fmtNum(SERIES.inflasi.values[y])}</td><td>${y === 2022 ? 'Tertinggi dalam periode' : y === 2024 ? 'Terendah dalam periode' : '—'}</td></tr>`).join('')}</tbody></table>
    <p class="source">Sumber: BPS, 2019–2024. IHK dihitung dari harga barang dan jasa di kota-kota yang disurvei BPS.</p>`;
  tableSec.appendChild(wrap);
  root.appendChild(tableSec);

  const note = document.createElement('section');
  note.className = 'note-box';
  note.innerHTML = `<h2>Cara membaca inflasi</h2><p>Inflasi 1,57% pada Desember 2024 berarti harga-harga rata-rata naik 1,57%
    dibanding Desember 2023. BPS mengukurnya lewat IHK: keranjang barang dan jasa yang dibeli rumah tangga.
    Angka bulanan IHK dirilis BPS setiap awal bulan; halaman ini memakai angka Desember tahunan agar tren enam tahun terbaca sekilas.</p>
    <p class="source">Sumber: BPS.</p>`;
  root.appendChild(note);
  return root;
}

// ================= TENAGA KERJA =================
export function viewTenagaKerja(state, actions) {
  const root = document.createElement('div');
  root.className = 'page';
  root.innerHTML = `
    <header class="page-head"><p class="page-eyebrow">Bagian</p><h1>Tenaga Kerja</h1>
    <p class="page-lede">Siapa yang bekerja, siapa yang mencari kerja — dari Survei Angkatan Kerja Nasional (Sakernas) BPS.</p></header>
    <div class="kpi-grid small">
      <article class="kpi-card"><div class="kpi-label">TPT Agustus 2024</div><div class="kpi-value">4,91 <span class="kpi-unit">%</span></div><div class="kpi-note">Turun dari 5,32% pada Agustus 2023</div><div class="kpi-source">Sumber: BPS (Sakernas), 2024</div></article>
      <article class="kpi-card"><div class="kpi-label">Angkatan kerja</div><div class="kpi-value">152,1 <span class="kpi-unit">juta jiwa</span></div><div class="kpi-note">Penduduk usia kerja yang bekerja atau mencari kerja</div><div class="kpi-source">Sumber: BPS (Sakernas), Agustus 2024</div></article>
      <article class="kpi-card"><div class="kpi-label">Penganggur</div><div class="kpi-value">7,47 <span class="kpi-unit">juta orang</span></div><div class="kpi-note">Mencari kerja atau mempersiapkan usaha</div><div class="kpi-source">Sumber: BPS (Sakernas), Agustus 2024</div></article>
    </div>`;
  const chartSec = document.createElement('section');
  chartSec.appendChild(sectionHeadEl('Pengangguran terbuka 2019–2024', 'TPT melonjak saat pandemi 2020, lalu turun tiap tahun hingga 4,91% pada 2024.', 'BPS (Sakernas)', 'Agustus, 2019–2024'));
  chartSec.appendChild(yearPicker(state, actions));
  chartSec.appendChild(chartCard(
    'TPT (% , Agustus)',
    seriesChart({ values: SERIES.tpt.values, years: YEARS, unit: '%', color: '#c792ea', type: state.chartType, highlightYear: state.year, title: 'Tingkat Pengangguran Terbuka 2019-2024' }),
    'Pemilih tahun menyorot satu tahun pada chart.',
    toggleChartType(state, actions),
  ));
  root.appendChild(chartSec);

  const tableSec = document.createElement('section');
  tableSec.appendChild(sectionHeadEl('Tabel TPT tahunan', 'Tingkat Pengangguran Terbuka, Agustus setiap tahun.', 'BPS (Sakernas)', '2019–2024'));
  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  wrap.innerHTML = `<table class="data-table"><caption>TPT Agustus, 2019–2024</caption>
    <thead><tr><th>Tahun</th><th>TPT (%)</th><th>Perubahan dari tahun sebelumnya</th></tr></thead>
    <tbody>${YEARS.map((y, i) => {
      const prev = i > 0 ? SERIES.tpt.values[YEARS[i - 1]] : null;
      const diff = prev === null ? '—' : (SERIES.tpt.values[y] - prev >= 0 ? '+' : '') + fmtNum(Math.round((SERIES.tpt.values[y] - prev) * 100) / 100) + ' poin';
      return `<tr><td>${y}</td><td>${fmtNum(SERIES.tpt.values[y])}</td><td>${diff}</td></tr>`;
    }).join('')}</tbody></table>
    <p class="source">Sumber: BPS (Sakernas), 2019–2024.</p>`;
  tableSec.appendChild(wrap);
  root.appendChild(tableSec);
  return root;
}

// ================= SOSIAL =================
const SOCIAL_TABS = [
  {
    id: 'kemiskinan',
    label: 'Kemiskinan',
    headline: 'Kemiskinan 8,57% pada September 2024',
    body: 'Sebanyak 24,06 juta jiwa hidup di bawah garis kemiskinan pada September 2024 — turun dari 9,36% setahun sebelumnya. Garis kemiskinan adalah batas pengeluaran minimum untuk memenuhi kebutuhan dasar makanan dan bukan makanan.',
    seriesKey: 'kemiskinan',
    color: '#f6b73c',
  },
  {
    id: 'gini',
    label: 'Gini ratio',
    headline: 'Gini ratio 0,379 pada September 2024',
    body: 'Gini ratio mengukur ketimpangan pendapatan: 0 berarti semua orang berpendapatan sama, 1 berarti satu orang menguasai segalanya. Angka 0,379 menempatkan ketimpangan Indonesia pada tingkat sedang.',
    seriesKey: null,
    color: '#38d6e8',
  },
  {
    id: 'ipm',
    label: 'IPM',
    headline: 'IPM 75,02 pada 2024',
    body: 'Indeks Pembangunan Manusia merangkum tiga hal: umur panjang dan hidup sehat, pengetahuan, dan standar hidup layak. Skor 75,02 menempatkan Indonesia pada kategori pembangunan manusia tinggi.',
    seriesKey: null,
    color: '#7dd87d',
  },
];

export function viewSosial(state, actions) {
  const root = document.createElement('div');
  root.className = 'page';
  root.innerHTML = `
    <header class="page-head"><p class="page-eyebrow">Bagian</p><h1>Sosial</h1>
    <p class="page-lede">Kemiskinan, ketimpangan, dan pembangunan manusia — ukuran kesejahteraan di luar angka ekonomi.</p></header>`;
  const tabSec = document.createElement('section');
  tabSec.appendChild(sectionHeadEl('Tiga ukuran kesejahteraan', 'Pilih tab untuk melihat tiap indikator.', 'BPS', '2024'));
  const tabBar = document.createElement('div');
  tabBar.className = 'tab-bar';
  tabBar.setAttribute('role', 'tablist');
  tabBar.setAttribute('aria-label', 'Indikator sosial');
  for (const tab of SOCIAL_TABS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab-btn' + (state.socialTab === tab.id ? ' active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', state.socialTab === tab.id ? 'true' : 'false');
    b.textContent = tab.label;
    b.addEventListener('click', () => { state.socialTab = tab.id; actions.rerender(); });
    tabBar.appendChild(b);
  }
  tabSec.appendChild(tabBar);
  const active = SOCIAL_TABS.find((t) => t.id === state.socialTab) || SOCIAL_TABS[0];
  const panel = document.createElement('div');
  panel.className = 'tab-panel';
  panel.setAttribute('role', 'tabpanel');
  panel.innerHTML = `<h3>${esc(active.headline)}</h3><p>${esc(active.body)}</p><p class="source">Sumber: BPS, 2024.</p>`;
  if (active.seriesKey) {
    panel.appendChild(chartCard(
      'Tingkat kemiskinan (% , September)',
      seriesChart({ values: SERIES.kemiskinan.values, years: YEARS, unit: '%', color: active.color, type: 'line', highlightYear: state.year, title: 'Tingkat kemiskinan 2019-2024' }),
      'Kemiskinan turun ke titik terendah enam tahun pada 2024.',
    ));
  } else if (active.id === 'gini') {
    panel.insertAdjacentHTML('beforeend', `<div class="gini-meter" aria-label="Gini ratio 0,379 dari skala 0 sampai 1">
      <div class="gini-track"><div class="gini-fill" style="width:37.9%"></div><span class="gini-marker" style="left:37.9%"></span></div>
      <div class="gini-scale"><span>0 — setara sempurna</span><span>0,379</span><span>1 — timpang sempurna</span></div></div>`);
  } else {
    panel.insertAdjacentHTML('beforeend', `<div class="ipm-scale" aria-label="IPM 75,02 dari skala 0 sampai 100">
      <div class="ipm-track"><div class="ipm-fill" style="width:75.02%"></div></div>
      <div class="ipm-labels"><span>0</span><strong>75,02 — tinggi</strong><span>100</span></div></div>`);
  }
  tabSec.appendChild(panel);
  root.appendChild(tabSec);

  const faq = document.createElement('section');
  faq.className = 'accordion-sec';
  faq.innerHTML = `<h2>Penjelasan indikator</h2>
    <details><summary>Apa itu garis kemiskinan?</summary><p>Garis kemiskinan adalah nilai rupiah minimum yang dibutuhkan seseorang per bulan untuk memenuhi kebutuhan dasar: makanan setara 2.100 kilokalori per hari plus kebutuhan bukan makanan seperti perumahan, pakaian, dan pendidikan. Penduduk dengan pengeluaran di bawah garis ini digolongkan miskin. Sumber: BPS.</p></details>
    <details><summary>Apa arti Gini ratio 0,379?</summary><p>Gini ratio 0 berarti pendapatan terbagi rata sempurna; 1 berarti satu orang menguasai seluruh pendapatan. Angka 0,379 pada September 2024 berarti ketimpangan Indonesia berada pada tingkat sedang. Sumber: BPS.</p></details>
    <details><summary>Apa saja komponen IPM?</summary><p>IPM disusun dari umur harapan hidup saat lahir, harapan lama sekolah dan rata-rata lama sekolah, serta pengeluaran per kapita yang disesuaikan. Skor 75,02 pada 2024 menempatkan Indonesia pada kategori pembangunan manusia tinggi. Sumber: BPS.</p></details>`;
  root.appendChild(faq);
  return root;
}

// ================= DAERAH =================
export function viewDaerah(state, actions) {
  const root = document.createElement('div');
  root.className = 'page';
  root.innerHTML = `
    <header class="page-head"><p class="page-eyebrow">Bagian</p><h1>Daerah</h1>
    <p class="page-lede">Jelajahi sepuluh provinsi berpenduduk terbesar: pilih provinsi untuk melihat penduduk dan kemiskinannya.</p></header>`;
  const pickerSec = document.createElement('section');
  pickerSec.appendChild(sectionHeadEl('Penjelajah provinsi', 'Pilih provinsi dari daftar atau dari tabel di bawah.', PROVINCE_SOURCE, null));
  const picker = document.createElement('div');
  picker.className = 'province-picker';
  const label = document.createElement('label');
  label.setAttribute('for', 'province-select');
  label.textContent = 'Provinsi:';
  const select = document.createElement('select');
  select.id = 'province-select';
  for (const p of PROVINCES) {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    if (state.selectedProvince === p.name) opt.selected = true;
    select.appendChild(opt);
  }
  select.addEventListener('change', () => { state.selectedProvince = select.value; actions.rerender(); });
  picker.append(label, select);
  pickerSec.appendChild(picker);

  const chips = document.createElement('div');
  chips.className = 'province-chips';
  for (const p of PROVINCES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.selectedProvince === p.name ? ' active' : '');
    b.textContent = p.name;
    b.addEventListener('click', () => { state.selectedProvince = p.name; actions.rerender(); });
    chips.appendChild(b);
  }
  pickerSec.appendChild(chips);

  const sel = PROVINCES.find((p) => p.name === state.selectedProvince) || PROVINCES[0];
  const rank = PROVINCES.findIndex((p) => p.name === sel.name) + 1;
  const share = ((sel.pop / 281.6) * 100).toFixed(1).replace('.', ',');
  const vsNational = (sel.poverty - 8.57).toFixed(1).replace('.', ',');
  const detail = document.createElement('div');
  detail.className = 'province-detail';
  detail.innerHTML = `
    <h3>${esc(sel.name)}</h3>
    <p class="province-rank">Provinsi terpadat ke-${rank} dari 10 provinsi terbesar</p>
    <div class="province-stats">
      <div><span>Penduduk</span><strong>${fmtNum(sel.pop)} juta jiwa</strong></div>
      <div><span>Pangsa penduduk nasional</span><strong>${share}%</strong></div>
      <div><span>Kemiskinan (Sep 2024)</span><strong>${fmtNum(sel.poverty)}%</strong></div>
      <div><span>Selisih vs nasional (8,57%)</span><strong>${sel.poverty > 8.57 ? '+' : ''}${vsNational} poin</strong></div>
    </div>
    <div class="province-bars">
      <div class="pbar-row"><span>Penduduk vs Jawa Barat (50,3 jt)</span><div class="pbar-track"><div class="pbar-fill" style="width:${(sel.pop / 50.3 * 100).toFixed(1)}%"></div></div></div>
      <div class="pbar-row"><span>Kemiskinan vs nasional (8,57%)</span><div class="pbar-track"><div class="pbar-fill amber" style="width:${(sel.poverty / 12 * 100).toFixed(1)}%"></div></div></div>
    </div>
    <p class="source">Sumber: ${esc(PROVINCE_SOURCE)}; pangsa dihitung dari penduduk nasional 281,6 juta (BPS, 2024).</p>`;
  pickerSec.appendChild(detail);
  root.appendChild(pickerSec);

  const tableSec = document.createElement('section');
  tableSec.appendChild(sectionHeadEl('Semua provinsi dalam tabel', 'Klik header kolom untuk mengurutkan.', PROVINCE_SOURCE, null));
  tableSec.appendChild(provinceTable(state, actions));
  root.appendChild(tableSec);
  return root;
}

// ================= DATA & METODOLOGI =================
export function viewData() {
  const root = document.createElement('div');
  root.className = 'page';
  root.innerHTML = `
    <header class="page-head"><p class="page-eyebrow">Bagian</p><h1>Data &amp; Metodologi</h1>
    <p class="page-lede">Unduh dataset yang dipakai portal ini, baca cara angka dihitung, dan lihat sumbernya.</p></header>
    <section>
      <h2>Unduh dataset</h2>
      <p>File CSV di bawah ini berisi angka yang sama dengan yang tampil di chart dan tabel portal ini.</p>
      <ul class="download-list">
        <li><a href="data/ekonomi-2019-2024.csv" download>ekonomi-2019-2024.csv</a><span>Pertumbuhan PDB, inflasi, TPT, kemiskinan, penduduk 2019–2024 (BPS)</span></li>
        <li><a href="data/provinsi-2024.csv" download>provinsi-2024.csv</a><span>10 provinsi terbesar: penduduk dan kemiskinan 2024 (BPS)</span></li>
        <li><a href="data/sektor-pdb-2024.csv" download>sektor-pdb-2024.csv</a><span>Pangsa PDB menurut lapangan usaha 2024 (BPS)</span></li>
      </ul>
    </section>
    <section>
      <h2>Metodologi</h2>
      <ul class="method-list">
        <li><strong>Pertumbuhan PDB</strong> — perubahan PDB harga konstan terhadap tahun sebelumnya (yoy), dihitung BPS dari Produk Domestik Bruto.</li>
        <li><strong>Inflasi</strong> — perubahan Indeks Harga Konsumen (IHK) Desember terhadap Desember tahun sebelumnya (yoy). IHK disusun dari harga barang dan jasa di kota survei BPS.</li>
        <li><strong>TPT</strong> — Tingkat Pengangguran Terbuka: penganggur dibagi angkatan kerja, dari Survei Angkatan Kerja Nasional (Sakernas) BPS setiap Agustus.</li>
        <li><strong>Kemiskinan</strong> — penduduk dengan pengeluaran per kapita di bawah garis kemiskinan, dihitung BPS setiap Maret dan September.</li>
        <li><strong>Gini ratio</strong> — ukuran ketimpangan distribusi pengeluaran/pendapatan, skala 0 (setara sempurna) sampai 1.</li>
        <li><strong>IPM</strong> — Indeks Pembangunan Manusia: gabungan umur harapan hidup, pendidikan, dan pengeluaran per kapita.</li>
        <li><strong>Penduduk provinsi</strong> — perkiraan BPS 2024 untuk 10 provinsi terbesar; angka nasional 281,6 juta jiwa (BPS, 2024).</li>
      </ul>
    </section>
    <section>
      <h2>Sumber</h2>
      <ul class="source-list">
        <li><strong>Badan Pusat Statistik (BPS)</strong> — seluruh angka penduduk, PDB, inflasi, kemiskinan, gini, IPM, perdagangan, dan wilayah, 2019–2024; rilis resmi 2024–2025.</li>
        <li><strong>BPS, Survei Angkatan Kerja Nasional (Sakernas)</strong> — angka pengangguran dan angkatan kerja, Agustus 2024.</li>
        <li><strong>World Bank</strong> — PDB paritas daya beli (PPP) US$4,67 triliun, 2024.</li>
      </ul>
      <p>Arunika adalah portal independen dan bukan situs resmi BPS. Angka dikutip dengan sumber dan tahunnya; periksa rilis asli BPS untuk angka terbaru.</p>
    </section>`;
  return root;
}

export const VIEWS = {
  home: viewHome,
  ekonomi: viewEkonomi,
  penduduk: viewPenduduk,
  harga: viewHarga,
  'tenaga-kerja': viewTenagaKerja,
  sosial: viewSosial,
  daerah: viewDaerah,
  data: viewData,
};
