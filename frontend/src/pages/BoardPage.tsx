import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { ListContainer } from '../components/list/ListContainer';
import { CreateListForm } from '../components/list/CreateListForm';
import { Button } from '../components/common/Button';
import { useBoardStore } from '../store/boardStore';
import type { Card } from '../types';

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBoard, setCurrentBoard, loadBoards, moveCard } = useBoardStore();
  const [activeCard, setActiveCard] = React.useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadBoards();
    if (id) {
      setCurrentBoard(id);
    }
  }, [id, loadBoards, setCurrentBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    const card = currentBoard?.lists
      .flatMap((list) => list.cards)
      .find((c) => c.id === cardId);

    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !currentBoard) return;

    const cardId = active.id as string;
    const targetListId = over.id as string;

    // Encontrar la lista objetivo
    const targetList = currentBoard.lists.find((list) => list.id === targetListId);
    if (!targetList) return;

    // Calcular nueva posición
    const newPosition = targetList.cards.length;

    moveCard(cardId, targetListId, newPosition);
  };

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Tablero no encontrado</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 to-primary-600">
      <Navbar />

      <div className="max-w-full mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {currentBoard.name}
          </h1>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {currentBoard.lists.map((list) => (
              <ListContainer key={list.id} list={list} />
            ))}
            <CreateListForm boardId={currentBoard.id} />
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="bg-white rounded-lg shadow-lg p-3 w-80 rotate-3">
                <h4 className="font-medium text-gray-900">{activeCard.title}</h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
