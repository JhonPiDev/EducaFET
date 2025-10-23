import { CourseModel } from '../models/course.model.js';
import { EnrollmentModel } from '../models/enrollment.model.js';
import { LessonModel } from '../models/lesson.model.js';

export const CourseController = {
  // Obtener todos los cursos con información adicional
  async getAllCourses(req, res) {
    try {
      const courses = await CourseModel.findAll();
      
      // Agregar número de lecciones a cada curso
      const coursesWithDetails = await Promise.all(
        courses.map(async (course) => {
          const lessonCount = await LessonModel.countByCourse(course.id);
          return {
            ...course,
            total_lessons: lessonCount
          };
        })
      );

      res.json(coursesWithDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener cursos' });
    }
  },

  // Obtener curso por ID con lecciones
  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);

      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      // Obtener lecciones del curso
      const lessons = await LessonModel.findByCourse(id);
      
      res.json({
        ...course,
        lessons,
        total_lessons: lessons.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener curso' });
    }
  },

  // Crear curso
  async createCourse(req, res) {
    try {
      const { name, description, duration, level, category, schedule, start_date, end_date } = req.body;
      const teacher_id = req.user.id;

      if (req.user.rol !== 'docente' && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para crear cursos' });
      }

      const newCourse = await CourseModel.create({
        name,
        description,
        teacher_id,
        duration,
        level,
        category,
        schedule,
        start_date,
        end_date
      });

      res.status(201).json({
        message: 'Curso creado exitosamente',
        course: newCourse
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear curso' });
    }
  },

  // Actualizar curso
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);

      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para actualizar este curso' });
      }

      const updated = await CourseModel.update(id, req.body);

      if (!updated) {
        return res.status(400).json({ message: 'No se pudo actualizar el curso' });
      }

      const updatedCourse = await CourseModel.findById(id);
      res.json({
        message: 'Curso actualizado exitosamente',
        course: updatedCourse
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar curso' });
    }
  },

  // Eliminar curso
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);

      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para eliminar este curso' });
      }

      await CourseModel.delete(id);
      res.json({ message: 'Curso eliminado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar curso' });
    }
  },

  // Inscribirse a un curso
  async enrollCourse(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      if (req.user.rol !== 'estudiante') {
        return res.status(403).json({ message: 'Solo los estudiantes pueden inscribirse' });
      }

      const course = await CourseModel.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      const enrollment = await EnrollmentModel.create(studentId, id);
      res.status(201).json({ 
        message: 'Inscripción exitosa', 
        enrollment 
      });
    } catch (error) {
      console.error(error);
      if (error.message === 'Ya estás inscrito en este curso') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error al inscribirse al curso' });
    }
  },

  // Obtener mis cursos
  async getMyCourses(req, res) {
    try {
      let courses;

      if (req.user.rol === 'estudiante') {
        courses = await CourseModel.findByStudent(req.user.id);
      } else if (req.user.rol === 'docente') {
        courses = await CourseModel.findByTeacher(req.user.id);
      } else {
        courses = await CourseModel.findAll();
      }

      // Agregar detalles adicionales
      const coursesWithDetails = await Promise.all(
        courses.map(async (course) => {
          const lessonCount = await LessonModel.countByCourse(course.id);
          return {
            ...course,
            total_lessons: lessonCount
          };
        })
      );

      res.json(coursesWithDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener cursos' });
    }
  },

  // Obtener estadísticas del curso
  async getCourseStatistics(req, res) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);

      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      // Verificar permisos
      if (course.teacher_id !== req.user.id && req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos' });
      }

      // Obtener estadísticas
      const [stats] = await db.query(`
        SELECT 
          COUNT(DISTINCT e.student_id) as total_students,
          AVG(e.progress) as average_progress,
          COUNT(DISTINCT l.id) as total_lessons,
          COUNT(DISTINCT a.id) as total_assessments
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
        LEFT JOIN lessons l ON c.id = l.course_id
        LEFT JOIN assessments a ON c.id = a.course_id AND a.status = 'active'
        WHERE c.id = ?
        GROUP BY c.id
      `, [id]);

      res.json(stats[0] || {
        total_students: 0,
        average_progress: 0,
        total_lessons: 0,
        total_assessments: 0
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }
};