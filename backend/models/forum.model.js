import { db } from '../config/db.js';

export const ForumModel = {
  // Crear tema
  async createTopic({ course_id, user_id, title, content }) {
    const [result] = await db.query(`
      INSERT INTO forum_topics (course_id, user_id, title, content) 
      VALUES (?, ?, ?, ?)
    `, [course_id, user_id, title, content]);
    
    return { id: result.insertId, course_id, title };
  },

  // Obtener temas de un curso
  async getTopicsByCourse(courseId) {
    const [rows] = await db.query(`
      SELECT 
        t.*,
        u.nombre as author_name,
        u.rol as author_role,
        COUNT(DISTINCT r.id) as replies_count,
        MAX(r.created_at) as last_reply_at
      FROM forum_topics t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN forum_replies r ON t.id = r.topic_id
      WHERE t.course_id = ?
      GROUP BY t.id
      ORDER BY t.is_pinned DESC, t.updated_at DESC
    `, [courseId]);
    return rows;
  },

  // Obtener tema por ID
  async getTopicById(id) {
    // Incrementar vistas
    await db.query('UPDATE forum_topics SET views = views + 1 WHERE id = ?', [id]);

    const [rows] = await db.query(`
      SELECT 
        t.*,
        u.nombre as author_name,
        u.rol as author_role
      FROM forum_topics t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id]);
    return rows[0];
  },

  // Crear respuesta
  async createReply({ topic_id, user_id, content }) {
    const [result] = await db.query(`
      INSERT INTO forum_replies (topic_id, user_id, content) 
      VALUES (?, ?, ?)
    `, [topic_id, user_id, content]);
    
    // Actualizar timestamp del tema
    await db.query('UPDATE forum_topics SET updated_at = NOW() WHERE id = ?', [topic_id]);
    
    return { id: result.insertId, topic_id };
  },

  // Obtener respuestas de un tema
  async getRepliesByTopic(topicId) {
    const [rows] = await db.query(`
      SELECT 
        r.*,
        u.nombre as author_name,
        u.rol as author_role
      FROM forum_replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.topic_id = ?
      ORDER BY r.created_at ASC
    `, [topicId]);
    return rows;
  },

  // Marcar respuesta como solución
  async markAsSolution(replyId) {
    // Primero desmarcar otras soluciones del mismo tema
    await db.query(`
      UPDATE forum_replies r1
      JOIN forum_replies r2 ON r1.topic_id = r2.topic_id
      SET r1.is_solution = FALSE
      WHERE r2.id = ?
    `, [replyId]);

    // Marcar esta como solución
    const [result] = await db.query(
      'UPDATE forum_replies SET is_solution = TRUE WHERE id = ?',
      [replyId]
    );
    
    return result.affectedRows > 0;
  },

  // Eliminar tema
  async deleteTopic(id) {
    const [result] = await db.query('DELETE FROM forum_topics WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Eliminar respuesta
  async deleteReply(id) {
    const [result] = await db.query('DELETE FROM forum_replies WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  // Agregar este método al ForumModel existente:

async getRecentTopics(limit = 10) {
  const [rows] = await db.query(`
    SELECT 
      t.*,
      u.nombre as author_name,
      u.rol as author_role,
      c.nombre as course_name,
      COUNT(DISTINCT r.id) as replies_count,
      MAX(r.created_at) as last_reply_at
    FROM forum_topics t
    JOIN users u ON t.user_id = u.id
    JOIN courses c ON t.course_id = c.id
    LEFT JOIN forum_replies r ON t.id = r.topic_id
    GROUP BY t.id
    ORDER BY t.updated_at DESC
    LIMIT ?
  `, [limit]);
  return rows;
},
};