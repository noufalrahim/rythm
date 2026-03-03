import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword, setAuthCookie, safeUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { name, email, phone, password } = await request.json();

        if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        if (!email && !phone) return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
        if (!password || password.length < 6)
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

        // Check if user already exists
        const existing = await User.findOne(
            email ? { email: email.toLowerCase() } : { phone }
        );
        if (existing) {
            return NextResponse.json({ error: 'An account with this email/phone already exists' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);
        const user = await User.create({
            name: name.trim(),
            email: email?.toLowerCase(),
            phone,
            passwordHash,
        });

        await setAuthCookie(user._id.toString());

        return NextResponse.json({ user: safeUser(user as Parameters<typeof safeUser>[0]) }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
