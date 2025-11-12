# Plan Frontend Standalone - Mustrello (Sin Backend)

## 📋 Objetivo

Crear una aplicación React funcional que simule un clon de Trello con:
- **Login hardcodeado**: Usuario `oasis` / Contraseña `oasis`
- **Gestión de tableros**: Crear, ver, editar y eliminar tableros
- **Gestión de listas**: Crear, editar y eliminar listas dentro de tableros
- **Gestión de tarjetas**: Crear, editar y eliminar tarjetas dentro de listas
- **Drag & Drop**: Mover tarjetas entre listas
- **Persistencia local**: Datos guardados en localStorage

---

## 🎯 Tecnologías

- **React 18** con TypeScript
- **Vite** como build tool
- **React Router DOM** para navegación
- **Tailwind CSS** para estilos
- **@dnd-kit** para drag and drop
- **Zustand** para state management
- **React Hook Form** + **Zod** para validación
- **localStorage** para persistencia de datos

---

## 🏗️ Estructura del Proyecto

```
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env
├── public/
│   └── vite.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── PageHeader.tsx
    │   ├── board/
    │   │   ├── BoardCard.tsx
    │   │   ├── BoardList.tsx
    │   │   └── CreateBoardModal.tsx
    │   ├── list/
    │   │   ├── ListContainer.tsx
    │   │   ├── ListHeader.tsx
    │   │   └── CreateListForm.tsx
    │   ├── card/
    │   │   ├── CardItem.tsx
    │   │   ├── CreateCardForm.tsx
    │   │   └── CardDetailModal.tsx
    │   └── common/
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Modal.tsx
    │       └── LoadingSpinner.tsx
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── DashboardPage.tsx
    │   └── BoardPage.tsx
    ├── store/
    │   ├── authStore.ts
    │   ├── boardStore.ts
    │   └── types.ts
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useLocalStorage.ts
    ├── utils/
    │   ├── constants.ts
    │   └── helpers.ts
    └── types/
        ├── auth.types.ts
        ├── board.types.ts
        └── index.ts
```

---

## 📦 Instalación y Configuración

### Paso 1: Crear proyecto con Vite

```bash
# Crear proyecto React con TypeScript
npm create vite@latest frontend -- --template react-ts

# Entrar al directorio
cd frontend

# Instalar dependencias base
npm install
```

### Paso 2: Instalar dependencias necesarias

```bash
# UI y Estilos
npm install tailwindcss postcss autoprefixer
npm install clsx tailwind-merge
npm install lucide-react  # Para iconos

# Routing
npm install react-router-dom

# State Management
npm install zustand

# Forms y Validación
npm install react-hook-form zod @hookform/resolvers

# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Utilidades
npm install date-fns uuid

# TypeScript types
npm install -D @types/uuid
```

### Paso 3: Configurar Tailwind CSS

```bash
npx tailwindcss init -p
```

**tailwind.config.js:**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

### Paso 4: Configurar variables de entorno

**.env:**
```
VITE_APP_NAME=Mustrello
VITE_HARDCODED_USER=oasis
VITE_HARDCODED_PASSWORD=oasis
```

---

## 🔧 Implementación por Fases

### **Fase 1: Configuración Base y Tipos** ⚙️

#### 1.1 Definir tipos TypeScript

**src/types/auth.types.ts:**
```typescript
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
```

**src/types/board.types.ts:**
```typescript
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

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
}
```

**src/types/index.ts:**
```typescript
export * from './auth.types';
export * from './board.types';
```

#### 1.2 Crear constantes

**src/utils/constants.ts:**
```typescript
export const HARDCODED_CREDENTIALS = {
  username: import.meta.env.VITE_HARDCODED_USER || 'oasis',
  password: import.meta.env.VITE_HARDCODED_PASSWORD || 'oasis',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'mustrello_auth_token',
  USER: 'mustrello_user',
  BOARDS: 'mustrello_boards',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  BOARD: '/board/:id',
};
```

---

### **Fase 2: State Management con Zustand** 🗄️

#### 2.1 Store de Autenticación

**src/store/authStore.ts:**
```typescript
import { create } from 'zustand';
import { User } from '../types';
import { STORAGE_KEYS, HARDCODED_CREDENTIALS } from '../utils/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (username: string, password: string) => {
    if (
      username === HARDCODED_CREDENTIALS.username &&
      password === HARDCODED_CREDENTIALS.password
    ) {
      const user: User = {
        id: '1',
        username: 'oasis',
        email: 'oasis@mustrello.com',
      };

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-123');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    set({ user: null, isAuthenticated: false });
  },

  initAuth: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);

    if (token && userStr) {
      const user = JSON.parse(userStr);
      set({ user, isAuthenticated: true });
    }
  },
}));
```

#### 2.2 Store de Tableros

**src/store/boardStore.ts:**
```typescript
import { create } from 'zustand';
import { Board, List, Card } from '../types';
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
      let sourceListId = '';

      // Encontrar y remover la tarjeta de su lista original
      const boardsWithCardRemoved = state.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) => {
          const cardIndex = list.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            movedCard = { ...list.cards[cardIndex], listId: targetListId };
            sourceListId = list.id;
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

  saveToLocalStorage: () => {
    const { boards } = get();
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  },
}));
```

---

### **Fase 3: Componentes Comunes** 🧩

#### 3.1 Button Component

**src/components/common/Button.tsx:**
```typescript
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500':
            variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400':
            variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
            variant === 'danger',
          'bg-transparent hover:bg-gray-100 text-gray-700':
            variant === 'ghost',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### 3.2 Input Component

**src/components/common/Input.tsx:**
```typescript
import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
            {
              'border-gray-300': !error,
              'border-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

#### 3.3 Modal Component

**src/components/common/Modal.tsx:**
```typescript
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
```

---

### **Fase 4: Autenticación** 🔐

#### 4.1 Login Form

**src/components/auth/LoginForm.tsx:**
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(username, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <Input
        label="Usuario"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="oasis"
        required
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="oasis"
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" className="w-full">
        Iniciar Sesión
      </Button>
      <p className="text-sm text-gray-600 text-center">
        Usuario: <strong>oasis</strong> | Contraseña: <strong>oasis</strong>
      </p>
    </form>
  );
};
```

#### 4.2 Protected Route

**src/components/auth/ProtectedRoute.tsx:**
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

#### 4.3 Login Page

**src/pages/LoginPage.tsx:**
```typescript
import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mustrello</h1>
          <p className="text-gray-600">Organiza tus proyectos</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
```

---

### **Fase 5: Dashboard y Tableros** 📊

#### 5.1 Navbar

**src/components/layout/Navbar.tsx:**
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <LayoutDashboard size={24} />
              <span className="text-xl font-bold">Mustrello</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hola, {user?.username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={18} className="mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

#### 5.2 Board Card

**src/components/board/BoardCard.tsx:**
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, List } from 'lucide-react';
import { Board } from '../../types';
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
```

#### 5.3 Create Board Modal

**src/components/board/CreateBoardModal.tsx:**
```typescript
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createBoard = useBoardStore((state) => state.createBoard);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createBoard(name, description);
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Tablero">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Tablero"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Proyecto Marketing"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu tablero..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Crear Tablero</Button>
        </div>
      </form>
    </Modal>
  );
};
```

#### 5.4 Dashboard Page

**src/pages/DashboardPage.tsx:**
```typescript
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
```

---

### **Fase 6: Vista de Tablero con Drag & Drop** 🎯

*(Continuará en siguiente sección...)*

#### 6.1 Card Item

**src/components/card/CardItem.tsx:**
```typescript
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Card } from '../../types';
import { useBoardStore } from '../../store/boardStore';

interface CardItemProps {
  card: Card;
}

export const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const deleteCard = useBoardStore((state) => state.deleteCard);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar la tarjeta "${card.title}"?`)) {
      deleteCard(card.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 mb-2 border border-gray-200 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{card.title}</h4>
          {card.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>
        <div className="flex items-center ml-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 6.2 Create Card Form

**src/components/card/CreateCardForm.tsx:**
```typescript
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';

interface CreateCardFormProps {
  listId: string;
}

export const CreateCardForm: React.FC<CreateCardFormProps> = ({ listId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createCard = useBoardStore((state) => state.createCard);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createCard(listId, title, description);
      setTitle('');
      setDescription('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
      >
        <Plus size={16} className="mr-2" />
        Añadir tarjeta
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la tarjeta"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        autoFocus
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        rows={2}
      />
      <div className="flex space-x-2">
        <Button type="submit" size="sm">
          Añadir
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setTitle('');
            setDescription('');
          }}
        >
          <X size={16} />
        </Button>
      </div>
    </form>
  );
};
```

#### 6.3 List Container

**src/components/list/ListContainer.tsx:**
```typescript
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { List } from '../../types';
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
```

#### 6.4 List Header

**src/components/list/ListHeader.tsx:**
```typescript
import React, { useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { List } from '../../types';
import { useBoardStore } from '../../store/boardStore';

interface ListHeaderProps {
  list: List;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ list }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);

  const { updateList, deleteList } = useBoardStore();

  const handleSubmit = () => {
    if (name.trim() && name !== list.name) {
      updateList(list.id, name);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar la lista "${list.name}"?`)) {
      deleteList(list.id);
    }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      {isEditing ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') {
              setName(list.name);
              setIsEditing(false);
            }
          }}
          className="flex-1 px-2 py-1 border border-primary-500 rounded focus:outline-none"
          autoFocus
        />
      ) : (
        <h3
          onClick={() => setIsEditing(true)}
          className="font-semibold text-gray-900 flex-1 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
        >
          {list.name}
        </h3>
      )}

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
        >
          <MoreVertical size={18} />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar lista
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

#### 6.5 Create List Form

**src/components/list/CreateListForm.tsx:**
```typescript
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';

interface CreateListFormProps {
  boardId: string;
}

export const CreateListForm: React.FC<CreateListFormProps> = ({ boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const createList = useBoardStore((state) => state.createList);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createList(boardId, name);
      setName('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg p-3 w-80 flex-shrink-0 transition-all flex items-center justify-center text-gray-700 font-medium"
      >
        <Plus size={20} className="mr-2" />
        Añadir lista
      </button>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la lista"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
          required
        />
        <div className="flex space-x-2">
          <Button type="submit" size="sm">
            Añadir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setName('');
            }}
          >
            <X size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};
```

#### 6.6 Board Page con Drag & Drop

**src/pages/BoardPage.tsx:**
```typescript
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { ListContainer } from '../components/list/ListContainer';
import { CreateListForm } from '../components/list/CreateListForm';
import { Button } from '../components/common/Button';
import { useBoardStore } from '../store/boardStore';
import { Card } from '../types';

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
```

---

### **Fase 7: Router y App Principal** 🚏

#### 7.1 App.tsx

**src/App.tsx:**
```typescript
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BoardPage } from './pages/BoardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/board/:id"
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

#### 7.2 main.tsx

**src/main.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🚀 Comandos para Iniciar

```bash
# 1. Entrar al directorio del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173

# Login con:
# Usuario: oasis
# Contraseña: oasis
```

---

## ✅ Checklist de Implementación

### Configuración Inicial
- [ ] Crear proyecto con Vite
- [ ] Instalar todas las dependencias
- [ ] Configurar Tailwind CSS
- [ ] Configurar TypeScript

### Autenticación
- [ ] Crear store de autenticación
- [ ] Implementar LoginForm
- [ ] Crear ProtectedRoute
- [ ] Crear LoginPage

### Dashboard
- [ ] Crear Navbar
- [ ] Crear BoardCard
- [ ] Crear CreateBoardModal
- [ ] Crear DashboardPage

### Tableros y Listas
- [ ] Crear store de tableros
- [ ] Implementar ListContainer
- [ ] Implementar ListHeader
- [ ] Crear CreateListForm

### Tarjetas y Drag & Drop
- [ ] Crear CardItem
- [ ] Crear CreateCardForm
- [ ] Configurar @dnd-kit
- [ ] Implementar lógica de drag & drop
- [ ] Crear BoardPage completa

### Polish Final
- [ ] Añadir transiciones y animaciones
- [ ] Mejorar responsive design
- [ ] Añadir manejo de errores
- [ ] Probar todas las funcionalidades

---

## 🎯 Funcionalidades Completadas

### ✅ Autenticación
- Login con credenciales hardcodeadas (oasis/oasis)
- Persistencia de sesión en localStorage
- Rutas protegidas
- Logout funcional

### ✅ Tableros
- Crear tableros
- Ver lista de tableros
- Eliminar tableros
- Navegación a tablero específico

### ✅ Listas
- Crear listas dentro de tableros
- Editar nombre de listas
- Eliminar listas

### ✅ Tarjetas
- Crear tarjetas dentro de listas
- Eliminar tarjetas
- Drag & drop entre listas
- Título y descripción

### ✅ Persistencia
- Todos los datos se guardan en localStorage
- Los datos persisten al recargar la página

---

## 📝 Notas Importantes

1. **Sin Backend**: Esta versión no necesita backend, todo funciona con localStorage
2. **Datos de prueba**: Los datos solo existen en el navegador del usuario
3. **Login hardcodeado**: Usuario `oasis` / Contraseña `oasis`
4. **Responsive**: La interfaz se adapta a diferentes tamaños de pantalla
5. **Drag & Drop**: Las tarjetas se pueden mover entre listas arrastrándolas

---

## 🔄 Próximos Pasos (Opcional)

1. Añadir modal de detalles de tarjeta
2. Implementar comentarios en tarjetas
3. Añadir fechas de vencimiento
4. Implementar búsqueda de tarjetas
5. Añadir etiquetas de colores
6. Modo oscuro/claro
7. Exportar tablero a JSON
8. Importar tablero desde JSON

---

**Última actualización:** 2025-11-11
**Versión:** 1.0.0 - Frontend Standalone
