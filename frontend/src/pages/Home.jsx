import { Link } from 'react-router-dom'
import { getProvider } from '../services/provider'
import { CATEGORIES } from '../ontology/schema'
import { EntityCard, Icon } from '../components/ui'
import sidiBouSaid from '../assets/sidi-bou-said-hero.png'

export default function Home() {
  const P = getProvider()
  const top = P.entities().filter((e) => e.eco >= 0.95 && e.prix != null).slice(0, 6)
  const stats = [
    ['Destinations', P.destinations().length],
    ['Hébergements', P.query({ cls: 'Hébergement' }).length],
    ['Activités', P.query({ cls: 'Activité' }).length],
    ['Transports', P.query({ cls: 'Transport' }).length],
  ]
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
        <h1>Voyager en Tunisie, <em>sans laisser de trace</em></h1>
        <p>Activités locales, hébergements et transports classés par empreinte carbone. Les recommandations sont calculées à partir d’une ontologie du tourisme éco-responsable.</p>
        <div className="cta">
          <Link className="btn" to="/recommandations">Obtenir ma recommandation</Link>
          <Link className="btn ghost" to="/explorer">Explorer le catalogue</Link>
          <Link className="btn ghost" to="/compte">Créer mon profil</Link>
        </div>
        <div className="stats">{stats.map(([k, v]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
        </div>
        <figure className="hero-image">
          <img src={sidiBouSaid} alt="Maisons blanches et volets bleus de Sidi Bou Said, face a la mer" />
          <figcaption>Sidi Bou Said · Un voyage au rythme de la Méditerranée</figcaption>
        </figure>
      </section>

      <section>
        <h2>Parcourir par catégorie</h2>
        <div className="chips">
          {CATEGORIES.map((c) => <Link key={c} className="chip category-chip" to={`/explorer?cat=${c}`}><Icon name={c} size={16} />{c === 'LieuTouristique' ? 'Lieux' : c}</Link>)}
        </div>
      </section>

      <section>
        <h2>Les choix les plus sobres</h2>
        <div className="grid">{top.map((e) => <EntityCard key={e.id} e={e} />)}</div>
      </section>
      <section className="panel landing-profile">
        <div><span className="eyebrow">Votre espace</span><h2>Un profil relié à l’ontologie</h2><p>Créez votre identité voyageur, modifiez vos coordonnées ou supprimez-les à tout moment. Vos informations sont stockées comme un individu <code>Personne</code> dans Fuseki.</p></div>
        <Link className="btn" to="/compte">Créer mon profil</Link>
      </section>
    </>
  )
}
