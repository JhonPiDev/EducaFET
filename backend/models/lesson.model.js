import { db } from '../config/db.js';

export const LessonModel = {
  // Crear lección
  async create({ course_id, title, description, content, order_num, duration, video_url }) {
    const [result] = await db.query(`
      INSERT INTO lessons 
      (course_id, title, description, content, order_num, duration, video_url, is_published) 
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [course_id, title, description, content, order_num, duration || 0, video_url || null]);
    
    return { id: result.insertId, course_id, title };
  },

  // Obtener lecciones de un curso
  async findByCourse(courseId) {
    const [rows] = await db.query(`
      SELECT * FROM lessons 
      WHERE course_id = ? AND is_published = TRUE
      ORDER BY order_num ASC
    `, [courseId]);
    return rows;
  },

  // Obtener lección por ID
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM lessons WHERE id = ?', [id]);
    return rows[0];
  },

  // Actualizar lección
  async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await db.query(
      `UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  // Eliminar lección
  async delete(id) {
    const [result] = await db.query('DELETE FROM lessons WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Contar lecciones de un curso
  async countByCourse(courseId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM lessons WHERE course_id = ? AND is_published = TRUE',
      [courseId]
    );
    return rows[0].count;
  }
};