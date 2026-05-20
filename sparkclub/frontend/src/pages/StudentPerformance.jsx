// frontend/src/pages/StudentPerformance.jsx
import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Trophy, Star, Zap, Target } from 'lucide-react';

export default function StudentPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getPerformance()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { metrics, badges } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance & Contributions</h1>
        <p className="text-slate-400 text-sm">Track your achievements and contribution score</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Target className="w-6 h-6 mx-auto text-spark-400 mb-2" />
          <p className="text-2xl font-bold">{metrics?.tasksCompleted || 0}</p>
          <p className="text-xs text-slate-500">Tasks Completed</p>
        </div>
        <div className="card text-center">
          <Zap className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-emerald-400">{metrics?.eventsParticipated || 0}</p>
          <p className="text-xs text-slate-500">Events</p>
        </div>
        <div className="card text-center">
          <Star className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-yellow-400">{metrics?.contributionScore || 0}</p>
          <p className="text-xs text-slate-500">Contribution Score</p>
        </div>
        <div className="card text-center">
          <Trophy className="w-6 h-6 mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-purple-400">#{metrics?.rank || '-'}</p>
          <p className="text-xs text-slate-500">Club Rank</p>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Achievement Badges</h2>
        {badges?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {badges.map((badge, i) => (
              <div key={i} className="p-4 bg-slate-900/50 border border-spark-500/30 rounded-lg text-center">
                <span className="text-4xl">{badge.icon}</span>
                <p className="font-semibold text-slate-200 mt-2">{badge.name}</p>
                <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No badges earned yet. Complete more tasks to earn badges!</p>
        )}
      </div>

      {/* Leaderboard Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Leaderboards</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>You can rank on leaderboards by:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Department-wise contribution</li>
            <li>Monthly activity</li>
            <li>Club-wide participation</li>
            <li>Event contribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}