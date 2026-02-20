const TableSkeleton = () => [...Array(5)].map((_, i) => (
  <tr key={i} className="animate-pulse">
    <td colSpan="7" className="px-6 py-8"><div className="h-6 bg-slate-100 rounded-lg w-full" /></td>
  </tr>
));
export default TableSkeleton;