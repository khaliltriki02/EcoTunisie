import { Link } from 'react-router-dom'
import { label, rootOf } from '../ontology/schema'
import { ecoPractices } from '../data/kb'
import { getProvider } from '../services/provider'

const paths = {
  Destination: <><path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2.3" /></>,
  Hébergement: <><path d="M3 19v-7h18v7M3 16h18M6 12V8h5a3 3 0 0 1 3 3v1" /><path d="M3 19v2m18-2v2" /></>,
  Activité: <><path d="m5 20 5-8 3 3 4-7 2 2" /><path d="M4 20h16" /><circle cx="17" cy="6" r="2" /></>,
  Restauration: <><path d="M7 3v8M4 3v4a3 3 0 0 0 6 0V3m-3 8v10M16 3v18m0-18c3 2 3 7 0 9" /></>,
  Transport: <><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M8 21h8M12 18v3M7 8h10M8 13h.01M16 13h.01" /></>,
  LieuTouristique: <><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 21h18M2 6h20L12 2 2 6Z" /></>,
  Leaf: <><path d="M20 4C12 4 5 7 5 14c0 3.5 2.5 6 6 6 7 0 10-7 9-16Z" /><path d="M4 20c3-5 7-8 12-10" /></>,
  Search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4-4" /></>,
  Star: <path d="m12 3 2.78 5.64L21 9.55l-4.5 4.38 1.06 6.19L12 17.2l-5.56 2.92 1.06-6.19L3 9.55l6.22-.91L12 3Z" />,
  Check: <path d="m5 12 4.2 4.2L19 6.5" />,
}

export function Icon({ name, size = 18, className = '' }) {
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.Leaf}</svg>
}

export const ecoColor = (v) => (v >= 0.8 ? '#2f7d4f' : v >= 0.55 ? '#b7852a' : '#b34a3a')

export function EcoBar({ value }) {
  if (value == null) return null
  return (
    <div className="eco" title={`Éco-score ${Math.round(value * 100)}/100`}>
      <div className="eco-track"><div className="eco-fill" style={{ width: `${value * 100}%`, background: ecoColor(value) }} /></div>
      <span style={{ color: ecoColor(value) }}>{Math.round(value * 100)}</span>
    </div>
  )
}

export const Badge = ({ cls }) => <span className="badge" title={ecoPractices[cls]}><Icon name="Leaf" size={13} />{label(cls)}</span>

export function EntityCard({ e, showDest = true }) {
  const root = rootOf(e.type)
  const P = getProvider()
  return (
    <article className="card">
      <div className="card-top">
        <span className="ico"><Icon name={root} /></span>
        <span className="tag">{label(e.type)}</span>
        {e.ext && <span className="tag ext" title="Individu d'extension, absent du RDF d'origine">ext.</span>}
      </div>
      <h3>{e.nom}</h3>
      {showDest && e.dests && (
        <p className="muted">
          {e.dests.slice(0, 3).map((d, i) => (
            <span key={d}>{i > 0 && ', '}<Link to={`/destination/${d}`}>{P.byId(d)?.nom ?? d}</Link></span>
          ))}
          {e.dests.length > 3 && ` +${e.dests.length - 3}`}
        </p>
      )}
      <div className="meta">
        {e.prix != null && <span>{e.prix === 0 ? 'Gratuit' : `${e.prix} TND`}</span>}
        {e.prixEntree != null && <span>Entrée {e.prixEntree} TND</span>}
        {e.co2 != null && <span>{e.co2} g CO₂/km</span>}
        {e.niveau && <span>Niveau {e.niveau}</span>}
        {e.cuisine && <span>{e.cuisine}</span>}
      </div>
      <EcoBar value={e.eco} />
      {e.badges?.length > 0 && <div className="badges">{e.badges.map((b) => <Badge key={b} cls={b} />)}</div>}
    </article>
  )
}
