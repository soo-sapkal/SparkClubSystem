// frontend/src/pages/StudentAttendance.jsx
import { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle, Calendar, Clipboard } from 'lucide-react';

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getAttendance()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { summary } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-slate-400 text-sm">Track your participation and attendance record</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Clipboard className="w-6 h-6 mx-auto text-spark-400 mb-2" />
          <p className="text-2xl font-bold">{summary?.tasksCompleted || 0}</p>
          <p className="text-xs text-slate-500">Tasks Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{summary?.totalTasks || 0}</p>
          <p className="text-xs text-slate-500">Total Tasks</p>
        </div>
        <div className="card text-center">
          <Calendar className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-emerald-400">{summary?.eventsAttended || 0}</p>
          <p className="text-xs text-slate-500">Events Attended</p>
        </div>
        <div className="card text-center">
          <CheckCircle className="w-6 h-6 mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-purple-400">{summary?.attendanceRate || 0}%</p>
          <p className="text-xs text-slate-500">Attendance Rate</p>
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Attendance Impact</h2>
        <div className="space-y-3 text-sm text-slate-400">
          <p>Your attendance affects:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Volunteer rankings</li>
            <li>Promotion eligibility</li>
            <li>Funding eligibility for events</li>
            <li>Leadership selection</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Attendance Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="font-medium text-slate-200">QR Check-in</p>
            <p className="text-xs text-slate-500 mt-1">Scan QR code at events</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="font-medium text-slate-200">Event Check-in</p>
            <p className="text-xs text-slate-500 mt-1">Register at venue</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="font-medium text-slate-200">Coordinator Verification</p>
            <p className="text-xs text-slate-500 mt-1">Verified by event lead</p>
          </div>
        </div>
      </div>
    </div>
  );
}