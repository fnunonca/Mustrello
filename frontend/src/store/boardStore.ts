import { create } from 'zustand';
import type { Board, List, Card, Comment } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;

  // Boards
  loadBoards: () => void;
  createBoard: (name: string, description: string) => Board;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string) => void;

  // Lists
  createList: (boardId: string, name: string) => void;
  updateList: (listId: string, name: string) => void;
  deleteList: (listId: string) => void;

  // Cards
  createCard: (listId: string, title: string, description: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, targetListId: string, newPosition: number) => void;

  // Comments
  addComment: (cardId: string, text: string) => void;
  updateComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;

  // Persistence
  saveToLocalStorage: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,

  loadBoards: () => {
    const boardsStr = localStorage.getItem(STORAGE_KEYS.BOARDS);
    if (boardsStr) {
      const boards = JSON.parse(boardsStr);
      set({ boards });
    }
  },

  createBoard: (name: string, description: string) => {
    const newBoard: Board = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      lists: [],
    };

    set((state) => ({
      boards: [...state.boards, newBoard],
    }));

    get().saveToLocalStorage();
    return newBoard;
  },

  deleteBoard: (boardId: string) => {
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== boardId),
      currentBoard: state.currentBoard?.id === boardId ? null : state.currentBoard,
    }));
    get().saveToLocalStorage();
  },

  setCurrentBoard: (boardId: string) => {
    const board = get().boards.find((b) => b.id === boardId);
    set({ currentBoard: board || null });
  },

  createList: (boardId: string, name: string) => {
    set((state) => ({
      boards: state.boards.map((board) => {
        if (board.id === boardId) {
          const newList: List = {
            id: uuidv4(),
            boardId,
            name,
            position: board.lists.length,
            cards: [],
          };
          return { ...board, lists: [...board.lists, newList] };
        }
        return board;
      }),
    }));

    const updatedBoard = get().boards.find((b) => b.id === boardId);
    if (updatedBoard && get().currentBoard?.id === boardId) {
      set({ currentBoard: updatedBoard });
    }

    get().saveToLocalStorage();
  },

  updateList: (listId: string, name: string) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) =>
          list.id === listId ? { ...list, name } : list
        ),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  deleteList: (listId: string) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.filter((list) => list.id !== listId),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  createCard: (listId: string, title: string, description: string) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => {
          if (list.id === listId) {
            const newCard: Card = {
              id: uuidv4(),
              listId,
              title,
              description,
              position: list.cards.length,
              createdAt: new Date().toISOString(),
              comments: [],
            };
            return { ...list, cards: [...list.cards, newCard] };
          }
          return list;
        }),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  updateCard: (cardId: string, updates: Partial<Card>) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, ...updates } : card
          ),
        })),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  deleteCard: (cardId: string) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        })),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  moveCard: (cardId: string, targetListId: string, newPosition: number) => {
    set((state) => {
      let movedCard: Card | null = null;

      // Encontrar y remover la tarjeta de su lista original
      const boardsWithCardRemoved = state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => {
          const cardIndex = list.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            movedCard = { ...list.cards[cardIndex], listId: targetListId };
            return {
              ...list,
              cards: list.cards.filter((c) => c.id !== cardId),
            };
          }
          return list;
        }),
      }));

      if (!movedCard) return state;

      // Agregar la tarjeta a la lista objetivo
      const finalBoards = boardsWithCardRemoved.map((board) => ({
        ...board,
        lists: board.lists.map((list) => {
          if (list.id === targetListId) {
            const newCards = [...list.cards];
            newCards.splice(newPosition, 0, movedCard!);
            // Reajustar posiciones
            return {
              ...list,
              cards: newCards.map((card, idx) => ({ ...card, position: idx })),
            };
          }
          return list;
        }),
      }));

      return { boards: finalBoards };
    });

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  addComment: (cardId: string, text: string) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) => {
            if (card.id === cardId) {
              const newComment: Comment = {
                id: uuidv4(),
                cardId,
                text,
                createdAt: new Date().toISOString(),
              };
              return {
                ...card,
                comments: [...(card.comments || []), newComment],
              };
            }
            return card;
          }),
        })),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  updateComment: (commentId: string, text: string) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) => ({
            ...card,
            comments: (card.comments || []).map((comment) =>
              comment.id === commentId
                ? { ...comment, text, updatedAt: new Date().toISOString() }
                : comment
            ),
          })),
        })),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  deleteComment: (commentId: string) => {
    set((state) => ({
      boards: state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) => ({
            ...card,
            comments: (card.comments || []).filter(
              (comment) => comment.id !== commentId
            ),
          })),
        })),
      })),
    }));

    if (get().currentBoard) {
      const boardId = get().currentBoard!.id;
      const updatedBoard = get().boards.find((b) => b.id === boardId);
      set({ currentBoard: updatedBoard || null });
    }

    get().saveToLocalStorage();
  },

  saveToLocalStorage: () => {
    const { boards } = get();
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  },
}));
