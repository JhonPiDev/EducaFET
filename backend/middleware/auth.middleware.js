import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

const SECRET = process.env.JWT_SECRET || 'educafet_secret_key';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, SECRET);

    // Obtener usuario
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Agregar usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    };

    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }

    res.status(500).json({ message: 'Error en la autenticación' });
  }
};

// Middleware para verificar roles específicos
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    next();
  };
};