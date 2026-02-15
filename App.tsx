import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskItem } from './components/TaskItem';
import { TaskSlot } from './components/TaskSlot';
import { EnchantingModal } from './components/EnchantingModal';
import { BookshelfTopbar } from './components/BookshelfTopbar';
import { taskService } from './services/taskService';
import { Task, Subject } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ArrowDownAZ, ArrowUpAZ, CalendarArrowDown, CalendarArrowUp, SlidersHorizontal, Grid3X3, List, Star } from 'lucide-react';
import { Typewriter } from './components/ui/Typewriter';
import { ItemDrop } from './components/ItemDrop';
import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { playSound } from './lib/sounds';
import { LevelUpOverlay } from './components/ui/LevelUpOverlay';
import { MinecraftHeader } from './components/MinecraftHeader'; // Import direct for custom props
import { LeaderboardModal } from './components/LeaderboardModal';
import { ServerShout } from './components/ui/ServerShout';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortOption, setSortOption] = useState<'date-asc' | 'date-desc' | 'title-asc' | 'priority-desc'>('date-asc');
  const [weather, setWeather] = useState<'snow' | 'rain' | 'none'>('snow');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [shoutMessage, setShoutMessage] = useState<string | null>(null);
  
  // Animation state
  const completedRef = useRef<HTMLDivElement>(null);
  const [activeDrops, setActiveDrops] = useState<Array<{ id: string; startX: number; dropY: number }>>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Realtime Broadcast Subscription
  useEffect(() => {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const channel = supabase.channel('global-room');
      
      channel
        .on('broadcast', { event: 'shout' }, (payload) => {
             const msg = payload.payload?.message;
             if (msg) {
                 setShoutMessage(msg);
                 setTimeout(() => setShoutMessage(null), 4000);
             }
        })
        .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [fetchedTasks, fetchedSubjects] = await Promise.all([
          taskService.fetchTasks(user.id),
          taskService.fetchSubjects(user.id)
      ]);
      setTasks(fetchedTasks);
      setSubjects(fetchedSubjects);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  // --- XP & Level Calculations ---
  
  const { totalXP, level, xpProgress } = useMemo(() => {
    const xp = tasks
        .filter(t => t.is_complete)
        .reduce((acc, t) => acc + (t.priority || 1) * 100, 0);
    
    const lvl = Math.floor(xp / 1000) + 1;
    const progress = (xp % 1000) / 1000;
    
    return { totalXP: xp, level: lvl, xpProgress: progress };
  }, [tasks]);

  // --- Boss Bar Logic (Weekly Tasks) ---
  
  const { bossCurrent, bossMax } = useMemo(() => {
     const now = new Date();
     const start = startOfWeek(now);
     const end = endOfWeek(now);
     
     const weeklyTasks = tasks.filter(t => {
         try {
             return isWithinInterval(parseISO(t.due_date), { start, end });
         } catch { return false; }
     });

     const max = weeklyTasks.length;
     // Boss Health is UNCOMPLETED tasks
     const current = weeklyTasks.filter(t => !t.is_complete).length;
     
     return { bossCurrent: current, bossMax: max };
  }, [tasks]);

  // Track boss health changes to play dragon sound
  const prevBossHealth = useRef(bossCurrent);
  useEffect(() => {
      if (bossMax > 0 && prevBossHealth.current > 0 && bossCurrent === 0) {
          // Boss Defeated!
          playSound('dragonDeath');
      }
      prevBossHealth.current = bossCurrent;
  }, [bossCurrent, bossMax]);

  // --- Task Handlers ---

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id' | 'is_complete'>) => {
    if (!user) return;
    try {
      const finalSubjectId = taskData.subject_id || selectedSubjectId;
      const newTask = await taskService.addTask({
        ...taskData,
        subject_id: finalSubjectId,
        user_id: user.id,
        is_complete: false,
      });
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id' | 'is_complete'>) => {
    if (!editingTask) return;
    try {
      const updated = await taskService.updateTask(editingTask.id, taskData);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (error) {
        console.error('Failed to update task', error);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: boolean, rect?: DOMRect) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Calculate XP BEFORE update to see if we cross a threshold
    const xpBefore = tasks.filter(t => t.is_complete).reduce((acc, t) => acc + (t.priority || 1) * 100, 0);
    const lvlBefore = Math.floor(xpBefore / 1000) + 1;

    // Optimistic Update
    const nextStatus = !currentStatus;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_complete: nextStatus } : t));

    if (nextStatus) {
        // Just Completed
        playSound('orb');
        if (rect) {
            const dropId = uuidv4();
            setActiveDrops(prev => [...prev, { 
                id: dropId, 
                startX: rect.left + rect.width / 2,
                dropY: rect.top + rect.height / 2
            }]);
        }
        
        // Broadcast Event
        if (isSupabaseConfigured && supabase && user) {
            const channel = supabase.channel('global-room');
            channel.send({
                type: 'broadcast',
                event: 'shout',
                payload: { message: `${user.username} just gained XP!` }
            });
        }
        
        // Check Level Up
        const gainedXP = (task.priority || 1) * 100;
        const xpAfter = xpBefore + gainedXP;
        const lvlAfter = Math.floor(xpAfter / 1000) + 1;
        
        if (lvlAfter > lvlBefore) {
            setTimeout(() => {
                playSound('levelup');
                setShowLevelUp(true);
                setTimeout(() => setShowLevelUp(false), 4000);
            }, 500); // Slight delay for dramatic effect
        }
    }

    try {
      await taskService.updateTask(id, { is_complete: nextStatus });
    } catch (error) {
      console.error('Failed to toggle task', error);
      loadData(); // Revert
    }
  };

  const removeDrop = (id: string) => {
      setActiveDrops(prev => prev.filter(d => d.id !== id));
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Destroy this block?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await taskService.deleteTask(id);
    } catch (error) {
      console.error('Failed to delete task', error);
      loadData();
    }
  };

  // --- Subject Handlers ---
  
  const handleAddSubject = async (name: string, icon: Subject['icon'], color: string) => {
      if(!user) return;
      try {
          const newSub = await taskService.addSubject({ name, icon, color, user_id: user.id });
          setSubjects(prev => [...prev, newSub]);
      } catch(e) {
          console.error(e);
      }
  };

  const handleDeleteSubject = async (id: string) => {
      if(!window.confirm("Burn this book? All associated tasks will lose their subject.")) return;
      try {
          await taskService.deleteSubject(id);
          setSubjects(prev => prev.filter(s => s.id !== id));
          if(selectedSubjectId === id) setSelectedSubjectId(null);
          setTasks(prev => prev.map(t => t.subject_id === id ? { ...t, subject_id: null } : t));
      } catch(e) {
          console.error(e);
      }
  };

  // --- Modal Logic ---

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data: any) => {
      if (editingTask) {
          handleUpdateTask(data);
      } else {
          handleAddTask(data);
      }
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingTask(undefined);
  };

  // --- Filtering & Sorting ---

  const displayedTasks = tasks.filter(t => {
      if (selectedSubjectId && t.subject_id !== selectedSubjectId) return false;
      if (filter === 'pending') return !t.is_complete;
      if (filter === 'completed') return t.is_complete;
      return true;
  });

  const sortedTasks = [...displayedTasks].sort((a, b) => {
    switch (sortOption) {
      case 'date-asc': return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case 'date-desc': return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      case 'title-asc': return a.title.localeCompare(b.title);
      case 'priority-desc': return (b.priority || 1) - (a.priority || 1);
      default: return 0;
    }
  });

  const currentSubjectName = selectedSubjectId 
    ? subjects.find(s => s.id === selectedSubjectId)?.name || 'Unknown Quest' 
    : 'All Quests';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 bg-mc-stone border-4 border-mc-stoneLight animate-spin"></div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Auth />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="min-h-screen bg-mc-bg text-gray-200 font-pixel selection:bg-mc-green selection:text-white relative overflow-hidden flex flex-col">
              
              {/* Level Up Overlay */}
              <LevelUpOverlay show={showLevelUp} level={level} />

              {/* Server Shout Notification */}
              <ServerShout message={shoutMessage} />
              
              {/* Custom Layout Structure reusing components manually for prop passing */}
              <MinecraftHeader 
                level={level} 
                progress={xpProgress} 
                bossBarConfig={{
                    label: "Weekly Objectives",
                    current: bossCurrent,
                    max: bossMax
                }}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              />
              
              <Layout 
                weather={weather} 
                level={level} 
                progress={xpProgress}
                topbar={
                    <BookshelfTopbar 
                        subjects={subjects}
                        selectedSubjectId={selectedSubjectId}
                        onSelectSubject={setSelectedSubjectId}
                        onAddSubject={handleAddSubject}
                        onDeleteSubject={handleDeleteSubject}
                    />
                }
              >
                {/* Render Active Drops */}
                {activeDrops.map(drop => (
                    <ItemDrop 
                        key={drop.id}
                        startX={drop.startX}
                        dropY={drop.dropY}
                        targetRef={completedRef}
                        onComplete={() => removeDrop(drop.id)}
                    />
                ))}

                <div className="space-y-6 font-pixel">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Typewriter text="Dashboard" className="text-4xl text-white uppercase tracking-wider text-shadow" />
                        {selectedSubjectId && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl text-mc-gold uppercase"
                            >
                                // {currentSubjectName}
                            </motion.span>
                        )}
                      </div>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-mc-stoneLight text-xl"
                      >
                        XP: {totalXP} / {(level * 1000)}
                      </motion.p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95, y: 0 }}
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 bg-mc-grass border-t-4 border-l-4 border-[#83d656] border-b-4 border-r-4 border-[#2d4415] text-white px-6 py-3 text-xl shadow-pixel active:shadow-none active:translate-y-1 transition-none"
                    >
                      <Plus className="w-6 h-6" />
                      New Quest
                    </motion.button>
                  </div>

                  {/* Show Stats for filtered tasks */}
                  <Dashboard 
                    tasks={displayedTasks} 
                    onWeatherChange={setWeather}
                    currentWeather={weather}
                    completedRef={completedRef}
                  />

                  <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-mc-stoneDark pb-4 gap-4">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl text-white uppercase">Quest Log</h2>
                            <span className="text-mc-stoneLight text-lg">({sortedTasks.length})</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                            {/* View Mode Toggle */}
                            <div className="flex bg-[#111] p-1 border-2 border-white/20 items-center mr-2">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-mc-stoneLight text-white' : 'text-gray-400 hover:text-white'}`}
                                    title="List View"
                                >
                                    <List className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-mc-stoneLight text-white' : 'text-gray-400 hover:text-white'}`}
                                    title="Inventory View"
                                >
                                    <Grid3X3 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Sort Controls */}
                            <div className="flex bg-[#111] p-1 border-2 border-white/20 items-center">
                                <span className="text-mc-stoneLight px-2 hidden sm:block"><SlidersHorizontal className="w-4 h-4"/></span>
                                <button 
                                    onClick={() => setSortOption('date-asc')}
                                    title="Sort by Date (Earliest)"
                                    className={`p-2 transition-colors ${sortOption === 'date-asc' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <CalendarArrowDown className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setSortOption('date-desc')}
                                    title="Sort by Date (Latest)"
                                    className={`p-2 transition-colors ${sortOption === 'date-desc' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <CalendarArrowUp className="w-5 h-5" />
                                </button>
                                <div className="w-px h-5 bg-white/20 mx-1"></div>
                                <button 
                                    onClick={() => setSortOption('title-asc')}
                                    title="Sort Alphabetically"
                                    className={`p-2 transition-colors ${sortOption === 'title-asc' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <ArrowDownAZ className="w-5 h-5" />
                                </button>
                                <div className="w-px h-5 bg-white/20 mx-1"></div>
                                <button 
                                    onClick={() => setSortOption('priority-desc')}
                                    title="Sort by Priority (High to Low)"
                                    className={`p-2 transition-colors ${sortOption === 'priority-desc' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Star className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Filter Controls */}
                            <div className="flex bg-[#111] p-1 border-2 border-white/20">
                                {(['all', 'pending', 'completed'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 text-lg uppercase transition-all duration-200 ${
                                            filter === f 
                                            ? 'bg-mc-stoneLight text-white border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                                            : 'text-gray-500 hover:text-white'
                                        }`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                          </div>
                      </div>

                      {loading ? (
                          <div className="flex justify-center py-12">
                              <div className="w-16 h-16 border-8 border-mc-stoneLight border-t-mc-green border-r-mc-green animate-spin"></div>
                          </div>
                      ) : sortedTasks.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 bg-[#222] border-4 border-dashed border-[#444]"
                          >
                              <p className="text-gray-500 text-2xl">
                                  {selectedSubjectId ? "This book is empty." : "Inventory Empty"}
                              </p>
                          </motion.div>
                      ) : (
                          <>
                            {viewMode === 'list' ? (
                                <motion.ul layout className="grid grid-cols-1 gap-4">
                                    <AnimatePresence mode='popLayout'>
                                        {sortedTasks.map(task => (
                                            <TaskItem 
                                                key={task.id} 
                                                task={task} 
                                                onToggle={handleToggleTask}
                                                onDelete={handleDeleteTask}
                                                onEdit={openEditModal}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.ul>
                            ) : (
                                <motion.div layout className="bg-[#c6c6c6] p-4 border-4 border-[#373737] rounded-sm shadow-2xl max-w-4xl mx-auto">
                                    <h3 className="text-[#3f3f3f] mb-2 text-xl ml-1">Inventory</h3>
                                    <div className="flex flex-wrap gap-1 content-start min-h-[300px]">
                                        <AnimatePresence mode="popLayout">
                                            {sortedTasks.map(task => (
                                                <TaskSlot 
                                                    key={task.id} 
                                                    task={task} 
                                                    onToggle={handleToggleTask} 
                                                    onClick={openEditModal} 
                                                />
                                            ))}
                                            {/* Fill empty slots to look like inventory */}
                                            {Array.from({ length: Math.max(0, 27 - sortedTasks.length) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="w-20 h-20 bg-[#8b8b8b] border-t-4 border-l-4 border-[#373737] border-b-4 border-r-4 border-[#ffffff] m-1 opacity-50"></div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                          </>
                      )}
                  </div>
                </div>

                <EnchantingModal 
                  isOpen={isModalOpen} 
                  onClose={handleCloseModal} 
                  onSubmit={handleModalSubmit}
                  initialData={editingTask}
                  subjects={subjects}
                  defaultSubjectId={selectedSubjectId}
                />

                <LeaderboardModal 
                  isOpen={isLeaderboardOpen} 
                  onClose={() => setIsLeaderboardOpen(false)} 
                />
              </Layout>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;