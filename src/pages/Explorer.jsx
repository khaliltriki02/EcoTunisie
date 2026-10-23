import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProvider } from '../services/provider'
import { CATEGORIES, descendantsOf, isA, label } from '../ontology/schema'
import { EntityCard, Icon } from '../components/ui'

export default function Explorer() {
  const P = getProvider()
  const [sp, setSp] = useSearchParams()
  const cat = sp.get('cat') || 'Activité'
  const [type, setType] = useState('')
  const [dest, setDest] = useState('')
  const [maxPrix, setMaxPrix] = useState(200)
  const [minEco, setMinEco] = useState(0)
  const [q, setQ] = useState('')

  const types = useMemo(() => {
    const present = new Set(P.all().map((e) => e.type))
    return descendantsOf(cat).filter((c) => present.has(c) || descendantsOf(c).some((d) => present.has(d)))
  }, [cat])

  const items = useMemo(
    () =>
      P.query({ cls: type || cat, dest: dest || undefined })
        .filter((e) => (e.prix == null || e.prix <= maxPrix) && (e.eco ?? 1) >= minEco)
        .filter((e) => e.nom.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => (b.eco ?? 0) - (a.eco ?? 0)),
    [cat, type, dest, maxPrix, minEco, q],
  )

  return (
    <>
      <h1>Explorer</h1>
      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button key={c} className={c === cat ? 'on' : ''} onClick={() => { setSp({ cat: c }); setType('') }}>
            <Icon name={c} size={16} /> {c === 'LieuTouristique' ? 'Lieux' : c}
          </button>
        ))}
      </div>

      <div className="filters">
        <div className="search-input"><Icon name="Search" size={17} /><input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          {types.map((t) => <option key={t} value={t}>{label(t)}</option>)}
        </select>
        {cat !== 'Destination' && (
          <select value={dest} onChange={(e) => setDest(e.target.value)}>
            <option value="">Toutes destinations</option>
            {P.destinations().map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        )}
        <label>Prix max {maxPrix} TND<input type="range" min="0" max="200" step="5" value={maxPrix} onChange={(e) => setMaxPrix(+e.target.value)} /></label>
        <label>Éco-score min {Math.round(minEco * 100)}<input type="range" min="0" max="0.95" step="0.05" value={minEco} onChange={(e) => setMinEco(+e.target.value)} /></label>
      </div>

      <p className="muted">{items.length} résultat(s) — requête subsumption-aware sur la classe <code>{type || cat}</code></p>
      <div className="grid">
        {items.map((e) =>
          isA(e.type, 'Destination') ? <DestCard key={e.id} d={e} /> : <EntityCard key={e.id} e={e} />,
        )}
      </div>
    </>
  )
}

import { Link } from 'react-router-dom'
export function DestCard({ d }) {
  return (
    <Link to={`/destination/${d.id}`} className="card link">
      <div className="card-top"><span className="ico"><Icon name="Destination" /></span><span className="tag">{label(d.type)}</span></div>
      <h3>{d.nom}</h3>
      <p className="muted">{d.region} · {d.saison}</p>
      <p>{d.desc}</p>
    </Link>
  )
}
