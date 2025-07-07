'use client';

import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);

    // Sign up
    const signUpNewUser = async ({email, password}) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Error signing up:", error);
            return {success: false, error: error.message};
        }

        return { success: true, data };
    };

    // Sign in
    const signInUser = async ({email, password}) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) {
                console.error("Error signing in:", error);
                return { success: false, error: error.message };
            }
            console.log("Sign-in successful:", data);
            return { success: true, data };
        } catch (error) {
            console.error("Error signing in:", error);
            return { success: false, error: error.message };
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
        });
    }, []);

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            return { success: false, error: error.message };
        }
        setSession(null);
        return { success: true };
    };

    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signInUser, signOut}}> 
        {children} 
        </AuthContext.Provider>
    );  
};

export const useAuth = () => {
    return useContext(AuthContext);
};