import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, List } from 'lucide-react';
import type { Board } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { Button } from '../common/Button';

interface BoardCardProps {
  board: Board;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const navigate = useNavigate();
  const deleteBoard = useBoardStore((state) => state.deleteBoard);

  const handleClick = () => {
    navigate(`/board/${board.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar el tablero "${board.name}"?`)) {
      deleteBoard(board.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {board.description || 'Sin descripción'}
      </p>
      <div className="flex items-center text-gray-500 text-sm">
        <List size={16} className="mr-2" />
        <span>{board.lists.length} listas</span>
      </div>
    </div>
  );
};
