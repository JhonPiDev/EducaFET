import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

const SECRET = process.env.JWT_SECRET || 'educafet_secret_key';

export const AuthController = {
  async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword)
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });

      const existing = await UserModel.findByEmail(email);
      if (existing) return res.status(400).json({ message: 'El correo ya está registrado' });

      const hashed = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create({ nombre: name, email, password: hashed });

      const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET, { expiresIn: '1h' });

      res.json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.nombre,
          role: newUser.rol,
        },
        expiresIn: 3600,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar usuario' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol,
        },
        expiresIn: 3600,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  },

  async refreshToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

      const oldToken = authHeader.split(' ')[1];
      const decoded = jwt.verify(oldToken, SECRET);

      const newToken = jwt.sign({ id: decoded.id, email: decoded.email }, SECRET, { expiresIn: '1h' });

      res.json({ token: newToken, expiresIn: 3600 });
    } catch (error) {
      res.status(401).json({ message: 'Token inválido o expirado' });
    }
  },
};
