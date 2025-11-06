import express from 'express';
import { LessonController } from '../controllers/lesson.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Obtener lecciones de un curso
router.get('/course/:courseId', authMiddleware, LessonController.getLessonsByCourse);

// Obtener lección por ID
router.get('/:id', authMiddleware, LessonController.getLessonById);

// Crear lección (solo docentes)
router.post('/', authMiddleware, roleMiddleware(['docente', 'admin']), LessonController.createLesson);

// Actualizar lección
router.put('/:id', authMiddleware, roleMiddleware(['docente', 'admin']), LessonController.updateLesson);

// Eliminar lección
router.delete('/:id', authMiddleware, roleMiddleware(['docente', 'admin']), LessonController.deleteLesson);

// Marcar como completada (estudiantes)
router.post('/:id/complete', authMiddleware, roleMiddleware(['estudiante']), LessonController.completeLesson);

export default router;