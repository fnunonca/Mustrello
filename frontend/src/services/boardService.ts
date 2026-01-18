import api from './api';
import type { Board, List, Card, Comment } from '../types';

// DTOs que vienen del backend
interface BoardDto {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lists?: ListDto[];
}

interface ListDto {
  id: string;
  name: string;
  position: number;
  cards?: CardDto[];
}

interface CardDto {
  id: string;
  title: string;
  description?: string;
  position: number;
  color?: string;
  comments?: CommentDto[];
}

interface CommentDto {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

// Funciones de mapeo de DTOs a tipos del frontend
function mapBoardDtoToBoard(dto: BoardDto): Board {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    createdAt: dto.createdAt,
    lists: dto.lists?.map(mapListDtoToList) || []
  };
}

function mapListDtoToList(dto: ListDto): List {
  return {
    id: dto.id,
    boardId: '', // Se llenará con el boardId del contexto
    name: dto.name,
    position: dto.position,
    cards: dto.cards?.map(mapCardDtoToCard) || []
  };
}

function mapCardDtoToCard(dto: CardDto): Card {
  return {
    id: dto.id,
    listId: '', // Se llenará con el listId del contexto
    title: dto.title,
    description: dto.description || '',
    position: dto.position,
    color: dto.color,
    createdAt: new Date().toISOString(),
    comments: dto.comments?.map(mapCommentDtoToComment) || []
  };
}

function mapCommentDtoToComment(dto: CommentDto): Comment {
  return {
    id: dto.id,
    cardId: '', // Se llenará con el cardId del contexto
    text: dto.text,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

export const boardService = {
  // Boards
  async getBoards(): Promise<Board[]> {
    const response = await api.get<BoardDto[]>('/boards');
    return response.data.map(mapBoardDtoToBoard);
  },

  async getBoard(id: string): Promise<Board> {
    const response = await api.get<BoardDto>(`/boards/${id}`);
    const board = mapBoardDtoToBoard(response.data);
    // Llenar boardId y listId en listas y tarjetas
    board.lists = board.lists.map(list => ({
      ...list,
      boardId: board.id,
      cards: list.cards.map(card => ({
        ...card,
        listId: list.id,
        comments: card.comments.map(comment => ({
          ...comment,
          cardId: card.id
        }))
      }))
    }));
    return board;
  },

  async createBoard(name: string, description: string): Promise<Board> {
    const response = await api.post<BoardDto>('/boards', { name, description });
    return mapBoardDtoToBoard(response.data);
  },

  async updateBoard(id: string, data: { name?: string; description?: string }): Promise<Board> {
    const response = await api.put<BoardDto>(`/boards/${id}`, data);
    return mapBoardDtoToBoard(response.data);
  },

  async deleteBoard(id: string): Promise<void> {
    await api.delete(`/boards/${id}`);
  },

  // Lists
  async createList(boardId: string, name: string, position: number): Promise<List> {
    const response = await api.post<ListDto>(`/boards/${boardId}/lists`, { name, position });
    return { ...mapListDtoToList(response.data), boardId };
  },

  async updateList(id: string, data: { name?: string; position?: number }): Promise<List> {
    const response = await api.put<ListDto>(`/lists/${id}`, data);
    return mapListDtoToList(response.data);
  },

  async deleteList(id: string): Promise<void> {
    await api.delete(`/lists/${id}`);
  },

  // Cards
  async createCard(listId: string, title: string, description: string, position: number): Promise<Card> {
    const response = await api.post<CardDto>(`/lists/${listId}/cards`, { title, description, position });
    return { ...mapCardDtoToCard(response.data), listId };
  },

  async updateCard(id: string, data: { title?: string; description?: string; color?: string; position?: number }): Promise<Card> {
    const response = await api.put<CardDto>(`/cards/${id}`, data);
    return mapCardDtoToCard(response.data);
  },

  async deleteCard(id: string): Promise<void> {
    await api.delete(`/cards/${id}`);
  },

  async moveCard(id: string, targetListId: string, newPosition: number): Promise<Card> {
    const response = await api.post<CardDto>(`/cards/${id}/move`, { targetListId, newPosition });
    return { ...mapCardDtoToCard(response.data), listId: targetListId };
  },

  // Comments
  async createComment(cardId: string, text: string): Promise<Comment> {
    const response = await api.post<CommentDto>(`/cards/${cardId}/comments`, { text });
    return { ...mapCommentDtoToComment(response.data), cardId };
  },

  async updateComment(id: string, text: string): Promise<Comment> {
    const response = await api.put<CommentDto>(`/comments/${id}`, { text });
    return mapCommentDtoToComment(response.data);
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  }
};

export default boardService;
