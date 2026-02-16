import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PixelCard } from './ui/PixelCard';
import { motion } from 'framer-motion';
import { Pickaxe } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { WeatherEffects } from './ui/WeatherEffects';
import { CustomCursor } from './ui/CustomCursor';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (username.length < 3) {
        setError("Username must be at least 3 characters.");
        return;
    }
    if (username.includes('@')) {
        setError("Please enter a Username, not an email.");
        return;
    }

    setLoading(true);

    try {
        if (isLogin) {
          await signIn(username);
        } else {
          await signUp(username);
          if (isSupabaseConfigured) {
             alert('Profile created! You can now play.');
          }
        }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mc-bg p-4 relative overflow-hidden font-pixel">
      <CustomCursor />
      {/* Moody rain for the login screen */}
      <WeatherEffects effectType="rain" particleCount={120} />

      <PixelCard className="w-full max-w-md relative z-10 !bg-[#2a2a2a] !border-mc-stoneLight">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-16 h-16 bg-mc-grass border-4 border-mc-grassSide mx-auto mb-4 flex items-center justify-center shadow-pixel"
          >
             <Pickaxe className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2 uppercase tracking-wider"
          >
            TasCraft
          </motion.h1>
          <p className="text-gray-400 text-xl">
            {isLogin ? 'Multiplayer Login' : 'Create New Character'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-mc-stoneLight uppercase text-lg">Username</label>
            <div className="relative">
                <input
                type="text"
                placeholder="Steve"
                className="w-full bg-black border-2 border-mc-stoneLight p-3 pl-4 text-white placeholder-gray-600 focus:outline-none focus:border-mc-green focus:bg-[#111] transition-colors font-pixel text-xl"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} // Prevent spaces
                required
                />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-mc-red/20 border-2 border-mc-red p-2 text-mc-red text-lg text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-mc-stoneLight border-t-4 border-l-4 border-[#999] border-b-4 border-r-4 border-[#333] active:border-t-[#333] active:border-l-[#333] active:border-b-[#999] active:border-r-[#999] text-white font-bold text-xl py-3 shadow-pixel hover:bg-[#888] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Connecting to Server...' : (
                <>
                    {isLogin ? 'Join Server' : 'Create Profile'}
                </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setError('');
            }}
            className="text-mc-gold hover:text-yellow-300 hover:underline transition-colors text-lg"
          >
            {isLogin ? "Need a character? Sign Up" : 'Already have a username? Login'}
          </button>
        </div>
        
        {!isSupabaseConfigured && (
             <div className="mt-6 p-3 bg-[#332200] border-2 border-mc-gold">
                <p className="text-mc-gold text-lg text-center">
                    [!] Offline Mode (Demo)
                </p>
             </div>
        )}
      </PixelCard>
    </div>
  );
};
