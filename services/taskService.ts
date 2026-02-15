import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, TaskCategory, Subject, LeaderboardEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock data for demo mode
const STORAGE_KEY_TASKS = 'nebula_tasks_demo';
const STORAGE_KEY_SUBJECTS = 'nebula_subjects_demo';

const getLocalTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY_TASKS);
  return stored ? JSON.parse(stored) : [];
};

const setLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
};

const getLocalSubjects = (): Subject[] => {
  const stored = localStorage.getItem(STORAGE_KEY_SUBJECTS);
  if (stored) return JSON.parse(stored);
  return [];
};

const setLocalSubjects = (subjects: Subject[]) => {
  localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
};

export const taskService = {
  // --- USER ACTIVITY ---
  async updateLastSeen(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId);
    }
  },

  // --- LEADERBOARD ---
  async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*');
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
      return data || [];
    } else {
      // Mock Leaderboard for Demo
      const localTasks = getLocalTasks();
      const xp = localTasks.filter(t => t.is_complete).reduce((acc, t) => acc + (t.priority || 1) * 100, 0);
      const completed = localTasks.filter(t => t.is_complete).length;
      
      const userStr = localStorage.getItem('nebula_user');
      const username = userStr ? JSON.parse(userStr).username : 'Steve';
      const userId = userStr ? JSON.parse(userStr).id : 'demo';

      return [
        { user_id: 'notch', username: 'Notch', total_completed: 999, total_xp: 99900, last_seen: new Date().toISOString() },
        { user_id: 'jeb', username: 'jeb_', total_completed: 50, total_xp: 5000, last_seen: new Date().toISOString() },
        { user_id: userId, username: username, total_completed: completed, total_xp: xp, last_seen: new Date().toISOString() },
        { user_id: 'alex', username: 'Alex', total_completed: 10, total_xp: 1000, last_seen: '2023-01-01T00:00:00Z' },
      ].sort((a, b) => b.total_xp - a.total_xp);
    }
  },

  // --- TASKS ---
  async fetchTasks(userId: string): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getLocalTasks();
    }
  },

  async addTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();
      
      if (error) throw error;
      // Fire and forget last seen update
      if (task.user_id) this.updateLastSeen(task.user_id);
      return data;
    } else {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTask: Task = {
        ...task,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        priority: task.priority || 1, 
      };
      const tasks = getLocalTasks();
      setLocalTasks([...tasks, newTask]);
      return newTask;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data.user_id) this.updateLastSeen(data.user_id);
      return data;
    } else {
      await new Promise(resolve => setTimeout(resolve, 200));
      const tasks = getLocalTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');
      
      const updatedTask = { ...tasks[index], ...updates };
      tasks[index] = updatedTask;
      setLocalTasks(tasks);
      return updatedTask;
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      await new Promise(resolve => setTimeout(resolve, 200));
      const tasks = getLocalTasks();
      setLocalTasks(tasks.filter(t => t.id !== id));
    }
  },

  // --- SUBJECTS ---
  async fetchSubjects(userId: string): Promise<Subject[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } else {
      return getLocalSubjects();
    }
  },

  async addSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
     if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subjects')
        .insert([subject])
        .select()
        .single();
      
      if (error) throw error;
      if (subject.user_id) this.updateLastSeen(subject.user_id);
      return data;
    } else {
      const newSubject = { ...subject, id: uuidv4() };
      const subs = getLocalSubjects();
      setLocalSubjects([...subs, newSubject]);
      return newSubject;
    }
  },

  async deleteSubject(id: string): Promise<void> {
     if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const subs = getLocalSubjects();
      setLocalSubjects(subs.filter(s => s.id !== id));
    }
  }
};