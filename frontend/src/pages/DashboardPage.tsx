import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { BoardCard } from '../components/board/BoardCard';
import { CreateBoardModal } from '../components/board/CreateBoardModal';
import { Button } from '../components/common/Button';
import { useBoardStore } from '../store/boardStore';

export const DashboardPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { boards, loadBoards } = useBoardStore();

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Tableros</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Nuevo Tablero
          </Button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">
              No tienes tableros todavía
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Crear tu primer tablero
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}

        <CreateBoardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
};
