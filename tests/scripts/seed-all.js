/**
 * Seeder completo: usuarios, áreas, programas, líneas, revistas,
 * volúmenes, números, artículos, archivos y evaluaciones.
 *
 * Uso:  npm run seed:all
 */
import bcrypt from 'bcrypt';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../../config/conexion.js';
import '../../models/index.js';
import {
  Usuario,
  Area,
  Programa,
  LineaInvestigacion,
  Revista,
  Volumen,
  NumeroRevista,
  Articulo,
  ArchivoArticulo,
  Evaluacion,
} from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_ROOT = join(__dirname, '..', '..', '..');

function generateRevistaCoverSVG(nombre, issn, periodicidad, color) {
  const lines = nombre.split(' ');
  const title1 = lines.slice(0, Math.ceil(lines.length / 2)).join(' ');
  const title2 = lines.slice(Math.ceil(lines.length / 2)).join(' ');
  const periodicidadLabel = periodicidad === 'semestral' ? 'Periodicidad Semestral' : 'Periodicidad Anual';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0b0b0b;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#1a2332;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#bg)"/>
  <rect x="0" y="0" width="6" height="400" fill="${color}"/>
  <circle cx="520" cy="80" r="60" fill="none" stroke="${color}" stroke-width="1" opacity="0.2"/>
  <circle cx="520" cy="80" r="40" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
  <circle cx="480" cy="340" r="80" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.1"/>
  <line x1="40" y1="120" x2="280" y2="120" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
  <text x="40" y="100" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#ffffff" letter-spacing="-0.5">${title1}</text>
  <text x="40" y="160" font-family="Georgia, serif" font-size="36" font-weight="700" fill="${color}" letter-spacing="-0.5">${title2}</text>
  <text x="40" y="200" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#666" letter-spacing="0.15em">ISSN ${issn}</text>
  <rect x="40" y="220" width="80" height="2" fill="${color}"/>
  <text x="40" y="260" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#888" letter-spacing="0.1em">${periodicidadLabel}</text>
</svg>`;
}

const PASSWORD_HASH = await bcrypt.hash('password123', 10);
const ADMIN_HASH = await bcrypt.hash('admin123', 10);

/* ───────────────────── USUARIOS ───────────────────── */

const usuariosData = [
  {
    nombre: 'Carlos',
    segundo_nombre: 'Alberto',
    apellido: 'Mendoza',
    segundo_apellido: 'Rivas',
    cedula: 'V-12345678',
    correo: 'admin@saberunerg.com',
    password: ADMIN_HASH,
    afiliacion_institucional: 'UNERG',
    rol: 'admin',
  },
  {
    nombre: 'María',
    segundo_nombre: 'Elena',
    apellido: 'Pérez',
    segundo_apellido: 'López',
    cedula: 'V-20123456',
    correo: 'editor@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'UNERG',
    rol: 'editor',
  },
  {
    nombre: 'José',
    segundo_nombre: 'Luis',
    apellido: 'García',
    segundo_apellido: 'Fernández',
    cedula: 'V-18234567',
    correo: 'revisor1@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'UCV',
    rol: 'revisor',
  },
  {
    nombre: 'Ana',
    segundo_nombre: 'Lucía',
    apellido: 'Torres',
    segundo_apellido: 'Morales',
    cedula: 'V-19345678',
    correo: 'revisor2@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'USB',
    rol: 'revisor',
  },
  {
    nombre: 'Pedro',
    segundo_nombre: 'Antonio',
    apellido: 'Rodríguez',
    segundo_apellido: 'Díaz',
    cedula: 'V-25456789',
    correo: 'investigador1@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'UNERG',
    rol: 'investigador',
  },
  {
    nombre: 'Laura',
    segundo_nombre: 'Camila',
    apellido: 'Hernández',
    segundo_apellido: 'Suárez',
    cedula: 'V-27567890',
    correo: 'investigador2@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'UNERG',
    rol: 'investigador',
  },
  {
    nombre: 'Diego',
    segundo_nombre: 'Fernando',
    apellido: 'Castillo',
    segundo_apellido: 'Medina',
    cedula: 'V-26678901',
    correo: 'investigador3@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'LUZ',
    rol: 'investigador',
  },
  {
    nombre: 'Carmen',
    segundo_nombre: 'Rosa',
    apellido: 'Vargas',
    segundo_apellido: 'Pinto',
    cedula: 'V-28789012',
    correo: 'investigador4@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'UCV',
    rol: 'investigador',
  },
  {
    nombre: 'Andrés',
    segundo_nombre: 'Mauricio',
    apellido: 'Rojas',
    segundo_apellido: 'Blanco',
    cedula: 'V-24890123',
    correo: 'investigador5@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'UNERG',
    rol: 'investigador',
  },
  {
    nombre: 'Valentina',
    segundo_nombre: 'Isabel',
    apellido: 'Mendoza',
    segundo_apellido: 'Guzmán',
    cedula: 'V-29901234',
    correo: 'investigador6@saberunerg.com',
    password: PASSWORD_HASH,
    afiliacion_institucional: 'USB',
    rol: 'investigador',
  },
];

/* ───────────────────── ÁREAS ───────────────────── */

const areasData = [
  { nombre: 'Ciencias Naturales y Exactas', color_institucional: '#1B5E20' },
  { nombre: 'Ingeniería y Tecnología', color_institucional: '#0D47A1' },
  { nombre: 'Ciencias de la Salud', color_institucional: '#B71C1C' },
];

/* ───────────────────── PROGRAMAS ───────────────────── */

const programasData = [
  { area: 'Ciencias Naturales y Exactas', nombre: 'Biología' },
  { area: 'Ciencias Naturales y Exactas', nombre: 'Química' },
  { area: 'Ciencias Naturales y Exactas', nombre: 'Matemáticas' },
  { area: 'Ingeniería y Tecnología', nombre: 'Ingeniería de Sistemas' },
  { area: 'Ingeniería y Tecnología', nombre: 'Ingeniería Electrónica' },
  { area: 'Ciencias de la Salud', nombre: 'Medicina' },
  { area: 'Ciencias de la Salud', nombre: 'Salud Pública' },
];

/* ───────────────────── LÍNEAS ───────────────────── */

const lineasData = [
  { programa: 'Biología', nombre: 'Ecología Tropical' },
  { programa: 'Biología', nombre: 'Biodiversidad y Conservación' },
  { programa: 'Biología', nombre: 'Biología Molecular y Celular' },
  { programa: 'Química', nombre: 'Química Ambiental' },
  { programa: 'Química', nombre: 'Química Orgánica' },
  { programa: 'Matemáticas', nombre: 'Matemáticas Aplicadas' },
  { programa: 'Matemáticas', nombre: 'Estadística y Probabilidad' },
  { programa: 'Ingeniería de Sistemas', nombre: 'Inteligencia Artificial' },
  { programa: 'Ingeniería de Sistemas', nombre: 'Desarrollo de Software' },
  { programa: 'Ingeniería de Sistemas', nombre: 'Redes y Seguridad' },
  { programa: 'Ingeniería Electrónica', nombre: 'Electrónica y Control' },
  { programa: 'Ingeniería Electrónica', nombre: 'Telecomunicaciones' },
  { programa: 'Medicina', nombre: 'Investigación Biomédica' },
  { programa: 'Medicina', nombre: 'Enfermedades Infecciosas' },
  { programa: 'Salud Pública', nombre: 'Epidemiología' },
  { programa: 'Salud Pública', nombre: 'Salud Comunitaria' },
];

/* ───────────────────── REVISTAS ───────────────────── */

const revistasData = [
  {
    nombre: 'Revista Científica UNERG',
    issn: '2026-0001',
    periodicidad: 'semestral',
    descripcion: 'Publicación científica de la Universidad Nacional Experimental de los Llanos Rómulo Gallegos',
    portada: '/uploads/revistas/1/cover.svg',
    coverColor: '#3ecf8e',
  },
  {
    nombre: 'Ciencia e Investigación',
    issn: '2026-0002',
    periodicidad: 'anual',
    descripcion: 'Revista multidisciplinaria de investigación científica',
    portada: '/uploads/revistas/2/cover.svg',
    coverColor: '#5b8def',
  },
];

/* ───────────────────── ARTÍCULOS ───────────────────── */

function makeFechaReciente(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().slice(0, 10);
}

const articulosData = [
  {
    titulo_es: 'Diversidad de anfibios en el bioma llanero venezolano',
    titulo_en: 'Amphibian diversity in the Venezuelan llano biome',
    resumen_es: 'El bioma llanero venezolano, caracterizado por su extensa planicie inundable y estacionalidad marcada, constituye uno de los ecosistemas menos estudiados en cuanto a su diversidad herpetológica a nivel regional. En el presente estudio se evaluó la riqueza específica, abundancia y composición de la comunidad de anfibios en tres áreas naturales representativas de los estados Guárico y Anzoátegui durante un periodo de doce meses. Se emplearon métodos de muestreo visual-acústico, captura con redes de mano y trampas de caída en cuatro estaciones del año. Se registraron un total de 42 especies pertenecientes a 12 familias, siendo Hylidae, Leptodactylidae y Bufonidae los grupos más diversos. Los valores del índice de diversidad de Shannon variaron entre 3.2 y 3.8, indicando una alta heterogeneidad entre sitios. Se identificaron tres especies con distribución restringida al país y dos registros nuevos para el estado Anzoátegui. Las áreas con mayor cobertura de vegetación ribereña presentaron significativamente mayor riqueza que las zonas abiertas de sabana. Los factores ambientales que mejor explicaron los patrones de distribución fueron la temperatura media, la precipitación acumulada y la disponuridad de cuerpos de agua permanentes. Se recomienda la implementación de planes de conservación que incluyan la protección de humedales y la restauración de riberas como estrategia prioritaria para mantener la diversidad de anfibios en la región.',
    resumen_en: 'The Venezuelan llano biome, characterized by its extensive floodplain and marked seasonality, constitutes one of the least studied ecosystems regarding herpetological diversity at the regional level. This study assessed species richness, abundance, and composition of the amphibian community in three representative natural areas of Guárico and Anzoátegui states over a twelve-month period. Visual-acoustic sampling methods, hand net capture, and pitfall traps were employed across four seasonal stations. A total of 42 species belonging to 12 families were recorded, with Hylidae, Leptodactylidae, and Bufonidae being the most diverse groups. Shannon diversity index values ranged from 3.2 to 3.8, indicating high heterogeneity among sites. Three species with restricted national distribution and two new records for Anzoátegui state were identified. Areas with greater riparian vegetation cover showed significantly higher richness than open savanna zones. Environmental factors that best explained distribution patterns were mean temperature, accumulated precipitation, and availability of permanent water bodies. The implementation of conservation plans including wetland protection and riparian restoration as a priority strategy is recommended to maintain amphibian diversity in the region.',
    palabras_clave: 'anfibios, biodiversidad, llanos, Venezuela, conservación, herpetología, Shannon',
    status: 'aprobado',
    autor: 'investigador1@saberunerg.com',
    linea: 'Ecología Tropical',
    revista: 'Revista Científica UNERG',
    diasAtras: 45,
    img: '/uploads/articulos/1/cover.svg',
    doi: '10.58927/suerg.2024.001',
    volumen: 1,
    numero: 1,
  },
  {
    titulo_es: 'Síntesis de compuestos heterocíclicos con actividad antimicrobiana',
    titulo_en: 'Synthesis of heterocyclic compounds with antimicrobial activity',
    resumen_es: 'La emergencia de resistencia antimicrobiana representa una de las principales amenazas para la salud pública a nivel mundial, lo que ha impulsado la búsqueda de nuevos compuestos químicos con potencial terapéutico. En este estudio se sintetizaron quince nuevos compuestos heterocíclicos derivados del núcleo tiazólico mediante reacciones de ciclación entre tionoureas y α-halocetonas en presencia de base. Los compuestos fueron caracterizados espectroscópicamente mediante IR, RMN de 1H y 13C, y espectrometría de masas. Posteriormente, se evaluó su actividad antimicrobiana contra cepas de Staphylococcus aureus, Escherichia coli, Pseudomonas aeruginosa y Candida albicans utilizando el método de dilución en agar. Tres de los quince compuestos sintetizados (HT-3, HT-7 y HT-12) mostraron concentraciones inhibitorias mínimas comparables a la ampicilina (16-32 μg/mL) contra bacterias gram positivas. El compuesto HT-7 presentó la mayor actividad, con una CIM de 8 μg/mL contra S. aureus y actividad fungicida moderada contra C. albicans. Los estudios de relación estructura-actividad revelaron que la presencia de grupos metoxilo en posición orto del anillo fenilo mejoró significativamente la actividad antibacteriana. Los análisis de toxicidad in vitro en células HepG2 mostraron bajos niveles de citotoxicidad (CC50 > 200 μg/mL) para los compuestos más activos, lo que sugiere un perfil de seguridad favorable. Estos resultados abren nuevas perspectivas para el desarrollo de agentes antimicrobianos derivados de heterociclos tiazólicos.',
    resumen_en: 'The emergence of antimicrobial resistance represents one of the major threats to public health worldwide, driving the search for new chemical compounds with therapeutic potential. In this study, fifteen new heterocyclic compounds derived from the thiazole nucleus were synthesized through cyclization reactions between thionoureas and α-haloketones in the presence of base. The compounds were spectroscopically characterized using IR, 1H and 13C NMR, and mass spectrometry. Subsequently, their antimicrobial activity was evaluated against strains of Staphylococcus aureus, Escherichia coli, Pseudomonas aeruginosa, and Candida albicans using the agar dilution method. Three of the fifteen synthesized compounds (HT-3, HT-7, and HT-12) showed minimum inhibitory concentrations comparable to ampicillin (16-32 μg/mL) against gram-positive bacteria. Compound HT-7 exhibited the highest activity, with an MIC of 8 μg/mL against S. aureus and moderate fungicidal activity against C. albicans. Structure-activity relationship studies revealed that the presence of methoxy groups in the ortho position of the phenyl ring significantly improved antibacterial activity. In vitro toxicity studies on HepG2 cells showed low cytotoxicity levels (CC50 > 200 μg/mL) for the most active compounds, suggesting a favorable safety profile. These results open new perspectives for the development of antimicrobial agents derived from thiazole heterocycles.',
    palabras_clave: 'química orgánica, heterociclos, antimicrobianos, tiazol, resistencia',
    status: 'aprobado',
    autor: 'investigador2@saberunerg.com',
    linea: 'Química Orgánica',
    revista: 'Revista Científica UNERG',
    diasAtras: 38,
    img: '/uploads/articulos/2/cover.svg',
    doi: '10.58927/suerg.2024.002',
    volumen: 1,
    numero: 2,
  },
  {
    titulo_es: 'Modelo de optimización logística para cadenas de suministro agrícola',
    titulo_en: 'Logistics optimization model for agricultural supply chains',
    resumen_es: 'La eficiencia en las cadenas de suministro agrícola es un factor determinante para la competitividad del sector agropecuario en países en desarrollo. En Venezuela, los problemas logísticos asociados al transporte de productos desde las zonas de producción hasta los centros de distribución generan pérdidas significativas que afectan tanto a productores como consumidores. El presente estudio propone un modelo matemático de programación lineal entera mixta (MILP) para optimizar el transporte de productos agrícolas perecederos desde fincas ubicadas en los estados Guárico, Portuguesa y Barinas hacia centros de distribución y mercados mayoristas en la región central del país. El modelo considera restricciones de capacidad vehicular, ventanas de tiempo de entrega, costos de combustible y deterioro de la mercancía. Se utilizaron datos reales de distancias, costos operativos y demanda de arroz, maíz y sorgo obtenidos de productores locales y transportistas. El modelo fue resuelto utilizando el solver CPLEX implementado en el lenguaje de modelado GAMS. Los resultados muestran que la optimización logística propuesta puede reducir los costos totales de transporte en un 18-22% y disminuir las pérdidas por deterioro en un 15% respecto al sistema actual no optimizado. El ahorro anual estimado es de aproximadamente 2.4 millones de dólares para la cadena de arroz. Además, se identificaron las rutas óptimas que minimizan la huella de carbono del transporte, lo que contribuye a la sostenibilidad ambiental del sector.',
    resumen_en: 'Efficiency in agricultural supply chains is a determining factor for the competitiveness of the agricultural sector in developing countries. In Venezuela, logistical problems associated with transporting products from production zones to distribution centers generate significant losses affecting both producers and consumers. This study proposes a mixed-integer linear programming (MILP) model to optimize the transportation of perishable agricultural products from farms located in Guárico, Portuguesa, and Barinas states to distribution centers and wholesale markets in the central region of the country. The model considers vehicle capacity constraints, delivery time windows, fuel costs, and merchandise deterioration. Real data on distances, operating costs, and demand for rice, corn, and sorghum were obtained from local producers and transporters. The model was solved using the CPLEX solver implemented in the GAMS modeling language. Results show that the proposed logistics optimization can reduce total transportation costs by 18-22% and decrease deterioration losses by 15% compared to the current non-optimized system. Estimated annual savings are approximately 2.4 million dollars for the rice chain. Additionally, optimal routes that minimize the carbon footprint of transportation were identified, contributing to the environmental sustainability of the sector.',
    palabras_clave: 'optimización, logística, programación lineal, agricultura, MILP, cadenas de suministro',
    status: 'aprobado',
    autor: 'investigador3@saberunerg.com',
    linea: 'Matemáticas Aplicadas',
    revista: 'Ciencia e Investigación',
    diasAtras: 30,
    img: '/uploads/articulos/3/cover.svg',
    doi: '10.58927/ci.2024.003',
    volumen: 1,
    numero: 1,
  },
  {
    titulo_es: 'Red neuronal convolucional para detección de enfermedades foliares en caña de azúcar',
    titulo_en: 'Convolutional neural network for foliar disease detection in sugarcane',
    resumen_es: 'La caña de azúcar constituye uno de los cultivos más importantes económicamente en Venezuela, sin embargo, las enfermedades foliares representan una amenaza significativa para la productividad. La detección temprana de estas enfermedades es crucial para implementar estrategias de control oportunas. En este trabajo se implementó una red neuronal convolucional (CNN) basada en la arquitectura ResNet-50 pre-entrenada con transfer learning para la clasificación automática de imágenes de hojas de caña de azúcar afectadas por enfermedades fúngicas. Se construyó un conjunto de datos con 3,200 imágenes de campo clasificadas en cinco categorías: saludable, roya (Puccinia melanocephala), mancha anular (Leptosphaeria sacchari), carbón (Ustilago scitaminea) y marchitez (Fusarium moniliforme). El conjunto de datos se dividió en 80% entrenamiento, 10% validación y 10% prueba. Se aplicaron técnicas de aumento de datos para mitigar el desbalanceo de clases. El modelo fine-tuned alcanzó una precisión del 94.7% en el conjunto de prueba, con un F1-score macro de 0.93. La matriz de confusión reveló que la mayor confusión ocurrió entre marchitez y plantas sanas. El tiempo de inferencia promedio por imagen fue de 23 milisegundos, lo que permite su implementación en dispositivos móviles para asistencia en campo. Se comparó el rendimiento con las arquitecturas VGG-16 y EfficientNet-B3, obteniendo mejor desempeño en todas las métricas. El modelo propuesto puede servir como herramienta de apoyo para los agricultores y técnicos agrícolas en la identificación temprana de enfermedades.',
    resumen_en: 'Sugarcane is one of the most economically important crops in Venezuela; however, foliar diseases represent a significant threat to productivity. Early detection of these diseases is crucial for implementing timely control strategies. This work implemented a convolutional neural network (CNN) based on the pre-trained ResNet-50 architecture with transfer learning for automatic classification of sugarcane leaf images affected by fungal diseases. A dataset of 3,200 field images was built, classified into five categories: healthy, rust (Puccinia melanocephala), ring spot (Leptosphaeria sacchari), smut (Ustilago scitaminea), and wilt (Fusarium moniliforme). The dataset was split into 80% training, 10% validation, and 10% test. Data augmentation techniques were applied to mitigate class imbalance. The fine-tuned model achieved 94.7% accuracy on the test set, with a macro F1-score of 0.93. The confusion matrix revealed that the greatest confusion occurred between wilt and healthy plants. Average inference time per image was 23 milliseconds, enabling implementation on mobile devices for field assistance. Performance was compared with VGG-16 and EfficientNet-B3 architectures, achieving better results across all metrics. The proposed model can serve as a support tool for farmers and agricultural technicians in early disease identification.',
    palabras_clave: 'inteligencia artificial, deep learning, caña de azúcar, fitopatología, CNN, ResNet-50',
    status: 'aprobado',
    autor: 'investigador1@saberunerg.com',
    linea: 'Inteligencia Artificial',
    revista: 'Ciencia e Investigación',
    diasAtras: 25,
    img: '/uploads/articulos/4/cover.svg',
    doi: '10.58927/ci.2024.004',
    volumen: 1,
    numero: 2,
  },
  {
    titulo_es: 'Prevalencia de hipertensión arterial en comunidades rurales del estado Guárico',
    titulo_en: 'Prevalence of arterial hypertension in rural communities of Guárico state',
    resumen_es: 'La hipertensión arterial es la principal factor de riesgo modificable para las enfermedades cardiovasculares, que constituyen la primera causa de morbilidad y mortalidad en Venezuela. Sin embargo, en las comunidades rurales los datos epidemiológicos son escasos. El objetivo de este estudio fue determinar la prevalencia de hipertensión arterial y sus factores de riesgo asociados en comunidades rurales del estado Guárico. Se realizó un estudio transversal analítico que incluyó 1,200 adultos mayores de 18 años seleccionados mediante muestreo aleatorio estratificado de cinco comunidades rurales. Se aplicaron cuestionarios estandarizados para variables sociodemográficas, hábitos alimentarios, actividad física y antecedentes familiares. Se midieron presión arterial, peso, talla, perímetro abdominal y se tomaron muestras de sangre para perfil lipídico y glucemia. La prevalencia global de hipertensión arterial fue del 28.3% (IC95%: 25.7-30.9%), siendo significativamente mayor en hombres (31.2%) que en mujeres (25.8%). Los factores asociados con mayor riesgo fueron: edad ≥45 años (OR: 3.4), obesidad (OR: 2.8), consumo excesivo de sodio (OR: 2.1), sedentarismo (OR: 1.9) y antecedentes familiares (OR: 2.5). Solo el 34% de los hipertensos conocían su condición y el 22% recibían tratamiento farmacológico. La hipertensión no controlada se asoció con mayor riesgo de proteinuria y alteraciones del perfil lipídico. Los resultados evidencian la necesidad de programas de tamizaje y educación en salud cardiovascular dirigidos a poblaciones rurales.',
    resumen_en: 'Arterial hypertension is the main modifiable risk factor for cardiovascular diseases, which constitute the leading cause of morbidity and mortality in Venezuela. However, epidemiological data in rural communities are scarce. This study aimed to determine the prevalence of arterial hypertension and its associated risk factors in rural communities of Guárico state. An analytical cross-sectional study was conducted including 1,200 adults over 18 years selected through stratified random sampling from five rural communities. Standardized questionnaires were applied for sociodemographic variables, dietary habits, physical activity, and family history. Blood pressure, weight, height, abdominal circumference were measured, and blood samples were taken for lipid profile and glycemia. The overall prevalence of arterial hypertension was 28.3% (95% CI: 25.7-30.9%), being significantly higher in men (31.2%) than women (25.8%). Associated factors with higher risk included: age ≥45 years (OR: 3.4), obesity (OR: 2.8), excessive sodium intake (OR: 2.1), sedentary lifestyle (OR: 1.9), and family history (OR: 2.5). Only 34% of hypertensive individuals knew their condition and 22% received pharmacological treatment. Uncontrolled hypertension was associated with higher risk of proteinuria and lipid profile alterations. Results demonstrate the need for screening programs and cardiovascular health education directed at rural populations.',
    palabras_clave: 'hipertensión, salud pública, comunidades rurales, epidemiología, Guárico, Venezuela',
    status: 'aprobado',
    autor: 'investigador4@saberunerg.com',
    linea: 'Epidemiología',
    revista: 'Revista Científica UNERG',
    diasAtras: 20,
    img: '/uploads/articulos/5/cover.svg',
    doi: '10.58927/suerg.2024.005',
    volumen: 1,
    numero: 1,
  },
  {
    titulo_es: 'Análisis de redes sociales para identificar desinformación en salud',
    titulo_en: 'Social network analysis to identify health misinformation',
    resumen_es: 'La propagación de desinformación en salud a través de las redes sociales constituye un problema creciente que amenaza la salud pública y la toma de decisiones informadas. Durante la pandemia de COVID-19, este fenómeno se intensificó significativamente. El presente estudio analizó 50,000 publicaciones en las plataformas Twitter, Facebook e Instagram realizadas durante el periodo enero-diciembre 2021, utilizando técnicas de procesamiento de lenguaje natural y aprendizaje automático. Se desarrolló un clasificador basado en el modelo BERT fine-tuned con un corpus etiquetado de 5,000 publicaciones, alcanzando una precisión del 89.3% y un F1-score de 0.87. Los resultados mostraron que el 35% de las publicaciones analizadas contenían información científicamente falsa o engañosa, principalmente relacionada con tratamientos no comprobados (42%), efectos secundarios de vacunas (28%) y orígenes artificiales del virus (18%). Las publicaciones con desinformación recibieron en promedio 3.2 veces más interacciones que las basadas en evidencia científica. Los usuarios con mayor capacidad de difusión fueron identificados como cuentas con orientación política y cuentas de lifestyle sin formación científica. Se detectaron patrones de coordinación entre cuentas para amplificar mensajes específicos, sugiriendo la existencia de redes organizadas de desinformación. El análisis de sentimiento reveló que el miedo y la indignación eran las emociones predominantes en las publicaciones desinformativas.',
    resumen_en: 'The spread of health misinformation through social media constitutes a growing problem threatening public health and informed decision-making. During the COVID-19 pandemic, this phenomenon intensified significantly. This study analyzed 50,000 posts on Twitter, Facebook, and Instagram platforms from January to December 2021, using natural language processing and machine learning techniques. A classifier based on the BERT model was developed, fine-tuned with a labeled corpus of 5,000 posts, achieving 89.3% precision and an F1-score of 0.87. Results showed that 35% of analyzed posts contained scientifically false or misleading information, primarily related to unproven treatments (42%), vaccine side effects (28%), and artificial virus origins (18%). Misinformation posts received on average 3.2 times more interactions than evidence-based content. Users with the greatest dissemination capacity were identified as politically oriented accounts and lifestyle accounts without scientific training. Coordination patterns were detected among accounts to amplify specific messages, suggesting the existence of organized misinformation networks. Sentiment analysis revealed that fear and indignation were the predominant emotions in misinformative posts.',
    palabras_clave: 'redes sociales, desinformación, salud, COVID-19, análisis de datos, NLP, BERT',
    status: 'enviado',
    autor: 'investigador5@saberunerg.com',
    linea: 'Salud Comunitaria',
    revista: 'Ciencia e Investigación',
    diasAtras: 15,
    img: '/uploads/articulos/6/cover.svg',
    doi: null,
    volumen: null,
    numero: null,
  },
  {
    titulo_es: 'Controlador borroso para estabilización de drones en entornos turbulentos',
    titulo_en: 'Fuzzy controller for drone stabilization in turbulent environments',
    resumen_es: 'Los vehículos aéreos no tripulados (VANT) han encontrado aplicaciones en múltiples sectores, desde agricultura de precisión hasta inspección de infraestructura. Sin embargo, su operación en entornos con turbulencia atmosférica presenta desafíos significativos para los sistemas de control convencionales. Este estudio presenta el diseño e implementación de un sistema de control borroso tipo Mamdani para mantener la estabilidad de cuadricópteros ante ráfagas de viento y turbulencia. El controlador utiliza como entradas el error de actitud (roll, pitch, yaw) y la velocidad angular, procesadas mediante siete conjuntos borrosos triangulares para cada variable. La base de reglas consta de 49 reglas IF-THEN derivadas del conocimiento experto en pilotaje de drones. Se realizaron simulaciones en MATLAB/Simulink con un modelo dinámico completo de cuadricóptero que incluye efectos aerodinámicos, saturación de motores y retrasos en la comunicación. Las ráfagas de viento se modelaron como procesos estocásticos de Markov con velocidades de hasta 15 m/s. Los resultados mostraron una mejora del 40% en el rechazo a perturbaciones comparado con un controlador PID clásico, reduciendo la desviación máxima de actitud de 12.5° a 7.5°. El tiempo de estabilización después de una ráfaga se redujo de 2.1 a 1.3 segundos. También se implementó el controlador en hardware real usando un procesador ESP32, demostrando viabilidad para aplicaciones en tiempo real con un ciclo de ejecución de 2 milisegundos.',
    resumen_en: 'Unmanned aerial vehicles (UAVs) have found applications in multiple sectors, from precision agriculture to infrastructure inspection. However, their operation in environments with atmospheric turbulence presents significant challenges for conventional control systems. This study presents the design and implementation of a Mamdani-type fuzzy control system to maintain quadcopter stability against wind gusts and turbulence. The controller uses attitude error (roll, pitch, yaw) and angular velocity as inputs, processed through seven triangular fuzzy sets for each variable. The rule base consists of 49 IF-THEN rules derived from expert knowledge in drone piloting. Simulations were performed in MATLAB/Simulink with a complete quadcopter dynamic model including aerodynamic effects, motor saturation, and communication delays. Wind gusts were modeled as Markov stochastic processes with speeds up to 15 m/s. Results showed a 40% improvement in disturbance rejection compared to a classical PID controller, reducing maximum attitude deviation from 12.5° to 7.5°. Stabilization time after a gust was reduced from 2.1 to 1.3 seconds. The controller was also implemented on real hardware using an ESP32 processor, demonstrating feasibility for real-time applications with a 2-millisecond execution cycle.',
    palabras_clave: 'sistemas borrosos, drones, control automático, estabilidad, Mamdani, cuadricóptero',
    status: 'enviado',
    autor: 'investigador6@saberunerg.com',
    linea: 'Electrónica y Control',
    revista: 'Revista Científica UNERG',
    diasAtras: 12,
    img: '/uploads/articulos/7/cover.svg',
    doi: null,
    volumen: null,
    numero: null,
  },
  {
    titulo_es: 'Variabilidad genética del virus del dengue en el estado Anzoátegui',
    titulo_en: 'Genetic variability of dengue virus in Anzoátegui state',
    resumen_es: 'El dengue es una arbovirosis transmitida por mosquitos del género Aedes que representa un grave problema de salud pública en Venezuela. La comprensión de la variabilidad genética del virus es fundamental para el seguimiento epidemiológico y el desarrollo de vacunas. En este estudio se caracterizaron genéticamente 87 aislados del virus del dengue recolectados en hospitales del estado Anzoátegui entre 2022 y 2025. Se extrajo ARN viral y se amplificó la región del genoma que codifica la proteína E (envelope) mediante RT-PCR. Los productos amplificados fueron secuenciados por el método de Sanger y las secuencias fueron alineadas con secuencias de referencia usando MEGA 11. El análisis filogenético reveló la circulación concurrente de los genotipos I y II, con predominancia del genotipo I (72% de los aislados). El genotipo II se concentró principalmente en brotes urbanos del período 2024-2025. Se detectaron 15 variantes nucleotídicas en la proteína E, de las cuales tres eran sinónimas y doce resultaron en cambios de aminoácidos. Variante L339F en la proteína E fue encontrada exclusivamente en genotipo I y se asoció con mayor virulencia en reportes previos. El análisis de diversidad genética mostró valores de nucleotídicos promedio de 0.023 y de aminoácidos de 0.015. No se encontró evidencia de recombinación entre genotipos. Estos resultados proporcionan información valiosa para la vigilancia genómica del dengue en la región nororiental de Venezuela.',
    resumen_en: 'Dengue is an arbovirus disease transmitted by Aedes mosquitoes that represents a serious public health problem in Venezuela. Understanding viral genetic variability is fundamental for epidemiological surveillance and vaccine development. This study genetically characterized 87 dengue virus isolates collected in hospitals of Anzoátegui state between 2022 and 2025. Viral RNA was extracted and the genome region encoding the E (envelope) protein was amplified by RT-PCR. Amplified products were sequenced using the Sanger method and sequences were aligned with reference sequences using MEGA 11. Phylogenetic analysis revealed concurrent circulation of genotypes I and II, with genotype I predominating (72% of isolates). Genotype II was mainly concentrated in urban outbreaks during the 2024-2025 period. Fifteen nucleotide variants were detected in the E protein, of which three were synonymous and twelve resulted in amino acid changes. Variant L339F in the E protein was found exclusively in genotype I and has been associated with greater virulence in previous reports. Genetic diversity analysis showed average nucleotide values of 0.023 and amino acid values of 0.015. No evidence of recombination between genotypes was found. These results provide valuable information for genomic surveillance of dengue in the northeastern region of Venezuela.',
    palabras_clave: 'dengue, variabilidad genética, secuenciación, Anzoátegui, genotipos, filogenia',
    status: 'asignado',
    autor: 'investigador4@saberunerg.com',
    linea: 'Enfermedades Infecciosas',
    revista: 'Revista Científica UNERG',
    diasAtras: 60,
    img: '/uploads/articulos/8/cover.svg',
    doi: '10.58927/suerg.2023.008',
    volumen: 1,
    numero: 1,
  },
  {
    titulo_es: 'Impacto de la deforestación sobre la calidad del agua en la cuenca del río Chirgua',
    titulo_en: 'Impact of deforestation on water quality in the Chirgua river basin',
    resumen_es: 'La deforestación en cuencas hidrográficas tropicales tiene implicaciones directas sobre la calidad del agua superficial, afectando los procesos ecológicos y el suministro de agua para consumo humano y活动idad agropecuaria. La cuenca del río Chirgua, ubicada en el estado Portuguesa, ha experimentado una pérdida de cobertura boscosa del 35% en las últimas dos décadas. El objetivo de este estudio fue evaluar el impacto de la deforestación sobre los parámetros fisicoquímicos y biológicos de la calidad del agua en 15 puntos de muestreo distribuidos a lo largo de un gradiente de cobertura vegetal. Se evaluaron parámetros in situ (temperatura, pH, oxígeno disuelto, conductividad, turbidez) y se recolectaron muestras para análisis de laboratorio (DBO5, nitrógeno total, fósforo total, coliformes termotolerantes). Los resultados mostraron que las áreas con mayor deforestación presentaron niveles de oxígeno disuelto 40% menores (promedio 4.2 mg/L vs 7.0 mg/L), valores de turbidez 3.5 veces superiores y concentraciones de fósforo total 2.8 veces mayores que las áreas con cobertura boscosa intacta. La actividad microbiana indicada por coliformes termotolerantes fue 5 veces mayor en zonas deforestadas. El análisis de componentes principales reveló que la deforestación explica el 62% de la variabilidad en la calidad del agua. Se propone un modelo de regresión que permite estimar la calidad del agua a partir del porcentaje de cobertura boscosa en la cuenca.',
    resumen_en: 'Deforestation in tropical watersheds has direct implications for surface water quality, affecting ecological processes and water supply for human consumption and agricultural activity. The Chirgua river basin, located in Portuguesa state, has experienced a 35% loss of forest cover over the last two decades. This study aimed to assess the impact of deforestation on physicochemical and biological parameters of water quality at 15 sampling points distributed along a vegetation cover gradient. In situ parameters (temperature, pH, dissolved oxygen, conductivity, turbidity) were evaluated and samples were collected for laboratory analysis (BOD5, total nitrogen, total phosphorus, thermotolerant coliforms). Results showed that areas with greater deforestation presented dissolved oxygen levels 40% lower (average 4.2 mg/L vs 7.0 mg/L), turbidity values 3.5 times higher, and total phosphorus concentrations 2.8 times greater than areas with intact forest cover. Microbial activity indicated by thermotolerant coliforms was 5 times higher in deforested zones. Principal component analysis revealed that deforestation explains 62% of the variability in water quality. A regression model is proposed that allows estimating water quality from the percentage of forest cover in the watershed.',
    palabras_clave: 'deforestación, calidad del agua, cuenca hidrográfica, río Chirgua, Portugal, oxígeno disuelto',
    status: 'publicado',
    autor: 'investigador2@saberunerg.com',
    linea: 'Química Ambiental',
    revista: 'Revista Científica UNERG',
    diasAtras: 90,
    img: '/uploads/articulos/9/cover.svg',
    doi: '10.58927/suerg.2023.009',
    volumen: 1,
    numero: 2,
  },
  {
    titulo_es: 'Algoritmo genético para optimización de rutas de transporte público',
    titulo_en: 'Genetic algorithm for public transport route optimization',
    resumen_es: 'La planificación eficiente de rutas de transporte público es un problema combinatorio complejo que impacta directamente en la calidad de vida urbana y la sostenibilidad ambiental. En ciudades intermedias venezolanas como San Juan de los Morros, el sistema de transporte público opera de manera subóptima, con rutas redundantes, tiempos de espera excesivos y cobertura desigual del territorio. Este estudio propone la aplicación de un algoritmo genético (AG) para optimizar las 15 rutas del sistema de transporte de la ciudad, considerando restricciones de demanda, capacidad vehicular, frecuencias mínimas y conectividad entre paradas. El algoritmo utiliza una representación de cromosoma basada en la asignación de paradas a rutas, con una función de fitness que minimiza el tiempo total de viaje de los pasajeros y los costos operativos de la empresa de transporte. Se implementaron operadores de cruce order-based y mutación por intercambio, con una población de 200 individuos y 500 generaciones. El AG convergió en la generación 387 con una mejora acumulada del 22% en tiempos de viaje y del 15% en costos operativos respecto a la configuración actual. La solución óptima reduce el número de rutas de 15 a 12, elimina trasbordos innecesarios y mejora la cobertura del 78% al 91% del territorio urbano. Se realizó una validación con datos de GPS de 500 viajes reales que confirmó la viabilidad práctica de la solución propuesta.',
    resumen_en: 'Efficient public transport route planning is a complex combinatorial problem that directly impacts urban quality of life and environmental sustainability. In intermediate Venezuelan cities like San Juan de los Morros, the public transport system operates suboptimally, with redundant routes, excessive waiting times, and unequal territory coverage. This study proposes the application of a genetic algorithm (GA) to optimize the 15 routes of the city transport system, considering demand constraints, vehicle capacity, minimum frequencies, and connectivity between stops. The algorithm uses a chromosome representation based on stop-to-route assignment, with a fitness function that minimizes total passenger travel time and transport company operating costs. Order-based crossover and swap mutation operators were implemented, with a population of 200 individuals and 500 generations. The GA converged at generation 387 with a cumulative improvement of 22% in travel times and 15% in operating costs compared to the current configuration. The optimal solution reduces routes from 15 to 12, eliminates unnecessary transfers, and improves coverage from 78% to 91% of the urban territory. Validation was performed with GPS data from 500 actual trips that confirmed the practical feasibility of the proposed solution.',
    palabras_clave: 'algoritmos genéticos, transporte público, optimización, metaheurísticas, rutas urbanas',
    status: 'rechazado',
    autor: 'investigador3@saberunerg.com',
    linea: 'Matemáticas Aplicadas',
    revista: 'Ciencia e Investigación',
    diasAtras: 50,
    img: '/uploads/articulos/10/cover.svg',
    doi: null,
    volumen: null,
    numero: null,
  },
  {
    titulo_es: 'Evaluación de la actividad larvicida de extractos de Azadirachta indica',
    titulo_en: 'Evaluation of larvicidal activity of Azadirachta indica extracts',
    resumen_es: 'El control químico convencional de Aedes aegypti, principal vector del dengue, Zika y chikungunya, ha generado resistencia en poblaciones de mosquitos, lo que ha impulsado la investigación de alternativas biológicas. El neem (Azadirachta indica) es reconocido por sus propiedades insecticidas, pero su actividad larvicida contra mosquitos tropicales no ha sido suficientemente documentada. En este estudio se prepararon extractos etanólicos a diferentes concentraciones (1%, 3%, 5% y 10%) a partir de hojas frescas de neem recolectadas en San Juan de los Morros. Se evaluó la actividad larvicida contra larvas de tercer estadio de Aedes aegypti utilizando el protocolo de la OMS. Se determinaron las concentraciones letales 50 y 90 (CL50 y CL90) a las 24 y 48 horas de exposición. El extracto al 5% mostró una mortalidad del 92% a las 24 horas, con una CL50 de 1.8 mg/mL y CL90 de 4.2 mg/mL. El extracto al 10% alcanzó mortalidad del 100% a las 12 horas. El análisis fitoquímico reveló la presencia de azadiractina (4.2%), nimbidina (2.8%) y salanina (1.5%) como principios activos principales. Se realizó una caracterización por cromatografía líquida de alta resolución (HPLC) que confirmó la pureza de los compuestos. La estabilidad del extracto se evaluó a diferentes temperaturas y condiciones de almacenamiento, manteniendo su actividad larvicida durante 6 meses a 4°C. Estos resultados sustentan el potencial del neem como bioplaguicida para el control de poblaciones de Aedes aegypti en áreas endémicas.',
    resumen_en: 'Conventional chemical control of Aedes aegypti, the main vector of dengue, Zika, and chikungunya, has generated resistance in mosquito populations, driving research into biological alternatives. Neem (Azadirachta indica) is recognized for its insecticidal properties, but its larvicidal activity against tropical mosquitoes has not been sufficiently documented. This study prepared ethanolic extracts at different concentrations (1%, 3%, 5%, and 10%) from fresh neem leaves collected in San Juan de los Morros. Larvicidal activity was evaluated against third instar larvae of Aedes aegypti using the WHO protocol. Lethal concentrations 50 and 90 (LC50 and LC90) were determined at 24 and 48 hours of exposure. The 5% extract showed 92% mortality at 24 hours, with an LC50 of 1.8 mg/mL and LC90 of 4.2 mg/mL. The 10% extract achieved 100% mortality at 12 hours. Phytochemical analysis revealed the presence of azadirachtin (4.2%), nimbidin (2.8%), and salannin (1.5%) as the main active compounds. High-performance liquid chromatography (HPLC) characterization confirmed compound purity. Extract stability was evaluated at different temperatures and storage conditions, maintaining larvicidal activity for 6 months at 4°C. These results support the potential of neem as a biopesticide for controlling Aedes aegypti populations in endemic areas.',
    palabras_clave: 'neem, Aedes aegypti, larvicida, extractos naturales, azadiractina, bioplaguicida',
    status: 'por_corregir',
    autor: 'investigador5@saberunerg.com',
    linea: 'Investigación Biomédica',
    revista: 'Revista Científica UNERG',
    diasAtras: 35,
    img: '/uploads/articulos/11/cover.svg',
    doi: null,
    volumen: null,
    numero: null,
  },
  {
    titulo_es: 'Segmentación de imágenes médicas mediante U-Net con atención',
    titulo_en: 'Medical image segmentation using attention U-Net',
    resumen_es: 'La segmentación precisa de lesiones en imágenes de resonancia magnética cerebral es un paso fundamental para el diagnóstico asistido por computadora y la planificación de tratamientos en neurología. Las arquitecturas de redes neuronales convolucionales han demostrado resultados prometedores en esta tarea, pero enfrentan desafíos en la delimitación de bordes y la preservación de detalles anatómicos. Este estudio implementó una arquitectura U-Net incorporada con un mecanismo de atención espacial para la segmentación automática de lesiones en imágenes de resonancia magnética T2-weighted. El conjunto de datos utilizado comprende 450 exámenes de resonancia magnética de pacientes con lesiones cerebrales, divididos en 320 para entrenamiento, 65 para validación y 65 para prueba. Se implementaron tres variantes: U-Net estándar, Attention U-Net y una propuesta híbrida con módulo de atención channel-spatial. El modelo híbrido alcanzó un Dice score de 0.89 en el conjunto de prueba, superando a la U-Net estándar (0.82) y a la Attention U-Net (0.86). La métrica de Hausdorff distance 95% se redujo de 8.3 mm a 5.1 mm, indicando una mejor delimitación de bordes. El tiempo promedio de inferencia por imagen fue de 1.2 segundos usando una GPU NVIDIA RTX 3060. El análisis cualitativo realizado por tres neurorradiólogos mostró una concordancia sustancial (κ = 0.78) entre las segmentaciones automáticas y las delimitaciones manuales de expertos. El modelo propuesto puede integrarse en sistemas de diagnóstico asistido para mejorar la precisión y eficiencia en la evaluación de lesiones cerebrales.',
    resumen_en: 'Accurate segmentation of lesions in brain MRI images is a fundamental step for computer-assisted diagnosis and treatment planning in neurology. Convolutional neural network architectures have shown promising results in this task but face challenges in edge delineation and anatomical detail preservation. This study implemented a U-Net architecture incorporated with a spatial attention mechanism for automatic segmentation of lesions in T2-weighted MRI images. The dataset comprises 450 MRI scans from patients with brain lesions, divided into 320 for training, 65 for validation, and 65 for testing. Three variants were implemented: standard U-Net, Attention U-Net, and a proposed hybrid with channel-spatial attention module. The hybrid model achieved a Dice score of 0.89 on the test set, outperforming standard U-Net (0.82) and Attention U-Net (0.86). The Hausdorff distance 95% metric was reduced from 8.3 mm to 5.1 mm, indicating improved edge delineation. Average inference time per image was 1.2 seconds using an NVIDIA RTX 3060 GPU. Qualitative analysis by three neuroradiologists showed substantial agreement (κ = 0.78) between automatic segmentations and expert manual delineations. The proposed model can be integrated into computer-aided diagnosis systems to improve accuracy and efficiency in brain lesion assessment.',
    palabras_clave: 'segmentación de imágenes, U-Net, atención, resonancia magnética, deep learning, neuroimagen',
    status: 'en_revision',
    autor: 'investigador1@saberunerg.com',
    linea: 'Inteligencia Artificial',
    revista: 'Ciencia e Investigación',
    diasAtras: 10,
    img: '/uploads/articulos/12/cover.svg',
    doi: null,
    volumen: null,
    numero: null,
  },
  {
    titulo_es: 'Percepción de riesgo sísmico en edificaciones del centro de Caracas',
    titulo_en: 'Seismic risk perception in downtown Caracas buildings',
    resumen_es: 'Venezuela se encuentra en una zona de alta actividad sísmica, y la ciudad de Caracas ha sido afectada por terremotos devastadores a lo largo de su historia. La percepción de riesgo de la población es un factor determinante en la adopción de medidas de protección y la respuesta ante desastres. Este estudio evaluó la percepción de riesgo sísmico en residentes de edificaciones del centro de Caracas mediante un estudio transversal descriptivo. Se aplicaron encuestas estructuradas a 800 residentes de 45 edificaciones seleccionadas por muestreo aleatorio estratificado, considerando antigüedad de la construcción, tipo estructural y número de pisos. Las encuestas incluyeron dimensiones de conocimiento sobre riesgo sísmico, percepción de peligro, medidas de preparación, disponibilidad de equipos de emergencia y conocimiento de protocolos de evacuación. Los resultados revelaron que el 62% de los residentes no conoce los protocolos de evacuación de su edificio, el 78% no cuenta con un kit de emergencia y solo el 15% ha participado en simulacros. El nivel de conocimiento sísmico fue clasificado como bajo en el 58% de los encuestados, medio en el 32% y alto en el 10%. La percepción de riesgo se asoció significativamente con el nivel educativo (p < 0.001), la antigüedad del edificio (p < 0.01) y la experiencia previa con terremotos (p < 0.01). Los edificios construidos antes de 1967, sin refuerzo sísmico, mostraron residentes con mayor percepción de peligro pero menor autoeficacia para responder. Se recomienda la implementación de programas de educación sísmica y la actualización del inventario de edificaciones vulnerables.',
    resumen_en: 'Venezuela is located in a zone of high seismic activity, and Caracas has been affected by devastating earthquakes throughout its history. Population risk perception is a determining factor in the adoption of protective measures and disaster response. This study evaluated seismic risk perception in residents of downtown Caracas buildings through a descriptive cross-sectional study. Structured surveys were applied to 800 residents of 45 buildings selected by stratified random sampling, considering building age, structural type, and number of floors. Surveys included dimensions of seismic risk knowledge, hazard perception, preparedness measures, emergency equipment availability, and evacuation protocol knowledge. Results revealed that 62% of residents are unaware of their buildings evacuation protocols, 78% do not have an emergency kit, and only 15% have participated in drills. Seismic knowledge level was classified as low in 58% of respondents, medium in 32%, and high in 10%. Risk perception was significantly associated with education level (p < 0.001), building age (p < 0.01), and previous earthquake experience (p < 0.01). Buildings constructed before 1967, without seismic reinforcement, showed residents with greater hazard perception but lower self-efficacy to respond. Implementation of seismic education programs and updating the inventory of vulnerable buildings is recommended.',
    palabras_clave: 'riesgo sísmico, percepción, edificaciones, Caracas, desastres, preparación comunitaria',
    status: 'enviado',
    autor: 'investigador6@saberunerg.com',
    linea: 'Salud Comunitaria',
    revista: 'Revista Científica UNERG',
    diasAtras: 8,
    img: '/uploads/articulos/13/cover.svg',
    doi: null,
    volumen: null,
    numero: null,
  },
  {
    titulo_es: 'Identificación de especies de peces del río Portuguesa mediante DNA barcoding',
    titulo_en: 'Fish species identification in Portuguesa river using DNA barcoding',
    resumen_es: 'La identificación taxonómica precisa de las especies de peces es esencial para la conservación de la biodiversidad acuática y el manejo sostenible de los recursos pesqueros. El DNA barcoding emerge como una herramienta poderosa para complementar la taxonomía morfológica, especialmente en especies crípticas o en etapas juveniles. En este estudio se aplicó la técnica de DNA barcoding para identificar especies de peces del río Portuguesa, utilizando el gen mitocondrial citocromo c oxidasa subunidad I (COI). Se colectaron 120 especímenes de 35 especies en 12 puntos de muestreo a lo largo del curso principal del río y sus tributarios. Se extrajo ADN genómico y se amplificó una región de 652 pb del gen COI. Los productos amplificados fueron secuenciados y comparados con secuencias de referencia en las bases de datos BOLD y GenBank. El análisis filogenético se realizó utilizando los métodos de máxima verosimilitud y vecino-neighbor-joining. Los resultados confirmaron la identificación morfológica de 30 especies (85.7%), mientras que 3 especies presentaron divergencias significativas que sugieren la presencia de especies crípticas no descritas. Se detectaron 5 registros nuevos para el estado Portuguesa, incluyendo dos especies endémicas de cuencas adyacentes. El valor promedio de divergencia intraespecífica fue de 0.5% y la divergencia interespecífica promedio fue de 8.3%, lo que confirma la utilidad del método para la discriminación de especies. El código de barras genético establecido puede servir como referencia para estudios futuros de monitoreo ecológico y gestión pesquera en la cuenca del río Portuguesa.',
    resumen_en: 'Accurate taxonomic identification of fish species is essential for aquatic biodiversity conservation and sustainable management of fisheries resources. DNA barcoding emerges as a powerful tool to complement morphological taxonomy, especially in cryptic species or juvenile stages. This study applied DNA barcoding to identify fish species from the Portuguesa river, using the mitochondrial gene cytochrome c oxidase subunit I (COI). A total of 120 specimens from 35 species were collected at 12 sampling points along the main course of the river and its tributaries. Genomic DNA was extracted and a 652 bp region of the COI gene was amplified. Amplified products were sequenced and compared with reference sequences in BOLD and GenBank databases. Phylogenetic analysis was performed using maximum likelihood and neighbor-joining methods. Results confirmed morphological identification of 30 species (85.7%), while 3 species showed significant divergences suggesting the presence of undescribed cryptic species. Five new records for Portuguesa state were detected, including two endemic species from adjacent basins. Average intraspecific divergence was 0.5% and average interspecific divergence was 8.3%, confirming the method utility for species discrimination. The established genetic barcode can serve as a reference for future ecological monitoring and fisheries management studies in the Portuguesa river basin.',
    palabras_clave: 'DNA barcoding, peces, COI, biodiversidad acuática, taxonomía molecular, río Portuguesa',
    status: 'aprobado',
    autor: 'investigador2@saberunerg.com',
    linea: 'Biodiversidad y Conservación',
    revista: 'Ciencia e Investigación',
    diasAtras: 18,
    img: '/uploads/articulos/14/cover.svg',
    doi: '10.58927/ci.2024.014',
    volumen: 1,
    numero: 1,
  },
  {
    titulo_es: 'Monitorización de calidad del aire con sensores IoT de bajo costo',
    titulo_en: 'Air quality monitoring with low-cost IoT sensors',
    resumen_es: 'La contaminación del aire es un problema creciente en las ciudades venezolanas, pero la falta de estaciones de monitoreo confiables dificulta la evaluación del riesgo para la salud pública. Las estaciones de referencia son costosas y de difícil acceso para comunidades en desarrollo. Este estudio presenta el diseño, implementación y validación de una red de monitoreo de calidad del aire basada en sensores IoT de bajo costo. Se desplegaron 20 nodos sensores distribuidos estratégicamente en la ciudad de San Juan de los Morros, cada uno equipado con un microcontrolador ESP32, sensor de partículas PM2.5 (PMS5003), sensor de CO2 (MH-Z14A) y sensor de CO (MQ-7). Los datos se transmiten vía WiFi a un servidor en la nube donde se almacenan y procesan en tiempo real. Se validaron los sensores contra una estación de referencia de la red nacional durante 3 meses, obteniendo coeficientes de correlación de 0.92 para PM2.5, 0.89 para CO2 y 0.85 para CO. Los resultados mostraron que las concentraciones de PM2.5 superaron los límites de la OMS (25 μg/m³ promedio 24h) en el 35% de las mediciones, principalmente en horas pico de tráfico. El costo total por nodo sensor fue de aproximadamente 85 USD, comparado con los 25,000 USD de una estación de referencia. La plataforma web desarrollada permite visualización de datos, alertas automáticas y exportación de reportes. La red puede expandirse fácilmente para cubrir más áreas y proporcionar datos de alta resolución espacial y temporal para la toma de decisiones en salud pública.',
    resumen_en: 'Air pollution is a growing problem in Venezuelan cities, but the lack of reliable monitoring stations hinders health risk assessment. Reference stations are expensive and difficult to access for developing communities. This study presents the design, implementation, and validation of an air quality monitoring network based on low-cost IoT sensors. Twenty sensor nodes were strategically distributed in San Juan de los Morros, each equipped with an ESP32 microcontroller, PM2.5 particle sensor (PMS5003), CO2 sensor (MH-Z14A), and CO sensor (MQ-7). Data is transmitted via WiFi to a cloud server for real-time storage and processing. Sensors were validated against a national network reference station for 3 months, obtaining correlation coefficients of 0.92 for PM2.5, 0.89 for CO2, and 0.85 for CO. Results showed that PM2.5 concentrations exceeded WHO limits (25 μg/m³ 24h average) in 35% of measurements, mainly during traffic peak hours. Total cost per sensor node was approximately 85 USD, compared to 25,000 USD for a reference station. The developed web platform enables data visualization, automatic alerts, and report export. The network can be easily expanded to cover more areas and provide high spatial and temporal resolution data for public health decision-making.',
    palabras_clave: 'IoT, calidad del aire, sensores, ESP32, monitoreo ambiental, PM2.5, salud pública',
    status: 'En_evaluacion',
    autor: 'investigador3@saberunerg.com',
    linea: 'Telecomunicaciones',
    revista: 'Revista Científica UNERG',
    diasAtras: 22,
    img: '/uploads/articulos/15/cover.svg',
    doi: null,
    volumen: null,
    numero: null,
  },
  {
    titulo_es: 'Caracterización fisicoquímica de suelos agrícolas del estado Guárico',
    titulo_en: 'Physicochemical characterization of agricultural soils in Guárico state',
    resumen_es: 'El conocimiento de las propiedades fisicoquímicas del suelo es fundamental para la planificación agrícola sostenible y la optimización del uso de fertilizantes en zonas productoras de granos básicos. El estado Guárico constituye uno de los principales focos de producción de arroz en Venezuela, sin embargo, la información sobre la fertilidad de sus suelos es limitada. El presente estudio tuvo como objetivo caracterizar las propiedades fisicoquímicas de suelos agrícolas en la zona de recolección de arroz de los municipios San Juan de los Morros, San Gerónimo de Guayabal y Julio de Feo. Se recolectaron 45 muestras de suelo en puntos georreferenciados a una profundidad de 0-20 cm. Se determinaron parámetros de fertilidad: pH, materia orgánica, nitrógeno total, fósforo disponible, potasio intercambiable, capacidad de intercambio catiónico (CIC), textura y conductividad eléctrica. Los resultados mostraron que el 60% de las muestras presentó deficiencia de nitrógeno (< 0.15%), el 55% mostró bajo fósforo disponible (< 10 ppm) y el 45% registró pH ácido (< 5.5). La materia orgánica promedio fue del 2.1%, por debajo del nivel deseable para cultivos intensivos. La textura predominante fue franco-arcillosa (45%) seguida de franca (30%). El análisis de correlación reveló que el pH se correlaciona positivamente con la CIC (r = 0.72, p < 0.001) y negativamente con la disponibilidad de fósforo (r = -0.58, p < 0.01). Se propone un plan de enmienda que incluye cal agrícola para corregir la acidez, incorporación de materia orgánica y aplicación de fertilizantes ricos en fósforo para mejorar la productividad de los cultivos de arroz.',
    resumen_en: 'Knowledge of soil physicochemical properties is fundamental for sustainable agricultural planning and fertilizer use optimization in grain-producing zones. Guárico state constitutes one of the main rice production areas in Venezuela; however, information about soil fertility is limited. This study aimed to characterize the physicochemical properties of agricultural soils in the rice harvesting zone of San Juan de los Morros, San Gerónimo de Guayabal, and Julio de Feo municipalities. Forty-five soil samples were collected at georeferenced points at 0-20 cm depth. Fertility parameters were determined: pH, organic matter, total nitrogen, available phosphorus, exchangeable potassium, cation exchange capacity (CEC), texture, and electrical conductivity. Results showed that 60% of samples had nitrogen deficiency (< 0.15%), 55% showed low available phosphorus (< 10 ppm), and 45% registered acidic pH (< 5.5). Average organic matter was 2.1%, below the desirable level for intensive crops. Predominant texture was clay-loam (45%) followed by loam (30%). Correlation analysis revealed that pH positively correlates with CEC (r = 0.72, p < 0.001) and negatively with phosphorus availability (r = -0.58, p < 0.01). An amendment plan is proposed including agricultural lime to correct acidity, organic matter incorporation, and phosphorus-rich fertilizer application to improve rice crop productivity.',
    palabras_clave: 'suelos, fertilidad, caracterización, Guárico, agricultura, arroz, pH, materia orgánica',
    status: 'aprobado',
    autor: 'investigador4@saberunerg.com',
    linea: 'Química Ambiental',
    revista: 'Ciencia e Investigación',
    diasAtras: 5,
    img: '/uploads/articulos/16/cover.svg',
    doi: '10.58927/ci.2024.016',
    volumen: 2,
    numero: 1,
  },
];

/* ───────────────────── SEED FUNCTIONS ───────────────────── */

function findOrCreate(Model, whereClause, defaults) {
  return Model.findOrCreate({ where: whereClause, defaults });
}

async function seed() {
  console.log('🌱 Iniciando seed completo de la base de datos...\n');
  await db.authenticate();
  console.log('✅ Conexión a la base de datos establecida');

  // Create tables from models (same as server startup)
  await db.sync();
  console.log('✅ Tablas sincronizadas\n');

  /* ── 1. Usuarios ── */
  console.log('👤 Creando usuarios...');
  const usuarios = {};
  for (const u of usuariosData) {
    const [usuario] = await findOrCreate(Usuario, { correo: u.correo }, u);
    usuarios[u.correo] = usuario;
    console.log(`   ${usuario.rol.padEnd(14)} ${u.correo}`);
  }

  /* ── 2. Áreas ── */
  console.log('\n📁 Creando áreas...');
  const areas = {};
  for (const a of areasData) {
    const [area] = await findOrCreate(Area, { nombre: a.nombre }, a);
    areas[a.nombre] = area;
    console.log(`   ✦ ${a.nombre}`);
  }

  /* ── 3. Programas ── */
  console.log('\n📂 Creando programas...');
  const programas = {};
  for (const p of programasData) {
    const area = areas[p.area];
    const [prog] = await findOrCreate(Programa, { nombre: p.nombre }, { nombre: p.nombre, area_id: area.id });
    programas[p.nombre] = prog;
    console.log(`   ✦ ${p.nombre} → ${p.area}`);
  }

  /* ── 4. Líneas de investigación ── */
  console.log('\n🔬 Creando líneas de investigación...');
  const lineas = {};
  for (const l of lineasData) {
    const prog = programas[l.programa];
    const [linea] = await findOrCreate(
      LineaInvestigacion,
      { programa_id: prog.id, nombre: l.nombre },
      { programa_id: prog.id, nombre: l.nombre }
    );
    lineas[l.nombre] = linea;
    console.log(`   ✦ ${l.nombre} → ${l.programa}`);
  }

  /* ── 5. Revistas ── */
  console.log('\n📚 Creando revistas...');
  const revistas = {};

  const allLineaIds = Object.values(lineas).map((l) => l.id);

  for (const r of revistasData) {
    const { coverColor, ...revistaFields } = r;
    const revistaLineas = r.nombre === 'Revista Científica UNERG'
      ? allLineaIds
      : allLineaIds.filter((id) => id <= 8);
    const [revista] = await findOrCreate(Revista, { issn: r.issn }, {
      ...revistaFields,
      lineas_permitidas: revistaLineas,
    });
    revistas[r.nombre] = revista;

    const coverDir = join(BACKEND_ROOT, 'uploads', 'revistas', String(revista.id));
    mkdirSync(coverDir, { recursive: true });
    const svg = generateRevistaCoverSVG(r.nombre, r.issn, r.periodicidad, coverColor);
    writeFileSync(join(coverDir, 'cover.svg'), svg, 'utf-8');

    await revista.update({ portada: r.portada, lineas_permitidas: revistaLineas });

    console.log(`   ✦ ${r.nombre} (ISSN: ${r.issn}) — ${revistaLineas.length} líneas permitidas`);
  }

  /* ── 6. Volúmenes ── */
  console.log('\n📖 Creando volúmenes...');
  const volumenes = {};
  const volumenesByRevista = {};

  for (const revNombre of Object.keys(revistas)) {
    const rev = revistas[revNombre];
    volumenesByRevista[revNombre] = [];
    for (let v = 1; v <= 3; v++) {
      const key = `${revNombre}-V${v}`;
      const [vol] = await findOrCreate(
        Volumen,
        { revista_id: rev.id, numero_volumen: v },
        { revista_id: rev.id, numero_volumen: v }
      );
      volumenes[key] = vol;
      volumenesByRevista[revNombre].push(vol);
      console.log(`   ✦ ${revNombre} → Vol. ${v}`);
    }
  }

  /* ── 7. Números de revista ── */
  console.log('\n📄 Creando números de revista...');
  const numeros = {};

  for (const revNombre of Object.keys(revistas)) {
    const rev = revistas[revNombre];
    const vols = volumenesByRevista[revNombre];

    for (const vol of vols) {
      const anioBase = 2024 + (vol.numero_volumen - 1);
      for (let n = 1; n <= 2; n++) {
        const key = `${revNombre}-V${vol.numero_volumen}-N${n}`;
        let numero = await NumeroRevista.findOne({
          where: { volumen_id: vol.id, numero: n },
        });
        if (!numero) {
          numero = await NumeroRevista.create({
            revista_id: rev.id,
            volumen_id: vol.id,
            numero: n,
            anio: anioBase,
            titulo_edicion: n === 1 ? 'Enero-Junio' : 'Julio-Diciembre',
            status: vol.numero_volumen < 3 ? 'publicado' : 'futuro',
          });
        }
        numeros[key] = numero;
        console.log(`   ✦ ${revNombre} Vol.${vol.numero_volumen} Nº${n} (${anioBase})`);
      }
    }
  }

  /* ── 8. Artículos ── */
  console.log('\n📝 Creando artículos...');

  const articulosCreados = [];
  for (const a of articulosData) {
    const autor = usuarios[a.autor];
    const linea = lineas[a.linea];
    const revista = revistas[a.revista];

    let numeroRevistaId = null;
    if (a.volumen && a.numero) {
      const volKey = `${a.revista}-V${a.volumen}-N${a.numero}`;
      if (numeros[volKey]) {
        numeroRevistaId = numeros[volKey].id;
      }
    }

    const [articulo] = await findOrCreate(
      Articulo,
      { titulo_es: a.titulo_es },
      {
        revista_id: revista.id,
        linea_id: linea.id,
        autor_principal_id: autor.id,
        titulo_es: a.titulo_es,
        titulo_en: a.titulo_en,
        resumen_es: a.resumen_es,
        resumen_en: a.resumen_en,
        palabras_clave: a.palabras_clave,
        firma_originalidad: true,
        firma_etica: true,
        status: a.status,
        numero_revista_id: numeroRevistaId,
        img: a.img,
        doi: a.doi,
        fecha_recepcion: makeFechaReciente(a.diasAtras),
        fecha_publicacion: a.status === 'publicado' ? makeFechaReciente(a.diasAtras - 30) : null,
      }
    );
    articulosCreados.push({ articulo, data: a });
    console.log(`   ✦ [${a.status}] ${a.titulo_es.slice(0, 55)}...`);
  }

  /* ── 9. Archivos de artículos ── */
  console.log('\n📎 Creando archivos de artículos...');
  for (const { articulo } of articulosCreados) {
    const existe = await ArchivoArticulo.findOne({
      where: { articulo_id: articulo.id, tipo_archivo: 'manuscrito_original' },
    });
    if (!existe) {
      await ArchivoArticulo.create({
        articulo_id: articulo.id,
        tipo_archivo: 'manuscrito_original',
        url: `/uploads/articulos/${articulo.id}/manuscrito_original.pdf`,
        version: 1,
        es_anonimo: false,
      });
    }
  }
  console.log(`   ✦ ${articulosCreados.length} archivos manuscrito_original creados`);

  /* ── 9b. Imágenes de portada SVG ── */
  console.log('\n🖼️  Creando imágenes de portada SVG...');
  const fs = await import('fs');
  const pathMod = await import('path');
  const svgColors = ['#2d6a4f','#e76f51','#264653','#6a4c93','#1982c4','#8ac926','#ff595e','#ffca3a','#0077b6','#fb5607','#8338ec','#3a86ff','#06d6a0','#118ab2','#073b4c','#80b918','#555555'];
  for (let i = 0; i < articulosCreados.length; i++) {
    const { articulo, data } = articulosCreados[i];
    const dir = pathMod.default.join('uploads', 'articulos', String(articulo.id));
    fs.default.mkdirSync(dir, { recursive: true });
    const color = svgColors[i % svgColors.length];
    const title = (data.titulo_es || 'Articulo').substring(0, 40);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.7"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <text x="400" y="210" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="bold" fill="white">${title}</text>
  <rect x="360" y="240" width="80" height="2" rx="1" fill="white" opacity="0.5"/>
  <text x="400" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="white" opacity="0.7">${data.status}</text>
  <text x="400" y="460" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="white" opacity="0.4">SaberUnerg</text>
</svg>`;
    const svgPath = pathMod.default.join(dir, 'cover.svg');
    if (!fs.default.existsSync(svgPath)) {
      fs.default.writeFileSync(svgPath, svg);
    }
  }
  console.log(`   ✦ ${articulosCreados.length} imágenes SVG creadas`);

  /* ── 10. Evaluaciones para artículos en revisión/aprobados ── */
  console.log('\n⚖️  Creando evaluaciones...');
  const revisor1 = usuarios['revisor1@saberunerg.com'];
  const revisor2 = usuarios['revisor2@saberunerg.com'];
  let evalCount = 0;

  for (const { articulo, data } of articulosCreados) {
    if (['en_revision', 'aprobado', 'asignado', 'publicado', 'por_corregir'].includes(data.status)) {
      const existe = await Evaluacion.findOne({ where: { articulo_id: articulo.id, revisor_id: revisor1.id } });
      if (!existe) {
        const veredicto1 = data.status === 'rechazado' ? 'rechazado' : data.status === 'por_corregir' ? 'corregir' : 'aprobado';
        await Evaluacion.create({
          articulo_id: articulo.id,
          revisor_id: revisor1.id,
          veredicto: veredicto1,
          observaciones_editor: 'Evaluación inicial del revisor 1',
          observaciones_autor: 'Corregir sección de metodología',
          fecha_evaluacion: new Date(Date.now() - data.diasAtras * 86400000 + 5 * 86400000),
        });
        evalCount++;
      }
    }
  }
  console.log(`   ✦ ${evalCount} evaluaciones creadas`);

  /* ── Resumen ── */
  console.log('\n' + '═'.repeat(55));
  console.log('✅ Seed completado exitosamente');
  console.log('═'.repeat(55));
  console.log(`\n  👤 Usuarios:       ${usuariosData.length}`);
  console.log(`  📁 Áreas:          ${areasData.length}`);
  console.log(`  📂 Programas:      ${programasData.length}`);
  console.log(`  🔬 Líneas:         ${lineasData.length}`);
  console.log(`  📚 Revistas:       ${revistasData.length}`);
  console.log(`  📖 Volúmenes:      ${Object.keys(volumenes).length}`);
  console.log(`  📄 Números:        ${Object.keys(numeros).length}`);
  console.log(`  📝 Artículos:      ${articulosCreados.length}`);
  console.log(`  📎 Archivos:       ${articulosCreados.length}`);
  console.log(`  ⚖️  Evaluaciones:  ${evalCount}`);

  console.log('\n📋 Credenciales de acceso:');
  console.log('  ─────────────────────────────────────────');
  console.log('  Admin:     admin@saberunerg.com / admin123');
  console.log('  Editor:    editor@saberunerg.com / password123');
  console.log('  Revisor:   revisor1@saberunerg.com / password123');
  console.log('  Revisor:   revisor2@saberunerg.com / password123');
  console.log('  Inv. 1-6:  investigador[1-6]@saberunerg.com / password123');
  console.log('  ─────────────────────────────────────────');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Error en seed:', err.message);
    if (err.parent) console.error(err.parent.message);
    process.exit(1);
  });
