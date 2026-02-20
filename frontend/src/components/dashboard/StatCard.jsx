const StatCard = ({ title, value, icon, color }) => (
  <div className={`p-5 rounded-2xl border border-slate-200 flex items-center gap-4 bg-white shadow-sm`}>
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);
export default StatCard;