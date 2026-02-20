import React, { useEffect, useState, useCallback } from 'react';
import * as apiService from '../services/api';
import { discoverProductsFromItems, formatRelativeTime } from '../utils/helpers';
import { Package, RefreshCw, Check, CreditCard, Filter, Tag, Search, List, ChevronLeft, ChevronRight } from 'lucide-react';

import StatCard from '../components/dashboard/StatCard';
import ProductFilter from '../components/dashboard/ProductFilter';
import TagFilter from '../components/dashboard/TagFilter';
import ItemRow from '../components/dashboard/ItemRow';
import TableSkeleton from '../components/dashboard/TableSkeleton';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [productFilter, setProductFilter] = useState('');
  const [tagFilter, setTagFilter] = useState(''); 
  const [page, setPage] = useState(1);

  const fetchTags = useCallback(async () => {
    try {
      const data = await apiService.getTags();
      setTags(Array.isArray(data?.tags) ? data?.tags : []);
    } catch (err) {
      console.error("Tags Fetch Error:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getShipments({ page, shipment_status: statusFilter, sort_dir: 'DESC' });
      const records = data.orders || data.shipments || [];
      setItems(records);
      setProducts(discoverProductsFromItems(records));
      setSelectedIds([]); 
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { 
    loadData(); 
    fetchTags(); 
  }, [loadData, fetchTags]);

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (item.ship_to?.name || "").toLowerCase().includes(searchLower) || 
                          (item.order_number || item.shipment_number || "").toString().includes(searchLower);
    const matchesProduct = !productFilter || item.items?.some(p => p.sku === productFilter || p.name === productFilter);
    
    // Filtering logic for the tag filter dropdown
    const matchesTag = !tagFilter || item.tagIds?.includes(Number(tagFilter)) || item.tags?.some(t => t.tagId === Number(tagFilter));

    return matchesSearch && matchesProduct && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ShipFlow Dashboard</h1>
          <p className="text-slate-500 text-sm">Managing {statusFilter} labels and organizing by tags.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <TagFilter tags={tags} tagFilter={tagFilter} setTagFilter={setTagFilter} />
          <ProductFilter products={products} productFilter={productFilter} setProductFilter={setProductFilter} />
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select className="text-sm font-medium outline-none bg-transparent cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">Awaiting Shipment</option>
              <option value="label_purchased">Label Purchased</option>
            </select>
          </div>
          
          <button onClick={loadData} className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Visible Orders" value={filteredItems.length} icon={<Package className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Selected" value={selectedIds.length} icon={<Check className="text-emerald-600" />} color="bg-emerald-50" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600"
                    checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} 
                    onChange={() => setSelectedIds(selectedIds.length === filteredItems.length ? [] : filteredItems.map(i => i.order_id || i.shipment_id))}
                  />
                </th>
                <th className="px-2 py-4 w-10"></th>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Tags</th> {/* New column header */}
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableSkeleton />
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const id = item.order_id || item.shipment_id;
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
                  <td colSpan="8" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    No results match your criteria.
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

export default Dashboard;