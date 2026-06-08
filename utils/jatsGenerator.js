import fs from 'fs';
import path from 'path';

/**
 * Genera JATS XML v1.3 (NLM) para un artículo científico.
 * Document type: journal article (DTD JATS v1.3)
 */
export function generateJATSXML(article, manuscriptContent) {
  const authors = [];
  if (article.autor_principal) {
    const ap = article.autor_principal;
    authors.push({
      given: [ap.nombre, ap.segundo_nombre].filter(Boolean).join(' '),
      surname: [ap.apellido, ap.segundo_apellido].filter(Boolean).join(' '),
      aff: ap.afiliacion_institucional || '',
    });
  }
  if (article.autores_secundarios) {
    for (const as of article.autores_secundarios) {
      if (as.usuario) {
        const u = as.usuario;
        authors.push({
          given: [u.nombre, u.segundo_nombre].filter(Boolean).join(' '),
          surname: [u.apellido, u.segundo_apellido].filter(Boolean).join(' '),
          aff: u.afiliacion_institucional || '',
        });
      }
    }
  }

  const revista = article.revista?.nombre || 'Revista SaberUnerg';
  const issn = article.revista?.issn || '';
  const volumen = article.numero_revista?.volumen?.numero_volumen || '';
  const numero = article.numero_revista?.numero || '';
  const year = article.fecha_publicacion
    ? new Date(article.fecha_publicacion).getFullYear()
    : new Date().getFullYear();
  const month = article.fecha_publicacion
    ? String(new Date(article.fecha_publicacion).getMonth() + 1).padStart(2, '0')
    : '01';
  const day = article.fecha_publicacion
    ? String(new Date(article.fecha_publicacion).getDate()).padStart(2, '0')
    : '01';
  const doi = article.doi || '';
  const pages = article.pages || '';
  const keywords = (article.palabras_clave || '').split(',').map(k => k.trim()).filter(Boolean);

  // Build contributors XML
  const contribGroup = authors.map((a, i) => `
      <contrib contrib-type="author" corresp="${i === 0 ? 'yes' : 'no'}">
        <name>
          <surname>${escapeXml(a.surname)}</surname>
          <given-names>${escapeXml(a.given)}</given-names>
        </name>
        ${a.aff ? `<xref ref-type="aff" rid="aff${i + 1}"/>` : ''}
      </contrib>`).join('');

  const affList = authors.map((a, i) => a.aff ? `
      <aff id="aff${i + 1}">
        <institution>${escapeXml(a.aff)}</institution>
      </aff>` : '').join('');

  const kwdGroup = keywords.length > 0 ? `
      <kwd-group xml:lang="es">
        <title>Palabras clave</title>
        ${keywords.map(k => `<kwd>${escapeXml(k)}</kwd>`).join('\n        ')}
      </kwd-group>` : '';

  const abstractES = article.resumen_es ? `
      <abstract xml:lang="es">
        <p>${escapeXml(article.resumen_es)}</p>
      </abstract>` : '';

  const abstractEN = article.resumen_en ? `
      <abstract xml:lang="en">
        <p>${escapeXml(article.resumen_en)}</p>
      </abstract>` : '';

  // Body sections: split manuscript content by double newlines as rough sections
  const bodySections = manuscriptContent
    ? buildJATSBody(manuscriptContent)
    : '<sec sec-type="intro"><p>Contenido no disponible.</p></sec>';

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE article PUBLIC "-//NLM//DTD JATS (Z39.96) Journal Publishing DTD v1.3 20210610//EN" "JATS-journalpublishing1-3.dtd">
<article article-type="research-article" xml:lang="es"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:mml="http://www.w3.org/1998/Math/MathML">
  <front>
    <journal-meta>
      <journal-id journal-id-type="publisher">saberunerg</journal-id>
      <journal-title-group>
        <journal-title>${escapeXml(revista)}</journal-title>
      </journal-title-group>
      ${issn ? `<issn>${escapeXml(issn)}</issn>` : ''}
      <publisher>
        <publisher-name>Universidad Nacional Experimental Rómulo Gallegos</publisher-name>
      </publisher>
    </journal-meta>
    <article-meta>
      <article-id pub-id-type="publisher-id">${article.id}</article-id>
      ${doi ? `<article-id pub-id-type="doi">${escapeXml(doi)}</article-id>` : ''}
      <title-group>
        <article-title>${escapeXml(article.titulo_es || '')}</article-title>
        ${article.titulo_en ? `<trans-title-group xml:lang="en"><trans-title>${escapeXml(article.titulo_en)}</trans-title></trans-title-group>` : ''}
      </title-group>
      <contrib-group>${contribGroup}
      </contrib-group>
      ${affList}
      <pub-date pub-type="epub" date-type="pub" iso-8601-date="${year}-${month}-${day}">
        <day>${day}</day>
        <month>${month}</month>
        <year>${year}</year>
      </pub-date>
      ${volumen ? `<volume>${volumen}</volume>` : ''}
      ${numero ? `<issue>${numero}</issue>` : ''}
      ${pages ? `<fpage>${pages.split('-')[0]}</fpage>${pages.includes('-') ? `<lpage>${pages.split('-')[1]}</lpage>` : ''}` : ''}
      <permissions>
        <license license-type="open-access" xlink:href="https://creativecommons.org/licenses/by/4.0/">
          <license-p>Este artículo está disponible bajo licencia Creative Commons Attribution 4.0.</license-p>
        </license>
      </permissions>
      ${abstractES}
      ${abstractEN}
      ${kwdGroup}
    </article-meta>
  </front>
  <body>
    ${bodySections}
  </body>
  <back>
    <ref-list>
      <title>Referencias</title>
      <p>Las referencias bibliográficas deben ser incluidas por el autor en el manuscrito original.</p>
    </ref-list>
  </back>
</article>`;
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildJATSBody(content) {
  const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);
  if (paragraphs.length === 0) return '<sec sec-type="intro"><p>Contenido no disponible.</p></sec>';

  // Treat first paragraph as intro, subsequent as sections
  let secs = `<sec sec-type="intro">\n        <p>${escapeXml(paragraphs[0])}</p>\n      </sec>`;

  for (let i = 1; i < paragraphs.length; i++) {
    const secType = i === 1 ? 'methods' : i === 2 ? 'results' : i === 3 ? 'discussion' : 'other';
    secs += `\n      <sec sec-type="${secType}">\n        <p>${escapeXml(paragraphs[i])}</p>\n      </sec>`;
  }

  return secs;
}
