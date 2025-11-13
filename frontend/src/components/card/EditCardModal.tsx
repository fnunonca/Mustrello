import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';
import { CardComments } from './CardComments';
import type { Card } from '../../types';

interface EditCardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, description);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar tarjeta
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label
                  htmlFor="card-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Título
                </label>
                <input
                  id="card-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="card-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="card-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-2 pb-4 border-b border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar
                </Button>
              </div>
            </form>

            {/* Comments Section */}
            <div className="p-4">
              <CardComments cardId={card.id} comments={card.comments || []} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
