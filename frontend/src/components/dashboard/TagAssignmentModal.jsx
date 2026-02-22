import React, { useState, useMemo } from 'react';
import { X, Plus, Check, Loader2, Search, Tag as TagIcon } from 'lucide-react';
import * as apiService from '../../services/api';

const TagAssignmentModal = ({ isOpen, onClose, selectedIds, selectedOrders = [], tags, onTagsUpdated }) => {
  const [selectedTagId, setSelectedTagId] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); 
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Derived State: Currently Applied Tags ---
  const currentlyAppliedTags = useMemo(() => {
    const appliedMap = new Map();
    selectedOrders.forEach(order => {
      if (order.tags && Array.isArray(order.tags)) {
        order.tags.forEach(t => {
          if (!appliedMap.has(t.name)) {
            appliedMap.set(t.name, t);
          }
        });
      }
    });
    return Array.from(appliedMap.values());
  }, [selectedOrders]);

  if (!isOpen) return null;

  const safeTags = Array.isArray(tags) ? tags : [];

  const filteredTags = safeTags.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      await apiService.createTag({ name: newTagName.trim(), color: newTagColor });
      await onTagsUpdated(); 
      setNewTagName('');
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      setError(`Creation Failed: ${serverMsg}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleApplyTag = async (action) => {
    // UX Guardrail
    if (newTagName.trim() && !selectedTagId) {
      setError("Please click the '+' button to create your new tag first.");
      return;
    }

    const tagToApply = safeTags.find(t => (t.tagId || t.tag_id || t.name) === selectedTagId);
    
    if (!tagToApply) {
      setError("Please select an existing tag from the list below.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // USING YOUR BULK BACKEND ENDPOINT
      await apiService.updateOrderTags({
        shipmentIds: selectedIds, // Passed as an array to your Node backend
        tagName: tagToApply.name, 
        action: action 
      });

      await onTagsUpdated(); 
      onClose();
    } catch (err) {
      // Pull exact error text from Express
      const serverMsg = err.response?.data?.message || err.message;
      setError(`Failed to ${action} tag: ${serverMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to remove a specific tag directly from the "Applied Tags" section
  const handleQuickRemove = async (tagName) => {
    setIsProcessing(true);
    setError(null);
    try {
      // USING YOUR BULK BACKEND ENDPOINT
      await apiService.updateOrderTags({
        shipmentIds: selectedIds,
        tagName: tagName, 
        action: 'remove' 
      });
      
      await onTagsUpdated(); 
      // Keep modal open so user can see the tag disappear dynamically
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      setError(`Failed to remove tag: ${serverMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Manage Tags</h2>
            <p className="text-xs text-slate-500 font-medium">{selectedIds.length} orders selected</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 animate-in fade-in">
              {error}
            </div>
          )}

          {/* --- Currently Applied Tags Section --- */}
          {currentlyAppliedTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <TagIcon size={12} /> Currently Applied Tags
              </h3>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {currentlyAppliedTags.map(tag => (
                  <div 
                    key={tag.name} 
                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm group"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || '#94a3b8' }} />
                    <span className="text-xs font-bold text-slate-700">{tag.name}</span>
                    <button 
                      onClick={() => handleQuickRemove(tag.name)}
                      disabled={isProcessing}
                      className="text-slate-300 hover:text-red-500 focus:outline-none transition-colors ml-1 p-0.5 rounded disabled:opacity-50"
                      title={`Remove "${tag.name}" from selected orders`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {selectedIds.length > 1 && (
                <p className="text-[10px] text-slate-400 italic">
                  Note: These tags are applied to one or more of the selected orders.
                </p>
              )}
            </div>
          )}

          {/* Create New Tag Section */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Create New Tag</h3>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-10 h-10 p-1 rounded-lg border border-slate-300 cursor-pointer bg-white shrink-0"
              />
              <input 
                type="text" 
                placeholder="Tag Name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 ring-purple-500/20"
              />
              <button 
                onClick={handleCreateTag}
                disabled={isCreating || !newTagName.trim()}
                className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          {/* Select and Apply Existing Tag Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Existing Tag</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search to assign/remove..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ring-purple-500/20 bg-white transition-all"
              />
              {searchQuery && (
                <X 
                  size={14} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 cursor-pointer" 
                  onClick={() => setSearchQuery('')} 
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredTags.map(t => {
                const tId = t.tagId || t.tag_id || t.name;
                const isActive = Boolean(selectedTagId) && selectedTagId === tId;

                return (
                  <button
                    key={tId}
                    onClick={() => setSelectedTagId(tId)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      isActive 
                        ? 'border-purple-500 bg-purple-50 shadow-sm' 
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: t.color || '#cbd5e1' }} />
                    <span className="text-xs font-bold text-slate-700 truncate">{t.name}</span>
                    {isActive && <Check size={14} className="text-purple-500 ml-auto shrink-0" />}
                  </button>
                )
              })}
              
              {filteredTags.length === 0 && safeTags.length > 0 && (
                <div className="col-span-2 text-xs text-slate-500 italic text-center p-4">No matching tags found.</div>
              )}
              {safeTags.length === 0 && (
                <div className="col-span-2 text-xs text-slate-500 italic text-center p-4">No tags available in account.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end shrink-0">
          <button 
            onClick={() => handleApplyTag('remove')}
            disabled={isProcessing || !selectedTagId}
            className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl disabled:opacity-50 transition-colors"
          >
            Remove from Orders
          </button>
          <button 
            onClick={() => handleApplyTag('add')}
            disabled={isProcessing || !selectedTagId}
            className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            Apply Tag
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagAssignmentModal;