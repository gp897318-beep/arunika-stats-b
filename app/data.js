// data.js — semua angka di portal ini, beserta sumber dan tahunnya.
// Sumber: Badan Pusat Statistik (BPS) kecuali disebut lain. Angka diambil
// dari brief kompetisi; jangan tambah angka baru tanpa verifikasi sumbernya.

export const SOURCE_BPS = 'BPS';
export const SOURCE_BPS_SAKERNAS = 'BPS (Sakernas)';
export const SOURCE_WORLDBANK = 'World Bank';

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

// Deret tahunan 2019-2024 (BPS). Nilai per tahun dipakai pemilih tahun.
export const SERIES = {
  pertumbuhanPdb: { // persen, yoy
    label: 'Pertumbuhan PDB',
    unit: '%',
    source: SOURCE_BPS,
    values: { 2019: 5.02, 2020: -2.07, 2021: 3.70, 2022: 5.31, 2023: 5.05, 2024: 5.03 },
  },
  inflasi: { // persen yoy, Desember
    label: 'Inflasi (Desember, yoy)',
    unit: '%',
    source: SOURCE_BPS,
    values: { 2019: 2.72, 2020: 1.68, 2021: 1.87, 2022: 5.51, 2023: 2.61, 2024: 1.57 },
  },
  tpt: { // persen, Agustus
    label: 'Tingkat Pengangguran Terbuka (Agustus)',
    unit: '%',
    source: SOURCE_BPS_SAKERNAS,
    values: { 2019: 5.28, 2020: 7.07, 2021: 6.49, 2022: 5.86, 2023: 5.32, 2024: 4.91 },
  },
  kemiskinan: { // persen, September
    label: 'Tingkat Kemiskinan (September)',
    unit: '%',
    source: SOURCE_BPS,
    values: { 2019: 9.22, 2020: 10.19, 2021: 9.71, 2022: 9.57, 2023: 9.36, 2024: 8.57 },
  },
  penduduk: { // juta jiwa
    label: 'Penduduk',
    unit: 'juta jiwa',
    source: SOURCE_BPS,
    values: { 2019: 267.7, 2020: 270.2, 2021: 272.7, 2022: 275.8, 2023: 278.7, 2024: 281.6 },
  },
};

// Angka utama 2024 (BPS, kecuali disebut lain).
export const KPI_2024 = [
  { id: 'penduduk', label: 'Penduduk', value: '281,6', unit: 'juta jiwa', note: 'Negara ke-4 terbanyak di dunia', source: SOURCE_BPS, year: 2024 },
  { id: 'pdb', label: 'PDB', value: 'US$1.396,3', unit: 'miliar', note: 'PDB per kapita US$4.942', source: SOURCE_BPS, year: 2024 },
  { id: 'tumbuh', label: 'Pertumbuhan ekonomi', value: '5,03', unit: '%', note: 'Tumbuh stabil di atas 5% sejak 2022', source: SOURCE_BPS, year: 2024 },
  { id: 'inflasi', label: 'Inflasi', value: '1,57', unit: '% yoy', note: 'Desember 2024 — terendah dalam enam tahun terakhir', source: SOURCE_BPS, year: 2024 },
  { id: 'tpt', label: 'Pengangguran terbuka', value: '4,91', unit: '%', note: 'Agustus 2024 · 7,47 juta orang menganggur', source: SOURCE_BPS_SAKERNAS, year: 2024 },
  { id: 'miskin', label: 'Kemiskinan', value: '8,57', unit: '%', note: 'September 2024 · 24,06 juta jiwa', source: SOURCE_BPS, year: 2024 },
  { id: 'gini', label: 'Gini ratio', value: '0,379', unit: 'Sep 2024', note: 'Ketimpangan pendapatan', source: SOURCE_BPS, year: 2024 },
  { id: 'ipm', label: 'IPM', value: '75,02', unit: '2024', note: 'Indeks Pembangunan Manusia', source: SOURCE_BPS, year: 2024 },
];

// Perdagangan luar negeri 2024 (BPS).
export const TRADE_2024 = {
  ekspor: { value: 264.70, label: 'Ekspor', unit: 'US$ miliar' },
  impor: { value: 233.66, label: 'Impor', unit: 'US$ miliar' },
  surplus: { value: 31.04, label: 'Surplus neraca perdagangan', unit: 'US$ miliar' },
  source: SOURCE_BPS,
  year: 2024,
};

// Pangsa PDB menurut lapangan usaha 2024 (BPS, dibulatkan).
export const SECTORS_2024 = [
  { name: 'Industri pengolahan', share: 18.7 },
  { name: 'Perdagangan', share: 13.0 },
  { name: 'Pertanian, kehutanan, perikanan', share: 12.3 },
  { name: 'Konstruksi', share: 10.1 },
  { name: 'Pertambangan', share: 8.6 },
  { name: 'Lainnya', share: 37.3 },
];

// Struktur umur 2024 (BPS, perkiraan).
export const AGE_2024 = [
  { group: '0–14 tahun', share: 24.4, note: 'Anak-anak' },
  { group: '15–64 tahun', share: 68.0, note: 'Usia produktif — bonus demografi' },
  { group: '65+ tahun', share: 7.6, note: 'Lansia' },
];

// 10 provinsi terbesar, penduduk 2024 (juta, perkiraan BPS) + kemiskinan Sep 2024 (%).
export const PROVINCES = [
  { name: 'Jawa Barat', pop: 50.3, poverty: 7.5 },
  { name: 'Jawa Timur', pop: 41.8, poverty: 10.4 },
  { name: 'Jawa Tengah', pop: 37.9, poverty: 10.5 },
  { name: 'Sumatera Utara', pop: 15.6, poverty: 8.5 },
  { name: 'Banten', pop: 12.4, poverty: 5.8 },
  { name: 'DKI Jakarta', pop: 10.6, poverty: 4.1 },
  { name: 'Sulawesi Selatan', pop: 9.4, poverty: 8.6 },
  { name: 'Lampung', pop: 9.3, poverty: 10.7 },
  { name: 'Sumatera Selatan', pop: 9.0, poverty: 10.9 },
  { name: 'Riau', pop: 6.9, poverty: 6.4 },
];
export const PROVINCE_SOURCE = 'BPS, 2024 (penduduk: perkiraan; kemiskinan: Sep 2024)';

// Fakta wilayah 2024 (BPS).
export const TERRITORY = {
  area: '1,92 juta km²',
  provinces: 38,
  islands: '17.500+',
  source: SOURCE_BPS,
  year: 2024,
};

// Tenaga kerja Agustus 2024 (BPS/Sakernas).
export const LABOUR_2024 = {
  angkatanKerja: '152,1 juta jiwa',
  penganggur: '7,47 juta orang',
  tpt: 4.91,
  source: SOURCE_BPS_SAKERNAS,
  year: 2024,
};

// Rilis resmi terbaru yang dipakai di Beranda (BPS).
export const RELEASES = [
  { date: '16 Jun 2025', title: 'IPM 2024 sebesar 75,02', detail: 'Indeks Pembangunan Manusia Indonesia naik dari tahun sebelumnya.' },
  { date: '05 Feb 2025', title: 'Ekonomi Indonesia 2024 tumbuh 5,03%', detail: 'PDB 2024 mencapai US$1.396,3 miliar.' },
  { date: '15 Jan 2025', title: 'Kemiskinan September 2024 sebesar 8,57%', detail: 'Turun dari 9,36% pada September 2023; 24,06 juta jiwa.' },
  { date: '02 Jan 2025', title: 'Inflasi Desember 2024 sebesar 1,57% yoy', detail: 'Inflasi tahun kalender 2024 terendah dalam enam tahun.' },
  { date: '05 Nov 2024', title: 'TPT Agustus 2024 sebesar 4,91%', detail: 'Turun dari 5,32% pada Agustus 2023.' },
];

// Daftar halaman untuk navigasi dan pencarian.
export const PAGES = [
  { route: '#/', id: 'home', title: 'Beranda', blurb: 'Angka utama Indonesia 2024, tren, dan rilis terbaru.' },
  { route: '#/ekonomi', id: 'ekonomi', title: 'Ekonomi', blurb: 'PDB, pertumbuhan, pangsa sektor, dan perdagangan.' },
  { route: '#/penduduk', id: 'penduduk', title: 'Penduduk', blurb: 'Tren penduduk, struktur umur, dan provinsi terbesar.' },
  { route: '#/harga', id: 'harga', title: 'Harga', blurb: 'Inflasi tahunan 2019–2024 dan catatan IHK.' },
  { route: '#/tenaga-kerja', id: 'tenaga-kerja', title: 'Tenaga Kerja', blurb: 'Pengangguran, angkatan kerja, dan penganggur.' },
  { route: '#/sosial', id: 'sosial', title: 'Sosial', blurb: 'Kemiskinan, ketimpangan, dan pembangunan manusia.' },
  { route: '#/daerah', id: 'daerah', title: 'Daerah', blurb: 'Penjelajah provinsi: penduduk dan kemiskinan.' },
  { route: '#/data', id: 'data', title: 'Data & Metodologi', blurb: 'Unduh dataset, metodologi, dan daftar sumber.' },
];

// Entri yang bisa dicari: indikator dan halaman.
export const SEARCH_INDEX = [
  ...PAGES.map((p) => ({ kind: 'Halaman', label: p.title, detail: p.blurb, route: p.route })),
  { kind: 'Indikator', label: 'Pertumbuhan PDB 5,03%', detail: 'Ekonomi Indonesia 2024 (BPS)', route: '#/ekonomi' },
  { kind: 'Indikator', label: 'Inflasi 1,57%', detail: 'Inflasi Desember 2024 yoy (BPS)', route: '#/harga' },
  { kind: 'Indikator', label: 'Pengangguran 4,91%', detail: 'TPT Agustus 2024 (BPS/Sakernas)', route: '#/tenaga-kerja' },
  { kind: 'Indikator', label: 'Kemiskinan 8,57%', detail: 'September 2024; 24,06 juta jiwa (BPS)', route: '#/sosial' },
  { kind: 'Indikator', label: 'Gini ratio 0,379', detail: 'September 2024 (BPS)', route: '#/sosial' },
  { kind: 'Indikator', label: 'IPM 75,02', detail: 'Indeks Pembangunan Manusia 2024 (BPS)', route: '#/sosial' },
  { kind: 'Indikator', label: 'Penduduk 281,6 juta', detail: 'Penduduk Indonesia 2024 (BPS)', route: '#/penduduk' },
  { kind: 'Indikator', label: 'Ekspor US$264,70 miliar', detail: 'Surplus perdagangan US$31,04 miliar (BPS, 2024)', route: '#/ekonomi' },
  { kind: 'Indikator', label: 'Jawa Barat 50,3 juta', detail: 'Provinsi terpadat; kemiskinan 7,5% (BPS, 2024)', route: '#/daerah' },
  { kind: 'Indikator', label: 'Bonus demografi', detail: '68,0% penduduk usia 15–64 tahun (BPS, 2024)', route: '#/penduduk' },
];

export function fmtNum(n) {
  return String(n).replace('.', ',');
}

export function yearValue(seriesKey, year) {
  return SERIES[seriesKey].values[year];
}
