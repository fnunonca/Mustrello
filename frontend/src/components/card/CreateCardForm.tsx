import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';

interface CreateCardFormProps {
  listId: string;
}

export const CreateCardForm: React.FC<CreateCardFormProps> = ({ listId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createCard = useBoardStore((state) => state.createCard);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createCard(listId, title, description);
      setTitle('');
      setDescription('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
      >
        <Plus size={16} className="mr-2" />
        Añadir tarjeta
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la tarjeta"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        autoFocus
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        rows={2}
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
            setTitle('');
            setDescription('');
          }}
        >
          <X size={16} />
        </Button>
      </div>
    </form>
  );
};
