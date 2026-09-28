import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Board } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { getBoardColors } from '../../utils/boardColors';

interface BoardCardProps {
  board: Board;
  index: number;
}

const MAX_MINI_COLUMNS = 4;
const MAX_BARS_PER_COLUMN = 4;

export const BoardCard: React.FC<BoardCardProps> = ({ board, index }) => {
  const navigate = useNavigate();
  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const lists = board.lists ?? [];
  const totalCards = lists.reduce((sum, list) => sum + (list.cards?.length ?? 0), 0);
  const [color1, color2] = getBoardColors(board.id);
  const miniColumns = lists
    .slice(0, MAX_MINI_COLUMNS)
    .map((list) => Math.min(list.cards?.length ?? 0, MAX_BARS_PER_COLUMN));

  const createdLabel = board.createdAt
    ? format(new Date(board.createdAt), "d 'de' MMMM, yyyy", { locale: es })
    : null;

  const listsLabel = lists.length === 1 ? 'lista' : 'listas';
  const cardsLabel = totalCards === 1 ? 'tarjeta' : 'tarjetas';

  const goToBoard = useCallback(() => {
    navigate(`/board/${board.id}`);
  }, [navigate, board.id]);

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToBoard();
    }
  };

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    goToBoard();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm(`¿Eliminar el tablero "${board.name}"?`)) {
      deleteBoard(board.id);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    node.style.setProperty('--ry', `${(x - 0.5) * 16}deg`);
    node.style.setProperty('--rx', `${(0.5 - y) * 16}deg`);
    node.style.setProperty('--gx', `${x * 100}%`);
    node.style.setProperty('--gy', `${y * 100}%`);
    node.classList.add('is-tilting');
  };

  const handlePointerLeave = () => {
    const node = cardRef.current;
    if (!node) return;
    node.classList.remove('is-tilting');
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`Abrir tablero ${board.name}`}
      onClick={goToBoard}
      onKeyDown={handleCardKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="board-card"
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className="board-cover" style={{ '--c1': color1, '--c2': color2 } as React.CSSProperties}>
        {miniColumns.length > 0 ? (
          miniColumns.map((barCount, columnIndex) => (
            <div key={columnIndex} className="mini-col">
              {Array.from({ length: barCount }).map((_, barIndex) => (
                <i key={barIndex} />
              ))}
            </div>
          ))
        ) : (
          <div className="mini-col" />
        )}
        <span className="board-badge">
          {totalCards} {cardsLabel}
        </span>
      </div>
      <div className="board-body">
        <h3 className="board-title">{board.name}</h3>
        {board.description && <p className="board-description">{board.description}</p>}
        <div className="board-meta">
          <span>
            {lists.length} {listsLabel} · {totalCards} {cardsLabel}
          </span>
          {createdLabel && <span>{createdLabel}</span>}
        </div>
        <div className="board-actions">
          <button type="button" className="board-action-open" onClick={handleOpenClick}>
            Abrir
          </button>
          <button
            type="button"
            className="board-action-delete"
            onClick={handleDelete}
            aria-label={`Eliminar tablero ${board.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
