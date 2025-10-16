import express from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getCourseById);

// Rutas protegidas
router.post('/', authMiddleware, CourseController.createCourse);
router.put('/:id', authMiddleware, CourseController.updateCourse);
router.post('/:id/enroll', authMiddleware, CourseController.enrollCourse);
router.get('/my/courses', authMiddleware, CourseController.getMyCourses);

export default router;
