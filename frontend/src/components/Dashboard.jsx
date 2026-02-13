import { useEffect, useState, useCallback } from 'react';
import { getShipments } from '../services/api';
import { 
  Package, RefreshCw, Search, ChevronDown, ChevronUp,
  AlertCircle, Filter, List, ChevronLeft, ChevronRight, Box, Clock,
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter & Pagination State
  const [statusFilter, setStatusFilter] = useState(''); 
  const [sortBy, setSortBy] = useState('created_at'); 
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getShipments({ 
        page, 
        pageSize, 
        shipment_status: statusFilter || undefined,
        sortBy: sortBy 
      });
      // Handle response structure { shipments: [], total: X }
      const dataArray = response?.shipments || [];
      setShipments(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to connect to the ShipStation service.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, sortBy]);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side search within the current page results
  const filteredShipments = shipments.filter(s => 
    s.ship_to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.shipment_id?.toString().includes(searchTerm) ||
    s.shipment_number?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shipments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage fulfillment using official API status filters.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter (ShipStation Enums) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 ring-blue-500/10">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="text-sm focus:outline-none bg-transparent font-medium text-slate-700 min-w-[140px] cursor-pointer"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Shipments</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="label_purchased">Label Purchased</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sort By</label>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <Clock size={14} className="text-slate-400" />
              <select 
                className="text-sm focus:outline-none bg-transparent font-medium text-slate-700 cursor-pointer"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              >
                <option value="created_at">Latest Orders</option>
                <option value="ship_date">Ship Date</option>
                <option value="shipment_id">Shipment ID</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Search</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Name or ID..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm shadow-sm w-full sm:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={loadData}
            disabled={loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-95 mt-auto"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Results" 
          value={loading ? "..." : filteredShipments.length} 
          icon={<Package className="text-blue-600" size={20} />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Active Filter" 
          value={statusFilter ? statusFilter.replace('_', ' ') : 'All'} 
          icon={<Filter className="text-emerald-600" size={20} />} 
          color="bg-emerald-50" 
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-800 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Shipment ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Date Created</th>
                <th className="px-6 py-4 text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableSkeleton />
              ) : filteredShipments.length > 0 ? (
                filteredShipments.map((s) => (
                  <ShipmentRow key={s.shipment_id} shipment={s} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium">
                    No shipments found matching these criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <List size={14} className="text-slate-400" />
             <select 
                className="text-xs focus:outline-none bg-transparent font-bold text-slate-500 cursor-pointer"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
          </div>
          <div className="flex items-center gap-4 font-medium text-slate-600">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(prev => prev - 1)}
              className="p-1 hover:bg-white rounded-md border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Page {page}</span>
            <button 
              disabled={shipments.length < pageSize || loading}
              onClick={() => setPage(prev => prev + 1)}
              className="p-1 hover:bg-white rounded-md border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShipmentRow = ({ shipment }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'label_purchased': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <>
      <tr 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}
      >
        <td className="px-6 py-4 text-slate-400">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
        <td className="px-6 py-4 font-mono font-bold text-blue-600">#{shipment.shipment_id}</td>
        <td className="px-6 py-4">
          <div className="font-bold text-slate-900">{shipment.ship_to?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500 uppercase tracking-tight">{shipment.ship_to?.city}, {shipment.ship_to?.state}</div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusStyle(shipment.shipment_status)}`}>
            {shipment.shipment_status?.replace(/_/g, ' ') || 'N/A'}
          </span>
        </td>
        <td className="px-6 py-4 text-slate-500 font-medium">
          {shipment.created_at ? new Date(shipment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 text-slate-400 font-bold">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
               {shipment.items?.length || 0}
            </span>
            <ExternalLink size={14} className="group-hover:text-blue-500" />
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-slate-50/50">
          <td colSpan="6" className="px-12 py-6 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
              <Box size={14} className="text-blue-500" />
              Order Contents
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
              {shipment.items && shipment.items.length > 0 ? (
                shipment.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">SKU: {item.sku || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Qty</p>
                      <p className="text-sm font-black text-blue-600 leading-none">{item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-slate-400 italic text-xs">No items recorded for this shipment.</div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${color} shrink-0`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{title}</p>
      <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
    </div>
  </div>
);

const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td colSpan="6" className="px-6 py-8"><div className="h-5 bg-slate-100 rounded-lg w-full" /></td>
      </tr>
    ))}
  </>
);

export default Dashboard;