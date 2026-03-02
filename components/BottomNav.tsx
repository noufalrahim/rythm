'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Music2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/library', label: 'Library', icon: Library },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { currentSong, isPlaying } = usePlayer();

    return (
        <nav className="bottom-nav">
            {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                    <Link key={href} href={href} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
                        <Icon size={22} className="bottom-nav-icon" strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="bottom-nav-label">{label}</span>
                    </Link>
                );
            })}
            {/* Now Playing shortcut */}
            <button className={`bottom-nav-item ${isPlaying ? 'active' : ''}`}>
                <div className={`now-playing-icon ${isPlaying ? 'playing' : ''}`}>
                    <Music2 size={22} strokeWidth={isPlaying ? 2.5 : 1.8} />
                </div>
                <span className="bottom-nav-label">Playing</span>
            </button>
        </nav>
    );
}
