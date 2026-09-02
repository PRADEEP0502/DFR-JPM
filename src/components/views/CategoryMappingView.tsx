import React, { useState } from 'react';
import {
  GitFork,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  User,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  X,
} from 'lucide-react';
import { CategoryHolderMapping, DfrUser } from '../../types/dfr';
import { dfrService } from '../../services/dfrService';

interface CategoryMappingViewProps {
  mappings: CategoryHolderMapping[];
  users: DfrUser[];
  onRefresh: () => void;
}

export const CategoryMappingView: React.FC<CategoryMappingViewProps> = ({
  mappings,
  users,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [categoryInput, setCategoryInput] = useState<string>('');
  const [selectedHolderId, setSelectedHolderId] = useState<string>('user-001');
  const [isActive, setIsActive] = useState<boolean>(true);

  const staffUsers = users.filter(
    u => u.id !== 'user-000' && u.id !== 'user-009' && u.id !== 'user-008'
  );

  const PRESET_CATEGORIES = [
    'SERVICE',
    'SB',
    'CHEMICAL',
    'DYES',
    'POLYBAG',
    'MAINTENANCE',
    'ELECTRICAL',
    'STATIONARY',
    'CLEANING PURPOSE',
    'YARN',
    'PACKING',
    'GENERAL',
    'PLANT & MACHINERY',
    'FABRIC',
  ];

  const handleOpenCreate = () => {
    setEditingId(null);
    setCategoryInput('');
    setSelectedHolderId(staffUsers[0]?.id || 'user-001');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mapping: CategoryHolderMapping) => {
    setEditingId(mapping.id);
    setCategoryInput(mapping.category);
    setSelectedHolderId(mapping.holder_id);
    setIsActive(mapping.is_active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryInput.trim() || !selectedHolderId) return;

    if (editingId) {
      dfrService.updateCategoryMapping(editingId, categoryInput, selectedHolderId, isActive);
    } else {
      dfrService.addCategoryMapping(categoryInput, selectedHolderId);
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string, category: string) => {
    if (confirm(`Are you sure you want to remove the mapping for "${category}"?`)) {
      dfrService.deleteCategoryMapping(id);
      onRefresh();
    }
  };

  const handleToggleStatus = (mapping: CategoryHolderMapping) => {
    dfrService.updateCategoryMapping(
      mapping.id,
      mapping.category,
      mapping.holder_id,
      !mapping.is_active
    );
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-16 max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <GitFork className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Category → Initial Holder Configuration
            </h1>
            <p className="text-[11px] sm:text-xs text-sky-200/80 mt-0.5">
              Configurable intake routing rules assigning initial holders when bills arrive from Selsoft ERP
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl sm:rounded-2xl shadow-lg transition flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Add Category Mapping
        </button>
      </div>

      {/* Business Rule Notice Callout */}
      <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 text-xs text-sky-950">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-sky-900">
            Automated Inward Rule & Historical Protection Policy:
          </p>
          <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
            These rules determine the <strong>initial Current Holder</strong> automatically assigned when a new bill is ingested from the Selsoft ERP API.
            Editing or deleting a mapping <strong>will NOT modify</strong> the Current Holder of existing bills that have already been inwarded.
          </p>
        </div>
      </div>

      {/* Mappings Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Routing Rules ({mappings.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Applied strictly on initial intake</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px] border-collapse">
            <thead className="bg-slate-100/80 text-slate-600 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">ERP Category</th>
                <th className="py-3.5 px-5"></th>
                <th className="py-3.5 px-5">Assigned Initial Holder</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Last Modified</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {mappings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No category mappings configured. Click "Add Category Mapping" above to create one.
                  </td>
                </tr>
              ) : (
                mappings.map(m => {
                  const userObj = users.find(u => u.id === m.holder_id);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-black text-xs border border-slate-200 shadow-2xs">
                          {m.category}
                        </span>
                      </td>

                      <td className="py-4 px-2 text-slate-400">
                        <ArrowRight className="w-4 h-4 text-sky-500" />
                      </td>

                      <td className="py-4 px-5 font-bold text-sky-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black border border-sky-200">
                            {m.holder_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900">{m.holder_name}</span>
                            <span className="text-[10px] text-slate-500 block font-medium">
                              {userObj?.role || 'STAFF'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition ${
                            m.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {m.is_active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>

                      <td className="py-4 px-5 text-slate-500 text-[11px] font-mono">
                        {new Date(m.updated_at).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
                            title="Edit mapping"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.category)}
                            className="p-1.5 rounded-lg bg-slate-100 text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                            title="Delete mapping"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Mapping Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Edit Category Mapping' : 'Add Category Mapping'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition shrink-0 min-h-[36px] min-w-[36px]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Category Input / Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ERP Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHEMICAL, DYES, POLYBAG..."
                  value={categoryInput}
                  onChange={e => setCategoryInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-sky-500 uppercase"
                  required
                />

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {PRESET_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryInput(cat)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        categoryInput === cat
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Designated Initial Holder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designated Initial Holder <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedHolderId}
                  onChange={e => setSelectedHolderId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-sky-500"
                  required
                >
                  {staffUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="activeToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Enable this rule for new incoming bills
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold shadow-md transition"
                >
                  {editingId ? 'Save Changes' : 'Create Mapping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
