import express from 'express';
import { AssessmentController } from '../controllers/assessment.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// -------------------------------
// RUTAS ESPECÍFICAS (deben ir primero)
// -------------------------------

// Obtener evaluaciones pendientes del estudiante
router.get(
  '/student/pending',
  authMiddleware,
  roleMiddleware(['estudiante']),
  AssessmentController.getPendingAssessments
);

// Obtener historial del estudiante
router.get(
  '/student/history',
  authMiddleware,
  roleMiddleware(['estudiante']),
  AssessmentController.getStudentHistory
);

// Obtener evaluaciones de un curso
router.get(
  '/course/:courseId',
  authMiddleware,
  AssessmentController.getAssessmentsByCourse
);

// Obtener envíos de una evaluación (docentes)
router.get(
  '/:id/submissions',
  authMiddleware,
  roleMiddleware(['docente', 'admin']),
  AssessmentController.getSubmissions
);

// Calificar envío (docentes)
router.post(
  '/submissions/:id/grade',
  authMiddleware,
  roleMiddleware(['docente', 'admin']),
  AssessmentController.gradeSubmission
);

// Enviar respuestas (estudiantes)
router.post(
  '/:id/submit',
  authMiddleware,
  roleMiddleware(['estudiante']),
  AssessmentController.submitAssessment
);

// Crear evaluación (solo docentes)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['docente', 'admin']),
  AssessmentController.createAssessment
);

// -------------------------------
// RUTA GENÉRICA — SIEMPRE ÚLTIMA
// -------------------------------

// Obtener evaluación por ID
router.get(
  '/:id',
  authMiddleware,
  AssessmentController.getAssessmentById
);

export default router;
