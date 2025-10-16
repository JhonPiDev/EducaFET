import { db } from '../config/db.js';

export const CourseModel = {
  // Obtener todos los cursos
  async findAll() {
    const [rows] = await db.query(`
      SELECT c.*, u.nombre as teacher_name 
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.status = 'active'
      ORDER BY c.created_at DESC
    `);
    return rows;
  },

  // Obtener curso por ID
  async findById(id) {
    const [rows] = await db.query(`
      SELECT c.*, u.nombre as teacher_name 
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
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
      SELECT c.*, COUNT(e.id) as students_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.teacher_id = ? AND c.status = 'active'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [teacherId]);
    return rows;
  },

  // Obtener cursos de un estudiante
  async findByStudent(studentId) {
    const [rows] = await db.query(`
      SELECT c.*, u.nombre as teacher_name, e.progress, e.enrollment_date
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = ? AND e.status = 'active'
      ORDER BY e.enrollment_date DESC
    `, [studentId]);
    return rows;
  }
};