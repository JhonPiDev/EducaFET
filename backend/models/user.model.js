import { db } from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ nombre, email, password, rol }) {
    const [result] = await db.query(
      'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password, rol || 'estudiante']
    );
    return { id: result.insertId, nombre, email, rol: rol || 'estudiante' };
  }
};
