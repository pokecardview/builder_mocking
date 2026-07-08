'use client';
import { useEffect, useState } from 'react';
export function useAnonymousUser() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let id = localStorage.getItem('prodcoach_user_id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('prodcoach_user_id', id); }
    setUserId(id);
  }, []);
  return userId;
}
