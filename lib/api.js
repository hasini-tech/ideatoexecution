import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

export const json = (data, status = 200) => NextResponse.json(data, { status });
export const bad = (message, status = 400) => json({ error: message }, status);
export async function body(req) {
  try { return await req.json(); } catch { return {}; }
}

/** Wraps a route handler: auth check + consistent error handling. */
export function route(handler, { auth = true } = {}) {
  return async (req, ctx) => {
    try {
      let user = null;
      if (auth) {
        user = await getCurrentUser();
        if (!user) return bad('Please sign in again.', 401);
      }
      return await handler(req, ctx, user);
    } catch (e) {
      if (e.name === 'CastError') return bad('Not found', 404);
      if (e.name === 'ValidationError') return bad(Object.values(e.errors)[0]?.message || 'Invalid data');
      console.error(e);
      return bad(e.message || 'Server error', 500);
    }
  };
}
