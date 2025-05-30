const express = require('express');
const router = express.Router();

// Endpoint para devolver la URL del iframe de Google Maps Embed API
router.get('/embed', (req, res) => {
    const { lat, lng, q } = req.query;
    if (!lat || !lng) return res.status(400).json({ msg: 'Faltan coordenadas' });
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const query = q ? encodeURIComponent(q) : `${lat},${lng}`;
    const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&center=${lat},${lng}&zoom=16`;
    res.json({ url });
});

module.exports = router;
