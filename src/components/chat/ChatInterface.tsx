import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Sparkles,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function DashboardOverview() {
  const [moodHistory, setMoodHistory] = useState<any[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('mood_history') || '[]');
    setMoodHistory(history);
  }, []);

  /* --------------------------------------------------
     NORMALIZE MOOD VALUES
     This fixes:
     Happy / happy / happiness / joyful
     Sad / sadness / depressed
     etc.
  -------------------------------------------------- */
  const normalizeMood = (mood: string) => {
    const value = mood?.toLowerCase().trim();

    if (
      ['happy', 'happiness', 'joy', 'joyful', 'good', 'great', 'excited'].includes(
        value
      )
    )
      return 'happy';

    if (['sad', 'sadness', 'down', 'upset', 'crying'].includes(value))
      return 'sad';

    if (['angry', 'anger', 'mad', 'furious'].includes(value)) return 'angry';

    if (
      ['depression', 'depressed', 'hopeless', 'empty'].includes(value)
    )
      return 'depression';

    if (
      ['anxiety', 'anxious', 'panic', 'nervous', 'fear'].includes(value)
    )
      return 'anxiety';

    if (['tired', 'tiredness', 'sleepy', 'fatigue'].includes(value))
      return 'tiredness';

    if (['hungry', 'starving'].includes(value)) return 'hungry';

    if (['stress', 'stressed', 'pressure', 'overwhelmed'].includes(value))
      return 'stressed';

    return 'neutral';
  };

  /* --------------------------------------------------
     COUNT ALL MOODS CORRECTLY
  -------------------------------------------------- */
  const getMoodDistribution = () => {
    const counts: Record<string, number> = {};

    moodHistory.forEach((item) => {
      const mood = normalizeMood(item.emotion);
      counts[mood] = (counts[mood] || 0) + 1;
    });

    return counts;
  };

  const distribution = getMoodDistribution();

  const latestMood =
    moodHistory.length > 0
      ? normalizeMood(moodHistory[moodHistory.length - 1].emotion)
      : 'N/A';

  const emotions = [
    'happy',
    'sad',
    'angry',
    'depression',
    'anxiety',
    'tiredness',
    'hungry',
    'stressed',
    'neutral',
  ];

  const getBarColor = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return 'bg-emerald-500';
      case 'sad':
        return 'bg-blue-500';
      case 'angry':
        return 'bg-red-500';
      case 'depression':
        return 'bg-indigo-500';
      case 'anxiety':
        return 'bg-purple-500';
      case 'tiredness':
        return 'bg-yellow-500';
      case 'hungry':
        return 'bg-orange-500';
      case 'stressed':
        return 'bg-pink-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="px-2">
        <h1 className="text-4xl font-bold text-white">Health Dashboard</h1>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Stats */}
        <div className="col-span-3 bg-brand-card p-6 rounded-2xl">
          <p className="text-xs text-slate-400">Latest Mood</p>
          <p className="text-2xl text-white capitalize">{latestMood}</p>
        </div>

        <div className="col-span-3 bg-brand-card p-6 rounded-2xl">
          <p className="text-xs text-slate-400">Chat Logs</p>
          <p className="text-2xl text-white">{moodHistory.length}</p>
        </div>

        <div className="col-span-6 bg-[#0F1420] border border-slate-800 rounded-2xl p-8">
          <h2 className="text-sm text-slate-400 mb-6 uppercase">
            Emotional Distribution
          </h2>

          {moodHistory.length === 0 ? (
            <p className="text-slate-500">No mood data found</p>
          ) : (
            <div className="space-y-4">
              {emotions.map((emotion) => {
                const count = distribution[emotion] || 0;
                if (count === 0) return null;

                const percentage = Math.round(
                  (count / moodHistory.length) * 100
                );

                return (
                  <div key={emotion}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-slate-300">
                        {emotion}
                      </span>
                      <span className="text-cyan-400">
                        {percentage}% ({count})
                      </span>
                    </div>

                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8 }}
                        className={cn('h-full', getBarColor(emotion))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}