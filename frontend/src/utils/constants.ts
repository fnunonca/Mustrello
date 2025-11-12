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
