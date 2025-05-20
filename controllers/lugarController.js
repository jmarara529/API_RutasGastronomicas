const db = require('../db');

exports.insertarLugarSiNoExiste = async (place_id, nombre, direccion, categoria, ciudad) => {
  const [[existe]] = await db.execute('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
  if (existe) return existe.id;

  const [result] = await db.execute(
    'INSERT INTO lugares (place_id, nombre, direccion, categoria, ciudad) VALUES (?, ?, ?, ?, ?)',
    [place_id, nombre, direccion, categoria, ciudad]
  );
  return result.insertId;
};
