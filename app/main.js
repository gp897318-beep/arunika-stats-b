// main.js — router hash, navigasi sidebar, pencarian, dan state global.
// State: tahun terpilih (2019-2024), jenis chart, urutan tabel, provinsi
// terpilih, tab sosial. Semua kontrol memanggil rerender() lewat actions.

import { PAGES, SEARCH_INDEX } from './data.js';
import { VIEWS } from './views.js';

const state = {
  year: 2024,
  chartType: 'line',
  sortKey: 'pop',
  sortDir: 'desc',
  selectedProvince: 'Jawa Barat',
  socialTab: 'kemiskinan',
};

const app = document.getElementById('app');
const navList = document.getElementById('nav-list');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// Bangun navigasi sidebar dari daftar halaman.
for (const page of PAGES) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = page.route;
  a.dataset.pageId = page.id;
  a.innerHTML = `<span class="nav-title"></span><span class="nav-blurb"></span>`;
  a.querySelector('.nav-title').textContent = page.title;
  a.querySelector('.nav-blurb').textContent = page.blurb;
  li.appendChild(a);
  navList.appendChild(li);
}

function currentPageId() {
  const hash = window.location.hash || '#/';
  const id = hash.replace(/^#\//, '').replace(/\/$/, '') || 'home';
  return VIEWS[id] ? id : 'home';
}

const actions = {
  rerender() { render(); },
};

function render() {
  const id = currentPageId();
  const view = VIEWS[id];
  app.innerHTML = '';
  app.appendChild(view(state, actions));
  // Tandai link aktif di sidebar.
  navList.querySelectorAll('a').forEach((a) => {
    a.classList.toggle('active', a.dataset.pageId === id);
    if (a.dataset.pageId === id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = 'Arunika — ' + (PAGES.find((p) => p.id === id)?.title || 'Beranda') + ' | Portal Statistik Indonesia';
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// ---- Pencarian: cari indikator dan halaman, klik hasil pindah halaman ----
function runSearch(q) {
  const query = q.trim().toLowerCase();
  searchResults.innerHTML = '';
  if (query.length < 2) { searchResults.hidden = true; return; }
  const hits = SEARCH_INDEX.filter((item) =>
    (item.label + ' ' + item.detail + ' ' + item.kind).toLowerCase().includes(query),
  ).slice(0, 8);
  if (hits.length === 0) {
    const li = document.createElement('li');
    li.className = 'search-empty';
    li.textContent = 'Tidak ada hasil untuk "' + q.trim() + '". Coba kata lain, misalnya "inflasi" atau "provinsi".';
    searchResults.appendChild(li);
  } else {
    for (const hit of hits) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = hit.route;
      a.innerHTML = '<span class="search-kind"></span><span class="search-label"></span><span class="search-detail"></span>';
      a.querySelector('.search-kind').textContent = hit.kind;
      a.querySelector('.search-label').textContent = hit.label;
      a.querySelector('.search-detail').textContent = hit.detail;
      a.addEventListener('click', () => { searchResults.hidden = true; searchInput.value = ''; });
      li.appendChild(a);
      searchResults.appendChild(li);
    }
  }
  searchResults.hidden = false;
}

searchInput.addEventListener('input', () => runSearch(searchInput.value));
searchInput.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') { searchResults.hidden = true; searchInput.value = ''; }
  if (ev.key === 'Enter') {
    const first = searchResults.querySelector('a');
    if (first) { window.location.hash = first.getAttribute('href'); searchResults.hidden = true; searchInput.value = ''; }
  }
});
document.addEventListener('click', (ev) => {
  if (!ev.target.closest('.search-box')) searchResults.hidden = true;
});

window.addEventListener('hashchange', render);
render();
