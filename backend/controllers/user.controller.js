import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';

export const UserController = {
  // Obtener perfil del usuario actual
  async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // No enviar la contraseña
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener perfil' });
    }
  },

  // Actualizar perfil
  async updateProfile(req, res) {
    try {
      const { name, email, phone, bio } = req.body;
      const userId = req.user.id;

      // Validar que el email no esté en uso por otro usuario
      if (email && email !== req.user.email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'El email ya está en uso' });
        }
      }

      // Actualizar usuario
      const updated = await UserModel.update(userId, {
        nombre: name,
        email,
        telefono: phone,
        bio
      });

      if (!updated) {
        return res.status(400).json({ message: 'No se pudo actualizar el perfil' });
      }

      const updatedUser = await UserModel.findById(userId);
      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        message: 'Perfil actualizado correctamente',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar perfil' });
    }
  },

  // Cambiar contraseña
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Validar campos requeridos
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      // Obtener usuario
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await UserModel.update(userId, { password: hashedPassword });

      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al cambiar contraseña' });
    }
  },

  // Actualizar avatar
  async updateAvatar(req, res) {
    try {
      // En producción, aquí procesarías el archivo subido
      // Por ejemplo con multer o similar
      const avatarUrl = req.body.avatar || 'https://via.placeholder.com/150';
      const userId = req.user.id;

      await UserModel.update(userId, { avatar: avatarUrl });

      res.json({
        message: 'Avatar actualizado correctamente',
        avatar: avatarUrl
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar avatar' });
    }
  },

  // Obtener todos los usuarios (solo admin)
  async getAllUsers(req, res) {
    try {
      // Verificar que sea admin
      if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para esta acción' });
      }

      const users = await UserModel.findAll();
      
      // Remover contraseñas
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  },

  // Obtener usuario por ID (admin o el mismo usuario)
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      // Verificar permisos
      if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'No tienes permisos para ver este perfil' });
      }

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener usuario' });
    }
  },

  // Eliminar usuario (solo admin)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar que sea admin
      if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para esta acción' });
      }

      // No permitir eliminar al mismo admin
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
      }

      const deleted = await UserModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar usuario' });
    }
  },

  // Actualizar preferencias de notificaciones
  async updateNotificationPreferences(req, res) {
    try {
      const { email, push, course } = req.body;
      const userId = req.user.id;

      // En producción, guardarías esto en una tabla de preferencias
      // Por ahora solo simularemos la respuesta
      
      res.json({
        message: 'Preferencias de notificaciones actualizadas',
        preferences: { email, push, course }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar preferencias' });
    }
  }
};