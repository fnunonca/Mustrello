import React, { useState } from 'react';
import { MessageCircle, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '../common/Button';
import type { Comment } from '../../types';
import { useBoardStore } from '../../store/boardStore';

interface CardCommentsProps {
  cardId: string;
  comments: Comment[];
}

export const CardComments: React.FC<CardCommentsProps> = ({ cardId, comments }) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const addComment = useBoardStore((state) => state.addComment);
  const updateComment = useBoardStore((state) => state.updateComment);
  const deleteComment = useBoardStore((state) => state.deleteComment);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      addComment(cardId, newCommentText);
      setNewCommentText('');
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = (commentId: string) => {
    if (editText.trim()) {
      updateComment(commentId, editText);
      setEditingCommentId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleDelete = (commentId: string) => {
    if (confirm('¿Eliminar este comentario?')) {
      deleteComment(commentId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-gray-700">
        <MessageCircle size={18} />
        <h4 className="font-semibold">Comentarios</h4>
      </div>

      {/* Add new comment form */}
      <form onSubmit={handleAddComment} className="space-y-2">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={3}
        />
        <Button type="submit" size="sm" disabled={!newCommentText.trim()}>
          Comentar
        </Button>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay comentarios aún
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-3 space-y-2"
            >
              {editingCommentId === comment.id ? (
                // Edit mode
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                      title="Guardar"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                      {comment.updatedAt && ' (editado)'}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-white"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-white"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
