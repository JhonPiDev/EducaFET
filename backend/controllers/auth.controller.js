import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

const SECRET = process.env.JWT_SECRET || 'educafet_secret_key';

export const AuthController = {
   async register(req, res) {
    console.log("📩 Datos recibidos en el backend:", req.body); // 👈 Muestra los datos enviados

    try {
      const { name, email, password, confirmPassword, rol } = req.body;

      // 🔍 Validaciones básicas
      if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
      }

      // 🧠 Verificar si el usuario ya existe
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'El correo ya está registrado' });
      }

      // 🔒 Encriptar la contraseña
      const hashed = await bcrypt.hash(password, 10);

      // 🧾 Crear nuevo usuario con el rol recibido (sin forzar "estudiante")
      const newUser = await UserModel.create({
        nombre: name,
        email,
        password: hashed,
        rol: rol || 'estudiante' // 👈 Solo usa estudiante si no se envió ningún rol
      });

      // 🪙 Generar token JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.rol },
        SECRET,
        { expiresIn: '1h' }
      );

      // ✅ Respuesta al frontend
      res.json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.nombre,
          role: newUser.rol
        },
        expiresIn: 3600
      });

    } catch (error) {
      console.error('❌ Error al registrar usuario:', error);
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
