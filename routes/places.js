const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
const axios = require('axios');

// Buscar lugares por texto
router.get('/buscar', placesController.buscarLugar);

// Buscar lugares cercanos a unas coordenadas
router.get('/cercanos', placesController.buscarCercanos);

// Obtener detalles de un lugar por place_id
router.get('/detalles', placesController.detallesLugar);

// Endpoint para servir imágenes de Google Places (proxy)
router.get('/photo', async (req, res) => {
  const { name, photo_reference, maxwidth = 400 } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  let url = null;
  if (name) {
    // Nuevo formato Places API v1
    url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxwidth}&key=${apiKey}`;
  } else if (photo_reference) {
    // Legacy formato
    url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photo_reference}&key=${apiKey}`;
  } else {
    return res.status(400).json({ msg: 'Falta parámetro name o photo_reference' });
  }
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener la imagen de Google Places', error: err.message });
  }
});

module.exports = router;