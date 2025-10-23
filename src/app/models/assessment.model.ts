export interface Assessment {
  id: string;
  course_id: string;
  course_name?: string;
  teacher_name?: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'assignment';
  due_date: Date | null;
  max_score: number;
  time_limit: number | null; // en minutos
  attempts_allowed: number;
  attempts_made?: number;
  status: 'active' | 'draft' | 'deleted';
  created_at: Date;
  questions?: Question[];
  submissions_count?: number;
  average_score?: number;
}

export interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options: string[] | null; // Para preguntas de selección múltiple
  correct_answer?: string; // Solo visible para docentes
  points: number;
}

export interface Submission {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  assessment_id: string;
  assessment_title?: string;
  assessment_type?: string;
  course_name?: string;
  answers: { [questionId: string]: string }; // { question_id: answer }
  score: number | null;
  max_score?: number;
  feedback: string | null;
  status: 'pending' | 'graded';
  submitted_at: Date;
  graded_at: Date | null;
  graded_by: string | null;
}

export interface CreateAssessmentData {
  course_id: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'assignment';
  due_date: Date | null;
  max_score: number;
  time_limit: number | null;
  attempts_allowed: number;
  questions: CreateQuestionData[];
}

export interface CreateQuestionData {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options: string[] | null;
  correct_answer: string;
  points: number;
}

export interface SubmitAssessmentData {
  answers: { [questionId: string]: string };
}

export interface GradeSubmissionData {
  score: number;
  feedback: string;
}