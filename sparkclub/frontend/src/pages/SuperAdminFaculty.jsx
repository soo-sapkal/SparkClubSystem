// frontend/src/pages/SuperAdminFaculty.jsx
import { useEffect, useState } from 'react';
import { superadminAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { GraduationCap, Mail, Building2, Search } from 'lucide-react';

export default function SuperAdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    superadminAPI.getFaculty()
      .then(r => setFaculty(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const filteredFaculty = faculty.filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.club_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Faculty Coordinators</h1>
        <p className="text-slate-400 text-sm">Manage all faculty coordinators across clubs</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, email or club..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map(f => (
          <div key={f.id} className="card hover:border-spark-500/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-spark-600 rounded-full flex items-center justify-center text-sm font-bold">
                {f.avatar_initials || f.name?.[0] || 'F'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{f.name}</h3>
                <p className="text-sm text-slate-500">Faculty Coordinator</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4" />
                <span className="truncate">{f.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-4 h-4" />
                <span>{f.club_name || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!filteredFaculty.length && (
        <div className="text-center py-12 text-slate-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No faculty coordinators found</p>
        </div>
      )}
    </div>
  );
}