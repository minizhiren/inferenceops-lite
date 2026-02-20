import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export default function AppLayout() {
    const { session, logout } = useAuth()
    const { pathname } = useLocation()

    const isActive = (p: string) => pathname === p

    return (
        <div style={{ minHeight: '100vh', background: '#0b0b0b', color: '#fff' }}>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: '#0f0f0f',
                    borderBottom: '1px solid #222',
                    padding: '0 10px'
                }}
            >
                <div
                    style={{
                        height: 56,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                    }}
                >
                    {/* left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link to="/tasks" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                            InferenceOps Lite
                        </Link>
                        <span style={{ opacity: 0.5, fontSize: 12 }}>Internal Console</span>
                    </div>

                    {/* middle nav */}
                    <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                        <NavLink to="/tasks" active={isActive('/tasks')} label="Tasks" />
                        <NavLink to="/submit" active={isActive('/submit')} label="Submit" />

                        {session?.user.role === 'admin' && (
                            <NavLink to="/admin/nodes" active={isActive('/admin/nodes')} label="Admin Nodes" />
                        )}
                    </div>

                    {/* right */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '0 0 auto' }}>
                        <div style={{ opacity: 0.85, fontSize: 13 }}>
                            {session?.user.name} ({session?.user.role})
                        </div>
                        <button
                            onClick={logout}
                            style={{
                                padding: '8px 10px',
                                borderRadius: 10,
                                border: '1px solid #333',
                                background: '#111',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* page body */}
            <div style={{ width: '100%', padding: '0px' }}>
                <Outlet />
            </div>
        </div>
    )
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
    return (
        <Link
            to={to}
            style={{
                textDecoration: 'none',
                color: '#fff',
                padding: '8px 10px',
                borderRadius: 10,
                border: active ? '1px solid #3b82f6' : '1px solid transparent',
                background: active ? '#0b1b3a' : 'transparent',
                opacity: active ? 1 : 0.85,
            }}
        >
            {label}
        </Link>
    )
}
