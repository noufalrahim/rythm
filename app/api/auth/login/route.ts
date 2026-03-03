import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { comparePassword, setAuthCookie, safeUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email)
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        if (!password)
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json({ error: 'No account found with this email' }, { status: 401 });
        }

        const valid = await comparePassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }

        await setAuthCookie(user._id.toString());

        return NextResponse.json({ user: safeUser(user as Parameters<typeof safeUser>[0]) });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
