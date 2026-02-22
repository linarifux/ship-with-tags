import React, { useState } from 'react';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import * as apiService from '../../services/api';

const TagAssignmentModal = ({ isOpen, onClose, selectedIds, tags, onTagsUpdated }) => {
  const [selectedTagId, setSelectedTagId] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Default Blue
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const safeTags = Array.isArray(tags) ? tags : [];

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      await apiService.createTag({ name: newTagName.trim(), color: newTagColor });
      await onTagsUpdated(); 
      setNewTagName('');
    } catch (err) {
      // UX Update: Reveal the exact server error message
      const serverMessage = err.response?.data?.message || err.message;
      setError(`Failed to create tag: ${serverMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleApplyTag = async (action) => {
    // UX Guardrail: If user types a new tag but clicks 'Apply' instead of '+'
    if (newTagName.trim() && !selectedTagId) {
      setError("Please click the '+' button to create your new tag first.");
      return;
    }

    // Find the tag matching our bulletproof ID
    const tagToApply = safeTags.find(t => (t.tagId || t.tag_id || t.name) === selectedTagId);
    
    if (!tagToApply) {
      setError("Please select an existing tag from the list.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      await apiService.updateOrderTags({
        orderIds: selectedIds,
        tagName: tagToApply.name, // Sending Name, not ID
        action: action 
      });
      await onTagsUpdated(); 
      onClose();
    } catch (err) {
      // UX Update: Reveal the exact server error message
      const serverMessage = err.response?.data?.message || err.message;
      setError(`Failed to ${action} tag. Server says: ${serverMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Manage Tags</h2>
            <p className="text-xs text-slate-500 font-medium">{selectedIds.length} orders selected</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 animate-in fade-in">
              {error}
            </div>
          )}

          {/* Create New Tag Section */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Create New Tag</h3>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-10 h-10 p-1 rounded-lg border border-slate-300 cursor-pointer bg-white"
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
                className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          {/* Select and Apply Existing Tag Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Existing Tag</h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {safeTags.map(t => {
                // Bulletproof ID fallback handles 'tagId', 'tag_id', or relies on 'name'
                const tId = t.tagId || t.tag_id || t.name;
                
                // Only matches if selectedTagId actually has a value, preventing undefined matches
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
              {safeTags.length === 0 && <div className="col-span-2 text-xs text-slate-500 italic text-center p-4">No tags available.</div>}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
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