'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, PlusCircle, Music4 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { currentSong } = usePlayer();

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/search', label: 'Search', icon: Search },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <Music4 size={28} style={{ color: 'var(--green)' }} />
                <span className="sidebar-logo-text">Rythm</span>
            </div>

            {/* Main nav */}
            <nav className="sidebar-nav">
                {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link key={href} href={href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-divider" />

            {/* Library */}
            <div className="sidebar-section">
                <div className="sidebar-section-header">
                    <div className="sidebar-nav-item" style={{ cursor: 'default' }}>
                        <Library size={22} />
                        <span>Your Library</span>
                    </div>
                    <button className="sidebar-icon-btn" title="Create playlist">
                        <PlusCircle size={20} />
                    </button>
                </div>

                <Link href="/library" className={`sidebar-nav-item sidebar-nav-item-sm ${pathname === '/library' ? 'active' : ''}`}>
                    <div className="sidebar-playlist-thumb" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)' }}>
                        <span style={{ fontSize: '10px', color: 'white', fontWeight: 700 }}>♥</span>
                    </div>
                    <div>
                        <div className="sidebar-playlist-name">Liked Songs</div>
                        <div className="sidebar-playlist-sub">Playlist</div>
                    </div>
                </Link>
            </div>

            {/* Now playing footer */}
            {currentSong && (
                <div className="sidebar-footer">
                    <div className="sidebar-now-playing">
                        <div className="sidebar-np-dot" />
                        <div className="sidebar-np-text">
                            <div className="sidebar-np-title">{currentSong.title}</div>
                            <div className="sidebar-np-artist">{currentSong.artist?.name}</div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
