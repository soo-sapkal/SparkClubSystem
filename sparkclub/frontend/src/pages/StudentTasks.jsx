// frontend/src/pages/StudentTasks.jsx
import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle, Clock, AlertTriangle, PlayCircle, FileCheck } from 'lucide-react';

const STATUS_COLORS = {
  todo: 'bg-slate-800 text-slate-400 border-slate-700',
  in_progress: 'bg-blue-900/30 text-blue-300 border-blue-800',
  blocked: 'bg-red-900/30 text-red-300 border-red-800',
  review: 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
  completed: 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
};

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  review: 'Review',
  completed: 'Completed'
};

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const status = filter === 'all' ? undefined : filter;
    studentAPI.getTasks(status)
      .then(r => setTasks(r.data))
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateTaskStatus(taskId, newStatus) {
    setUpdating(taskId);
    try {
      await studentAPI.updateTask(taskId, newStatus, '');
      const status = filter === 'all' ? undefined : filter;
      const r = await studentAPI.getTasks(status);
      setTasks(r.data);
    } catch (err) {
      alert('Failed to update task');
    }
    setUpdating(null);
  }

  const columns = ['todo', 'in_progress', 'blocked', 'review', 'completed'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-slate-400 text-sm">Track and manage your assignments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded text-sm ${filter === 'all' ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>All</button>
        {columns.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded text-sm ${filter === s ? 'bg-spark-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map(status => (
            <div key={status} className={`rounded-lg p-3 border ${STATUS_COLORS[status]}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{STATUS_LABELS[status]}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-900/50">{tasks.filter(t => t.status === status).length}</span>
              </div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="font-medium text-slate-200 text-sm line-clamp-2">{task.title}</p>
                    {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">{task.deadline || 'No deadline'}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${task.priority === 'urgent' ? 'bg-red-900 text-red-300' : task.priority === 'high' ? 'bg-orange-900 text-orange-300' : 'bg-slate-700 text-slate-400'}`}>
                        {task.priority}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 mt-2 pt-2 border-t border-slate-800">
                      {status === 'todo' && (
                        <button onClick={() => updateTaskStatus(task.id, 'in_progress')} disabled={updating === task.id}
                          className="text-xs text-blue-400 hover:text-blue-300">Start →</button>
                      )}
                      {status === 'in_progress' && (
                        <button onClick={() => updateTaskStatus(task.id, 'review')} disabled={updating === task.id}
                          className="text-xs text-yellow-400 hover:text-yellow-300">Submit Review</button>
                      )}
                      {status === 'review' && (
                        <button onClick={() => updateTaskStatus(task.id, 'completed')} disabled={updating === task.id}
                          className="text-xs text-emerald-400 hover:text-emerald-300">Complete ✓</button>
                      )}
                      {status === 'in_progress' && (
                        <button onClick={() => updateTaskStatus(task.id, 'blocked')} disabled={updating === task.id}
                          className="text-xs text-red-400 hover:text-red-300">Block</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}