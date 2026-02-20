import React, { useState, useRef, useEffect } from 'react';
import { Search, Tag, ChevronDown, X, Check } from 'lucide-react';

const ProductFilter = ({ products, productFilter, setProductFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProduct = products.find(p => p.sku === productFilter || p.name === productFilter);
  const selectedName = selectedProduct?.name || 'All Products';

  return (
    <div className="flex flex-col gap-1.5" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filter by Product</label>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm min-w-[200px] max-w-[280px] text-left hover:border-slate-300 transition-all"
        >
          <div className="flex items-center gap-2 truncate text-sm font-medium text-slate-700">
            <Tag size={14} className={productFilter ? "text-blue-500" : "text-slate-400"} />
            <span className="truncate">{selectedName}</span>
          </div>
          {productFilter ? (
            <X size={14} className="text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); setProductFilter(''); }} />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-[320px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 border-b bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  autoFocus
                  placeholder="Search SKU or Name..."
                  className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:ring-2 ring-blue-500/20 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              <button 
                onClick={() => { setProductFilter(''); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-md flex items-center justify-between"
              >
                All Products {!productFilter && <Check size={12} className="text-blue-500" />}
              </button>
              {filtered.map(p => {
                const identifier = p.sku || p.name;
                return (
                  <button 
                    key={p.product_id}
                    onClick={() => { setProductFilter(identifier); setIsOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md group"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-700">{p.name}</p>
                      {productFilter === identifier && <Check size={12} className="text-blue-500" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] px-1 bg-slate-100 text-slate-500 rounded font-mono uppercase">
                        {p.sku ? `SKU: ${p.sku}` : 'No SKU'}
                      </span>
                      {/* FIX: Access .amount property instead of rendering the whole object */}
                      {p.price && typeof p.price === 'object' && (
                        <span className="text-[9px] text-slate-400">
                          {p.price.amount} {p.price.currency?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;