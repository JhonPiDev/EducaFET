import { LessonModel } from '../models/lesson.model.js';
import { CourseModel } from '../models/course.model.js';

export const LessonController = {
  // Obtener lecciones de un curso
  async getLessonsByCourse(req, res) {
    try {
      const { courseId } = req.params;

      // Si es estudiante, obtener su progreso
      if (req.user.rol === 'estudiante') {
        const progress = await LessonModel.getStudentProgress(req.user.id, courseId);
        res.json(progress);
      } else {
        const lessons = await LessonModel.findByCourse(courseId);
        res.json(lessons);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener lecciones' });
    }
  },

async getLessonById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Obtener la lección
    const lesson = await LessonModel.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    // Si es estudiante obtener su progreso
    let completed = false;
    let completed_at = null;

    if (req.user.rol === 'estudiante') {
      const progress = await LessonModel.getStudentLessonProgress(userId, id);

      if (progress) {
        completed = progress.completed === 1;
        completed_at = progress.completed_at;
      }
    }

    // Añadir campos extra
    lesson.completed = completed;
    lesson.completed_at = completed_at;

    res.json(lesson);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener lección' });
  }
},

  // Crear lección (solo docentes)
  async createLesson(req, res) {
    try {
      const { course_id, title, description, content, order_num, duration, video_url } = req.body;

      // Verificar que sea docente
      if (req.user.rol !== 'docente' && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para crear lecciones' });
      }

      // Verificar que el curso pertenezca al docente
      const course = await CourseModel.findById(course_id);
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No puedes crear lecciones en este curso' });
      }

      const lesson = await LessonModel.create({
        course_id,
        title,
        description,
        content,
        order_num,
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

      // Verificar permisos
      const course = await CourseModel.findById(lesson.course_id);
      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos' });
      }

      await LessonModel.update(id, req.body);

      res.json({ message: 'Lección actualizada exitosamente' });
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
        return res.status(403).json({ message: 'No tienes permisos' });
      }

      await LessonModel.delete(id);

      res.json({ message: 'Lección eliminada exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar lección' });
    }
  },

  // Marcar lección como completada (estudiantes)
  async completeLesson(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      if (req.user.rol !== 'estudiante') {
        return res.status(403).json({ message: 'Solo los estudiantes pueden completar lecciones' });
      }

      await LessonModel.markAsCompleted(studentId, id);

      res.json({ message: 'Lección marcada como completada' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al completar lección' });
    }
  }
};
