import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.post('/change-password', authMiddleware, UserController.changePassword);
router.post('/avatar', authMiddleware, UserController.updateAvatar);
router.post('/notification-preferences', authMiddleware, UserController.updateNotificationPreferences);

// Rutas solo para admin
router.get('/', authMiddleware, roleMiddleware(['admin']), UserController.getAllUsers);
router.get('/:id', authMiddleware, UserController.getUserById);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), UserController.deleteUser);

export default router;