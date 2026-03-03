import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import dbConnect from './mongodb';
import User, { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'rythm-dev-secret-change-in-production';
const COOKIE_NAME = 'rythm_auth';
const TOKEN_EXPIRY = '7d';

// ─── JWT ────────────────────────────────────────────────────────────────────

export function signToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded;
    } catch {
        return null;
    }
}

// ─── Password ────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ─── Cookie helpers ──────────────────────────────────────────────────────────

export async function setAuthCookie(userId: string) {
    const token = signToken(userId);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
    return token;
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

// ─── Get current user from cookie ────────────────────────────────────────────

export async function getAuthUser(): Promise<IUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        if (!token) return null;

        const decoded = verifyToken(token);
        if (!decoded) return null;

        await dbConnect();
        const user = await User.findById(decoded.userId).select('-passwordHash').lean();
        return user as IUser | null;
    } catch {
        return null;
    }
}

export async function requireAuth(): Promise<IUser> {
    const user = await getAuthUser();
    if (!user) throw new Error('UNAUTHORIZED');
    return user;
}

// ─── Safe user shape (no passwordHash) ───────────────────────────────────────

export function safeUser(user: IUser) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
    };
}
