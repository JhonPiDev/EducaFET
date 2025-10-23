import { LessonModel } from '../models/lesson.model.js';
import { CourseModel } from '../models/course.model.js';

export const LessonController = {
  // Obtener lecciones de un curso
  async getLessonsByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const lessons = await LessonModel.findByCourse(courseId);

      res.json(lessons);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener lecciones' });
    }
  },

  // Obtener lección por ID
  async getLessonById(req, res) {
    try {
      const { id } = req.params;
      const lesson = await LessonModel.findById(id);

      if (!lesson) {
        return res.status(404).json({ message: 'Lección no encontrada' });
      }

      res.json(lesson);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener lección' });
    }
  },

  // Crear lección (solo docentes)
  async createLesson(req, res) {
    try {
      const { courseId } = req.params;
      const { title, description, content, order_num, duration, video_url } = req.body;

      // Verificar que sea docente o admin
      if (req.user.rol !== 'docente' && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para crear lecciones' });
      }

      // Verificar que el curso existe y pertenece al docente
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No puedes crear lecciones en este curso' });
      }

      // Si no se proporciona order_num, calcular el siguiente
      let lessonOrder = order_num;
      if (!lessonOrder) {
        const lessonCount = await LessonModel.countByCourse(courseId);
        lessonOrder = lessonCount + 1;
      }

      const lesson = await LessonModel.create({
        course_id: courseId,
        title,
        description,
        content,
        order_num: lessonOrder,
        duration,
        video_url
      });

      res.status(201).json({
        message: 'Lección creada exitosamente',
        lesson
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear lección' });
    }
  },

  // Actualizar lección
  async updateLesson(req, res) {
    try {
      const { id } = req.params;
      const lesson = await LessonModel.findById(id);

      if (!lesson) {
        return res.status(404).json({ message: 'Lección no encontrada' });
      }

      // Verificar que el curso pertenece al docente
      const course = await CourseModel.findById(lesson.course_id);
      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para actualizar esta lección' });
      }

      const updated = await LessonModel.update(id, req.body);

      if (!updated) {
        return res.status(400).json({ message: 'No se pudo actualizar la lección' });
      }

      const updatedLesson = await LessonModel.findById(id);
      res.json({
        message: 'Lección actualizada exitosamente',
        lesson: updatedLesson
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar lección' });
    }
  },

  // Eliminar lección
  async deleteLesson(req, res) {
    try {
      const { id } = req.params;
      const lesson = await LessonModel.findById(id);

      if (!lesson) {
        return res.status(404).json({ message: 'Lección no encontrada' });
      }

      // Verificar permisos
      const course = await CourseModel.findById(lesson.course_id);
      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para eliminar esta lección' });
      }

      await LessonModel.delete(id);
      res.json({ message: 'Lección eliminada exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar lección' });
    }
  }
};