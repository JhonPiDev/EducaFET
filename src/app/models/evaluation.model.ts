export interface Evaluation {
  id: string;
  courseId: string;
  title: string;
  description: string;
  totalQuestions: number;
  createdAt: string;
  updatedAt?: string;
  duration: number; // duración en minutos
  course_id: string;
}
