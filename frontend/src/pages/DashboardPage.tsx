import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { BoardCard } from '../components/board/BoardCard';
import { CreateBoardModal } from '../components/board/CreateBoardModal';
import { useBoardStore } from '../store/boardStore';

// Loaded lazily so three.js never inflates the main bundle.
const BoardsBackground = lazy(() =>
  import('../components/board/BoardsBackground').then((m) => ({ default: m.BoardsBackground }))
);
const Boards3DCarousel = lazy(() =>
  import('../components/board/Boards3DCarousel').then((m) => ({ default: m.Boards3DCarousel }))
);

type ViewMode = 'grid' | '3d';

export const DashboardPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { boards, loadBoards } = useBoardStore();

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const hasBoards = boards.length > 0;

  return (
    <div className="dashboard-shell min-h-screen">
      <Suspense fallback={null}>
        <BoardsBackground />
      </Suspense>

      <div className="relative z-10">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="dashboard-hero">
            <div>
              <h1 className="dashboard-title">Mis Tableros</h1>
              <p className="dashboard-subtitle">
                {hasBoards
                  ? `${boards.length} ${boards.length === 1 ? 'tablero' : 'tableros'} en total`
                  : 'Crea tu primer tablero para empezar a organizar tu trabajo.'}
              </p>
            </div>
            <div className="dashboard-hero-actions">
              {hasBoards && (
                <div className="view-toggle" role="group" aria-label="Vista">
                  <button type="button" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                    Grid
                  </button>
                  <button type="button" aria-pressed={viewMode === '3d'} onClick={() => setViewMode('3d')}>
                    3D
                  </button>
                </div>
              )}
              <button type="button" className="btn-gradient-primary" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} />
                Nuevo Tablero
              </button>
            </div>
          </div>

          {!hasBoards ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <Plus size={28} />
              </div>
              <p>No tienes tableros todavía</p>
              <button type="button" className="btn-gradient-primary" onClick={() => setIsCreateModalOpen(true)}>
                Crear tu primer tablero
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="boards-grid">
              {boards.map((board, index) => (
                <BoardCard key={board.id} board={board} index={index} />
              ))}
              <button
                type="button"
                className="board-create-tile"
                style={{ '--i': boards.length } as React.CSSProperties}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <span className="board-create-plus">+</span>
                Crear tablero
              </button>
            </div>
          ) : (
            <Suspense fallback={<div className="carousel-loading">Cargando vista 3D…</div>}>
              <Boards3DCarousel boards={boards} />
            </Suspense>
          )}

          <CreateBoardModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};
