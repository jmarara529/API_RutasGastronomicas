const axios = require('axios');

// Buscar lugares por texto (Places API NEW, con fallback a Geocoding+Nearby)
exports.buscarLugar = async (req, res) => {
  const { query, radius = 1000, type } = req.query;
  if (!query) {
    return res.status(400).json({ msg: 'El parámetro "query" es obligatorio' });
  }
  try {
    // 1. Intentar búsqueda directa por texto
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: query,
        languageCode: 'es',
        maxResultCount: 20
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.id,places.rating,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos'
        }
      }
    );
    // Filtrar resultados que sean realmente lugares (no solo calles o ciudades)
    const filtered = (response.data.places || []).filter(p => Array.isArray(p.types) && p.types.some(t => t !== 'route' && t !== 'locality' && t !== 'political'));
    if (filtered.length > 0) {
      return res.json({ results: filtered });
    }
    // 2. Si no hay resultados útiles, intentar geocodificar el texto
    const geo = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: query,
        key: process.env.GOOGLE_PLACES_API_KEY,
        language: 'es'
      }
    });
    if (
      geo.data &&
      geo.data.results &&
      geo.data.results.length > 0 &&
      geo.data.results[0].geometry &&
      geo.data.results[0].geometry.location
    ) {
      const { lat, lng } = geo.data.results[0].geometry.location;
      // 3. Buscar lugares cercanos a esas coordenadas
      const nearby = await axios.post(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: parseInt(radius, 10)
            }
          },
          includedTypes: type ? [type] : undefined,
          languageCode: 'es',
          maxResultCount: 20
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.id,places.rating,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos'
          }
        }
      );
      return res.json({ results: nearby.data.places || [] });
    }
    // Si tampoco hay resultados, devolver vacío
    return res.json({ results: [] });
  } catch (error) {
    res.status(500).json({ msg: 'Error al consultar Google Places (New o Geocoding)', error: error.message });
  }
};

// Buscar lugares cercanos a unas coordenadas (Places API NEW)
exports.buscarCercanos = async (req, res) => {
  const { lat, lng, radius = 500, type } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ msg: 'Los parámetros "lat" y "lng" son obligatorios' });
  }
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        locationRestriction: {
          circle: {
            center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
            radius: parseInt(radius, 10)
          }
        },
        includedTypes: type ? [type] : undefined,
        languageCode: 'es',
        maxResultCount: 20
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.id,places.rating,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos'
        }
      }
    );
    res.json({ results: response.data.places || [] });
  } catch (error) {
    res.status(500).json({ msg: 'Error al consultar lugares cercanos (New)', error: error.message });
  }
};

// Obtener detalles de un lugar por place_id (mantener legacy si no necesitas migrar)
exports.detallesLugar = async (req, res) => {
  const { place_id } = req.query;
  if (!place_id) {
    return res.status(400).json({ msg: 'El parámetro "place_id" es obligatorio' });
  }
  try {
    // Usar Places API (New) para obtener detalles por place_id
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:lookup',
      {
        placeId: place_id,
        languageCode: 'es'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,rating,nationalPhoneNumber,websiteUri,regularOpeningHours,photos'
        },
        validateStatus: () => true // Permite capturar el body de error de Google
      }
    );
    if (response.status === 404) {
      // Prueba con el endpoint legacy si falla el de la API New
      try {
        const legacy = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id,
            key: process.env.GOOGLE_PLACES_API_KEY,
            language: 'es'
          }
        });
        if (legacy.data && legacy.data.result) {
          return res.json({ result: legacy.data.result, legacy: true });
        } else {
          return res.status(404).json({ msg: 'No se encontró el sitio (ni en legacy)', google: response.data, legacy: legacy.data });
        }
      } catch (legacyError) {
        return res.status(500).json({ msg: 'Error al consultar detalles (legacy)', error: legacyError.message, google: response.data });
      }
    }
    if (response.data && response.data.place) {
      res.json({ result: response.data.place });
    } else {
      res.status(500).json({ msg: 'Respuesta inesperada de Google', google: response.data });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Error al consultar detalles de Google Places', error: error.message });
  }
};