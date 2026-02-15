export enum TaskCategory {
  HOMEWORK = 'Homework',
  EXAM = 'Exam',
  PROJECT = 'Project',
  PERSONAL = 'Personal'
}

export interface Subject {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  icon: 'book' | 'sword' | 'pickaxe' | 'potion' | 'redstone';
}

export interface Task {
  id: string;
  user_id?: string;
  subject_id?: string | null; // Link to Subject
  title: string;
  description: string;
  due_date: string; // ISO date string
  category: TaskCategory;
  priority: number; // 1 to 5 (Nether Stars)
  is_complete: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  email?: string; // Made optional as we prioritize username
  username: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  dueToday: number;
  pending: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_completed: number;
  total_xp: number;
  last_seen?: string;
  rank?: number;
}