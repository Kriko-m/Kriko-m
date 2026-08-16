'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

interface Props {
  naam: string
  role?: string
}

interface AccountInfo {
  id: string | null
  role: 'leiding' | 'groepsleiding'
  email: string
  naam: string
}

export default function PortaalNav({ naam, role }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'
  const isHomePage = pathname === '/portaal/home' || pathname === '/portaal/leiding' || pathname === '/portaal/home/' || pathname === '/portaal/leiding/'

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [displayName, setDisplayName] = useState(naam)
  
  // Account Management State (Groepsleiding)
  const [accounts, setAccounts] = useState<AccountInfo[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [editingRole, setEditingRole] = useState<'leiding' | 'groepsleiding'>('leiding')
  const [editName, setEditName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  useEffect(() => {
    setDisplayName(naam)
  }, [naam])

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.naam) {
        setDisplayName(user.user_metadata.naam)
      }
    }
    loadUser()
  }, [supabase])

  // Click outside listener for profile dropdown
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

  async function openAccountModal() {
    setDropdownOpen(false)
    setShowAccountsModal(true)
    setLoadingAccounts(true)
    setModalError('')
    setModalSuccess('')

    try {
      const res = await fetch('/api/admin/accounts')
      const data = await res.json()
      if (data.accounts) {
        setAccounts(data.accounts)
        const target = data.accounts.find((a: AccountInfo) => a.role === editingRole)
        if (target) setEditName(target.naam)
      }
    } catch {
      setModalError('Kon accountgegevens niet laden.')
    } finally {
      setLoadingAccounts(false)
    }
  }

  function handleSelectRoleToEdit(roleType: 'leiding' | 'groepsleiding') {
    setEditingRole(roleType)
    setEditPassword('')
    setModalError('')
    setModalSuccess('')
    const target = accounts.find(a => a.role === roleType)
    if (target) setEditName(target.naam)
  }

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault()
    setSavingAccount(true)
    setModalError('')
    setModalSuccess('')

    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editingRole,
          newName: editName,
          newPassword: editPassword || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setModalError(data.error || 'Fout bij opslaan van account.')
      } else {
        setModalSuccess(`Account voor ${editingRole === 'leiding' ? 'Leiding' : 'Groepsleiding'} succesvol bijgewerkt!`)
        setEditPassword('')
        // Refresh accounts list
        const listRes = await fetch('/api/admin/accounts')
        const listData = await listRes.json()
        if (listData.accounts) setAccounts(listData.accounts)
        router.refresh()
      }
    } catch {
      setModalError('Netwerkfout bij opslaan.')
    } finally {
      setSavingAccount(false)
    }
  }

  return (
    <>
      <header className="portaal-nav">
        <div className="portaal-nav-container">
          
          {/* Left: Clean Brand Title */}
          <Link
            href="/portaal/home"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0,
              padding: '4px 0',
            }}
            title="Leidingportaal"
          >
            <span style={{
              fontFamily: 'var(--font-heading, Nunito, sans-serif)',
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.05em',
              lineHeight: 1,
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              Leidingportaal
            </span>
          </Link>

          {/* Center: Centered Nav Tabs (Hidden on Home Page to prevent duplication with main cards) */}
          {!isHomePage && (
            <nav className="portaal-nav-center-tabs">
              {/* 1. Kriko Echo */}
              <Link
                href="/portaal/echos"
                className={`portaal-nav-tab${pathname === '/portaal/echos' ? ' active' : ''}`}
              >
                <i className="fa-solid fa-newspaper"></i>
                <span>Kriko Echo</span>
              </Link>

              {/* 2. Documenten & Links */}
              <Link
                href="/portaal/algemene-info"
                className={`portaal-nav-tab${pathname === '/portaal/algemene-info' ? ' active' : ''}`}
              >
                <i className="fa-solid fa-folder-open"></i>
                <span>Documenten &amp; Links</span>
              </Link>

              {/* 3. Kalender */}
              <Link
                href="/portaal/leiding/agenda"
                className={`portaal-nav-tab${pathname === '/portaal/leiding/agenda' ? ' active' : ''}`}
              >
                <i className="fa-solid fa-calendar-days"></i>
                <span>Kalender</span>
              </Link>

              {/* 4. Website Beheer — Enkel voor Groepsleiding */}
              {isGroepsleiding && (
                <Link
                  href="/portaal/website-beheer"
                  className={`portaal-nav-tab${pathname === '/portaal/website-beheer' ? ' active' : ''}`}
                >
                  <i className="fa-solid fa-globe"></i>
                  <span>Website Beheer</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right: Actions & User Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Duidelijke Terug naar website knop */}
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.86rem',
                fontWeight: 700,
                transition: 'background 0.15s ease',
              }}
              title="Terug naar de publieke website"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Terug naar website</span>
            </Link>

            {/* Account Profile Dropdown */}
            <div className="portaal-profile-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                title="Account menu"
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: dropdownOpen ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  cursor: 'pointer',
                  fontSize: '1.15rem',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <i className="fa-solid fa-user"></i>
              </button>

              {dropdownOpen && (
                <div
                  className="portaal-profile-dropdown"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 230,
                    background: '#ffffff',
                    borderRadius: 16,
                    boxShadow: '0 12px 32px rgba(26,61,42,0.2)',
                    border: '1.5px solid #C2D9C9',
                    overflow: 'hidden',
                    zIndex: 100,
                    animation: 'dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Account Info Header */}
                  <div style={{ padding: '14px 16px', background: '#EEF5F1', borderBottom: '1px solid #C2D9C9' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6A8A75', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Ingelogd als
                    </span>
                    <strong style={{ display: 'block', fontSize: '0.98rem', fontWeight: 800, color: '#1A3D2A', marginTop: 2, fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
                      {displayName || (isGroepsleiding ? 'Groepsleiding' : 'Leiding')}
                    </strong>
                    <span style={{ display: 'inline-block', marginTop: 4, fontSize: '0.72rem', fontWeight: 700, color: '#1A3D2A', background: 'rgba(26,61,42,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                      {isGroepsleiding ? 'Groepsleiding' : 'Leiding'}
                    </span>
                  </div>

                  <div style={{ padding: '6px' }}>
                    {isGroepsleiding && (
                      <button
                        onClick={openAccountModal}
                        className="portaal-dropdown-item"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 10,
                          background: 'none',
                          border: 'none',
                          color: '#1A3D2A',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <i className="fa-solid fa-users-gear" style={{ color: '#6A8A75' }}></i>
                        <span>Accountbeheer</span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="portaal-dropdown-item"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: 'none',
                        border: 'none',
                        color: '#B91C1C',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <i className="fa-solid fa-right-from-bracket"></i>
                      <span>Uitloggen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Account Management Modal for Groepsleiding */}
      {showAccountsModal && (
        <div className="portaal-modal-overlay">
          <div className="portaal-modal-card" style={{ maxWidth: 540 }}>
            <div className="portaal-modal-header">
              <h3 className="portaal-modal-title">👥 Accountbeheer — Rollen & Wachtwoorden</h3>
              <button className="portaal-modal-close" onClick={() => setShowAccountsModal(false)}>&times;</button>
            </div>
            
            {loadingAccounts ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#1A3D2A', fontWeight: 600 }}>Accounts laden…</div>
            ) : (
              <form onSubmit={handleSaveAccount}>
                <div className="portaal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {modalError && <div className="portaal-modal-alert error">{modalError}</div>}
                  {modalSuccess && <div className="portaal-modal-alert success">{modalSuccess}</div>}

                  <div style={{ fontSize: '0.86rem', color: '#6A8A75' }}>
                    Selecteer hieronder het account dat je wilt bewerken (naam of wachtwoord aanpassen):
                  </div>

                  {/* Selector between the 2 accounts */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleSelectRoleToEdit('leiding')}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        border: editingRole === 'leiding' ? '2px solid #1A3D2A' : '1.5px solid #E2E8F0',
                        background: editingRole === 'leiding' ? '#EEF5F1' : '#FAFAFA',
                        color: '#1A3D2A',
                        fontWeight: editingRole === 'leiding' ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      Leiding
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRoleToEdit('groepsleiding')}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        border: editingRole === 'groepsleiding' ? '2px solid #1A3D2A' : '1.5px solid #E2E8F0',
                        background: editingRole === 'groepsleiding' ? '#EEF5F1' : '#FAFAFA',
                        color: '#1A3D2A',
                        fontWeight: editingRole === 'groepsleiding' ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      Groepsleiding
                    </button>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Weergavenaam voor {editingRole === 'leiding' ? 'Leiding' : 'Groepsleiding'}:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      placeholder="Bijv. Leiding Kriko-M"
                      disabled={savingAccount}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nieuw Wachtwoord (laat leeg om ongewijzigd te laten):</label>
                    <input
                      type="password"
                      className="form-control"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Nieuw wachtwoord (minstens 6 tekens)"
                      disabled={savingAccount}
                    />
                  </div>
                </div>

                <div className="portaal-modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowAccountsModal(false)}
                    disabled={savingAccount}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    Sluiten
                  </button>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={savingAccount || !editName.trim()}
                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                  >
                    {savingAccount ? 'Opslaan…' : 'Wijzigingen Opslaan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
