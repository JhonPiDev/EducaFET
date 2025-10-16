// ============================================
// 📁 backend/controllers/course.controller.js
// ============================================

import { CourseModel } from '../models/course.model.js';
import { EnrollmentModel } from '../models/enrollment.model.js';

export const CourseController = {
  // ✅ Obtener todos los cursos
  async getAllCourses(req, res) {
    try {
      const courses = await CourseModel.findAll();
      res.json(courses);
    } catch (error) {
      console.error('❌ Error al obtener cursos:', error);
      res.status(500).json({ message: 'Error al obtener cursos' });
    }
  },

  // ✅ Obtener curso por ID
  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
      res.json(course);
    } catch (error) {
      console.error('❌ Error al obtener curso:', error);
      res.status(500).json({ message: 'Error al obtener curso' });
    }
  },

  // ✅ Crear curso
  async createCourse(req, res) {
    try {
      const newCourse = await CourseModel.create(req.body);
      res.status(201).json(newCourse);
    } catch (error) {
      console.error('❌ Error al crear curso:', error);
      res.status(500).json({ message: 'Error al crear curso' });
    }
  },

  // ✅ Actualizar curso
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const updated = await CourseModel.update(id, req.body);
      if (!updated) return res.status(404).json({ message: 'Curso no encontrado' });
      res.json({ message: 'Curso actualizado correctamente' });
    } catch (error) {
      console.error('❌ Error al actualizar curso:', error);
      res.status(500).json({ message: 'Error al actualizar curso' });
    }
  },

  // ✅ Inscribirse a curso
  async enrollCourse(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user?.id || 1; // fallback para pruebas
      const enrollment = await EnrollmentModel.create(studentId, id);
      res.status(201).json({ message: 'Inscripción exitosa', enrollment });
    } catch (error) {
      console.error('❌ Error al inscribirse:', error);
      res.status(500).json({ message: 'Error al inscribirse' });
    }
  },

  // ✅ Obtener mis cursos
  async getMyCourses(req, res) {
    try {
      const userId = req.user?.id || 1;
      const role = req.user?.rol || 'estudiante';
      let courses = [];

      if (role === 'docente') {
        courses = await CourseModel.findByTeacher(userId);
      } else {
        courses = await CourseModel.findByStudent(userId);
      }

      res.json(courses);
    } catch (error) {
      console.error('❌ Error al obtener mis cursos:', error);
      res.status(500).json({ message: 'Error al obtener mis cursos' });
    }
  }
};
