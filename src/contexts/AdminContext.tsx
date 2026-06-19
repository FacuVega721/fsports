import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AdminCtx {
  isAdmin: boolean;
  loadingAuth: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AdminCtx>({
  isAdmin: false,
  loadingAuth: true,
  login: async () => false,
  logout: async () => {},
});

const DEV_KEY = 'fsports_admin_dev';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    if (import.meta.env.DEV) {
      setIsAdmin(sessionStorage.getItem(DEV_KEY) === 'true');
      setLoadingAuth(false);
      return;
    }
    fetch('/admin/verify')
      .then((r) => r.json())
      .then((d: { ok: boolean }) => setIsAdmin(Boolean(d.ok)))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoadingAuth(false));
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    if (import.meta.env.DEV) {
      const devPin = import.meta.env.VITE_ADMIN_PIN ?? '0000';
      if (pin === devPin) {
        sessionStorage.setItem(DEV_KEY, 'true');
        setIsAdmin(true);
        return true;
      }
      return false;
    }
    try {
      const r = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const d = (await r.json()) as { ok: boolean };
      if (d.ok) setIsAdmin(true);
      return Boolean(d.ok);
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    if (import.meta.env.DEV) {
      sessionStorage.removeItem(DEV_KEY);
      setIsAdmin(false);
      return;
    }
    await fetch('/admin/logout', { method: 'POST' });
    setIsAdmin(false);
  }, []);

  return (
    <Ctx.Provider value={{ isAdmin, loadingAuth, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  return useContext(Ctx);
}
