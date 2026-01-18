import { create } from 'zustand';
import type { Board, Card } from '../types';
import boardService from '../services/boardService';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;

  // Boards
  loadBoards: () => Promise<void>;
  createBoard: (name: string, description: string) => Promise<Board | null>;
  deleteBoard: (boardId: string) => Promise<void>;
  setCurrentBoard: (boardId: string) => Promise<void>;

  // Lists
  createList: (boardId: string, name: string) => Promise<void>;
  updateList: (listId: string, name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;

  // Cards
  createCard: (listId: string, title: string, description: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, targetListId: string, newPosition: number) => Promise<void>;

  // Comments
  addComment: (cardId: string, text: string) => Promise<void>;
  updateComment: (commentId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Error handling
  clearError: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  loadBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const boards = await boardService.getBoards();
      set({ boards, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load boards';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createBoard: async (name: string, description: string) => {
    set({ isLoading: true, error: null });
    try {
      const newBoard = await boardService.createBoard(name, description);
      set((state) => ({
        boards: [...state.boards, newBoard],
        isLoading: false
      }));
      return newBoard;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create board';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await boardService.deleteBoard(boardId);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
        currentBoard: state.currentBoard?.id === boardId ? null : state.currentBoard,
        isLoading: false
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete board';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setCurrentBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardService.getBoard(boardId);
      set({ currentBoard: board, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load board';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createList: async (boardId: string, name: string) => {
    const board = get().currentBoard;
    if (!board) return;

    set({ isLoading: true, error: null });
    try {
      const position = board.lists.length;
      const newList = await boardService.createList(boardId, name, position);

      set((state) => {
        const updatedBoard = {
          ...state.currentBoard!,
          lists: [...state.currentBoard!.lists, newList]
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === boardId ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create list';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateList: async (listId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      await boardService.updateList(listId, { name });

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) =>
            list.id === listId ? { ...list, name } : list
          )
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update list';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteList: async (listId: string) => {
    set({ isLoading: true, error: null });
    try {
      await boardService.deleteList(listId);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.filter((list) => list.id !== listId)
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete list';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createCard: async (listId: string, title: string, description: string) => {
    const board = get().currentBoard;
    if (!board) return;

    const list = board.lists.find((l) => l.id === listId);
    if (!list) return;

    set({ isLoading: true, error: null });
    try {
      const position = list.cards.length;
      const newCard = await boardService.createCard(listId, title, description, position);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((l) =>
            l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
          )
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create card';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    set({ isLoading: true, error: null });
    try {
      await boardService.updateCard(cardId, updates);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId ? { ...card, ...updates } : card
            )
          }))
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update card';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteCard: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await boardService.deleteCard(cardId);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => ({
            ...list,
            cards: list.cards.filter((card) => card.id !== cardId)
          }))
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete card';
      set({ error: errorMessage, isLoading: false });
    }
  },

  moveCard: async (cardId: string, targetListId: string, newPosition: number) => {
    const board = get().currentBoard;
    if (!board) return;

    // Encontrar la tarjeta actual
    let movedCard: Card | null = null;
    for (const list of board.lists) {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) {
        movedCard = { ...card, listId: targetListId };
        break;
      }
    }
    if (!movedCard) return;

    set({ isLoading: true, error: null });
    try {
      await boardService.moveCard(cardId, targetListId, newPosition);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        // Remover tarjeta de su lista original
        const boardsWithCardRemoved = state.currentBoard.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((c) => c.id !== cardId)
        }));

        // Agregar tarjeta a la lista objetivo
        const finalLists = boardsWithCardRemoved.map((list) => {
          if (list.id === targetListId) {
            const newCards = [...list.cards];
            newCards.splice(newPosition, 0, movedCard!);
            return {
              ...list,
              cards: newCards.map((card, idx) => ({ ...card, position: idx }))
            };
          }
          return list;
        });

        const updatedBoard = { ...state.currentBoard, lists: finalLists };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to move card';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addComment: async (cardId: string, text: string) => {
    set({ isLoading: true, error: null });
    try {
      const newComment = await boardService.createComment(cardId, text);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => {
              if (card.id === cardId) {
                return {
                  ...card,
                  comments: [...(card.comments || []), newComment]
                };
              }
              return card;
            })
          }))
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateComment: async (commentId: string, text: string) => {
    set({ isLoading: true, error: null });
    try {
      await boardService.updateComment(commentId, text);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              comments: (card.comments || []).map((comment) =>
                comment.id === commentId
                  ? { ...comment, text, updatedAt: new Date().toISOString() }
                  : comment
              )
            }))
          }))
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteComment: async (commentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await boardService.deleteComment(commentId);

      set((state) => {
        if (!state.currentBoard) return { isLoading: false };

        const updatedBoard = {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              comments: (card.comments || []).filter(
                (comment) => comment.id !== commentId
              )
            }))
          }))
        };
        return {
          currentBoard: updatedBoard,
          boards: state.boards.map((b) => b.id === state.currentBoard!.id ? updatedBoard : b),
          isLoading: false
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
