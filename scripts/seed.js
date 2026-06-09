import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/conexion.js';
import '../models/index.js';
import {
  Usuario, Area, Programa, LineaInvestigacion,
  Revista, Volumen, NumeroRevista,
  Articulo, ArchivoArticulo, Evaluacion
} from '../models/index.js';
import { generarGaleradaArticulo, generarPDFNumeroCompleto } from '../controllers/galeradaControllers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HASH = await bcrypt.hash('password123', 10);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeContentFile(dir, filename, label) {
  ensureDir(dir);
  const content = Array(250).fill(label).join(' ');
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, content, 'utf-8');
  return fullPath;
}

function generatePlaceholderSVG(title) {
  const hash = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1},60%,50%)"/>
      <stop offset="100%" stop-color="hsl(${hue2},60%,40%)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <text x="400" y="225" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="sans-serif" font-size="28" font-weight="600">${title.slice(0, 40)}</text>
</svg>`;
  return svg;
}

function writeImageFile(imgPath, title) {
  const dir = path.dirname(imgPath);
  ensureDir(dir);
  fs.writeFileSync(imgPath, generatePlaceholderSVG(title), 'utf-8');
  return imgPath;
}

async function seed() {
  console.log('Limpiando datos existentes...');
  await Evaluacion.destroy({ where: {} });
  await ArchivoArticulo.destroy({ where: {} });
  await Articulo.destroy({ where: {} });
  await NumeroRevista.destroy({ where: {} });
  await Volumen.destroy({ where: {} });
  await Revista.destroy({ where: {} });
  await LineaInvestigacion.destroy({ where: {} });
  await Programa.destroy({ where: {} });
  await Area.destroy({ where: {} });
  await Usuario.destroy({ where: {} });

  console.log('Creando usuarios...');
  const usuarios = await Usuario.bulkCreate([
    { nombre: 'Carlos', apellido: 'Mendoza', cedula: 'V-12345678', correo: 'admin@saberunerg.com', password: HASH, afiliacion_institucional: 'UNERG', rol: 'admin' },
    { nombre: 'María', apellido: 'Pérez', cedula: 'V-20123456', correo: 'editor@saberunerg.com', password: HASH, afiliacion_institucional: 'UNERG', rol: 'editor' },
    { nombre: 'José', apellido: 'García', cedula: 'V-18234567', correo: 'revisor1@saberunerg.com', password: HASH, afiliacion_institucional: 'UCV', rol: 'revisor' },
    { nombre: 'Ana', apellido: 'Torres', cedula: 'V-19345678', correo: 'revisor2@saberunerg.com', password: HASH, afiliacion_institucional: 'USB', rol: 'revisor' },
    { nombre: 'Pedro', apellido: 'Rodríguez', cedula: 'V-25456789', correo: 'investigador1@saberunerg.com', password: HASH, afiliacion_institucional: 'UNERG', rol: 'investigador' },
    { nombre: 'Laura', apellido: 'Hernández', cedula: 'V-27567890', correo: 'investigador2@saberunerg.com', password: HASH, afiliacion_institucional: 'UNERG', rol: 'investigador' },
    { nombre: 'Diego', apellido: 'Castillo', cedula: 'V-26678901', correo: 'investigador3@saberunerg.com', password: HASH, afiliacion_institucional: 'LUZ', rol: 'investigador' },
  ]);

  console.log('Creando áreas, programas y líneas...');
  const [areaCiencias, areaIngenieria, areaSalud] = await Area.bulkCreate([
    { nombre: 'Ciencias Naturales y Exactas', color_institucional: '#1B5E20' },
    { nombre: 'Ingeniería y Tecnología', color_institucional: '#0D47A1' },
    { nombre: 'Ciencias de la Salud', color_institucional: '#B71C1C' },
  ]);

  const programas = await Programa.bulkCreate([
    { nombre: 'Biología', area_id: areaCiencias.id },
    { nombre: 'Química', area_id: areaCiencias.id },
    { nombre: 'Ingeniería de Sistemas', area_id: areaIngenieria.id },
    { nombre: 'Medicina', area_id: areaSalud.id },
  ]);

  const lineas = await LineaInvestigacion.bulkCreate([
    { nombre: 'Ecología Tropical', programa_id: programas[0].id },
    { nombre: 'Química Ambiental', programa_id: programas[1].id },
    { nombre: 'Inteligencia Artificial', programa_id: programas[2].id },
    { nombre: 'Desarrollo de Software', programa_id: programas[2].id },
    { nombre: 'Investigación Biomédica', programa_id: programas[3].id },
    { nombre: 'Salud Pública', programa_id: programas[3].id },
  ]);

  console.log('Creando revistas, volúmenes y números...');

  // Asegurar imagen de portada por defecto
  const revDir = path.join(__dirname, '..', 'uploads', 'revistas');
  ensureDir(revDir);
  const revCoverPath = path.join(revDir, 'cover_default.jpg');
  if (!fs.existsSync(revCoverPath)) {
    // Crear un SVG placeholder como portada de revista
    const revSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
  <rect width="1200" height="400" fill="#1a1a2e"/>
  <text x="600" y="200" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="42" font-weight="700">REVISTA CIENTÍFICA</text>
</svg>`;
    fs.writeFileSync(revCoverPath.replace('.jpg', '.svg'), revSvg, 'utf-8');
  }

  const revistas = await Revista.bulkCreate([
    { nombre: 'Revista Científica UNERG', issn: '2026-0001', periodicidad: 'semestral', descripcion: 'Publicación científica de la UNERG', portada: '/uploads/revistas/cover_default.jpg' },
    { nombre: 'Ciencia e Investigación', issn: '2026-0002', periodicidad: 'anual', descripcion: 'Revista multidisciplinaria', portada: '/uploads/revistas/cover_default.jpg' },
  ]);

  for (const rev of revistas) {
    const vol = await Volumen.create({ revista_id: rev.id, numero_volumen: 1 });
    await NumeroRevista.bulkCreate([
      { revista_id: rev.id, volumen_id: vol.id, numero: 1, anio: 2024, status: 'publicado', fecha_publicacion: '2024-06-15', views: Math.floor(Math.random() * 500) + 100, downloads: Math.floor(Math.random() * 200) + 50 },
      { revista_id: rev.id, volumen_id: vol.id, numero: 2, anio: 2024, status: 'publicado', fecha_publicacion: '2024-12-15', views: Math.floor(Math.random() * 300) + 80, downloads: Math.floor(Math.random() * 150) + 30 },
      { revista_id: rev.id, volumen_id: vol.id, numero: 3, anio: 2025, status: 'futuro', views: 0, downloads: 0 },
    ]);
  }

  console.log('Creando artículos en diferentes estados...');
  const [n1r1, n2r1, n1r2, n2r2] = await NumeroRevista.findAll({ order: [['id', 'ASC']] });
  const hoy = () => new Date().toISOString().slice(0, 10);
  const atras = (d) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt.toISOString().slice(0, 10); };

  const articulosData = [
    // PUBLICADOS (con manuscrito_original solamente)
    { titulo_es: 'Diversidad de anfibios en el bioma llanero venezolano', titulo_en: 'Amphibian diversity in the Venezuelan llano biome', resumen_es: 'Estudio sobre la diversidad de anfibios en los llanos venezolanos durante doce meses.', resumen_en: 'Study on amphibian diversity in the Venezuelan plains over twelve months.', palabras_clave: 'anfibios, biodiversidad, llanos, Venezuela', status: 'publicado', autor: usuarios[4], linea: lineas[0], revista_id: revistas[0].id, num: n1r1, f_recepcion: atras(120), f_publicacion: atras(30), doi: '10.58927/suerg.2024.001', img: '/uploads/articulos/anfibios.svg', pages: '1-12', hasCorregido: false },
    { titulo_es: 'Síntesis de compuestos heterocíclicos con actividad antimicrobiana', titulo_en: 'Synthesis of heterocyclic compounds with antimicrobial activity', resumen_es: 'Síntesis de quince compuestos heterocíclicos con potencial antimicrobiano.', resumen_en: 'Synthesis of fifteen heterocyclic compounds with antimicrobial potential.', palabras_clave: 'química orgánica, heterociclos, antimicrobianos', status: 'publicado', autor: usuarios[5], linea: lineas[1], revista_id: revistas[0].id, num: n1r1, f_recepcion: atras(110), f_publicacion: atras(25), doi: '10.58927/suerg.2024.002', img: '/uploads/articulos/heterociclos.svg', pages: '13-24', hasCorregido: false },
    // PUBLICADO (con manuscrito_corregido para probar prioridad)
    { titulo_es: 'Red neuronal convolucional para detección de enfermedades foliares', titulo_en: 'CNN for foliar disease detection', resumen_es: 'Implementación de una CNN para clasificar enfermedades en hojas de caña de azúcar.', resumen_en: 'Implementation of a CNN to classify diseases in sugarcane leaves.', palabras_clave: 'deep learning, CNN, caña de azúcar, fitopatología', status: 'publicado', autor: usuarios[4], linea: lineas[2], revista_id: revistas[1].id, num: n1r2, f_recepcion: atras(100), f_publicacion: atras(20), doi: '10.58927/ci.2024.001', img: '/uploads/articulos/cnn_hojas.svg', pages: '1-15', hasCorregido: true },
    // PUBLICADO (con manuscrito_corregido)
    { titulo_es: 'Impacto de la deforestación sobre la calidad del agua', titulo_en: 'Impact of deforestation on water quality', resumen_es: 'Evaluación del impacto de la deforestación en la calidad del agua superficial.', resumen_en: 'Assessment of deforestation impact on surface water quality.', palabras_clave: 'deforestación, calidad del agua, cuenca hidrográfica', status: 'publicado', autor: usuarios[5], linea: lineas[1], revista_id: revistas[0].id, num: n2r1, f_recepcion: atras(90), f_publicacion: atras(15), doi: '10.58927/suerg.2024.003', img: '/uploads/articulos/deforestacion.svg', pages: '25-38', hasCorregido: true },
    // OTROS ESTADOS
    { titulo_es: 'Prevalencia de hipertensión arterial en comunidades rurales', titulo_en: 'Prevalence of hypertension in rural communities', resumen_es: 'Estudio transversal sobre prevalencia de hipertensión en el estado Guárico.', resumen_en: 'Cross-sectional study on hypertension prevalence in Guárico state.', palabras_clave: 'hipertensión, salud pública, epidemiología, Guárico', status: 'aprobado', autor: usuarios[6], linea: lineas[5], revista_id: revistas[0].id, num: null, f_recepcion: atras(60), doi: '10.58927/suerg.2024.004', img: '/uploads/articulos/hipertension.svg', pages: '', hasCorregido: false },
    { titulo_es: 'Modelo de optimización logística para cadenas de suministro agrícola', titulo_en: 'Logistics optimization model for agricultural supply chains', resumen_es: 'Modelo MILP para optimizar transporte de productos agrícolas perecederos.', resumen_en: 'MILP model to optimize perishable agricultural product transportation.', palabras_clave: 'optimización, logística, programación lineal, agricultura', status: 'En_evaluacion', autor: usuarios[6], linea: lineas[2], revista_id: revistas[1].id, num: null, f_recepcion: atras(45), img: '/uploads/articulos/logistica.svg', pages: '', hasCorregido: false },
    { titulo_es: 'Análisis de redes sociales para identificar desinformación en salud', titulo_en: 'Social network analysis to identify health misinformation', resumen_es: 'Análisis de 50,000 publicaciones para detectar desinformación en salud.', resumen_en: 'Analysis of 50,000 posts to detect health misinformation.', palabras_clave: 'redes sociales, desinformación, salud, NLP', status: 'por_evaluar', autor: usuarios[4], linea: lineas[2], revista_id: revistas[1].id, num: null, f_recepcion: atras(30), img: '/uploads/articulos/redes_sociales.svg', pages: '', hasCorregido: false },
    { titulo_es: 'Evaluación de la actividad larvicida de extractos de neem', titulo_en: 'Evaluation of larvicidal activity of neem extracts', resumen_es: 'Evaluación de extractos de Azadirachta indica contra larvas de Aedes aegypti.', resumen_en: 'Evaluation of Azadirachta indica extracts against Aedes aegypti larvae.', palabras_clave: 'neem, Aedes aegypti, larvicida, extractos naturales', status: 'por_corregir', autor: usuarios[5], linea: lineas[4], revista_id: revistas[0].id, num: null, f_recepcion: atras(25), img: '/uploads/articulos/neem.svg', pages: '', hasCorregido: false },
    { titulo_es: 'Segmentación de imágenes médicas mediante U-Net con atención', titulo_en: 'Medical image segmentation using attention U-Net', resumen_es: 'Arquitectura U-Net con atención para segmentación de lesiones cerebrales.', resumen_en: 'Attention U-Net architecture for brain lesion segmentation.', palabras_clave: 'segmentación, U-Net, atención, deep learning', status: 'enviado', autor: usuarios[4], linea: lineas[2], revista_id: revistas[1].id, num: null, f_recepcion: atras(10), img: '/uploads/articulos/unet.svg', pages: '', hasCorregido: false },
    { titulo_es: 'Algoritmo genético para optimización de rutas de transporte público', titulo_en: 'Genetic algorithm for public transport route optimization', resumen_es: 'Algoritmo genético para optimizar rutas de transporte en San Juan de los Morros.', resumen_en: 'Genetic algorithm to optimize transport routes in San Juan de los Morros.', palabras_clave: 'algoritmos genéticos, transporte público, optimización', status: 'rechazado', autor: usuarios[6], linea: lineas[2], revista_id: revistas[1].id, num: null, f_recepcion: atras(80), img: '/uploads/articulos/genetico.svg', pages: '', hasCorregido: false },
  ];

  const createdArticles = [];
  for (const a of articulosData) {
    const article = await Articulo.create({
      revista_id: a.revista_id,
      linea_id: a.linea.id,
      autor_principal_id: a.autor.id,
      titulo_es: a.titulo_es,
      titulo_en: a.titulo_en,
      resumen_es: a.resumen_es,
      resumen_en: a.resumen_en,
      palabras_clave: a.palabras_clave,
      firma_originalidad: true,
      firma_etica: true,
      status: a.status,
      numero_revista_id: a.num?.id || null,
      fecha_recepcion: a.f_recepcion,
      fecha_publicacion: a.f_publicacion || null,
      doi: a.doi || null,
      img: a.img || null,
      pages: a.pages || null,
      views: a.status === 'publicado' ? Math.floor(Math.random() * 300) + 20 : 0,
    });
    createdArticles.push({ ...a, db: article });
  }

  console.log('Creando archivos físicos con contenido para cada artículo...');
  for (const a of createdArticles) {
    const artDir = path.join(__dirname, '..', 'uploads', 'articulos', String(a.db.id));
    ensureDir(artDir);

    // imagen de portada
    if (a.img) {
      const imgRelative = a.img.startsWith('/') ? a.img.slice(1) : a.img;
      const imgPath = path.join(__dirname, '..', imgRelative);
      writeImageFile(imgPath, a.titulo_es);
    }

    // manuscrito_original
    const moPath = writeContentFile(artDir, 'manuscrito_original.txt', 'manuscrito original');
    await ArchivoArticulo.create({
      articulo_id: a.db.id,
      tipo_archivo: 'manuscrito_original',
      url: `uploads/articulos/${a.db.id}/manuscrito_original.txt`,
      version: 1,
      es_anonimo: false,
    });

    // manuscrito_anonimizado
    const maPath = writeContentFile(artDir, 'manuscrito_anonimizado.txt', 'anonimizado');
    await ArchivoArticulo.create({
      articulo_id: a.db.id,
      tipo_archivo: 'manuscrito_anonimizado',
      url: `uploads/articulos/${a.db.id}/manuscrito_anonimizado.txt`,
      version: 1,
      es_anonimo: true,
    });

    // ficha_autores
    const faPath = writeContentFile(artDir, 'ficha_autores.txt', 'ficha autores');
    await ArchivoArticulo.create({
      articulo_id: a.db.id,
      tipo_archivo: 'ficha_autores',
      url: `uploads/articulos/${a.db.id}/ficha_autores.txt`,
      version: 1,
      es_anonimo: false,
    });

    // manuscrito_corregido (solo para artículos que lo requieren)
    if (a.hasCorregido) {
      const mcPath = writeContentFile(artDir, 'manuscrito_corregido.txt', 'manuscrito corregido');
      await ArchivoArticulo.create({
        articulo_id: a.db.id,
        tipo_archivo: 'manuscrito_corregido',
        url: `uploads/articulos/${a.db.id}/manuscrito_corregido.txt`,
        version: 2,
        es_anonimo: false,
      });
    }
  }

  console.log('Generando galeradas para artículos publicados...');
  for (const a of createdArticles) {
    if (a.status === 'publicado') {
      try {
        const galerada = await generarGaleradaArticulo(a.db.id);
        console.log(`  Galerada generada: ${a.db.titulo_es} → ${galerada.pdfRelativePath}`);
      } catch (err) {
        console.error(`  Error generando galerada para ${a.db.titulo_es}:`, err.message);
      }
    }
  }

  console.log('Creando evaluaciones...');
  const rev1 = usuarios[2], rev2 = usuarios[3];
  const artEnEvaluacion = createdArticles.find(a => a.status === 'En_evaluacion');
  if (artEnEvaluacion) {
    await Evaluacion.bulkCreate([
      { articulo_id: artEnEvaluacion.db.id, revisor_id: rev1.id, veredicto: 'aprobado', observaciones_editor: 'Artículo bien estructurado', observaciones_autor: 'Corregir figuras', fecha_evaluacion: new Date(), ronda: 1 },
      { articulo_id: artEnEvaluacion.db.id, revisor_id: rev2.id, veredicto: 'corregir', observaciones_editor: 'Metodología aceptable', observaciones_autor: 'Ampliar la discusión', fecha_evaluacion: new Date(), ronda: 1 },
    ]);
  }

  const artPorCorregir = createdArticles.find(a => a.status === 'por_corregir');
  if (artPorCorregir) {
    await Evaluacion.bulkCreate([
      { articulo_id: artPorCorregir.db.id, revisor_id: rev1.id, veredicto: 'corregir', observaciones_editor: 'Correcciones menores requeridas', observaciones_autor: 'Revisar formato de referencias', fecha_evaluacion: new Date(), ronda: 1 },
    ]);
  }

  const artRechazado = createdArticles.find(a => a.status === 'rechazado');
  if (artRechazado) {
    await Evaluacion.bulkCreate([
      { articulo_id: artRechazado.db.id, revisor_id: rev1.id, veredicto: 'rechazado', observaciones_editor: 'No cumple con el alcance de la revista', observaciones_autor: 'Metodología insuficiente', fecha_evaluacion: new Date(), ronda: 1 },
    ]);
  }

  console.log('Generando PDFs de números publicados...');
  const numerosPublicados = await NumeroRevista.findAll({ where: { status: 'publicado' } });
  for (const num of numerosPublicados) {
    try {
      const pdfResult = await generarPDFNumeroCompleto(num.id);
      await num.update({ archivo_numero_pdf: pdfResult.relativePath });
      console.log(`  PDF número generado: Nº ${num.numero} → ${pdfResult.relativePath}`);
    } catch (err) {
      console.error(`  Error generando PDF del número ${num.numero}:`, err.message);
    }
  }

  console.log('Seed completado exitosamente.\n');
  console.log('Usuarios creados (contraseña: password123):');
  for (const u of usuarios) {
    console.log(`  ${u.rol.padEnd(14)} ${u.correo}`);
  }
  console.log(`\n${createdArticles.length} artículos creados (${articulosData.filter(a => a.status === 'publicado').length} publicados).`);
  console.log('Revistas, volúmenes, números, líneas y evaluaciones creados.');
  console.log('\nArtículos publicados con galerada generada:');
  for (const a of createdArticles.filter(a => a.status === 'publicado')) {
    const corregido = a.hasCorregido ? ' (con manuscrito_corregido)' : ' (manuscrito_original)';
    console.log(`  - ${a.db.titulo_es}${corregido}`);
  }
  console.log('\nPruebas disponibles:');
  console.log('  1. Ver galerada HTML:   http://localhost:3000/api/galerada/articulos/{id}/galerada');
  console.log('  2. Descargar PDF:       http://localhost:3000/api/galerada/articulos/{id}/download-galerada');
  console.log('  3. Descargar JATS XML:  http://localhost:3000/api/galerada/articulos/{id}/jats');
  console.log('  4. Ver HTML5 semántico: http://localhost:3000/api/galerada/articulos/{id}/html5');
  console.log('  5. Descargar PDF número: http://localhost:3000/api/galerada/numeros/{numId}/download-pdf');
}

try {
  await db.authenticate();
  await seed();
} catch (e) {
  console.error('Error en seed:', e);
} finally {
  await db.close();
}
