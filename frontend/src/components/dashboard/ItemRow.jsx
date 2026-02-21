import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Package, ExternalLink } from 'lucide-react';

const ItemRow = ({ item, timeFormatter, isSelected, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const status = item.order_status || item.shipment_status || 'unknown';
  const dateValue = item.order_date || item.created_at;
  const orderId = item.order_id || item.shipment_id;
  const orderNumber = item.order_number || item.shipment_number;

  const safeRelativeTime = typeof timeFormatter === 'function' 
    ? timeFormatter(dateValue) 
    : dateValue;

  return (
    <>
      <tr className={`transition-colors group ${isSelected ? 'bg-blue-50/50' : isExpanded ? 'bg-slate-50/30' : 'hover:bg-slate-50/50'}`}>
        <td className="px-4 py-4 text-center">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform active:scale-90"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>

        <td className="px-2 py-4 text-slate-400 text-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>

        <td className="px-6 py-4 font-mono font-bold text-blue-600">
          #{orderNumber}
        </td>

        <td className="px-6 py-4">
          <div className="font-bold text-slate-900 leading-tight">
            {item.ship_to?.name || 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 uppercase tracking-tight font-medium">
            {item.ship_to?.city ? `${item.ship_to.city}, ${item.ship_to.state}` : 'No Address'}
          </div>
        </td>

        <td className="px-6 py-4 text-center">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
            status === 'pending' || status === 'awaiting_shipment' 
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {status.replace(/_/g, ' ')}
          </span>
        </td>

        {/* Dynamic Tag Badges */}
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
            {item.tags && item.tags.length > 0 ? (
              item.tags.map((tag) => (
                <span 
                  key={tag.tagId || tag.name}
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm truncate max-w-[80px]"
                  style={{ backgroundColor: tag.color || '#94a3b8' }}
                  title={tag.name}
                >
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-300 italic">No tags</span>
            )}
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="text-slate-900 font-bold text-xs">
            {safeRelativeTime}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {new Date(dateValue).toLocaleDateString()}
          </div>
        </td>

        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 text-slate-400 font-bold">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
               {item.items?.length || 0}
            </span>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-blue-500" />
          </div>
        </td>
      </tr>

      {/* Expanded Details */}
      {isExpanded && (
        <tr className="bg-slate-50/40 border-l-4 border-blue-500 animate-in fade-in duration-200">
          <td colSpan="8" className="px-12 py-6 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
              <Package size={14} className="text-blue-500" />
              Order Contents
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {item.items?.map((prod, idx) => (
                <div key={`${orderId}-item-${idx}`} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase font-semibold">
                        {prod.sku ? `SKU: ${prod.sku}` : <span className="italic text-slate-300 font-medium">No SKU</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Qty</p>
                    <p className="text-sm font-black text-blue-600 leading-none">{prod.quantity}</p>
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

export default ItemRow;