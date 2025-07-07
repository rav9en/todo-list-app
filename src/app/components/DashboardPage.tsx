'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [newTodo, setNewTodo] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { todos, loading, addTodo, deleteTodo } = useDashboard();

  // Check user session and redirect if not logged in
  useEffect(() => {
    if (session === null) {
      console.log('No session found, redirecting to login');
      router.push('/login');
    }
  }, [session, router]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setAddingTodo(true);
    try {
      const result = await addTodo(newTodo);
      if (result.success) {
        setNewTodo('');
      } else {
        console.error('Failed to add todo:', result.error);
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setAddingTodo(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      const result = await deleteTodo(id);
      if (!result.success) {
        console.error('Failed to delete todo:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/login');
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <div className="flex items-center gap-4">
              {session?.user?.email && (
                <span className="text-sm text-gray-600">
                  {session.user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleAddTodo} className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
            />
            <button
              type="submit"
              disabled={addingTodo || !newTodo.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {addingTodo ? 'Adding...' : 'Add Todo'}
            </button>
          </form>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {todos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600">Create your first task to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {todos.map((todo: any) => (
                <div key={todo.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {todo.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(todo.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                    title="Delete todo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{todos.length}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}