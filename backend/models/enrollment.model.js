export const EnrollmentModel = {
  // Inscribir estudiante a curso
  async create(studentId, courseId) {
    // Verificar si ya está inscrito
    const [existing] = await db.query(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ? AND status = "active"',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      throw new Error('Ya estás inscrito en este curso');
    }

    const [result] = await db.query(
      'INSERT INTO enrollments (student_id, course_id, progress, status) VALUES (?, ?, 0, "active")',
      [studentId, courseId]
    );

    return { id: result.insertId, studentId, courseId, progress: 0 };
  },

  // Obtener inscripción
  async findOne(studentId, courseId) {
    const [rows] = await db.query(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );
    return rows[0];
  },

  // Actualizar progreso
  async updateProgress(studentId, courseId, progress) {
    const [result] = await db.query(
      'UPDATE enrollments SET progress = ? WHERE student_id = ? AND course_id = ?',
      [progress, studentId, courseId]
    );
    return result.affectedRows > 0;
  },

  // Cancelar inscripción
  async cancel(studentId, courseId) {
    const [result] = await db.query(
      'UPDATE enrollments SET status = "cancelled" WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );
    return result.affectedRows > 0;
  }
};