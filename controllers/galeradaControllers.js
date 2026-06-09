import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  Articulo,
  ArchivoArticulo,
  NumeroRevista,
  Volumen,
  Revista,
  Usuario,
  AutorSecundario,
  LineaInvestigacion
} from '../models/index.js';
import {
  generateArticleGaleradaHTML,
  generateNumeroRevistaHTML,
  htmlToPDF,
  htmlToPDFBuffer,
  ensureDir
} from '../utils/pdfGenerator.js';
import { generateJATSXML } from '../utils/jatsGenerator.js';
import { generateSemanticHTML5 } from '../utils/html5Generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Obtiene el manuscrito base para generar la galerada.
 * Prioridad: manuscrito_corregido (última versión) > manuscrito_original (última versión)
 */
async function obtenerManuscritoBase(articuloId) {
  // Buscar manuscrito_corregido (más reciente)
  const corregido = await ArchivoArticulo.findOne({
    where: { articulo_id: articuloId, tipo_archivo: 'manuscrito_corregido' },
    order: [['version', 'DESC']]
  });

  if (corregido) return corregido;

  // Si no hay corregido, buscar manuscrito_original
  const original = await ArchivoArticulo.findOne({
    where: { articulo_id: articuloId, tipo_archivo: 'manuscrito_original' },
    order: [['version', 'DESC']]
  });

  return original;
}

/**
 * Genera y guarda en disco el PDF completo de un número de revista.
 * Devuelve la ruta relativa del archivo generado.
 */
export async function generarPDFNumeroCompleto(numeroId) {
  const numero = await NumeroRevista.findByPk(numeroId, {
    include: [
      {
        model: Volumen,
        as: 'volumen',
        include: [{ model: Revista, as: 'revista', attributes: ['id', 'nombre'] }]
      },
      {
        model: Articulo,
        as: 'articulos',
        where: { status: 'publicado' },
        required: false,
        include: [
          { model: Usuario, as: 'autor_principal', attributes: ['id', 'nombre', 'apellido'] },
          { model: AutorSecundario, include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] }] },
          { model: ArchivoArticulo, where: { tipo_archivo: 'galerada_html' }, required: false }
        ]
      }
    ]
  });

  if (!numero) throw new Error('Número no encontrado');

  const articulos = numero.articulos || [];
  if (articulos.length === 0) throw new Error('El número no tiene artículos publicados');

  // Asegurar galeradas
  const galeradaContents = [];
  for (const art of articulos) {
    let htmlContent = '';
    const galeradaHtml = art.ArchivoArticulos?.[0];
    if (galeradaHtml && galeradaHtml.url) {
      const filePath = path.join(__dirname, '..', galeradaHtml.url);
      if (fs.existsSync(filePath)) htmlContent = fs.readFileSync(filePath, 'utf-8');
    }
    if (!htmlContent) {
      const galerada = await generarGaleradaArticulo(art.id);
      const filePath = path.join(__dirname, '..', galerada.htmlRelativePath);
      htmlContent = fs.readFileSync(filePath, 'utf-8');
    }
    galeradaContents.push(htmlContent);
  }

  const numeroHTML = generateNumeroRevistaHTML(numero.toJSON(), articulos.map(a => a.toJSON()), galeradaContents);

  const numeroDir = path.join(__dirname, '..', 'uploads', 'numeros', String(numeroId));
  ensureDir(numeroDir);
  const pdfPath = path.join(numeroDir, 'numero_completo.pdf');
  await htmlToPDF(numeroHTML, pdfPath);

  const relativePath = `uploads/numeros/${numeroId}/numero_completo.pdf`;
  return { pdfPath, relativePath };
}

/**
 * Genera galerada_html y galerada_pdf para un artículo.
 * Guarda los archivos en uploads/articulos/:id/galerada.{html,pdf}
 * Y crea registros en archivos_articulos.
 */
export async function generarGaleradaArticulo(articuloId) {
  const articulo = await Articulo.findByPk(articuloId, {
    include: [
      { model: Usuario, as: 'autor_principal' },
      { model: AutorSecundario, include: [{ model: Usuario, as: 'usuario' }] },
      { model: Revista, as: 'revista' },
      { model: NumeroRevista, as: 'numero_revista', include: [{ model: Volumen, as: 'volumen' }] },
      { model: LineaInvestigacion, as: 'lineas_investigacion' }
    ]
  });

  if (!articulo) throw new Error('Artículo no encontrado');

  const manuscritoBase = await obtenerManuscritoBase(articuloId);
  const manuscritoUrl = manuscritoBase ? manuscritoBase.url : '';

  // Leer contenido del manuscrito base
  let manuscritoContenido = '';
  if (manuscritoBase && manuscritoBase.url) {
    const manuscritoPath = path.join(__dirname, '..', manuscritoBase.url);
    if (fs.existsSync(manuscritoPath)) {
      manuscritoContenido = fs.readFileSync(manuscritoPath, 'utf-8');
    }
  }

  const galeradaDir = path.join(__dirname, '..', 'uploads', 'articulos', String(articuloId));
  ensureDir(galeradaDir);

  // 1. Generar galerada HTML (actual: resúmenes + manuscrito)
  const htmlContent = generateArticleGaleradaHTML(articulo.toJSON(), manuscritoContenido);
  const htmlPath = path.join(galeradaDir, 'galerada.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  // 2. Generar PDF desde el HTML de galerada
  const pdfPath = path.join(galeradaDir, 'galerada.pdf');
  await htmlToPDF(htmlContent, pdfPath);

  // 3. Generar JATS XML
  const jatsContent = generateJATSXML(articulo.toJSON(), manuscritoContenido);
  const jatsPath = path.join(galeradaDir, 'galerada.xml');
  fs.writeFileSync(jatsPath, jatsContent, 'utf-8');

  // 4. Generar HTML5 semántico
  const html5Content = generateSemanticHTML5(articulo.toJSON(), manuscritoContenido);
  const html5Path = path.join(galeradaDir, 'galerada_html5.html');
  fs.writeFileSync(html5Path, html5Content, 'utf-8');

  // Helper para upsert en archivos_articulos
  const upsertArchivo = async (tipo, filePath, version = 1) => {
    const relPath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
    const existing = await ArchivoArticulo.findOne({
      where: { articulo_id: articuloId, tipo_archivo: tipo }
    });
    if (existing) {
      await existing.update({ url: relPath, version: (existing.version || 1) + 1 });
    } else {
      await ArchivoArticulo.create({
        articulo_id: articuloId,
        tipo_archivo: tipo,
        url: relPath,
        version: version,
        es_anonimo: false
      });
    }
    return relPath;
  };

  const htmlRelativePath = await upsertArchivo('galerada_html', htmlPath, 1);
  const pdfRelativePath = await upsertArchivo('galerada_pdf', pdfPath, 1);
  const jatsRelativePath = await upsertArchivo('galerada_xml_jats', jatsPath, 1);
  const html5RelativePath = await upsertArchivo('galerada_epub', html5Path, 1);

  return { htmlPath, pdfPath, jatsPath, html5Path, htmlRelativePath, pdfRelativePath, jatsRelativePath, html5RelativePath };
}

/**
 * Publicar un artículo: cambia estado a 'publicado', genera galerada y establece fecha_publicacion.
 * POST /api/articulos/:id/publicar
 */
export const publicarArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { pages, doi, fecha_publicacion } = req.body;

    if (fecha_publicacion && fecha_publicacion < new Date().toISOString().split('T')[0]) {
      return res.status(400).json({ message: 'La fecha de publicación no puede ser anterior al día actual.' });
    }

    const articulo = await Articulo.findByPk(id, {
      include: [
        { model: ArchivoArticulo },
        { model: NumeroRevista, as: 'numero_revista' }
      ]
    });

    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    if (!articulo.numero_revista_id) {
      return res.status(400).json({ message: 'El artículo debe estar asignado a un número de revista antes de publicarse.' });
    }

    // Actualizar datos de publicación
    const updates = { status: 'publicado' };
    if (pages) updates.pages = pages;
    if (doi) updates.doi = doi;
    updates.fecha_publicacion = fecha_publicacion || new Date().toISOString().split('T')[0];

    await articulo.update(updates);

    // Generar galerada
    const galerada = await generarGaleradaArticulo(articulo.id);

    res.json({
      message: 'Artículo publicado exitosamente. Galerada generada.',
      articulo,
      galerada
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al publicar el artículo', error: error.message });
  }
};

/**
 * Ver la galerada HTML de un artículo (para mostrar en la web).
 * GET /api/articulos/:id/galerada
 */
export const verGaleradaHTML = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findByPk(id, {
      include: [
        { model: ArchivoArticulo, where: { tipo_archivo: 'galerada_html' }, required: false }
      ]
    });

    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    // Solo artículos publicados pueden mostrar galerada
    if (articulo.status !== 'publicado') {
      return res.status(403).json({ message: 'El artículo no está publicado aún.' });
    }

    const galeradaHtml = articulo.ArchivoArticulos?.[0];

    if (galeradaHtml && galeradaHtml.url) {
      const filePath = path.join(__dirname, '..', galeradaHtml.url);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(content);
      }
    }

    // Si no existe, regenerarla
    const galerada = await generarGaleradaArticulo(articulo.id);
    const filePath = path.join(__dirname, '..', galerada.htmlRelativePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener galerada', error: error.message });
  }
};

/**
 * Descargar la galerada PDF de un artículo individual.
 * GET /api/articulos/:id/download-galerada
 */
export const descargarGaleradaPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findByPk(id, {
      include: [
        { model: ArchivoArticulo, where: { tipo_archivo: 'galerada_pdf' }, required: false }
      ]
    });

    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    if (articulo.status !== 'publicado') {
      return res.status(403).json({ message: 'El artículo no está publicado aún.' });
    }

    const galeradaPdf = articulo.ArchivoArticulos?.[0];

    let pdfPath;
    if (galeradaPdf && galeradaPdf.url) {
      pdfPath = path.join(__dirname, '..', galeradaPdf.url);
      if (!fs.existsSync(pdfPath)) {
        const galerada = await generarGaleradaArticulo(articulo.id);
        pdfPath = path.join(__dirname, '..', galerada.pdfRelativePath);
      }
    } else {
      const galerada = await generarGaleradaArticulo(articulo.id);
      pdfPath = path.join(__dirname, '..', galerada.pdfRelativePath);
    }

    const asciiName = `${(articulo.titulo_es || 'articulo').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.pdf`;
    const utf8Name = encodeURIComponent(`${articulo.titulo_es || 'articulo'}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`);
    res.sendFile(path.resolve(pdfPath));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al descargar galerada PDF', error: error.message });
  }
};

/**
 * Ver/Descargar JATS XML de un artículo.
 * GET /api/articulos/:id/jats
 */
export const verJATS = async (req, res) => {
  try {
    const { id } = req.params;
    const articulo = await Articulo.findByPk(id, {
      include: [
        { model: ArchivoArticulo, where: { tipo_archivo: 'galerada_xml_jats' }, required: false }
      ]
    });
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });
    if (articulo.status !== 'publicado') return res.status(403).json({ message: 'El artículo no está publicado.' });

    let jatsPath;
    const jatsArchivo = articulo.ArchivoArticulos?.[0];
    if (jatsArchivo && jatsArchivo.url) {
      jatsPath = path.join(__dirname, '..', jatsArchivo.url);
      if (!fs.existsSync(jatsPath)) {
        const galerada = await generarGaleradaArticulo(articulo.id);
        jatsPath = path.join(__dirname, '..', galerada.jatsRelativePath);
      }
    } else {
      const galerada = await generarGaleradaArticulo(articulo.id);
      jatsPath = path.join(__dirname, '..', galerada.jatsRelativePath);
    }

    const asciiName = `${(articulo.titulo_es || 'articulo').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.xml`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${asciiName}"`);
    res.sendFile(path.resolve(jatsPath));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener JATS XML', error: error.message });
  }
};

/**
 * Ver HTML5 semántico de un artículo.
 * GET /api/articulos/:id/html5
 */
export const verHTML5 = async (req, res) => {
  try {
    const { id } = req.params;
    const articulo = await Articulo.findByPk(id, {
      include: [
        { model: ArchivoArticulo, where: { tipo_archivo: 'galerada_epub' }, required: false }
      ]
    });
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });
    if (articulo.status !== 'publicado') return res.status(403).json({ message: 'El artículo no está publicado.' });

    let html5Path;
    const html5Archivo = articulo.ArchivoArticulos?.[0];
    if (html5Archivo && html5Archivo.url) {
      html5Path = path.join(__dirname, '..', html5Archivo.url);
      if (!fs.existsSync(html5Path)) {
        const galerada = await generarGaleradaArticulo(articulo.id);
        html5Path = path.join(__dirname, '..', galerada.html5RelativePath);
      }
    } else {
      const galerada = await generarGaleradaArticulo(articulo.id);
      html5Path = path.join(__dirname, '..', galerada.html5RelativePath);
    }

    const content = fs.readFileSync(html5Path, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener HTML5', error: error.message });
  }
};

/**
 * Descargar PDF completo de un número de revista (todos los artículos).
 * GET /api/numeros/:id/download-pdf
 */
export const descargarNumeroPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const numero = await NumeroRevista.findByPk(id, {
      include: [
        {
          model: Volumen,
          as: 'volumen',
          include: [{ model: Revista, as: 'revista', attributes: ['id', 'nombre'] }]
        }
      ]
    });

    if (!numero) {
      return res.status(404).json({ message: 'Número de revista no encontrado' });
    }

    // Si existe un PDF pre-generado, servirlo directamente
    if (numero.archivo_numero_pdf) {
      const pdfPath = path.join(__dirname, '..', numero.archivo_numero_pdf);
      if (fs.existsSync(pdfPath)) {
        const revistaNombre = numero.volumen?.revista?.nombre || 'Revista';
        const volNum = numero.volumen?.numero_volumen || '';
        const num = numero.numero || '';
        const fileName = `${revistaNombre.replace(/\s+/g, '_')}_Vol${volNum}_No${num}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.sendFile(path.resolve(pdfPath));
      }
    }

    // Fallback: generar en tiempo real si no existe
    const pdfResult = await generarPDFNumeroCompleto(id);
    const revistaNombre = numero.volumen?.revista?.nombre || 'Revista';
    const volNum = numero.volumen?.numero_volumen || '';
    const num = numero.numero || '';
    const fileName = `${revistaNombre.replace(/\s+/g, '_')}_Vol${volNum}_No${num}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(path.resolve(pdfResult.pdfPath));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al generar PDF del número', error: error.message });
  }
};

/**
 * Publicar un número completo: cambia estado del número a 'publicado',
 * publica todos sus artículos, y genera el PDF del número.
 * POST /api/numeros/:id/publicar
 */
export const publicarNumero = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_publicacion } = req.body;

    if (fecha_publicacion && fecha_publicacion < new Date().toISOString().split('T')[0]) {
      return res.status(400).json({ message: 'La fecha de publicación no puede ser anterior al día actual.' });
    }

    const numero = await NumeroRevista.findByPk(id, {
      include: [
        {
          model: Articulo,
          as: 'articulos',
          include: [
            { model: Usuario, as: 'autor_principal' },
            { model: AutorSecundario, include: [{ model: Usuario, as: 'usuario' }] }
          ]
        },
        { model: Volumen, as: 'volumen', include: [{ model: Revista, as: 'revista' }] }
      ]
    });

    if (!numero) {
      return res.status(404).json({ message: 'Número de revista no encontrado' });
    }

    const fechaPub = fecha_publicacion || new Date().toISOString().split('T')[0];

    // Publicar todos los artículos asignados
    const articulosPublicados = [];
    for (const art of numero.articulos || []) {
      if (art.status !== 'publicado') {
        await art.update({ status: 'publicado', fecha_publicacion: fechaPub });
        const galerada = await generarGaleradaArticulo(art.id);
        articulosPublicados.push({ articulo: art.id, galerada });
      }
    }

    // Generar PDF completo del número en segundo plano
    let numeroPdfPath = null;
    try {
      const pdfResult = await generarPDFNumeroCompleto(numero.id);
      numeroPdfPath = pdfResult.relativePath;
    } catch (pdfErr) {
      console.error('Error generando PDF del número:', pdfErr.message);
    }

    await numero.update({ status: 'publicado', fecha_publicacion: fechaPub, archivo_numero_pdf: numeroPdfPath });

    res.json({
      message: `Número publicado exitosamente. ${articulosPublicados.length} artículos publicados.`,
      numero: await NumeroRevista.findByPk(numero.id),
      articulosPublicados
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al publicar el número', error: error.message });
  }
};
