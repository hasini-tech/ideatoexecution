export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { route, json, bad, body } from '@/lib/api';
import { signToken, setAuthCookie, publicUser } from '@/lib/auth';
import User from '@/models/User';

export const POST = route(async (req) => {
  await connectDB();
  const b = await body(req);
  const user = await User.findOne({ email: String(b.email || '').trim().toLowerCase() });
  const ok = user && (await bcrypt.compare(String(b.password || ''), user.passwordHash));
  if (!ok) return bad('Incorrect email or password.', 401);
  setAuthCookie(await signToken(user._id));
  return json({ user: publicUser(user) });
}, { auth: false });
