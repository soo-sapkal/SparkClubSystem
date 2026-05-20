// frontend/src/pages/FacultyEvents.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { formatINR, formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, MapPin, DollarSign, AlertTriangle } from 'lucide-react';

export default function FacultyEvents() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyAPI.getEvents()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { events } = data || {};

  const RISK_COLORS = { low: 'bg-emerald-900/60 text-emerald-300', medium: 'bg-yellow-900/60 text-yellow-300', high: 'bg-red-900/60 text-red-300' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Oversight</h1>
        <p className="text-slate-400 text-sm">Review and monitor club events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.map(ev => (
          <div key={ev.id} className="card hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎪</span>
                <div>
                  <h3 className="font-semibold text-slate-200">{ev.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${ev.status === 'active' ? 'bg-emerald-900/60 text-emerald-300' : ev.status === 'completed' ? 'bg-blue-900/60 text-blue-300' : 'bg-yellow-900/60 text-yellow-300'}`}>
                    {ev.status}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${RISK_COLORS[ev.riskLevel]}`}>
                Risk: {ev.riskLevel}
              </span>
            </div>

            <p className="text-sm text-slate-400 line-clamp-2">{ev.description}</p>

            <div className="mt-3 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{ev.start_date ? formatDate(ev.start_date) : 'No date set'}</span>
                {ev.end_date && <span> - {formatDate(ev.end_date)}</span>}
              </div>
              {ev.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{ev.venue}</span>
                </div>
              )}
              {ev.coordinator_name && (
                <div className="text-slate-400">
                  Coordinator: {ev.coordinator_name}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Budget</p>
                <p className="font-semibold text-slate-200">{formatINR(ev.budget_allocated)}</p>
              </div>
              <div>
                <p className="text-slate-500">Spent</p>
                <p className={`font-semibold ${ev.budget_used > ev.budget_allocated ? 'text-red-400' : 'text-slate-200'}`}>
                  {formatINR(ev.budget_used)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Expected Turnout</p>
                <p className="font-semibold text-slate-200">{ev.expected_turnout || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Actual</p>
                <p className="font-semibold text-slate-200">{ev.actual_turnout || 0}</p>
              </div>
            </div>

            {ev.riskFactors?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {ev.riskFactors.map((rf, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-red-950/30 text-red-400 rounded">
                      {rf}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {!events?.length && (
          <div className="col-span-full card text-center py-12 text-slate-500">No events found</div>
        )}
      </div>
    </div>
  );
}