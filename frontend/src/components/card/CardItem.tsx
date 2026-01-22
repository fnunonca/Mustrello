import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Pencil, ArrowRightLeft } from 'lucide-react';
import type { Card } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { CardColorPicker } from './CardColorPicker';
import { EditCardModal } from './EditCardModal';

interface CardItemProps {
  card: Card;
}

export const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const currentBoard = useBoardStore((state) => state.currentBoard);
  const moveCard = useBoardStore((state) => state.moveCard);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar la tarjeta "${card.title}"?`)) {
      deleteCard(card.id);
    }
  };

  const handleColorChange = (color: string | undefined) => {
    updateCard(card.id, { color });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (title: string, description: string) => {
    updateCard(card.id, { title, description });
  };

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoveMenu(!showMoveMenu);
  };

  const handleMoveToList = (targetListId: string) => {
    moveCard(card.id, targetListId, 0);
    setShowMoveMenu(false);
  };

  // Close move menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(event.target as Node)) {
        setShowMoveMenu(false);
      }
    };

    if (showMoveMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoveMenu]);

  const otherLists = currentBoard?.lists.filter(list => list.id !== card.listId) || [];

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          backgroundColor: card.color || 'white',
        }}
        className="rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 mb-2 border border-gray-200 group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{card.title}</h4>
            {card.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {card.description}
              </p>
            )}
          </div>
          <div className="flex items-center ml-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
              title="Editar tarjeta"
            >
              <Pencil size={16} />
            </button>
            <CardColorPicker
              currentColor={card.color}
              onColorChange={handleColorChange}
            />
            <div className="relative" ref={moveMenuRef}>
              <button
                onClick={handleMoveClick}
                className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
                title="Mover a otra lista"
              >
                <ArrowRightLeft size={16} />
              </button>
              {showMoveMenu && otherLists.length > 0 && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[150px]">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                    Mover a
                  </div>
                  {otherLists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => handleMoveToList(list.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {list.name}
                    </button>
                  ))}
                </div>
              )}
              {showMoveMenu && otherLists.length === 0 && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 px-3 z-50 min-w-[150px]">
                  <span className="text-sm text-gray-500">No hay otras listas</span>
                </div>
              )}
            </div>
            <button
              {...attributes}
              {...listeners}
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <EditCardModal
        card={card}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
};
