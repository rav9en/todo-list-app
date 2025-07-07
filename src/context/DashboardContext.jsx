'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { session } = useAuth();

    // Load user's todos when component mounts or user changes
    useEffect(() => {
        if (session?.user) {
            loadUserTodos();
        } else {
            setTodos([]);
            setLoading(false);
        }
    }, [session]);

    // Load todos for the current user
    const loadUserTodos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading todos:', error);
                return;
            }

            setTodos(data || []);
        } catch (error) {
            console.error('Error loading todos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add a new todo
    const addTodo = async (content) => {
        if (!session?.user || !content.trim()) return { success: false, error: 'Invalid input' };

        try {
            const newTodo = {
                content: content.trim(),
                user_id: session.user.id,
            };

            const { data, error } = await supabase
                .from('todos')
                .insert([newTodo])
                .select()
                .single();

            if (error) {
                console.error('Error adding todo:', error);
                return { success: false, error: error.message };
            }

            // Add to local state
            setTodos(prev => [data, ...prev]);
            return { success: true, data };
        } catch (error) {
            console.error('Error adding todo:', error);
            return { success: false, error: error.message };
        }
    };

    // Delete a todo
    const deleteTodo = async (id) => {
        if (!session?.user) return { success: false, error: 'Not authenticated' };

        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id)
                .eq('user_id', session.user.id); // Ensure user can only delete their own todos

            if (error) {
                console.error('Error deleting todo:', error);
                return { success: false, error: error.message };
            }

            // Remove from local state
            setTodos(prev => prev.filter(todo => todo.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting todo:', error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        todos,
        loading,
        addTodo,
        deleteTodo,
        refreshTodos: loadUserTodos
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
