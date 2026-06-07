'use client'
import { useState } from 'react'

const STATUS_OPTIES = ['pending', 'waiting_approval', 'paid', 'completed', 'cancelled']
const STATUS_LABELS: Record<string, string> = {
  pending: 'Wachten op betaling',
  waiting_approval: 'Betaling gemeld',
  paid: 'Betaald',
  completed: 'Geleverd',
  cancelled: 'Geannuleerd',
}
const STATUS_KLEUREN: Record<string, string> = {
  pending: '#BE8A2E', waiting_approval: '#C9963A', paid: '#3F7D5A', completed: '#8A9A8A', cancelled: '#B23A4D',
}

type Tab = 'bestellingen' | 'berichten' | 'instellingen'

export default function AdminTabs({ orders: initialOrders, messages: initialMessages, settings: initialSettings }: {
  orders: any[]
  messages: any[]
  settings: any
}) {
  const [tab, setTab] = useState<Tab>('bestellingen')
  const [orders, setOrders] = useState(initialOrders)
  const [messages, setMessages] = useState(initialMessages)
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')

  const onreadMessages = messages.filter(m => !m.read).length

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  async function updateOrderStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      showFlash('Status bijgewerkt.')
    }
  }

  async function markMessageRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
  }

  async function deleteMessage(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd)
    body.alert_active = (fd.get('alert_active') === 'on').toString()
    const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      const data = await res.json()
      setSettings(data)
      showFlash('Instellingen opgeslagen.')
    }
    setSaving(false)
  }

  const tabStyle = (t: Tab) => ({
    padding: '10px 18px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer',
    background: tab === t ? '#1A3D2A' : '#EEF5F1', color: tab === t ? '#fff' : '#3A5A42',
  })

  return (
    <div>
      {flash && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '.88rem' }}>
          {flash}
        </div>
      )}

      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button style={tabStyle('bestellingen')} onClick={() => setTab('bestellingen')}>
          📦 Bestellingen <span style={{ marginLeft: 4, background: '#C9963A', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: '.72rem' }}>{orders.length}</span>
        </button>
        <button style={tabStyle('berichten')} onClick={() => setTab('berichten')}>
          💬 Berichten {onreadMessages > 0 && <span style={{ marginLeft: 4, background: '#B23A4D', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: '.72rem' }}>{onreadMessages}</span>}
        </button>
        <button style={tabStyle('instellingen')} onClick={() => setTab('instellingen')}>⚙️ Instellingen</button>
      </div>

      {/* ── BESTELLINGEN ── */}
      {tab === 'bestellingen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.length === 0 && <p style={{ color: '#6A8A75' }}>Geen bestellingen.</p>}
          {orders.map(order => {
            const st = STATUS_LABELS[order.status] ?? order.status
            const kleur = STATUS_KLEUREN[order.status] ?? '#888'
            const date = order.created_at ? new Date(order.created_at).toLocaleDateString('nl-BE') : ''
            const items: any[] = order.items ?? []
            return (
              <div key={order.id} style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <strong style={{ color: '#1A3D2A' }}>{order.order_ref}</strong>
                    <span style={{ marginLeft: 10, fontSize: '.8rem', color: '#6A8A75' }}>{date}</span>
                    <div style={{ fontSize: '.85rem', color: '#3A5A42', marginTop: 4 }}>
                      {order.customer_name} — {order.child_name} ({order.child_tak})
                    </div>
                    <div style={{ fontSize: '.82rem', color: '#6A8A75' }}>{order.email}</div>
                    <div style={{ fontSize: '.85rem', marginTop: 6, color: '#3A5A42' }}>
                      {items.map((i: any) => `${i.quantity}× ${i.name} (${i.size})`).join(', ')}
                    </div>
                    <div style={{ fontWeight: 700, color: '#1A3D2A', marginTop: 4 }}>€{Number(order.total).toFixed(2).replace('.', ',')}</div>
                    {order.communication && (
                      <div style={{ fontSize: '.8rem', color: '#6A8A75', marginTop: 4 }}>
                        Mededeling: <code style={{ fontWeight: 700 }}>{order.communication}</code>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.76rem', fontWeight: 700, background: `${kleur}22`, color: kleur }}>{st}</span>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      style={{ padding: '6px 10px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.82rem', cursor: 'pointer' }}
                    >
                      {STATUS_OPTIES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── BERICHTEN ── */}
      {tab === 'berichten' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && <p style={{ color: '#6A8A75' }}>Geen berichten.</p>}
          {messages.map(msg => (
            <div key={msg.id} style={{ background: msg.read ? '#f8faf9' : '#fff', border: `1.5px solid ${msg.read ? '#C2D9C9' : '#2A5C3F'}`, borderRadius: 14, padding: '16px 20px', opacity: msg.read ? .7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div>
                  <strong style={{ color: '#1A3D2A' }}>{msg.name}</strong>
                  <span style={{ marginLeft: 8, fontSize: '.82rem', color: '#6A8A75' }}>{msg.email}</span>
                  {!msg.read && <span style={{ marginLeft: 8, padding: '2px 8px', background: '#2A5C3F', color: '#fff', borderRadius: 20, fontSize: '.7rem', fontWeight: 700 }}>Nieuw</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!msg.read && (
                    <button onClick={() => markMessageRead(msg.id)} style={{ padding: '4px 10px', border: '1px solid #2A5C3F', borderRadius: 6, background: 'none', color: '#2A5C3F', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}>Gelezen</button>
                  )}
                  <button onClick={() => deleteMessage(msg.id)} style={{ padding: '4px 10px', border: '1px solid #B23A4D', borderRadius: 6, background: 'none', color: '#B23A4D', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}>Verwijder</button>
                </div>
              </div>
              {msg.subject && <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#3A5A42', marginBottom: 4 }}>{msg.subject}</div>}
              <div style={{ fontSize: '.88rem', color: '#3A5A42', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.message}</div>
              <div style={{ fontSize: '.75rem', color: '#6A8A75', marginTop: 8 }}>{msg.created_at ? new Date(msg.created_at).toLocaleString('nl-BE') : ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── INSTELLINGEN ── */}
      {tab === 'instellingen' && (
        <form onSubmit={saveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, maxWidth: 800 }}>
          {[
            { name: 'scouts_year', label: 'Scoutsjaar', placeholder: '2026-2027' },
            { name: 'bank_iban', label: 'Bank IBAN', placeholder: 'BE76 1234 5678 9012' },
            { name: 'bank_bic', label: 'Bank BIC', placeholder: 'KRIKOBE2B' },
            { name: 'bank_holder', label: 'Rekeninghouder', placeholder: 'Scouts Kriko-M vzw' },
            { name: 'contact_email', label: 'Contact e-mail', placeholder: 'groepsleiding@kriko-m.be' },
            { name: 'contact_phone', label: 'Contact telefoon', placeholder: '+32 3 776 00 00' },
          ].map(f => (
            <div key={f.name}>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>{f.label}</label>
              <input name={f.name} defaultValue={settings?.[f.name] ?? ''} placeholder={f.placeholder}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Aankondigingsbanner</label>
            <input name="alert_message" defaultValue={settings?.alert_message ?? ''} placeholder="Tekst van de banner (leeg = geen banner)"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #C2D9C9', borderRadius: 10, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box', marginBottom: 10 }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.88rem', fontWeight: 600, color: '#1A3D2A' }}>
              <input type="checkbox" name="alert_active" defaultChecked={settings?.alert_active} />
              Banner tonen op de website
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={saving}
              style={{ padding: '12px 28px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Opslaan…' : 'Instellingen opslaan'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
