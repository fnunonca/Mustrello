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
        required
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
