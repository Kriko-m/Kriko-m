'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

interface Props {
  naam: string
  isAdmin: boolean
  role?: string
}

export default function PortaalNav({ naam, isAdmin }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // State elements for navigation dropdown & account settings modal
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [displayName, setDisplayName] = useState(naam)
  const [newName, setNewName] = useState(naam)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  // Sync prop changes (if any) to local state
  useEffect(() => {
    setDisplayName(naam)
  }, [naam])

  // Retrieve user email asynchronously
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? '')
        if (user.user_metadata?.naam) {
          setDisplayName(user.user_metadata.naam)
        }
      }
    }
    loadUser()
  }, [supabase])

  // Click outside listener for the profile dropdown
  useEffect(() => {
    if (!dropdownOpen) return
    const closeMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.portaal-profile-container')) {
        setDropdownOpen(false)
      }
    }
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [dropdownOpen])

  async function handleLogout() {
    await supabase.auth.signOut()
    try { localStorage.removeItem('kriko_cart') } catch {}
    router.push('/portaal')
    router.refresh()
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setModalError('')
    setModalSuccess('')
    
    const { error } = await supabase.auth.updateUser({
      data: { naam: newName.trim() }
    })

    if (error) {
      setModalError(error.message)
      setSaving(false)
    } else {
      setModalSuccess('Naam succesvol bijgewerkt!')
      setDisplayName(newName.trim())
      router.refresh()
      setTimeout(() => {
        setShowSettingsModal(false)
        setModalSuccess('')
        setSaving(false)
      }, 1500)
    }
  }

  const links = [
    { href: '/portaal/dashboard', label: '🏠 Dashboard' },
    { href: '/portaal/leiding', label: '🛡️ Leiding' },
    { href: '/portaal/verslagen', label: '📋 Verslagen' },
    { href: '/portaal/archief', label: '📚 Archief' },
    ...(isAdmin ? [{ href: '/portaal/admin', label: '⚙️ Beheer' }] : []),
  ]

  return (
    <>
      <header className="portaal-nav">
        <div className="portaal-nav-container">
          <Link href="/portaal/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <Image src="/images/logo-finaal.png" alt="Kriko-M" width={36} height={36} style={{ objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900, fontSize: '1.1rem', color: '#fff', letterSpacing: '.04em' }}>Portaal</span>
          </Link>

          <nav className="portaal-nav-scroll">
            {links.map(l => {
              const active = pathname.startsWith(l.href)
              return (
                <Link key={l.href} href={l.href}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 50,
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-heading, Nunito, sans-serif)',
                    color: active ? '#C9963A' : 'rgba(255,255,255,.8)',
                    background: active ? 'rgba(201,150,58,0.12)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  }}>
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Profile Dropdown Container */}
            <div className="portaal-profile-container">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`portaal-profile-btn${dropdownOpen ? ' active' : ''}`}
                aria-expanded={dropdownOpen}
              >
                <i className="fa-solid fa-circle-user"></i>
                <span className="profile-btn-name" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName.split(' ')[0]}
                </span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              {dropdownOpen && (
                <div className="portaal-profile-dropdown">
                  <div className="portaal-dropdown-header">
                    <span className="user-name">{displayName}</span>
                    {userEmail && <span className="user-email">{userEmail}</span>}
                  </div>
                  <div className="portaal-dropdown-menu">
                    <Link href="/portaal/dashboard" className="portaal-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span>🏠 Mijn Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        setNewName(displayName)
                        setShowSettingsModal(true)
                      }}
                      className="portaal-dropdown-item"
                    >
                      <span>⚙️ Account Instellingen</span>
                    </button>
                    <div className="portaal-dropdown-divider"></div>
                    <button onClick={handleLogout} className="portaal-dropdown-item" style={{ color: 'var(--color-error)' }}>
                      <span>🚪 Uitloggen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Logout Button */}
            <button
              onClick={handleLogout}
              className="portaal-logout-icon-btn"
              title="Uitloggen"
              aria-label="Uitloggen"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Account Settings Modal */}
      {showSettingsModal && (
        <div className="portaal-modal-overlay">
          <div className="portaal-modal-card">
            <div className="portaal-modal-header">
              <h3 className="portaal-modal-title">⚙️ Account Instellingen</h3>
              <button className="portaal-modal-close" onClick={() => setShowSettingsModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveSettings}>
              <div className="portaal-modal-body">
                {modalError && (
                  <div className="portaal-modal-alert error">
                    {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div className="portaal-modal-alert success">
                    {modalSuccess}
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="settings_display_name">Weergavenaam:</label>
                  <input
                    type="text"
                    id="settings_display_name"
                    className="form-control"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="Voornaam + Achternaam"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="portaal-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowSettingsModal(false)}
                  disabled={saving}
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={saving || !newName.trim()}
                  style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                >
                  {saving ? 'Opslaan…' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
