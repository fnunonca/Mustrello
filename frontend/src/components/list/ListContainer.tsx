import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List } from '../../types';
import { ListHeader } from './ListHeader';
import { CardItem } from '../card/CardItem';
import { CreateCardForm } from '../card/CreateCardForm';

interface ListContainerProps {
  list: List;
}

export const ListContainer: React.FC<ListContainerProps> = ({ list }) => {
  const { setNodeRef } = useDroppable({ id: list.id });

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0">
      <ListHeader list={list} />

      <div ref={setNodeRef} className="space-y-2 min-h-[100px] mb-3">
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      <CreateCardForm listId={list.id} />
    </div>
  );
};
