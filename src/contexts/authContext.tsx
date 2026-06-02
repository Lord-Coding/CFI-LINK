import { createContext } from "react";
import { User } from "../lib/store";

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => { 
        success: boolean;
        error?: string; 
    };
    logout: () => void;
    refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);