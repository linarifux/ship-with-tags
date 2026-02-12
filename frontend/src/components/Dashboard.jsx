import { useEffect, useState, useCallback } from 'react';
import { getShipments } from '../services/api';
import { Package, RefreshCw, Search, ExternalLink, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShipments();
      // Ensure we are setting an array even if the API returns something else
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to connect to the ShipStation service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredShipments = shipments.filter(s => 
    s.shipTo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.shipmentId?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shipments</h1>
          <p className="text-slate-500 text-sm mt-1">Showing the latest fulfillment data from ShipStation.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full sm:w-64 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all disabled:opacity-50 shadow-sm active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-800 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-sm">Connection Error</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Shipments" 
          value={loading ? "..." : shipments.length} 
          icon={<Package className="text-blue-600" size={20} />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Results Found" 
          value={loading ? "..." : filteredShipments.length} 
          icon={<Search className="text-indigo-600" size={20} />} 
          color="bg-indigo-50" 
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Shipment ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableSkeleton />
              ) : filteredShipments.length > 0 ? (
                filteredShipments.map((s) => (
                  <tr key={s.shipmentId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">#{s.shipmentId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{s.shipTo?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">{s.shipTo?.city}, {s.shipTo?.state}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {s.serviceCode?.replace(/_/g, ' ') || 'Standard Shipping'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                        {s.shipmentStatus || 'Shipped'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(s.createDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package size={40} strokeWidth={1} />
                      <p className="text-lg font-medium">No shipments found</p>
                      <p className="text-sm">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper components for a cleaner file
const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-5"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
        <td className="px-6 py-5">
          <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
          <div className="h-3 w-20 bg-slate-50 rounded" />
        </td>
        <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
        <td className="px-6 py-5"><div className="h-6 w-16 bg-slate-100 rounded-full" /></td>
        <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
        <td className="px-6 py-5"><div className="h-8 w-8 bg-slate-50 rounded float-right" /></td>
      </tr>
    ))}
  </>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md hover:shadow-slate-200/50 transition-all cursor-default">
    <div className={`p-3 rounded-xl ${color} shrink-0`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
      <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
    </div>
  </div>
);

export default Dashboard;