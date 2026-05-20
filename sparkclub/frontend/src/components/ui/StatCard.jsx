export default function StatCard({ label, value, sub, icon: Icon, color = 'spark', trend }) {
  const colors = {
    spark:   'bg-spark-500/10 text-spark-400 border-spark-500/20',
    green:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red:     'bg-red-500/10 text-red-400 border-red-500/20',
    yellow:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return (
    <div className="card flex items-start gap-4">
      {Icon && (
        <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold mt-0.5 font-mono">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}