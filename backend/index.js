import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import userRoutes from './routes/user.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import lessonRoutes from './routes/lesson.routes.js';
import forumRoutes from './routes/forum.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/forums', forumRoutes);

app.get('/', (req, res) => res.send('Servidor EDUCAFET corriendo 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

