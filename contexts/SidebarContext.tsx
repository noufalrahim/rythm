'use client';

import React, { createContext, useContext, useRef, useCallback } from 'react';

interface SidebarContextType {
    /** Call this from any page to make the sidebar immediately refetch playlists */
    refreshPlaylists: () => void;
    /** Called by Sidebar to register its fetch function */
    registerRefresh: (fn: () => void) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const refreshFnRef = useRef<(() => void) | null>(null);

    const registerRefresh = useCallback((fn: () => void) => {
        refreshFnRef.current = fn;
    }, []);

    const refreshPlaylists = useCallback(() => {
        refreshFnRef.current?.();
    }, []);

    return (
        <SidebarContext.Provider value={{ refreshPlaylists, registerRefresh }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const ctx = useContext(SidebarContext);
    if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
    return ctx;
}
