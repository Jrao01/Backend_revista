/**
 * Genera HTML5 semántico para un artículo científico.
 * Compatible con CSS externo. Sin estilos inline.
 */
export function generateSemanticHTML5(article, manuscriptContent) {
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
  const keywords = (article.palabras_clave || '').split(',').map(k => k.trim()).filter(Boolean);

  const bodySections = manuscriptContent
    ? buildHTML5Body(manuscriptContent)
    : '<section class="sec-intro">\n        <p>Contenido no disponible.</p>\n      </section>';

  const kwdList = keywords.length > 0
    ? `<ul class="keyword-list">\n          ${keywords.map(k => `<li class="keyword">${k}</li>`).join('\n          ')}\n        </ul>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.titulo_es || 'Artículo'} — ${revista}</title>
  <link rel="stylesheet" href="/css/article.css">
</head>
<body>
  <article>
    <header class="article-header">
      <p class="journal-meta">${revista}${volumen ? ` · Vol. ${volumen}` : ''}${numero ? `, No. ${numero}` : ''} · ${year}</p>
      <h1 class="article-title">${article.titulo_es || ''}</h1>
      ${article.titulo_en ? `<p class="article-subtitle" lang="en">${article.titulo_en}</p>` : ''}
      <address class="authors">${authorStr}</address>
      <p class="article-meta">${pages ? `Págs. ${pages} · ` : ''}${doi ? `DOI: <a href="https://doi.org/${doi}" class="doi-link">${doi}</a>` : ''}</p>
    </header>

    <aside class="abstracts">
      <section class="abstract" lang="es">
        <h2 class="abstract-heading">Resumen</h2>
        <p class="abstract-text">${article.resumen_es || ''}</p>
        ${kwdList}
      </section>
      ${article.resumen_en ? `
      <section class="abstract" lang="en">
        <h2 class="abstract-heading">Abstract</h2>
        <p class="abstract-text">${article.resumen_en}</p>
        ${kwdList}
      </section>` : ''}
    </aside>

    <main class="article-body">
      ${bodySections}
    </main>

    <footer class="article-footer">
      <section class="license">
        <h2 class="footer-heading">Licencia</h2>
        <p>Este artículo está disponible bajo licencia <a href="https://creativecommons.org/licenses/by/4.0/" rel="license">Creative Commons Attribution 4.0</a>.</p>
      </section>
      <section class="references">
        <h2 class="footer-heading">Referencias</h2>
        <p>Las referencias bibliográficas deben ser incluidas por el autor en el manuscrito original.</p>
      </section>
    </footer>
  </article>
</body>
</html>`;
}

function buildHTML5Body(content) {
  const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);
  if (paragraphs.length === 0) {
    return '<section class="sec-intro">\n        <p>Contenido no disponible.</p>\n      </section>';
  }

  const sectionNames = ['intro', 'methods', 'results', 'discussion', 'conclusion'];
  let html = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const secClass = sectionNames[i] || 'other';
    const heading = i === 0 ? 'Introducción' : i === 1 ? 'Métodos' : i === 2 ? 'Resultados' : i === 3 ? 'Discusión' : i === 4 ? 'Conclusiones' : 'Notas';
    html += `<section class="sec-${secClass}">\n        <h2>${heading}</h2>\n        <p>${paragraphs[i].replace(/\n/g, '<br>')}</p>\n      </section>\n      `;
  }

  return html.trim();
}
