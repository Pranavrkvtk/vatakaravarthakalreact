import React, { useState } from 'react';
import Swal from 'sweetalert2';

// ---------- Local LoadingSpinner (reused from main dashboard) ----------
const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <div
      style={{
        width: 40,
        height: 40,
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ---------- Categories Tab (redesigned) ----------
function CategoriesTab({ categories, onAdd, onRename, onDelete, loading }) {
  const [newCategory, setNewCategory] = useState('');
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const name = newCategory.trim();
    if (!name) return;
    onAdd(name);
    setNewCategory('');
  };

  const startEdit = (cat) => {
    setEditingName(cat.name);
    setEditValue(cat.name);
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditValue('');
  };

  const saveEdit = (oldName) => {
    const newName = editValue.trim();
    if (!newName || newName === oldName) {
      cancelEdit();
      return;
    }
    if (categories.some((c) => c.name === newName && c.name !== oldName)) {
      Swal.fire('Name already exists', 'Please choose a different name.', 'warning');
      return;
    }
    onRename(oldName, newName);
    cancelEdit();
  };

  const handleDelete = (name) => {
    onDelete(name);
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        border: '1px solid var(--border-light)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
          📂 Categories
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
          Organise your posts – add, rename, or remove categories.
        </p>
      </div>

      {/* Add new category */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 28,
          flexWrap: 'wrap',
          background: 'var(--bg-base)',
          padding: 16,
          borderRadius: 14,
          border: '1px solid var(--border-light)',
        }}
      >
        <input
          type="text"
          placeholder="New category name…"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid var(--border-light)',
            fontSize: 14,
            background: '#fff',
            outline: 'none',
            transition: 'border 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
        />
        <button
          onClick={handleAdd}
          disabled={!newCategory.trim() || loading}
          style={{
            padding: '10px 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--primary)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: !newCategory.trim() || loading ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          + Add
        </button>
      </div>

      {/* Category list */}
      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--text-secondary)',
            fontSize: 15,
          }}
        >
          No categories yet. Add one above.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {categories.map((cat) => {
            const isEditing = editingName === cat.name;
            return (
              <div
                key={cat.name}
                style={{
                  background: 'var(--bg-base)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.name)}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '2px solid var(--primary)',
                        fontSize: 14,
                        background: '#fff',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => saveEdit(cat.name)}
                      style={{
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-light)',
                        borderRadius: 8,
                        padding: '6px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>📁</span>
                      <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                      {cat.count !== undefined && (
                        <span
                          style={{
                            background: 'var(--border-light)',
                            color: 'var(--text-secondary)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '1px 10px',
                            borderRadius: 20,
                            marginLeft: 4,
                          }}
                        >
                          {cat.count}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => startEdit(cat)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 15,
                          color: 'var(--text-secondary)',
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}
                        title="Rename"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(cat.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 15,
                          color: 'var(--error)',
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoriesTab;