import React, { useEffect, useState, useCallback, useMemo } from 'react';
import * as apiService from '../services/api';
import { discoverProductsFromItems, formatRelativeTime } from '../utils/helpers';
import { 
  Package, RefreshCw, Check, Filter, Tag,
  Search, List, ChevronLeft, ChevronRight, AlertCircle, Inbox
} from 'lucide-react';

import StatCard from '../components/dashboard/StatCard';
import ProductFilter from '../components/dashboard/ProductFilter';
import TagFilter from '../components/dashboard/TagFilter';
import ItemRow from '../components/dashboard/ItemRow';
import TableSkeleton from '../components/dashboard/TableSkeleton';
import TagAssignmentModal from '../components/dashboard/TagAssignmentModal';

const Dashboard = () => {
  // --- State Management ---
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]); 
  const [selectedIds, setSelectedIds] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [productFilter, setProductFilter] = useState('');
  const [tagFilter, setTagFilter] = useState(''); 
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // --- API Calls ---
  const fetchTags = useCallback(async () => {
    try {
      const data = await apiService.getTags();
      setTags(Array.isArray(data?.tags) ? data?.tags : []);
    } catch (err) {
      console.error("Tags Fetch Error:", err);
    }
  }, []);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = { 
        page, 
        page_size: pageSize,
        shipment_status: statusFilter, 
        sort_dir: 'DESC',
        tag: tagFilter || undefined 
      };

      const data = await apiService.getShipments(params);
      const records = data.shipments || data.orders || []; 
      setItems(records);
      setProducts(discoverProductsFromItems(records));
      // Keep selection if refreshing, clear if changing pages/filters
      if (!isRefresh) setSelectedIds([]); 
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load shipment data. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, pageSize, statusFilter, tagFilter]); 

  // --- Effects ---
  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // --- Derived State ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.ship_to?.name || "").toLowerCase().includes(searchLower) || 
        (item.order_number || item.shipment_number || "").toString().includes(searchLower);
      const matchesProduct = !productFilter || item.items?.some(p => 
        p.sku === productFilter || p.name === productFilter
      );
      return matchesSearch && matchesProduct;
    });
  }, [items, searchTerm, productFilter]);

  // Derive the full order objects for the selected IDs to pass to the Modal
  // Safely handles both camelCase and snake_case IDs from ShipStation
  const selectedOrders = useMemo(() => {
    return items.filter(item => {
      const itemId = item.orderId || item.order_id || item.shipmentId || item.shipment_id;
      return selectedIds.includes(itemId);
    });
  }, [items, selectedIds]);

  // --- Handlers ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map(i => i.orderId || i.order_id || i.shipmentId || i.shipment_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleManualRefresh = () => {
    loadData(true);
  };

  const handleTagsUpdated = async () => {
    // When tags are updated via modal, refresh the dashboard silently in the background
    await fetchTags();
    await loadData(true); 
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 font-sans text-slate-800 bg-slate-50/50 min-h-screen">
      
      {/* --- Header Section --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            Managing <span className="text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded-md">{statusFilter.replace('_', ' ')}</span> orders.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setIsTagModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-purple-700 transition-all animate-in zoom-in-95"
            >
              <Tag size={16} /> Manage Tags ({selectedIds.length})
            </button>
          )}

          <TagFilter 
            tags={tags} 
            tagFilter={tagFilter} 
            setTagFilter={(val) => {
              setTagFilter(val);
              setPage(1); 
            }} 
          />
          
          <ProductFilter 
            products={products} 
            productFilter={productFilter} 
            setProductFilter={setProductFilter} 
          />
          
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 hidden sm:block">Status</label>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm hover:border-slate-300 transition-colors focus-within:ring-2 ring-blue-500/20">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="text-sm font-semibold outline-none bg-transparent cursor-pointer text-slate-700 w-full sm:w-auto" 
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
          
          <button 
            onClick={handleManualRefresh} 
            disabled={loading || isRefreshing} 
            className="p-2.5 sm:mt-auto bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all focus:ring-2 ring-blue-500/20 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </header>

      {/* --- Error Banner --- */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
          <div>
            <h3 className="text-sm font-bold">Data Fetch Error</h3>
            <p className="text-xs font-medium opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* --- Sub-Controls & Stats --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search Order # or Recipient..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-400 transition-all placeholder:font-normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded">ESC</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <StatCard title="Visible Orders" value={loading ? "..." : filteredItems.length} icon={<Package className="text-blue-600" />} color="bg-blue-50" />
          <StatCard title="Selected" value={selectedIds.length} icon={<Check className={selectedIds.length > 0 ? "text-emerald-600" : "text-slate-400"} />} color={selectedIds.length > 0 ? "bg-emerald-50" : "bg-slate-100"} />
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} 
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-2 py-4 w-10"></th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Tags</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableSkeleton />
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const id = item.orderId || item.order_id || item.shipmentId || item.shipment_id;
                  return (
                    <ItemRow 
                      key={id} 
                      item={item} 
                      isSelected={selectedIds.includes(id)}
                      onSelect={() => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                      timeFormatter={formatRelativeTime} 
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-4 bg-slate-50 rounded-full mb-3">
                        <Inbox size={32} className="text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-600">No orders found</p>
                      <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                      {(searchTerm || productFilter || tagFilter) && (
                        <button 
                          onClick={() => { setSearchTerm(''); setProductFilter(''); setTagFilter(''); }}
                          className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        {!loading && items.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white border border-slate-200 rounded shadow-sm">
                <List size={14} className="text-slate-400" />
              </div>
              <span className="text-xs font-bold text-slate-500">Show</span>
              <select 
                className="text-xs font-bold outline-none bg-transparent cursor-pointer text-slate-900 focus:ring-2 ring-blue-500/20 rounded px-1" 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs font-bold text-slate-500">rows</span>
            </div>
            
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="p-1.5 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 text-xs font-bold text-slate-700 bg-slate-50 py-1.5 rounded-md border border-slate-100">
                Page {page}
              </div>
              <button 
                disabled={items.length < pageSize} 
                onClick={() => setPage(p => p + 1)} 
                className="p-1.5 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      <TagAssignmentModal 
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        selectedIds={selectedIds}
        selectedOrders={selectedOrders}
        tags={tags}
        onTagsUpdated={handleTagsUpdated}
      />
    </div>
  );
};

export default Dashboard;