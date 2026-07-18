'use client';

import React, { createContext, useContext, ReactNode } from 'react';

const AppContext = createContext<Record<string, never>>({});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}

export function useFirebase() {
  return useContext(AppContext);
}
