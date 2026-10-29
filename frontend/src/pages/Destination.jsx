import { Link, useParams } from 'react-router-dom'
import { getProvider } from '../services/provider'
import { CATEGORIES, label } from '../ontology/schema'
import { EntityCard, Icon } from '../components/ui'

const SECTIONS = CATEGORIES.filter((c) => c !== 'Destination')
const REL = { Hébergement: 'possedeHebergement', Activité: 'proposeActivite', Restauration: 'possedeRestauration', Transport: 'accessiblePar', LieuTouristique: 'contient' }

export default function Destination() {
  const { id } = useParams()
  const P = getProvider()
  const d = P.byId(id)
  if (!d) return <p>Destination introuvable. <Link to="/explorer?cat=Destination">Retour</Link></p>

  return (
    <>
      <p className="muted"><Link to="/explorer?cat=Destination">← Destinations</Link></p>
      <h1>{d.nom} <small className="tag">{label(d.type)}</small></h1>
      <p>{d.desc}</p>
      <p className="muted">
        {d.region} · Meilleure période : {d.saison} · {d.lat.toFixed(3)}, {d.lng.toFixed(3)} ·{' '}
        <a href={`https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lng}#map=11/${d.lat}/${d.lng}`} target="_blank" rel="noreferrer">Voir sur la carte</a>
      </p>
      {SECTIONS.map((c) => {
        const items = P.query({ cls: c, dest: id })
        if (!items.length) return null
        return (
          <section key={c}>
            <h2 className="section-title"><Icon name={c} size={20} />{c === 'LieuTouristique' ? 'Lieux touristiques' : c} <code>{REL[c]}</code></h2>
            <div className="grid">{items.map((e) => <EntityCard key={e.id} e={e} showDest={false} />)}</div>
          </section>
        )
      })}
    </>
  )
}
