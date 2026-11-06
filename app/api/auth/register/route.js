export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { route, json, bad, body } from '@/lib/api';
import { signToken, setAuthCookie, publicUser } from '@/lib/auth';
import User from '@/models/User';

export const POST = route(async (req) => {
  await connectDB();
  const b = await body(req);
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');
  if (!name) return bad('Please enter your name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad('Please enter a valid email address.');
  if (password.length < 8) return bad('Password must be at least 8 characters.');
  if (await User.findOne({ email })) return bad('An account with this email already exists.', 409);

  let timezone = 'Asia/Kolkata';
  try {
    if (b.timezone) { new Intl.DateTimeFormat('en', { timeZone: b.timezone }); timezone = b.timezone; }
  } catch {}
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), timezone });
  setAuthCookie(await signToken(user._id));
  return json({ user: publicUser(user) }, 201);
}, { auth: false });
