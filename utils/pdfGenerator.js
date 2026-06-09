import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getHeadlessShellPath() {
  const cacheDir = path.join(os.homedir(), '.cache', 'puppeteer');
  const shellDir = path.join(cacheDir, 'chrome-headless-shell');
  if (!fs.existsSync(shellDir)) return null;
  const platforms = fs.readdirSync(shellDir).filter(f => f.startsWith('win64'));
  if (platforms.length === 0) return null;
  const latest = platforms.sort().pop();
  const exePath = path.join(shellDir, latest, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
  return fs.existsSync(exePath) ? exePath : null;
}

/**
 * Genera el HTML de galerada para un artículo individual.
 * El contenido se renderiza desde el archivo manuscrito base (corregido o original).
 */
export function generateArticleGaleradaHTML(article, manuscritoContenido) {
  const authors = [];
  if (article.autor_principal) {
    const ap = article.autor_principal;
    authors.push([ap.nombre, ap.segundo_nombre, ap.apellido, ap.segundo_apellido].filter(Boolean).join(' '));
  }
  if (article.autores_secundarios) {
    for (const as of article.autores_secundarios) {
      if (as.usuario) {
        const u = as.usuario;
        authors.push([u.nombre, u.segundo_nombre, u.apellido, u.segundo_apellido].filter(Boolean).join(' '));
      }
    }
  }

  const authorStr = authors.join(', ');
  const revista = article.revista?.nombre || 'Revista SaberUnerg';
  const volumen = article.numero_revista?.volumen?.numero_volumen || '';
  const numero = article.numero_revista?.numero || '';
  const year = article.fecha_publicacion
    ? new Date(article.fecha_publicacion).getFullYear()
    : new Date().getFullYear();
  const doi = article.doi || '';
  const pages = article.pages || '';

  const bodyContent = manuscritoContenido
    ? `<div class="manuscript-body">${manuscritoContenido.replace(/\n/g, '<br/>')}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${article.titulo_es || ''}</title>
  <style>
    @page { margin: 2.5cm 2cm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #222;
      max-width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 2em;
      border-bottom: 1px solid #ddd;
      padding-bottom: 1em;
    }
    .journal-title {
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #555;
      margin-bottom: 0.5em;
    }
    .article-title {
      font-size: 18pt;
      font-weight: bold;
      color: #111;
      margin: 0.5em 0;
      line-height: 1.3;
    }
    .article-title-en {
      font-size: 14pt;
      font-style: italic;
      color: #666;
      margin-bottom: 1em;
    }
    .authors {
      font-size: 12pt;
      color: #333;
      margin-bottom: 0.3em;
    }
    .meta {
      font-size: 10pt;
      color: #777;
      margin-bottom: 1.5em;
    }
    .abstract-block {
      background: #f9f9f9;
      border-left: 3px solid #3ecf8e;
      padding: 1em 1.2em;
      margin: 1.5em 0;
    }
    .abstract-label {
      font-weight: bold;
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5em;
      color: #333;
    }
    .abstract-text {
      font-size: 11pt;
      text-align: justify;
      color: #444;
    }
    .keywords {
      font-size: 10pt;
      color: #555;
      margin-top: 0.5em;
    }
    .keywords strong { color: #333; }
    .doi {
      font-size: 10pt;
      color: #3ecf8e;
      margin-top: 0.5em;
    }
    .manuscript-body {
      margin-top: 2em;
      padding-top: 1.5em;
      border-top: 1px solid #ddd;
      font-size: 12pt;
      text-align: justify;
      color: #333;
      line-height: 1.8;
    }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  <div class="header">
    <div class="journal-title">${revista}${volumen ? ` · Vol. ${volumen}` : ''}${numero ? `, No. ${numero}` : ''} · ${year}</div>
    <h1 class="article-title">${article.titulo_es || ''}</h1>
    ${article.titulo_en ? `<div class="article-title-en">${article.titulo_en}</div>` : ''}
    <div class="authors">${authorStr}</div>
    <div class="meta">
      ${pages ? `Págs. ${pages} · ` : ''}${doi ? `DOI: ${doi}` : ''}
    </div>
  </div>

  <div class="abstract-block">
    <div class="abstract-label">Resumen</div>
    <div class="abstract-text">${article.resumen_es || ''}</div>
    ${article.palabras_clave ? `<div class="keywords"><strong>Palabras clave:</strong> ${article.palabras_clave}</div>` : ''}
    ${doi ? `<div class="doi">DOI: ${doi}</div>` : ''}
  </div>

  ${article.resumen_en ? `
  <div class="abstract-block">
    <div class="abstract-label">Abstract</div>
    <div class="abstract-text">${article.resumen_en}</div>
    ${article.palabras_clave ? `<div class="keywords"><strong>Keywords:</strong> ${article.palabras_clave}</div>` : ''}
  </div>
  ` : ''}

  ${bodyContent}
</body>
</html>`;
}

/**
 * Genera el HTML completo de un número de revista (portada + índice + artículos).
 */
export function generateNumeroRevistaHTML(numero, articulos, galeradaContents) {
  const revista = numero.volumen?.revista?.nombre || 'Revista SaberUnerg';
  const volumen = numero.volumen?.numero_volumen || '';
  const num = numero.numero || '';
  const year = numero.anio || new Date().getFullYear();
  const tituloEdicion = numero.titulo_edicion || '';
  const fechaPublicacion = numero.fecha_publicacion || '';

  let articlesHtml = '';
  for (let i = 0; i < articulos.length; i++) {
    const art = articulos[i];
    const content = galeradaContents[i] || '';

    const authors = [];
    if (art.autor_principal) {
      const ap = art.autor_principal;
      authors.push([ap.nombre, ap.apellido].filter(Boolean).join(' '));
    }
    if (art.autores_secundarios) {
      for (const as of art.autores_secundarios) {
        if (as.usuario) authors.push([as.usuario.nombre, as.usuario.apellido].filter(Boolean).join(' '));
      }
    }

    articlesHtml += `
    <div class="article-section">
      ${content}
    </div>
    ${i < articulos.length - 1 ? '<div class="page-break"></div>' : ''}
    `;
  }

  const indexItems = articulos.map((art, idx) => {
    const authors = [];
    if (art.autor_principal) {
      const ap = art.autor_principal;
      authors.push([ap.nombre, ap.apellido].filter(Boolean).join(' '));
    }
    if (art.autores_secundarios) {
      for (const as of art.autores_secundarios) {
        if (as.usuario) authors.push([as.usuario.nombre, as.usuario.apellido].filter(Boolean).join(' '));
      }
    }
    const pages = art.pages || '';
    return `
      <div class="index-item">
        <div class="index-title">${art.titulo_es || ''}</div>
        <div class="index-authors">${authors.join(', ')}</div>
        ${pages ? `<div class="index-pages">Págs. ${pages}</div>` : ''}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${revista} — Vol. ${volumen}, No. ${num}</title>
  <style>
    @page { margin: 2cm 2cm; size: A4; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #222;
    }
    .cover {
      text-align: center;
      padding-top: 6cm;
      page-break-after: always;
    }
    .cover-journal {
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #555;
      margin-bottom: 2em;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: bold;
      color: #111;
      margin-bottom: 0.5em;
      line-height: 1.2;
    }
    .cover-subtitle {
      font-size: 16pt;
      font-style: italic;
      color: #666;
      margin-bottom: 2em;
    }
    .cover-meta {
      font-size: 12pt;
      color: #777;
      margin-top: 3em;
    }
    .cover-meta strong { color: #333; }
    .index-page {
      page-break-after: always;
    }
    .index-title-header {
      font-size: 20pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 1.5em;
      color: #111;
    }
    .index-item {
      margin-bottom: 1.2em;
      padding-bottom: 0.8em;
      border-bottom: 1px solid #eee;
    }
    .index-title {
      font-size: 13pt;
      font-weight: 600;
      color: #222;
      margin-bottom: 0.2em;
    }
    .index-authors {
      font-size: 11pt;
      color: #555;
    }
    .index-pages {
      font-size: 10pt;
      color: #888;
      text-align: right;
    }
    .article-section {
      margin-bottom: 2em;
    }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  <!-- PORTADA -->
  <div class="cover">
    <div class="cover-journal">${revista}</div>
    <div class="cover-title">Volumen ${volumen}, Número ${num}</div>
    ${tituloEdicion ? `<div class="cover-subtitle">${tituloEdicion}</div>` : ''}
    <div class="cover-meta">
      <p><strong>Año:</strong> ${year}</p>
      ${fechaPublicacion ? `<p><strong>Publicación:</strong> ${fechaPublicacion}</p>` : ''}
      <p><strong>Artículos:</strong> ${articulos.length}</p>
    </div>
  </div>

  <!-- ÍNDICE -->
  <div class="index-page">
    <div class="index-title-header">Contenido</div>
    ${indexItems}
  </div>

  <!-- ARTÍCULOS -->
  ${articlesHtml}
</body>
</html>`;
}

/**
 * Convierte HTML a PDF usando puppeteer.
 */
export async function htmlToPDF(htmlContent, outputPath) {
  let browser;
  try {
    const shellPath = getHeadlessShellPath();
    const launchOpts = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--no-zygote',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    };
    if (shellPath) launchOpts.executablePath = shellPath;
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
    });
    return outputPath;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Genera un archivo PDF a partir de HTML en memoria (sin guardar el HTML).
 * Devuelve un Buffer del PDF.
 */
export async function htmlToPDFBuffer(htmlContent) {
  let browser;
  try {
    const shellPath = getHeadlessShellPath();
    const launchOpts = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--no-zygote',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    };
    if (shellPath) launchOpts.executablePath = shellPath;
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
    });
    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Asegura que exista un directorio para guardar archivos generados.
 */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
