import React, { useState, useRef, useEffect } from 'react';
import { Search, Tag, ChevronDown, X, Check } from 'lucide-react';

const TagFilter = ({ tags = [], tagFilter, setTagFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Defensive check: Ensure tags is an array before filtering
  const safeTags = Array.isArray(tags) ? tags : [];

  const filteredTags = safeTags.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Per your logic: the UI displays the selected tag's name.
  // We handle the case where tagFilter might be storing the name directly.
  const selectedTag = safeTags.find(t => 
    t.tag_id?.toString() === tagFilter?.toString() || 
    t.name === tagFilter
  );
  
  const selectedName = selectedTag?.name || 'All Tags';

  return (
    <div className="flex flex-col gap-1.5" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filter by Tag</label>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm min-w-[160px] text-left hover:border-slate-300 transition-all"
        >
          <div className="flex items-center gap-2 truncate text-sm font-medium text-slate-700">
            <Tag size={14} className={tagFilter ? "text-purple-500" : "text-slate-400"} />
            <span className="truncate">{selectedName}</span>
          </div>
          {tagFilter ? (
            <X 
              size={14} 
              className="text-slate-400 hover:text-red-500 cursor-pointer" 
              onClick={(e) => { e.stopPropagation(); setTagFilter(''); }} 
            />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-[240px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  autoFocus
                  placeholder="Search tags..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 ring-purple-500/20 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto p-1">
              <button 
                onClick={() => { setTagFilter(''); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-md flex justify-between items-center transition-colors"
              >
                All Tags {!tagFilter && <Check size={12} className="text-purple-500" />}
              </button>
              
              {filteredTags.map(t => {
                // Determine if this specific tag is the currently active one
                const isActive = tagFilter === t.name || tagFilter?.toString() === t.tag_id?.toString();
                
                return (
                  <button 
                    key={t.tag_id || t.name} // Fallback key if id is missing
                    // Per your logic: Pass the Name back to the parent component
                    onClick={() => { setTagFilter(t.name); setIsOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-md group transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-purple-700">{t.name}</p>
                      {isActive && <Check size={12} className="text-purple-500 shrink-0" />}
                    </div>
                    <div 
                      className="w-full h-1 mt-1 rounded-full opacity-80" 
                      style={{ backgroundColor: t.color || '#cbd5e1' }} 
                    />
                  </button>
                );
              })}
              
              {filteredTags.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs italic">
                  No tags found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagFilter;