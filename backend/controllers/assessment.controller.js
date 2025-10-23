import { AssessmentModel } from '../models/assessment.model.js';
import { QuestionModel } from '../models/question.model.js';
import { SubmissionModel } from '../models/submission.model.js';
import { CourseModel } from '../models/course.model.js';

export const AssessmentController = {
  // Crear evaluación (solo docentes)
  async createAssessment(req, res) {
    try {
      const { course_id, title, description, type, due_date, max_score, time_limit, attempts_allowed, questions } = req.body;

      // Verificar que sea docente o admin
      if (req.user.rol !== 'docente' && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para crear evaluaciones' });
      }

      // Verificar que el curso exista y pertenezca al docente
      const course = await CourseModel.findById(course_id);
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No puedes crear evaluaciones en este curso' });
      }

      // Crear evaluación
      const assessment = await AssessmentModel.create({
        course_id,
        title,
        description,
        type,
        due_date,
        max_score: max_score || 100,
        time_limit,
        attempts_allowed: attempts_allowed || 1
      });

      // Crear preguntas si se proporcionaron
      if (questions && questions.length > 0) {
        for (const question of questions) {
          await QuestionModel.create({
            assessment_id: assessment.id,
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options || null,
            correct_answer: question.correct_answer,
            points: question.points || 1
          });
        }
      }

      res.status(201).json({
        message: 'Evaluación creada exitosamente',
        assessment
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear evaluación' });
    }
  },

  // Obtener evaluación por ID
  async getAssessmentById(req, res) {
    try {
      const { id } = req.params;
      const assessment = await AssessmentModel.findById(id);

      if (!assessment) {
        return res.status(404).json({ message: 'Evaluación no encontrada' });
      }

      // Obtener preguntas
      const questions = await QuestionModel.findByAssessment(id);

      // Si es estudiante, no mostrar respuestas correctas
      if (req.user.rol === 'estudiante') {
        questions.forEach(q => {
          delete q.correct_answer;
        });
      }

      res.json({
        ...assessment,
        questions
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener evaluación' });
    }
  },

  // Obtener evaluaciones de un curso
  async getAssessmentsByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const assessments = await AssessmentModel.findByCourse(courseId);

      res.json(assessments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener evaluaciones' });
    }
  },

  // Obtener evaluaciones pendientes del estudiante
  async getPendingAssessments(req, res) {
    try {
      const studentId = req.user.id;
      const assessments = await AssessmentModel.findPendingByStudent(studentId);

      res.json(assessments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener evaluaciones pendientes' });
    }
  },

  // Enviar respuestas (estudiantes)
  async submitAssessment(req, res) {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      const studentId = req.user.id;

      // Verificar que sea estudiante
      if (req.user.rol !== 'estudiante') {
        return res.status(403).json({ message: 'Solo los estudiantes pueden enviar evaluaciones' });
      }

      // Verificar que la evaluación exista
      const assessment = await AssessmentModel.findById(id);
      if (!assessment) {
        return res.status(404).json({ message: 'Evaluación no encontrada' });
      }

      // Verificar intentos permitidos
      const attemptsCount = await SubmissionModel.countAttempts(studentId, id);
      if (assessment.attempts_allowed && attemptsCount >= assessment.attempts_allowed) {
        return res.status(400).json({ message: 'Has alcanzado el número máximo de intentos' });
      }

      // Crear envío
      const submission = await SubmissionModel.create({
        student_id: studentId,
        assessment_id: id,
        answers
      });

      // Si es un quiz con respuestas automáticas, calificar inmediatamente
      if (assessment.type === 'quiz') {
        const questions = await QuestionModel.findByAssessment(id);
        let totalScore = 0;
        let maxScore = 0;

        questions.forEach(question => {
          maxScore += question.points;
          const studentAnswer = answers[question.id];
          if (studentAnswer === question.correct_answer) {
            totalScore += question.points;
          }
        });

        // Guardar calificación
        await SubmissionModel.grade(submission.id, {
          score: totalScore,
          feedback: 'Calificación automática',
          graded_by: null
        });

        return res.json({
          message: 'Evaluación enviada y calificada',
          submission_id: submission.id,
          score: totalScore,
          max_score: maxScore
        });
      }

      res.json({
        message: 'Evaluación enviada exitosamente. Espera la calificación del docente.',
        submission_id: submission.id
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al enviar evaluación' });
    }
  },

  // Calificar envío (docentes)
  async gradeSubmission(req, res) {
    try {
      const { id } = req.params;
      const { score, feedback } = req.body;

      // Verificar que sea docente o admin
      if (req.user.rol !== 'docente' && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para calificar' });
      }

      const submission = await SubmissionModel.findById(id);
      if (!submission) {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }

      // Calificar
      await SubmissionModel.grade(id, {
        score,
        feedback,
        graded_by: req.user.id
      });

      res.json({ message: 'Envío calificado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al calificar envío' });
    }
  },

  // Obtener envíos de una evaluación (docentes)
  async getSubmissions(req, res) {
    try {
      const { id } = req.params;

      // Verificar que sea docente o admin
      if (req.user.rol !== 'docente' && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos' });
      }

      const submissions = await SubmissionModel.findByAssessment(id);
      res.json(submissions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener envíos' });
    }
  },

  // Obtener historial del estudiante
  async getStudentHistory(req, res) {
    try {
      const studentId = req.user.id;
      const submissions = await SubmissionModel.findByStudent(studentId);

      res.json(submissions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener historial' });
    }
  }
};