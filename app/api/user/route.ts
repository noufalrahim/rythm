import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getAuthUser, safeUser } from '@/lib/auth';

export async function PUT(request: Request) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { name, bio, avatar } = await request.json();

        const updated = await User.findByIdAndUpdate(
            authUser._id,
            {
                ...(name && { name: name.trim() }),
                ...(bio !== undefined && { bio }),
                ...(avatar !== undefined && { avatar }),
            },
            { new: true }
        );

        if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json({ user: safeUser(updated as Parameters<typeof safeUser>[0]) });
    } catch {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
