import express from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { LessonController } from '../controllers/lesson.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { AssessmentController } from '../controllers/assessment.controller.js';


const router = express.Router();

// Rutas de cursos
router.get('/', CourseController.getAllCourses);
router.get('/teacher/my-courses', authMiddleware, CourseController.getCoursesByTeacher);
router.get('/my/courses', authMiddleware, CourseController.getMyCourses);
router.get('/:id', CourseController.getCourseById);
router.post('/', authMiddleware, CourseController.createCourse);
router.put('/:id', authMiddleware, CourseController.updateCourse);
router.delete('/:id', authMiddleware, CourseController.deleteCourse);
router.post('/:id/enroll', authMiddleware, CourseController.enrollCourse);
router.get('/:id/statistics', authMiddleware, CourseController.getCourseStatistics);
router.get('/:courseId/check-enrollment/:userId', CourseController.checkEnrollment);
// Rutas de evaluaciones (asociadas a cursos)
router.get('/:courseId/assessments', authMiddleware, AssessmentController.getAssessmentsByCourse);
router.post('/:courseId/assessments', authMiddleware, AssessmentController.createAssessment);



// Rutas de lecciones
router.get('/:courseId/lessons', LessonController.getLessonsByCourse);
router.post('/:courseId/lessons', authMiddleware, LessonController.createLesson);
router.get('/lessons/:id', LessonController.getLessonById);
router.put('/lessons/:id', authMiddleware, LessonController.updateLesson);
router.delete('/lessons/:id', authMiddleware, LessonController.deleteLesson);

export default router;