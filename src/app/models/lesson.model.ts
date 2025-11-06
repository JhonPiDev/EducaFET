export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  order_num: number;
  duration: number;
  video_url?: string;
  is_published: boolean;
  completed?: boolean;
  completed_at?: Date;
  created_at: Date;
}
