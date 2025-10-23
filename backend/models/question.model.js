export const QuestionModel = {
  // Crear pregunta
  async create({ assessment_id, question_text, question_type, options, correct_answer, points }) {
    const [result] = await db.query(`
      INSERT INTO questions 
      (assessment_id, question_text, question_type, options, correct_answer, points) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [assessment_id, question_text, question_type, JSON.stringify(options), correct_answer, points]);
    
    return { id: result.insertId, assessment_id, question_text };
  },

  // Obtener preguntas de una evaluación
  async findByAssessment(assessmentId) {
    const [rows] = await db.query(`
      SELECT * FROM questions 
      WHERE assessment_id = ? 
      ORDER BY id ASC
    `, [assessmentId]);
    
    // Parsear opciones JSON
    return rows.map(row => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    }));
  },

  // Actualizar pregunta
  async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        if (key === 'options') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await db.query(
      `UPDATE questions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  // Eliminar pregunta
  async delete(id) {
    const [result] = await db.query('DELETE FROM questions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};