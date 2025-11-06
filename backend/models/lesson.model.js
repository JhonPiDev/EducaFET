import { db } from '../config/db.js';

export const LessonModel = {
  // Obtener lecciones de un curso
  async findByCourse(courseId) {
    const [rows] = await db.query(`
      SELECT * FROM lessons 
      WHERE course_id = ? AND is_published = TRUE
      ORDER BY order_num ASC
    `, [courseId]);
    return rows;
  },

  // ✅ Nuevo método: contar lecciones por curso
  async countByCourse(courseId) {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total FROM lessons WHERE course_id = ? AND is_published = TRUE
    `, [courseId]);
    return rows[0]?.total || 0;
  },

  // Obtener lección por ID
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM lessons WHERE id = ?', [id]);
    return rows[0];
  },

  // Crear lección
  async create({ course_id, title, description, content, order_num, duration, video_url }) {
    const [result] = await db.query(`
      INSERT INTO lessons 
      (course_id, title, description, content, order_num, duration, video_url, is_published) 
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [course_id, title, description, content, order_num || 0, duration || 0, video_url || null]);
    
    return { id: result.insertId, course_id, title };
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

  // Marcar lección como completada
  async markAsCompleted(studentId, lessonId) {
    const [result] = await db.query(`
      INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at) 
      VALUES (?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()
    `, [studentId, lessonId]);
    
    return result.affectedRows > 0;
  },

  // Obtener progreso de lecciones de un estudiante
  async getStudentProgress(studentId, courseId) {
    const [rows] = await db.query(`
      SELECT l.id, l.title, lp.completed, lp.completed_at
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ?
      WHERE l.course_id = ? AND l.is_published = TRUE
      ORDER BY l.order_num ASC
    `, [studentId, courseId]);
    
    return rows;
  }
};