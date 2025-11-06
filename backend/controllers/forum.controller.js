import { ForumModel } from '../models/forum.model.js';
import { CourseModel } from '../models/course.model.js';

export const ForumController = {
  // Obtener temas de un curso
  async getTopicsByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const topics = await ForumModel.getTopicsByCourse(courseId);
      res.json(topics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener temas' });
    }
  },

  // Obtener tema por ID con respuestas
  async getTopicById(req, res) {
    try {
      const { id } = req.params;
      const topic = await ForumModel.getTopicById(id);

      if (!topic) {
        return res.status(404).json({ message: 'Tema no encontrado' });
      }

      const replies = await ForumModel.getRepliesByTopic(id);

      res.json({ ...topic, replies });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener tema' });
    }
  },

  // Crear tema
  async createTopic(req, res) {
    try {
      const { course_id, title, content } = req.body;
      const user_id = req.user.id;

      // Verificar que tenga acceso al curso
      const course = await CourseModel.findById(course_id);
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado' });
      }

      const topic = await ForumModel.createTopic({
        course_id,
        user_id,
        title,
        content
      });

      res.status(201).json({
        message: 'Tema creado exitosamente',
        topic
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear tema' });
    }
  },

  // Crear respuesta
  async createReply(req, res) {
    try {
      const { topic_id, content } = req.body;
      const user_id = req.user.id;

      const reply = await ForumModel.createReply({
        topic_id,
        user_id,
        content
      });

      res.status(201).json({
        message: 'Respuesta agregada',
        reply
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear respuesta' });
    }
  },

  // Marcar respuesta como solución (autor del tema o docente)
  async markAsSolution(req, res) {
    try {
      const { replyId } = req.params;

      // TODO: Verificar permisos (que sea autor del tema o docente)

      await ForumModel.markAsSolution(replyId);

      res.json({ message: 'Respuesta marcada como solución' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al marcar solución' });
    }
  },

  // Eliminar tema
  async deleteTopic(req, res) {
    try {
      const { id } = req.params;

      // TODO: Verificar permisos (autor o docente/admin)

      await ForumModel.deleteTopic(id);

      res.json({ message: 'Tema eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar tema' });
    }
  },

  // Eliminar respuesta
  async deleteReply(req, res) {
    try {
      const { id } = req.params;

      // TODO: Verificar permisos (autor o docente/admin)

      await ForumModel.deleteReply(id);

      res.json({ message: 'Respuesta eliminada' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar respuesta' });
    }
  }
};