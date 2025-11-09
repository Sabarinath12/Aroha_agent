import { useState, useEffect, useCallback } from 'react';

export interface ReplitUser {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  url?: string;
  roles?: string;
}

export function useReplitAuth() {
  const [user, setUser] = useState<ReplitUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    const authComplete = (e: MessageEvent) => {
      if (e.data === "auth_complete") {
        window.removeEventListener("message", authComplete);
        window.location.reload();
      }
    };

    window.addEventListener("message", authComplete);

    const w = 350;
    const h = 500;
    const left = screen.width / 2 - w / 2;
    const top = screen.height / 2 - h / 2;

    window.open(
      `https://replit.com/auth_with_repl_site?domain=${location.host}`,
      "_blank",
      `modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
    );
  }, []);

  const logout = useCallback(() => {
    fetch('/api/logout', { method: 'POST' })
      .then(() => {
        setUser(null);
        // Redirect to landing page
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        // Even on error, redirect to landing page
        window.location.href = '/';
      });
  }, []);

  return { user, loading, login, logout };
}
