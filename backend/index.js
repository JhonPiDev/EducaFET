import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Servidor EDUCAFET corriendo 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
