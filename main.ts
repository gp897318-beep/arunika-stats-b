// main.ts — Arunika, portal statistik Indonesia (varian B, tema gelap).
// Node 22, standard library saja. Program ini menyerahkan situsnya:
// menyalin app/ dan screenshots/ dari repo ini ke direktori output lalu
// menulis /output/dossier.json dengan library make.fun yang divendor.
//
// vendor/makefun-frontend.ts adalah salinan kit yang tidak diubah: scorer
// mengharuskan dossier.json sama persis dengan yang ditulis ulang oleh
// salinan library yang sama, jadi file vendor itu jangan disentuh.
//
// Di luar container grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Batas yang sama dengan yang dipakai scorer: teks dossier dibatasi,
// screenshot paling banyak 4 dan masing-masing paling banyak 256 KiB,
// app/ paling banyak 993 file/direktori dan 16 MiB — semuanya berbagi
// batas /output (1.000 entri, 64 MiB) dengan dossier.json.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
