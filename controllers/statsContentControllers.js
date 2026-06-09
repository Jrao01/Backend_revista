import { Articulo, NumeroRevista, Volumen, Revista } from '../models/index.js';

export const incrementArticleView = async (req, res) => {
  try {
    const { id } = req.params;
    const articulo = await Articulo.findByPk(id);

    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    articulo.views = (articulo.views || 0) + 1;
    await articulo.save();

    res.json({ views: articulo.views });
  } catch (error) {
    console.error('Error incrementando vista:', error);
    res.status(500).json({ message: 'Error al registrar vista' });
  }
};

export const incrementNumeroDownload = async (req, res) => {
  try {
    const { numId } = req.params;
    const numero = await NumeroRevista.findByPk(numId);

    if (!numero) {
      return res.status(404).json({ message: 'Número no encontrado' });
    }

    numero.downloads = (numero.downloads || 0) + 1;
    await numero.save();

    res.json({ downloads: numero.downloads });
  } catch (error) {
    console.error('Error incrementando descarga:', error);
    res.status(500).json({ message: 'Error al registrar descarga' });
  }
};

export const getRevistaStats = async (req, res) => {
  try {
    const { revId } = req.params;

    const volumenes = await Volumen.findAll({
      where: { revista_id: revId },
      include: [{
        model: NumeroRevista,
        as: 'numeros'
      }]
    });

    let totalViews = 0;
    let totalDownloads = 0;
    const volumenStats = [];

    for (const vol of volumenes) {
      let volViews = 0;
      let volDownloads = 0;
      const numeroStats = [];

      for (const num of (vol.numeros || [])) {
        volViews += num.views || 0;
        volDownloads += num.downloads || 0;
        numeroStats.push({
          id: num.id,
          numero: num.numero,
          views: num.views || 0,
          downloads: num.downloads || 0
        });
      }

      totalViews += volViews;
      totalDownloads += volDownloads;

      volumenStats.push({
        id: vol.id,
        numero_volumen: vol.numero_volumen,
        views: volViews,
        downloads: volDownloads,
        numeros: numeroStats
      });
    }

    res.json({
      totalViews,
      totalDownloads,
      volumenes: volumenStats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};
