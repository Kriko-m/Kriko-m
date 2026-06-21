'use client'
import { useState } from 'react'
import { Verslag } from '@/lib/types'

const TAK_KLEUREN: Record<string, string> = {
  kapoenen: '#F4C842',
  welpen: '#5D9E6C',
  jonggivers: '#E07B1A',
  givers: '#1A3FB5',
  alle: '#1A3D2A',
}

export default function VerslagenClient({ verslagen }: { verslagen: Verslag[] }) {
  const [search, setSearch] = useState('')
  const [filterTak, setFilterTak] = useState('alle-takken')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = verslagen.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
                          (v.content && v.content.toLowerCase().includes(search.toLowerCase())) ||
                          (v.author && v.author.toLowerCase().includes(search.toLowerCase()))
    const matchesTak = filterTak === 'alle-takken' || v.tak === filterTak
    return matchesSearch && matchesTak
  })

  // Group by year
  const grouped: Record<string, Verslag[]> = {}
  filtered.forEach(v => {
    const year = v.date ? v.date.substring(0, 4) : 'Onbekend'
    grouped[year] = grouped[year] || []
    grouped[year].push(v)
  })

  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div>
      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Zoek op titel of inhoud..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 14px',
            border: '1.5px solid #C2D9C9',
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: '.9rem',
            outline: 'none',
          }}
        />
        <select
          value={filterTak}
          onChange={e => setFilterTak(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1.5px solid #C2D9C9',
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: '.9rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="alle-takken">📁 Alle takken</option>
          <option value="alle">👥 Iedereen (Alle)</option>
          <option value="kapoenen">💛 Kapoenen</option>
          <option value="welpen">💚 Welpen</option>
          <option value="jonggivers">💙 Jonggivers</option>
          <option value="givers">🤎 Givers</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6A8A75' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📋</div>
          <p>Geen verslagen gevonden die voldoen aan de filters.</p>
        </div>
      ) : (
        years.map(year => (
          <div key={year} style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#1A3D2A',
                borderLeft: '4px solid #C9963A',
                paddingLeft: 12,
                marginBottom: 16,
                fontFamily: 'var(--font-heading, Nunito, sans-serif)',
              }}
            >
              Jaar {year}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grouped[year].map(v => {
                const isExpanded = expandedId === v.id
                const kleur = TAK_KLEUREN[v.tak] || '#888'
                const formattedDate = v.date
                  ? new Date(v.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
                  : ''

                return (
                  <div
                    key={v.id}
                    style={{
                      background: '#fff',
                      border: '1.5px solid #C2D9C9',
                      borderRadius: 14,
                      boxShadow: '0 2px 10px rgba(0,0,0,.03)',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {/* Header: Clickable trigger */}
                    <div
                      onClick={() => toggleExpand(v.id)}
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: '#1A3D2A12',
                            color: '#1A3D2A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                          }}
                        >
                          📝
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '.98rem',
                              color: '#1A3D2A',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {v.title}
                          </div>
                          <div
                            style={{
                              fontSize: '.8rem',
                              color: '#6A8A75',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginTop: 2,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span>📅 {formattedDate}</span>
                            {v.author && <span>· 👤 {v.author}</span>}
                            <span
                              style={{
                                padding: '2px 8px',
                                background: `${kleur}22`,
                                color: kleur,
                                borderRadius: 12,
                                fontSize: '.68rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                display: 'inline-block',
                              }}
                            >
                              {v.tak}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                          fontSize: '1rem',
                          color: '#6A8A75',
                          fontWeight: 'bold',
                        }}
                      >
                        ▼
                      </div>
                    </div>

                    {/* Content view (visible when expanded) */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: '0 20px 20px',
                          borderTop: '1px solid #EEF5F1',
                          background: '#fcfdfd',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '.9rem',
                            color: '#2C4A35',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            paddingTop: 16,
                          }}
                        >
                          {v.content || (
                            <span style={{ fontStyle: 'italic', color: '#6A8A75' }}>
                              Geen gedetailleerde inhoud opgegeven voor dit verslag.
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
