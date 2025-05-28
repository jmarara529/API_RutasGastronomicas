const axios = require('axios');

// Buscar lugares por texto (nombre de calle, ciudad, etc.)
exports.buscarLugar = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ msg: 'El parámetro "query" es obligatorio' });
  }
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query,
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ msg: 'Error al consultar Google Places', error: error.message });
  }
};

// Buscar lugares cercanos a unas coordenadas (lat, lng)
exports.buscarCercanos = async (req, res) => {
  const { lat, lng, radius = 500, type } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ msg: 'Los parámetros "lat" y "lng" son obligatorios' });
  }
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius,
        type, // opcional: restaurante, bar, etc.
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ msg: 'Error al consultar lugares cercanos', error: error.message });
  }
};

// Obtener detalles de un lugar por place_id
exports.detallesLugar = async (req, res) => {
  const { place_id } = req.query;
  if (!place_id) {
    return res.status(400).json({ msg: 'El parámetro "place_id" es obligatorio' });
  }
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id,
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ msg: 'Error al consultar detalles de Google Places', error: error.message });
  }
};