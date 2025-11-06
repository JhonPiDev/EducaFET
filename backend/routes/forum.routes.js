import express from 'express';
import { ForumController } from '../controllers/forum.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Obtener temas de un curso
router.get('/course/:courseId', authMiddleware, ForumController.getTopicsByCourse);

// Obtener tema por ID con respuestas
router.get('/topic/:id', authMiddleware, ForumController.getTopicById);

// Crear tema
router.post('/topic', authMiddleware, ForumController.createTopic);

// Crear respuesta
router.post('/reply', authMiddleware, ForumController.createReply);

// Marcar respuesta como solución
router.post('/reply/:replyId/solution', authMiddleware, ForumController.markAsSolution);

// Eliminar tema
router.delete('/topic/:id', authMiddleware, ForumController.deleteTopic);

// Eliminar respuesta
router.delete('/reply/:id', authMiddleware, ForumController.deleteReply);

export default router;
