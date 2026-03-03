'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, PlusCircle, Music4, LogIn, ChevronRight } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import AuthModal from '@/components/AuthModal';
import PlaylistModal from '@/components/PlaylistModal';
import Image from 'next/image';

interface Playlist {
    _id: string;
    name: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const { currentSong } = usePlayer();
    const { user } = useAuth();
    const { registerRefresh } = useSidebar();
    const [showAuth, setShowAuth] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/search', label: 'Search', icon: Search },
    ];

    const fetchPlaylists = useCallback(async () => {
        if (!user) return;
        const res = await fetch('/api/playlists');
        const data = await res.json();
        setPlaylists(data.playlists || []);
    }, [user]);

    // Fetch playlists whenever user changes (login/logout)
    useEffect(() => {
        if (user) {
            fetchPlaylists();
        } else {
            setPlaylists([]);
        }
    }, [user, fetchPlaylists]);

    // Register the fetch function so other pages can trigger a refresh
    useEffect(() => {
        registerRefresh(fetchPlaylists);
    }, [registerRefresh, fetchPlaylists]);

    const handleCreatePlaylist = async (data: { name: string; description: string }) => {
        const res = await fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        await fetchPlaylists();
    };

    return (
        <>
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
                        {user && (
                            <button
                                className="sidebar-icon-btn"
                                title="Create playlist"
                                onClick={() => setShowCreate(true)}
                            >
                                <PlusCircle size={20} />
                            </button>
                        )}
                    </div>

                    {/* Liked Songs */}
                    <Link href="/library" className={`sidebar-nav-item sidebar-nav-item-sm ${pathname === '/library' ? 'active' : ''}`}>
                        <div className="sidebar-playlist-thumb" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)' }}>
                            <span style={{ fontSize: '10px', color: 'white', fontWeight: 700 }}>♥</span>
                        </div>
                        <div>
                            <div className="sidebar-playlist-name">Liked Songs</div>
                            <div className="sidebar-playlist-sub">Playlist</div>
                        </div>
                    </Link>

                    {/* User playlists */}
                    {user && playlists.map(pl => (
                        <Link key={pl._id} href={`/playlist/${pl._id}`} className={`sidebar-nav-item sidebar-nav-item-sm ${pathname === `/playlist/${pl._id}` ? 'active' : ''}`}>
                            <div className="sidebar-playlist-thumb" style={{ background: 'linear-gradient(135deg, #1DB954, #0a7a35)' }}>
                                <span style={{ fontSize: '10px', color: 'white', fontWeight: 700 }}>🎵</span>
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div className="sidebar-playlist-name">{pl.name}</div>
                                <div className="sidebar-playlist-sub">Playlist</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* User footer */}
                <div className="sidebar-footer">
                    {user ? (
                        <Link href="/profile" className="sidebar-user-card">
                            <div className="sidebar-user-avatar" style={{ flexShrink: 0 }}>
                                {user.avatar
                                    ? <Image src={user.avatar} alt={user.name} width={36} height={36} style={{ objectFit: 'cover', borderRadius: '50%', width: '100%', height: '100%' }} unoptimized />
                                    : user.name.charAt(0).toUpperCase()
                                }
                            </div>
                            <div className="sidebar-user-info" style={{ overflow: 'hidden', minWidth: 0 }}>
                                <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                                <div className="sidebar-playlist-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                            </div>
                            <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)', flexShrink: 0 }} />
                        </Link>
                    ) : (
                        <button className="btn-primary btn-full" style={{ width: '100%' }} onClick={() => setShowAuth(true)}>
                            <LogIn size={16} /> Sign in
                        </button>
                    )}

                    {/* Now playing */}
                    {currentSong && (
                        <div className="sidebar-now-playing" style={{ marginTop: 8 }}>
                            <div className="sidebar-np-dot" />
                            <div className="sidebar-np-text">
                                <div className="sidebar-np-title">{currentSong.title}</div>
                                <div className="sidebar-np-artist">{currentSong.artist?.name}</div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            {showCreate && (
                <PlaylistModal mode="create" onClose={() => setShowCreate(false)} onSave={handleCreatePlaylist} />
            )}
        </>
    );
}
