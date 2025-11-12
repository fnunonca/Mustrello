# Plan para Clon de Trello - Mustrello

## 📋 Resumen del Proyecto

Crear una aplicación web completa tipo Trello con las siguientes tecnologías:
- **Frontend**: React con TypeScript, Vite, Tailwind CSS
- **Backend**: C# .NET 8 Web API con Clean Architecture
- **Base de Datos**: SQL Server 2019
- **Autenticación**: JWT con ASP.NET Core Identity

---

## 🏗️ Estructura del Proyecto

```
Mustang_Trello/
├── README.md
├── PLAN.md
├── .gitignore
├── docker-compose.yml
├── docs/
│   ├── architecture.md
│   ├── api-documentation.md
│   └── setup-guide.md
├── src/
│   ├── backend/
│   │   ├── Mustrello.sln
│   │   ├── Mustrello.API/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   ├── Program.cs
│   │   │   └── appsettings.json
│   │   ├── Mustrello.Core/
│   │   │   ├── Entities/
│   │   │   ├── Interfaces/
│   │   │   ├── Services/
│   │   │   └── DTOs/
│   │   ├── Mustrello.Infrastructure/
│   │   │   ├── Data/
│   │   │   ├── Repositories/
│   │   │   ├── Identity/
│   │   │   └── Migrations/
│   │   └── Mustrello.Tests/
│   │       ├── Unit/
│   │       └── Integration/
│   └── frontend/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── public/
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── services/
│           ├── hooks/
│           ├── contexts/
│           ├── types/
│           ├── utils/
│           └── App.tsx
└── scripts/
    ├── setup-database.sql
    └── seed-data.sql
```

---

## 🎯 Componentes del Backend (.NET 8)

### Arquitectura en Capas (Clean Architecture)

#### **Mustrello.Core** (Capa de Dominio)
**Entidades:**
- `User` - Usuario del sistema (ASP.NET Identity)
- `Board` - Tablero de trabajo
- `List` - Lista dentro de un tablero
- `Card` - Tarjeta dentro de una lista
- `BoardMember` - Relación usuario-tablero (permisos)
- `CardComment` - Comentarios en tarjetas
- `CardAttachment` - Archivos adjuntos en tarjetas

**DTOs (Data Transfer Objects):**
- Request/Response models para API endpoints
- LoginRequest, RegisterRequest
- BoardDto, ListDto, CardDto
- CreateBoardRequest, UpdateCardRequest, etc.

**Interfaces:**
- `IRepository<T>` - Repositorio genérico
- `IAuthService` - Autenticación y autorización
- `IBoardService` - Lógica de negocio para tableros
- `IListService` - Lógica de negocio para listas
- `ICardService` - Lógica de negocio para tarjetas
- `IUnitOfWork` - Patrón Unit of Work

**Enums:**
- `UserRole` (Owner, Admin, Member, Guest)
- `BoardPermission` (Read, Write, Delete)
- `CardPriority` (Low, Medium, High, Critical)

#### **Mustrello.Infrastructure** (Capa de Infraestructura)
**Data:**
- `ApplicationDbContext` - DbContext de Entity Framework Core
- Configuraciones de entidades (Fluent API)
- Migraciones de base de datos

**Repositories:**
- Implementación de repositorios
- `BoardRepository`, `ListRepository`, `CardRepository`
- Patrón Unit of Work

**Identity:**
- Configuración de ASP.NET Core Identity
- JWT token generation y validación
- Custom user claims

#### **Mustrello.API** (Capa de Presentación)
**Controllers:**
- `AuthController` - Login, registro, refresh token
- `BoardsController` - CRUD de tableros
- `ListsController` - CRUD de listas
- `CardsController` - CRUD de tarjetas
- `UsersController` - Perfil y configuración de usuario

**Middleware:**
- Exception handling global
- JWT authentication
- Request/Response logging
- CORS configuration

**Configuraciones:**
- Swagger/OpenAPI documentation
- FluentValidation para validación de requests
- AutoMapper para mapeo de DTOs
- Serilog para logging
- Rate limiting
- Health checks

### NuGet Packages Necesarios
```xml
<!-- Entity Framework Core -->
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" />

<!-- Identity & Authentication -->
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" />

<!-- Utilities -->
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" />
<PackageReference Include="FluentValidation.AspNetCore" />
<PackageReference Include="Serilog.AspNetCore" />
<PackageReference Include="Swashbuckle.AspNetCore" />
```

---

## 💻 Componentes del Frontend (React)

### Estructura de Carpetas

#### **Pages** (Páginas principales)
- `LoginPage.tsx` - Página de inicio de sesión
- `RegisterPage.tsx` - Página de registro
- `DashboardPage.tsx` - Vista general de tableros del usuario
- `BoardPage.tsx` - Vista detallada de un tablero
- `ProfilePage.tsx` - Perfil y configuración del usuario
- `NotFoundPage.tsx` - Página 404

#### **Components** (Componentes reutilizables)

**Authentication:**
- `LoginForm.tsx` - Formulario de login
- `RegisterForm.tsx` - Formulario de registro
- `ProtectedRoute.tsx` - HOC para rutas protegidas

**Board:**
- `BoardCard.tsx` - Tarjeta de tablero en dashboard
- `BoardList.tsx` - Lista de tableros
- `CreateBoardModal.tsx` - Modal para crear tablero
- `BoardHeader.tsx` - Cabecera del tablero
- `BoardSettings.tsx` - Configuración del tablero

**List:**
- `ListContainer.tsx` - Contenedor de lista (droppable)
- `ListHeader.tsx` - Cabecera de lista con título
- `CreateList.tsx` - Formulario para nueva lista
- `ListMenu.tsx` - Menú de opciones de lista

**Card:**
- `CardItem.tsx` - Tarjeta individual (draggable)
- `CardDetailModal.tsx` - Modal con detalles completos
- `CreateCardForm.tsx` - Formulario para nueva tarjeta
- `CardComments.tsx` - Sección de comentarios
- `CardAttachments.tsx` - Gestión de archivos adjuntos

**Layout:**
- `Navbar.tsx` - Barra de navegación superior
- `Sidebar.tsx` - Barra lateral (opcional)
- `Header.tsx` - Encabezado de página
- `Footer.tsx` - Pie de página

**Common:**
- `Button.tsx` - Componente de botón
- `Input.tsx` - Input reutilizable
- `Modal.tsx` - Modal genérico
- `Dropdown.tsx` - Menú desplegable
- `Avatar.tsx` - Avatar de usuario
- `LoadingSpinner.tsx` - Indicador de carga
- `ErrorBoundary.tsx` - Manejo de errores

#### **Services** (Servicios API)
- `api.ts` - Configuración de Axios
- `authService.ts` - Login, registro, logout, refresh
- `boardService.ts` - CRUD de tableros
- `listService.ts` - CRUD de listas
- `cardService.ts` - CRUD de tarjetas

#### **Hooks** (Custom Hooks)
- `useAuth.ts` - Hook de autenticación
- `useBoards.ts` - Hook para gestión de tableros
- `useLists.ts` - Hook para listas
- `useCards.ts` - Hook para tarjetas
- `useDragAndDrop.ts` - Lógica de drag & drop

#### **Contexts**
- `AuthContext.tsx` - Contexto de autenticación
- `ThemeContext.tsx` - Tema claro/oscuro (opcional)

#### **Types**
- `auth.types.ts` - Tipos de autenticación
- `board.types.ts` - Tipos de tableros
- `card.types.ts` - Tipos de tarjetas
- `api.types.ts` - Tipos de respuestas API

### NPM Packages Necesarios
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "@tanstack/react-query": "^5.24.1",
    "zustand": "^4.5.1",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "react-hook-form": "^7.50.1",
    "zod": "^3.22.4",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.4",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "eslint": "^8.56.0",
    "prettier": "^3.2.5"
  }
}
```

---

## 🗄️ Esquema de Base de Datos (SQL Server 2019)

### Tablas Principales

#### **AspNetUsers** (Identity - gestiona ASP.NET Core Identity)
```sql
- Id (uniqueidentifier, PK)
- UserName (nvarchar)
- Email (nvarchar)
- PasswordHash (nvarchar)
- FirstName (nvarchar)
- LastName (nvarchar)
- CreatedAt (datetime2)
- UpdatedAt (datetime2)
```

#### **Boards**
```sql
- Id (uniqueidentifier, PK)
- Name (nvarchar(200), NOT NULL)
- Description (nvarchar(1000))
- CreatedBy (uniqueidentifier, FK -> AspNetUsers.Id)
- CreatedAt (datetime2, DEFAULT GETUTCDATE())
- UpdatedAt (datetime2)
- IsArchived (bit, DEFAULT 0)
```

#### **BoardMembers**
```sql
- Id (uniqueidentifier, PK)
- BoardId (uniqueidentifier, FK -> Boards.Id)
- UserId (uniqueidentifier, FK -> AspNetUsers.Id)
- Role (nvarchar(50)) -- Owner, Admin, Member, Guest
- JoinedAt (datetime2, DEFAULT GETUTCDATE())
- UNIQUE(BoardId, UserId)
```

#### **Lists**
```sql
- Id (uniqueidentifier, PK)
- BoardId (uniqueidentifier, FK -> Boards.Id)
- Name (nvarchar(200), NOT NULL)
- Position (int, NOT NULL)
- CreatedAt (datetime2, DEFAULT GETUTCDATE())
- UpdatedAt (datetime2)
- IsArchived (bit, DEFAULT 0)
```

#### **Cards**
```sql
- Id (uniqueidentifier, PK)
- ListId (uniqueidentifier, FK -> Lists.Id)
- Title (nvarchar(500), NOT NULL)
- Description (nvarchar(max))
- Position (int, NOT NULL)
- DueDate (datetime2, NULL)
- Priority (nvarchar(50)) -- Low, Medium, High, Critical
- CreatedBy (uniqueidentifier, FK -> AspNetUsers.Id)
- CreatedAt (datetime2, DEFAULT GETUTCDATE())
- UpdatedAt (datetime2)
- IsArchived (bit, DEFAULT 0)
```

#### **CardComments**
```sql
- Id (uniqueidentifier, PK)
- CardId (uniqueidentifier, FK -> Cards.Id)
- UserId (uniqueidentifier, FK -> AspNetUsers.Id)
- Comment (nvarchar(max), NOT NULL)
- CreatedAt (datetime2, DEFAULT GETUTCDATE())
- UpdatedAt (datetime2)
```

#### **CardAttachments**
```sql
- Id (uniqueidentifier, PK)
- CardId (uniqueidentifier, FK -> Cards.Id)
- FileName (nvarchar(255), NOT NULL)
- FilePath (nvarchar(500), NOT NULL)
- FileSize (bigint)
- UploadedBy (uniqueidentifier, FK -> AspNetUsers.Id)
- UploadedAt (datetime2, DEFAULT GETUTCDATE())
```

### Índices Recomendados
```sql
-- Mejorar rendimiento de consultas frecuentes
CREATE INDEX IX_Lists_BoardId ON Lists(BoardId);
CREATE INDEX IX_Cards_ListId ON Cards(ListId);
CREATE INDEX IX_CardComments_CardId ON Cards(CardId);
CREATE INDEX IX_BoardMembers_UserId ON BoardMembers(UserId);
CREATE INDEX IX_BoardMembers_BoardId ON BoardMembers(BoardId);
```

---

## 🚀 Fases de Implementación

### **Fase 1: Setup Inicial del Backend** ⚙️
**Objetivo:** Configurar la base del proyecto .NET 8

**Tareas:**
1. Crear solución `.sln` y proyectos de clase
2. Configurar referencias entre proyectos
3. Instalar NuGet packages necesarios
4. Crear archivo `appsettings.json` con connection string
5. Configurar Entity Framework Core
6. Crear entidades en `Mustrello.Core/Entities`
7. Crear `ApplicationDbContext` en `Mustrello.Infrastructure`
8. Generar migración inicial
9. Aplicar migración a SQL Server

**Comandos:**
```bash
dotnet new sln -n Mustrello
dotnet new webapi -n Mustrello.API
dotnet new classlib -n Mustrello.Core
dotnet new classlib -n Mustrello.Infrastructure
dotnet new xunit -n Mustrello.Tests
```

---

### **Fase 2: Autenticación y Seguridad** 🔐
**Objetivo:** Implementar sistema de login seguro

**Tareas:**
1. Configurar ASP.NET Core Identity en `ApplicationDbContext`
2. Crear servicio de JWT tokens (`JwtService`)
3. Implementar `AuthService` (login, register, refresh)
4. Crear `AuthController` con endpoints:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/auth/refresh`
   - `POST /api/auth/logout`
5. Configurar middleware de autenticación JWT
6. Añadir validación con FluentValidation
7. Configurar CORS para permitir frontend
8. Implementar hash de contraseñas (Identity lo maneja)

**Configuración JWT en appsettings.json:**
```json
{
  "JwtSettings": {
    "Secret": "your-secret-key-min-32-characters",
    "Issuer": "Mustrello.API",
    "Audience": "Mustrello.Client",
    "ExpirationInMinutes": 60
  }
}
```

---

### **Fase 3: API Core - CRUD Completo** 📡
**Objetivo:** Implementar toda la lógica de negocio

**Tareas:**
1. Implementar repositorios genéricos y específicos
2. Crear servicios de negocio:
   - `BoardService`
   - `ListService`
   - `CardService`
3. Implementar DTOs y AutoMapper profiles
4. Crear controladores REST:
   - `BoardsController`
   - `ListsController`
   - `CardsController`
5. Añadir autorización (solo miembros del board pueden editarlo)
6. Implementar paginación para listas grandes
7. Configurar Swagger para documentación
8. Añadir logging con Serilog

**Endpoints principales:**
```
# Boards
GET    /api/boards                    # Listar tableros del usuario
GET    /api/boards/{id}               # Obtener tablero específico
POST   /api/boards                    # Crear nuevo tablero
PUT    /api/boards/{id}               # Actualizar tablero
DELETE /api/boards/{id}               # Eliminar tablero

# Lists
GET    /api/boards/{boardId}/lists    # Listar listas de un tablero
POST   /api/boards/{boardId}/lists    # Crear nueva lista
PUT    /api/lists/{id}                # Actualizar lista
DELETE /api/lists/{id}                # Eliminar lista

# Cards
GET    /api/lists/{listId}/cards      # Listar tarjetas de una lista
POST   /api/lists/{listId}/cards      # Crear nueva tarjeta
PUT    /api/cards/{id}                # Actualizar tarjeta
DELETE /api/cards/{id}                # Eliminar tarjeta
PATCH  /api/cards/{id}/move           # Mover tarjeta entre listas
```

---

### **Fase 4: Setup del Frontend** ⚛️
**Objetivo:** Inicializar aplicación React

**Tareas:**
1. Crear proyecto React con Vite:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   ```
2. Instalar dependencias necesarias
3. Configurar Tailwind CSS
4. Configurar TypeScript (`tsconfig.json`)
5. Configurar ESLint y Prettier
6. Crear estructura de carpetas
7. Configurar React Router
8. Configurar Axios con interceptores
9. Setup de React Query para cache
10. Crear archivo `.env` para variables

**Variables de entorno (.env):**
```
VITE_API_URL=https://localhost:7001/api
VITE_APP_NAME=Mustrello
```

---

### **Fase 5: UI de Autenticación** 🔑
**Objetivo:** Implementar login y registro

**Tareas:**
1. Crear `AuthContext` con estado global
2. Implementar `authService.ts`:
   - login(), register(), logout()
   - Guardar token en localStorage
3. Crear componentes:
   - `LoginForm.tsx`
   - `RegisterForm.tsx`
   - `ProtectedRoute.tsx`
4. Crear páginas:
   - `LoginPage.tsx`
   - `RegisterPage.tsx`
5. Configurar rutas en React Router
6. Implementar interceptor de Axios para agregar token
7. Manejar refresh de token automático
8. Añadir validación de formularios con react-hook-form + zod

---

### **Fase 6: Dashboard y Tableros** 📊
**Objetivo:** Crear vista principal de tableros

**Tareas:**
1. Crear `DashboardPage.tsx`
2. Implementar `boardService.ts`
3. Crear componentes:
   - `BoardCard.tsx` - Tarjeta visual del tablero
   - `BoardList.tsx` - Grid de tableros
   - `CreateBoardModal.tsx`
4. Implementar hook `useBoards` con React Query
5. Añadir funcionalidad de crear tablero
6. Implementar búsqueda de tableros
7. Añadir estados de loading y error
8. Implementar eliminación de tableros

---

### **Fase 7: Vista de Tablero con Drag & Drop** 🎯
**Objetivo:** Implementar la vista principal tipo Trello

**Tareas:**
1. Crear `BoardPage.tsx`
2. Configurar `@dnd-kit` para drag and drop
3. Crear componentes:
   - `ListContainer.tsx` (columna droppable)
   - `CardItem.tsx` (tarjeta draggable)
   - `CreateList.tsx`
   - `CreateCardForm.tsx`
4. Implementar lógica de drag & drop:
   - Mover tarjetas dentro de la misma lista
   - Mover tarjetas entre listas
   - Reordenar listas
5. Implementar actualización optimista (UI update inmediato)
6. Sincronizar cambios con backend
7. Añadir animaciones suaves
8. Implementar scroll horizontal para listas

---

### **Fase 8: Detalles de Tarjeta** 🃏
**Objetivo:** Modal completo con toda la información

**Tareas:**
1. Crear `CardDetailModal.tsx`
2. Implementar edición inline de título y descripción
3. Añadir selector de fecha de vencimiento
4. Implementar sistema de comentarios:
   - `CardComments.tsx`
   - Crear/editar/eliminar comentarios
5. Añadir selector de prioridad
6. Implementar archivos adjuntos (opcional)
7. Mostrar historial de actividad (opcional)
8. Añadir miembros asignados a tarjeta (opcional)

---

### **Fase 9: Polish y Optimización** ✨
**Objetivo:** Mejorar UX y rendimiento

**Tareas:**
1. Añadir loading states en todas las acciones
2. Implementar error boundaries
3. Añadir toast notifications para feedback
4. Implementar skeleton loaders
5. Optimizar imágenes y assets
6. Lazy loading de componentes pesados
7. Implementar debounce en búsquedas
8. Añadir temas (claro/oscuro) opcional
9. Hacer diseño responsive (mobile-first)
10. Optimizar bundle size

---

### **Fase 10: Testing y Documentación** 🧪
**Objetivo:** Asegurar calidad y documentar

**Tareas:**
1. Escribir pruebas unitarias para servicios (backend)
2. Pruebas de integración para API
3. Pruebas de componentes React (Vitest + Testing Library)
4. Documentar API con Swagger
5. Crear archivo README con instrucciones
6. Documentar arquitectura en `docs/architecture.md`
7. Crear guía de contribución
8. Añadir scripts de deployment
9. Configurar CI/CD (opcional)

---

## 🔐 Consideraciones de Seguridad

### Backend
- ✅ Password hashing con ASP.NET Identity
- ✅ JWT tokens con expiración
- ✅ Validación de entrada con FluentValidation
- ✅ Autorización basada en roles/permisos
- ✅ SQL injection prevention (EF Core parametrizado)
- ✅ CORS configurado correctamente
- ✅ HTTPS enforcement en producción
- ✅ Rate limiting para prevenir abuso
- ✅ Secrets en variables de entorno

### Frontend
- ✅ Tokens en httpOnly cookies (mejor) o localStorage
- ✅ Validación de formularios
- ✅ Sanitización de HTML en comentarios
- ✅ XSS prevention
- ✅ CSRF tokens si es necesario
- ✅ Timeout de sesión
- ✅ No exponer información sensible en console.log

---

## 🐳 Docker Configuration (Opcional)

### docker-compose.yml
```yaml
version: '3.8'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      ACCEPT_EULA: Y
      SA_PASSWORD: YourStrong@Password123
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql

volumes:
  sqlserver-data:
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Bibliotecas Útiles
- [React Query Docs](https://tanstack.com/query/latest)
- [dnd-kit Documentation](https://docs.dndkit.com)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com)

---

## 🎯 Características Futuras (Post-MVP)

### Nivel 1 (Corto Plazo)
- Búsqueda global de tarjetas
- Etiquetas/labels con colores
- Filtros por prioridad, fecha, etiqueta
- Notificaciones de vencimiento
- Exportar tablero a JSON/PDF

### Nivel 2 (Mediano Plazo)
- Notificaciones en tiempo real (SignalR/WebSockets)
- Invitación de usuarios por email
- Templates de tableros
- Checklists dentro de tarjetas
- Power-ups / Integraciones

### Nivel 3 (Largo Plazo)
- App móvil (React Native)
- Modo offline con sincronización
- Inteligencia artificial para sugerencias
- Analytics y reportes
- API pública para integraciones

---

## 📝 Notas Importantes

1. **Versionado semántico**: Usar Git tags para versiones
2. **Commits**: Mensajes descriptivos en inglés o español consistente
3. **Code reviews**: Implementar PRs antes de mergear a main
4. **Environments**: Development, Staging, Production
5. **Backups**: Backup automático de base de datos
6. **Monitoring**: Logs centralizados y alertas
7. **Performance**: Lazy loading, caching, CDN para assets

---

**Última actualización:** 2025-11-11
**Versión del plan:** 1.0.0
