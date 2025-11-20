import { LessonModel } from "../models/lesson.model.js";
import { AssessmentModel } from "../models/assessment.model.js";

export const StudentTasksController = {
  async getPendingTasks(req, res) {
    try {
      const studentId = req.user.id;

      // 🔹 1. Obtener cursos del estudiante
      const courses = req.user.courses; 
      // Asegúrate que el token incluya los cursos del estudiante
      const courseIds = courses.map(c => c.id);

      let pendingLessons = [];
      let pendingAssessments = [];

      for (const courseId of courseIds) {
        // 🔹 2. Lecciones con su progreso
        const progress = await LessonModel.getStudentProgress(studentId, courseId);

        const incomplete = progress.filter(l => !l.completed);
        pendingLessons.push(...incomplete);

        // 🔹 3. Evaluaciones pendientes
        const courseAssessments = await AssessmentModel.findPendingByStudent(studentId, courseId);
        pendingAssessments.push(...courseAssessments);
      }

      res.json({
        lessons: pendingLessons,
        assessments: pendingAssessments
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error obteniendo tareas pendientes" });
    }
  }
};
