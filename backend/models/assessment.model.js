import { db } from '../config/db.js';

export const AssessmentModel = {
  // Crear evaluación
  async create({ course_id, title, description, type, due_date, max_score, time_limit, attempts_allowed }) {
    const [result] = await db.query(`
      INSERT INTO assessments 
      (course_id, title, description, type, due_date, max_score, time_limit, attempts_allowed, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [course_id, title, description, type, due_date, max_score, time_limit || null, attempts_allowed || 1]);
    
    return { id: result.insertId, course_id, title, type };
  },

  // Obtener evaluación por ID
  async findById(id) {
    const [rows] = await db.query(`
      SELECT a.*, c.name as course_name, u.nombre as teacher_name
      FROM assessments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE a.id = ?
    `, [id]);
    return rows[0];
  },

  // Obtener evaluaciones de un curso
  async findByCourse(courseId) {
    const [rows] = await db.query(`
      SELECT a.*, 
             COUNT(DISTINCT s.student_id) as submissions_count,
             AVG(s.score) as average_score
      FROM assessments a
      LEFT JOIN submissions s ON a.id = s.assessment_id
      WHERE a.course_id = ? AND a.status = 'active'
      GROUP BY a.id
      ORDER BY a.due_date ASC
    `, [courseId]);
    return rows;
  },

  // Obtener evaluaciones pendientes de un estudiante
  async findPendingByStudent(studentId) {
    const [rows] = await db.query(`
      SELECT a.*, c.name as course_name, c.teacher_id,
             COUNT(s.id) as attempts_made
      FROM assessments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN submissions s ON a.id = s.assessment_id AND s.student_id = ?
      WHERE e.student_id = ? 
        AND a.status = 'active'
        AND (a.due_date IS NULL OR a.due_date >= NOW())
        AND (s.id IS NULL OR s.status != 'graded')
      GROUP BY a.id
      HAVING COUNT(s.id) < a.attempts_allowed OR a.attempts_allowed IS NULL
      ORDER BY a.due_date ASC
    `, [studentId, studentId]);
    return rows;
  },

  // Actualizar evaluación
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
      `UPDATE assessments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  // Eliminar evaluación (soft delete)
  async delete(id) {
    const [result] = await db.query(
      `UPDATE assessments SET status = 'deleted' WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
};