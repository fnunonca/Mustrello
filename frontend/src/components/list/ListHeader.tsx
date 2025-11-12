import React, { useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { List } from '../../types';
import { useBoardStore } from '../../store/boardStore';

interface ListHeaderProps {
  list: List;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ list }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);

  const { updateList, deleteList } = useBoardStore();

  const handleSubmit = () => {
    if (name.trim() && name !== list.name) {
      updateList(list.id, name);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar la lista "${list.name}"?`)) {
      deleteList(list.id);
    }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      {isEditing ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') {
              setName(list.name);
              setIsEditing(false);
            }
          }}
          className="flex-1 px-2 py-1 border border-primary-500 rounded focus:outline-none"
          autoFocus
        />
      ) : (
        <h3
          onClick={() => setIsEditing(true)}
          className="font-semibold text-gray-900 flex-1 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
        >
          {list.name}
        </h3>
      )}

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
        >
          <MoreVertical size={18} />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar lista
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
