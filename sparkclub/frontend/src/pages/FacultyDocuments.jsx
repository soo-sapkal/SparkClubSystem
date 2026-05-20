// frontend/src/pages/FacultyDocuments.jsx
import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { formatDate } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FileText, Download, Eye } from 'lucide-react';

export default function FacultyDocuments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyAPI.getDocuments()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const { documents } = data || {};

  const DOC_TYPE_COLORS = {
    bill: 'bg-red-900/60 text-red-300',
    invoice: 'bg-orange-900/60 text-orange-300',
    approval_letter: 'bg-blue-900/60 text-blue-300',
    sponsorship_proposal: 'bg-purple-900/60 text-purple-300',
    event_permission: 'bg-yellow-900/60 text-yellow-300',
    meeting_minutes: 'bg-emerald-900/60 text-emerald-300',
    certificate: 'bg-cyan-900/60 text-cyan-300',
    vendor_quotation: 'bg-indigo-900/60 text-indigo-300',
    other: 'bg-slate-800 text-slate-400'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Review Center</h1>
        <p className="text-slate-400 text-sm">Access and review club documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents?.map(doc => (
          <div key={doc.id} className="card hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-spark-400" />
                <div>
                  <h3 className="font-medium text-slate-200 line-clamp-1">{doc.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${DOC_TYPE_COLORS[doc.doc_type] || DOC_TYPE_COLORS.other}`}>
                    {doc.doc_type?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>Uploaded by: {doc.uploaded_by_name}</p>
              <p>Version: {doc.version}</p>
              <p>{formatDate(doc.created_at)}</p>
              {doc.tags && <p className="text-slate-400">Tags: {doc.tags}</p>}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              {doc.file_url && (
                <>
                  <button className="btn-secondary text-xs py-1 flex items-center gap-1">
                    <Eye size={12} /> View
                  </button>
                  <button className="btn-secondary text-xs py-1 flex items-center gap-1">
                    <Download size={12} /> Download
                  </button>
                </>
              )}
              {!doc.file_url && <span className="text-xs text-slate-500">No file attached</span>}
            </div>
          </div>
        ))}
        {!documents?.length && (
          <div className="col-span-full card text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}