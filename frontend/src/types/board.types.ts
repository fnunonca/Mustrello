export interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lists: List[];
}

export interface List {
  id: string;
  boardId: string;
  name: string;
  position: number;
  cards: Card[];
}

export interface Comment {
  id: string;
  cardId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
  color?: string;
  comments: Comment[];
}
