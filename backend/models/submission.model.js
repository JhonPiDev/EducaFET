export const SubmissionModel = {
  // Crear envío
  async create({ student_id, assessment_id, answers }) {
    const [result] = await db.query(`
      INSERT INTO submissions 
      (student_id, assessment_id, answers, status, submitted_at) 
      VALUES (?, ?, ?, 'pending', NOW())
    `, [student_id, assessment_id, JSON.stringify(answers)]);
    
    return { id: result.insertId, student_id, assessment_id };
  },

  // Obtener envío por ID
  async findById(id) {
    const [rows] = await db.query(`
      SELECT s.*, a.title as assessment_title, a.type as assessment_type,
             u.nombre as student_name, u.email as student_email
      FROM submissions s
      JOIN assessments a ON s.assessment_id = a.id
      JOIN users u ON s.student_id = u.id
      WHERE s.id = ?
    `, [id]);
    
    if (rows[0]) {
      rows[0].answers = JSON.parse(rows[0].answers);
    }
    return rows[0];
  },

  // Obtener envíos de un estudiante
  async findByStudent(studentId, assessmentId = null) {
    let query = `
      SELECT s.*, a.title as assessment_title, a.type as assessment_type, 
             a.max_score, c.name as course_name
      FROM submissions s
      JOIN assessments a ON s.assessment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.student_id = ?
    `;
    const params = [studentId];

    if (assessmentId) {
      query += ' AND s.assessment_id = ?';
      params.push(assessmentId);
    }

    query += ' ORDER BY s.submitted_at DESC';

    const [rows] = await db.query(query, params);
    return rows.map(row => ({
      ...row,
      answers: row.answers ? JSON.parse(row.answers) : null
    }));
  },

  // Obtener envíos de una evaluación (para docentes)
  async findByAssessment(assessmentId) {
    const [rows] = await db.query(`
      SELECT s.*, u.nombre as student_name, u.email as student_email
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assessment_id = ?
      ORDER BY s.submitted_at DESC
    `, [assessmentId]);
    
    return rows.map(row => ({
      ...row,
      answers: row.answers ? JSON.parse(row.answers) : null
    }));
  },

  // Calificar envío
  async grade(id, { score, feedback, graded_by }) {
    const [result] = await db.query(`
      UPDATE submissions 
      SET score = ?, feedback = ?, graded_by = ?, graded_at = NOW(), status = 'graded'
      WHERE id = ?
    `, [score, feedback, graded_by, id]);
    
    return result.affectedRows > 0;
  },

  // Contar intentos de un estudiante
  async countAttempts(studentId, assessmentId) {
    const [rows] = await db.query(`
      SELECT COUNT(*) as count 
      FROM submissions 
      WHERE student_id = ? AND assessment_id = ?
    `, [studentId, assessmentId]);
    
    return rows[0].count;
  }
};