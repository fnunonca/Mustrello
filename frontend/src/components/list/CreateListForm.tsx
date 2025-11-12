import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';

interface CreateListFormProps {
  boardId: string;
}

export const CreateListForm: React.FC<CreateListFormProps> = ({ boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const createList = useBoardStore((state) => state.createList);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createList(boardId, name);
      setName('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg p-3 w-80 flex-shrink-0 transition-all flex items-center justify-center text-gray-700 font-medium"
      >
        <Plus size={20} className="mr-2" />
        Añadir lista
      </button>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la lista"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
          required
        />
        <div className="flex space-x-2">
          <Button type="submit" size="sm">
            Añadir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setName('');
            }}
          >
            <X size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};
