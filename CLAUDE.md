# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mustrello is a Trello-like kanban board application with a React/TypeScript frontend and .NET 10 C# backend.

## Development Commands

### Frontend (from `frontend/` directory)
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript + Vite production build
npm run lint         # ESLint check
npm run preview      # Preview production build
npm run deploy       # Build and deploy to GitHub Pages
```

### Backend (from `backend/` directory)
```bash
dotnet build                                    # Build solution
dotnet run --project Mustrello.API              # Run API (http://localhost:5000)
dotnet ef database update --project Mustrello.Infrastructure --startup-project Mustrello.API
dotnet ef migrations add <Name> --project Mustrello.Infrastructure --startup-project Mustrello.API
```

## Architecture

### Frontend (`frontend/src/`)
- **React 19 + TypeScript + Vite** with Tailwind CSS
- **Zustand** for state management (`store/authStore.ts`, `store/boardStore.ts`)
- **Axios** with interceptors for API calls (`services/api.ts`)
- Components organized by feature: `auth/`, `board/`, `card/`, `list/`, `common/`, `layout/`
- Protected routes via `ProtectedRoute` component
- JWT tokens stored in localStorage

### Backend (`backend/`) - Clean Architecture
- **Mustrello.API**: Controllers (Auth, Boards, Lists, Cards, Comments)
- **Mustrello.Core**: Entities (User, Board, BoardList, Card, Comment) and DTOs
- **Mustrello.Infrastructure**: EF Core DbContext, migrations, AuthService, JwtService

### Data Flow
Frontend Zustand stores → API services (Axios) → Backend controllers → EF Core → SQL Server

## Environment Configuration

### Frontend
- `.env`: `VITE_API_URL=http://localhost:5000/api` (local development)
- `.env.production`: `VITE_API_URL=https://fnunonca.somee.com/api`

### Backend
- `appsettings.json`: Connection strings, JWT secret, CORS origins
- CORS configured for: GitHub Pages (`fnunonca.github.io`), `localhost:5173`, `localhost:3000`

## Key Patterns

- **Authentication**: JWT Bearer tokens with claims-based user identification
- **Database**: EF Core with cascading deletes on board→lists→cards→comments
- **Frontend state**: Zustand stores with localStorage persistence for auth
- **API interceptors**: Auto-inject auth token, redirect to login on 401
- **Drag-and-drop**: @dnd-kit for list and card reordering

## Testing Credentials
- Username: `oasis`
- Password: `oasis`
