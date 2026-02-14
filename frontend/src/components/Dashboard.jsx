import { useEffect, useState, useCallback } from 'react';
import { getShipments, getOrders } from '../services/api'; 
import { 
  Package, RefreshCw, Search, ChevronDown, ChevronUp,
  AlertCircle, Filter, List, ChevronLeft, ChevronRight, Box, Clock,
  ExternalLink
} from 'lucide-react';

/**
 * Helper to convert ISO dates into relative time strings like "1 hour ago"
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString(); // Fallback to date for old items
};

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('pending'); 
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      // We pass sort_by and sort_dir to ensure newest appear at the top
      const commonParams = { 
        page, 
        pageSize, 
        sort_by: statusFilter === 'pending' ? 'order_date' : 'created_at', 
        sort_dir: 'DESC' 
      };

      if (statusFilter === 'pending') {
        // Fetch your 1,023 Awaiting Shipment orders
        response = await getOrders({ ...commonParams, orderStatus: 'awaiting_shipment' });
      } else {
        // Fetch processed items like label_purchased
        response = await getShipments({ ...commonParams, shipment_status: statusFilter });
      }

      const dataArray = response?.orders || response?.shipments || [];
      setItems(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to connect to ShipStation.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredItems = items.filter(item => {
    const name = (item.ship_to?.name || "").toLowerCase();
    const orderNum = (item.order_number || item.shipment_number || "").toString();
    const id = (item.order_id || item.shipment_id || "").toString();
    return name.includes(searchTerm.toLowerCase()) || orderNum.includes(searchTerm) || id.includes(searchTerm);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ShipFlow Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage unfulfilled orders and processed shipments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 ring-blue-500/10 transition-all">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="text-sm focus:outline-none bg-transparent font-medium text-slate-700 min-w-[150px] cursor-pointer"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="pending">Awaiting Shipment</option>
                <option value="processing">Processing</option>
                <option value="label_purchased">Label Purchased</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Search</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Name, Order #..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-sm w-full sm:w-48 focus:outline-none focus:ring-2 ring-blue-500/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={loadData}
            disabled={loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md mt-auto transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Results" 
          value={loading ? "..." : filteredItems.length} 
          icon={<Package className="text-blue-600" size={20} />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Viewing" 
          value={statusFilter === 'pending' ? 'Awaiting Shipment' : 'Fulfilled'} 
          icon={<Clock className="text-emerald-600" size={20} />} 
          color="bg-emerald-50" 
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-800 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Order/Ship ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableSkeleton />
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <ItemRow key={item.order_id || item.shipment_id} item={item} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Page {page}</span>
            <button 
              disabled={items.length < pageSize || loading}
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

const ItemRow = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = item.order_status || item.shipment_status;
  const dateValue = item.order_date || item.created_at;
  
  return (
    <>
      <tr 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`cursor-pointer transition-colors group ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}
      >
        <td className="px-6 py-4 text-slate-400">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
        <td className="px-6 py-4 font-mono font-bold text-blue-600 group-hover:text-blue-700">
          #{item.order_number || item.shipment_number}
        </td>
        <td className="px-6 py-4">
          <div className="font-bold text-slate-900">{item.ship_to?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500 uppercase tracking-tight font-medium">
            {item.ship_to?.city}, {item.ship_to?.state}
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
            status === 'awaiting_shipment' || status === 'pending' 
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {status?.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="text-slate-900 font-bold text-xs">{formatRelativeTime(dateValue)}</div>
          <div className="text-[10px] text-slate-400 font-medium">{new Date(dateValue).toLocaleDateString()}</div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 text-slate-400 font-bold">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
               {item.items?.length || 0}
            </span>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-slate-50/50 border-l-2 border-blue-500 animate-in fade-in duration-200">
          <td colSpan="6" className="px-12 py-6 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
              <Box size={14} className="text-blue-500" />
              Order Contents
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {item.items?.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{prod.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter font-semibold">
                        SKU: {prod.sku || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qty</p>
                    <p className="text-sm font-black text-blue-600">{prod.quantity}</p>
                  </div>
                </div>
              ))}
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
      <p className="text-2xl font-bold text-slate-900 truncate tracking-tight">{value}</p>
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