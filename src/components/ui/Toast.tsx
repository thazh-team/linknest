
import React, { createContext, useContext, useState, useCallback } from 'react'

type Toast = { id: string; title: string; type?: 'success' | 'error' | 'info' }
const ToastContext = createContext<{ add: (t: Omit<Toast,'id'>) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const add = useCallback((t: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(s => [...s, { ...t, id }])
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), 3500)
  }, [])
  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className="animate-in rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 text-sm shadow-soft-lg flex items-center gap-2">
            <div className={"h-2 w-2 rounded-full " + (t.type==='error' ? 'bg-red-500' : t.type==='success' ? 'bg-green-400' : 'bg-white dark:bg-zinc-900')} />
            {t.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast outside provider')
  return ctx
}
