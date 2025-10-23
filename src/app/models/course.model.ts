export interface Course {
  id: string;
  name: string;
  description: string;
  teacher: string;
  teacherId: string;
  students: number;
  duration: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  category: string;
  image?: string;
  startDate: Date;
  endDate: Date;
  schedule: string;
  status: 'active' | 'completed' | 'upcoming';
  completionRate?: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrollmentDate: Date;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  videoUrl?: string;
  materials?: Material[];
}

export interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'document' | 'link';
  url: string;
  size?: string;
}