import React, { useState } from 'react';
import { Tags, Plus, Trash2, Edit2, Tag, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { DfrLabel, BillRegisterItem } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

interface LabelsManagerViewProps {
  labels: DfrLabel[];
  bills: BillRegisterItem[];
  onRefresh: () => void;
  onSelectLabel?: (labelId: string) => void;
}

export const LabelsManagerView: React.FC<LabelsManagerViewProps> = ({
  labels,
  bills,
  onRefresh,
  onSelectLabel,
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<string>('#0284c7');
  const [description, setDescription] = useState<string>('');

  const PRESET_COLORS = [
    '#ef4444', '#f59e0b', '#10b981', '#0284c7',
    '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'
  ];

  const handleStartCreate = () => {
    setName('');
    setColor('#0284c7');
    setDescription('');
    setEditingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (e: React.MouseEvent, lbl: DfrLabel) => {
    e.stopPropagation();
    setEditingId(lbl.id);
    setName(lbl.name);
    setColor(lbl.color);
    setDescription(lbl.description || '');
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      dfrService.updateLabel(editingId, name, color, description);
    } else {
      dfrService.createLabel(name, color, description);
    }

    setIsCreating(false);
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this multi-label? It will be unattached from all bills.')) {
      dfrService.deleteLabel(id);
      onRefresh();
    }
  };

  const handleCardClick = (labelId: string) => {
    if (onSelectLabel) {
      onSelectLabel(labelId);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Tags className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
            Labels & Tags Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, manage, and click any tag to instantly view and filter matching bills in the Bill Register
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-2 min-h-[44px] touch-manipulation cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Label
        </button>
      </div>

      {/* Label Creation / Edit Form Modal */}
      {isCreating && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 max-w-lg text-slate-900">
          <h3 className="text-base font-extrabold text-slate-900">
            {editingId ? 'Edit Label Tag' : 'Create New Label Tag'}
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Label Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. VIP Supplier, Cash Discount Eligible, Urgent"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Badge Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-300 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border border-slate-300 transition transform hover:scale-110 shadow-2xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Description of tag purpose..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow transition cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Create Label'}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {labels.map(lbl => {
          const assignedCount = bills.filter(b => b.labels.some(l => l.id === lbl.id)).length;

          return (
            <div
              key={lbl.id}
              onClick={() => handleCardClick(lbl.id)}
              className="group bg-white border border-slate-200/90 hover:border-sky-400 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-150 space-y-4 text-slate-900 cursor-pointer relative"
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-3.5 py-1.5 rounded-full text-xs font-black text-white flex items-center gap-1.5 shadow-2xs group-hover:scale-105 transition transform"
                  style={{ backgroundColor: lbl.color }}
                >
                  <Tag className="w-3.5 h-3.5" />
                  {lbl.name}
                </span>

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleStartEdit(e, lbl)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    title="Edit label"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, lbl.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                    title="Delete label"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {lbl.description ? (
                <p className="text-xs text-slate-500 font-medium min-h-[32px]">{lbl.description}</p>
              ) : (
                <p className="text-xs text-slate-400 italic min-h-[32px]">No description provided</p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                  <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                  <span>Assigned Bills:</span>
                  <span className="font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full font-mono">
                    {assignedCount}
                  </span>
                </div>

                <span className="flex items-center gap-1 text-sky-600 group-hover:text-sky-700 font-extrabold text-xs">
                  <span>View Bills</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
