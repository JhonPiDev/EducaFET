import { db } from '../config/db.js';

export const CourseModel = {
  // Obtener todos los cursos con estadísticas
  async findAll() {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre as teacher_name,
        COUNT(DISTINCT e.student_id) as students
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return rows;
  },

  // Obtener curso por ID con estadísticas
  async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre as teacher_name,
        COUNT(DISTINCT e.student_id) as students
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);
    return rows[0];
  },

  // Crear curso
  async create({ name, description, teacher_id, duration, level, category, schedule, start_date, end_date }) {
    const [result] = await db.query(`
      INSERT INTO courses 
      (name, description, teacher_id, duration, level, category, schedule, start_date, end_date, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [name, description, teacher_id, duration, level, category, schedule, start_date, end_date]);
    
    return { id: result.insertId, name, description, teacher_id };
  },

  // Actualizar curso
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
      `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  // Eliminar curso (soft delete)
  async delete(id) {
    const [result] = await db.query(
      `UPDATE courses SET status = 'deleted' WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // Obtener cursos de un docente
  async findByTeacher(teacherId) {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT e.student_id) as students
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.teacher_id = ? AND c.status = 'active'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [teacherId]);
    return rows;
  },

  // Obtener cursos de un estudiante (inscritos)
  async findByStudent(studentId) {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        u.nombre as teacher_name,
        e.progress,
        e.enrollment_date,
        COUNT(DISTINCT e2.student_id) as students
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e2 ON c.id = e2.course_id AND e2.status = 'active'
      WHERE e.student_id = ? AND e.status = 'active' AND c.status = 'active'
      GROUP BY c.id, e.id
      ORDER BY e.enrollment_date DESC
    `, [studentId]);
    return rows;
  },
  // Obtener progreso real del estudiante en un curso
async getCourseProgress(studentId, courseId) {
  // Total de lecciones del curso
  const [[total]] = await db.query(
    `SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?`,
    [courseId]
  );

  // Lecciones completadas por el estudiante
  const [[completed]] = await db.query(
    `SELECT COUNT(*) AS completed 
     FROM lesson_progress 
     WHERE student_id = ? 
     AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)`,
    [studentId, courseId]
  );

  const totalLessons = total.total;
  const completedLessons = completed.completed;

  return {
    totalLessons,
    completedLessons,
    completionRate:
      totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    completed: completedLessons === totalLessons && totalLessons > 0
  };
}

};