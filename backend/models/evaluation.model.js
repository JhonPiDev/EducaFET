import { db } from '../config/db.js';

export const EvaluationModel = {
  async findByCourse(courseId) {
    const [rows] = await db.query(
      'SELECT * FROM evaluations WHERE course_id = ?',
      [courseId]
    );
    return rows;
  },

  async create({ course_id, title, description, total_questions }) {
    const [result] = await db.query(
      `INSERT INTO evaluations (course_id, title, description, total_questions)
       VALUES (?, ?, ?, ?)`,
      [course_id, title, description, total_questions]
    );
    return { id: result.insertId, course_id, title, description, total_questions };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM evaluations WHERE id = ?', [id]);
    return rows[0];
  }
};
