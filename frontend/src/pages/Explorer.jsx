import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { label } from '../ontology/schema'
import { EntityCard, Icon } from '../components/ui'

const MODULES = {
  Hébergement: { api: 'hebergements', types: ['Hôtel', 'Camping', 'Écolodge', 'Auberge', 'MaisonDHôte'] },
  Restauration: { api: 'restaurations', types: ['Restaurant', 'MarchéAlimentaire', 'RestaurantLocal', 'RestaurantTraditionnel', 'RestaurantBio', 'RestaurantVegetarien', 'RestaurantVegan'] },
  Transport: { api: 'transports', types: ['Train', 'Bus', 'Tramway', 'Taxi', 'Covoiturage', 'Vélo', 'Marche', 'Voiture'] },
  Activité: { api: 'activites', types: ['ActivitéNature', 'ActivitéSportive', 'ActivitéAventure', 'ActivitéCulturelle', 'ActivitéBienEtre', 'ActivitéGastronomique', 'Randonnée', 'Festival', 'Ecotourisme'] },
}

export default function Explorer() {
  const [sp, setSp] = useSearchParams(); const cat = MODULES[sp.get('cat')] ? sp.get('cat') : 'Hébergement'
  const [type, setType] = useState(''); const [dest, setDest] = useState(''); const [maxPrix, setMaxPrix] = useState(200); const [q, setQ] = useState('')
  const [items, setItems] = useState([]); const [destinations, setDestinations] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState(''); const [nlpResult, setNlpResult] = useState(null)
  const params = useMemo(() => ({ type, destination: dest, maxPrix, q }), [type, dest, maxPrix, q])
  useEffect(() => { api.destinations().then(setDestinations).catch(e => setError(e.message)) }, [])
  useEffect(() => { let active = true; setLoading(true); setError(''); const timer = setTimeout(() => api.list(MODULES[cat].api, params).then(x => active && setItems(x)).catch(e => active && setError(e.message)).finally(() => active && setLoading(false)), 180); return () => { active = false; clearTimeout(timer) } }, [cat, params])
  const display = items.map(e => ({ ...e, dests: e.destination ? [e.destination] : [], eco: null }))
  return <><h1>Explorer</h1><div className="tabs">{Object.keys(MODULES).map(category => <button key={category} className={category === cat ? 'on' : ''} onClick={() => { setSp({ cat: category }); setType(''); setDest(''); setQ('') }}><Icon name={category} size={16} /> {category}</button>)}</div>
    <div className="filters"><div className="search-input"><Icon name="Search" size={17} /><input placeholder="Rechercher..." value={q} onChange={e => setQ(e.target.value)} /></div><select value={type} onChange={e => setType(e.target.value)}><option value="">Tous les types</option>{MODULES[cat].types.map(t => <option key={t} value={t}>{label(t)}</option>)}</select><select value={dest} onChange={e => setDest(e.target.value)}><option value="">Toutes destinations</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}</select><label>Prix max {maxPrix} TND<input type="range" min="0" max="500" step="5" value={maxPrix} onChange={e => setMaxPrix(+e.target.value)} /></label></div>
    <form className="search-input" onSubmit={async e => { e.preventDefault(); try { const result = await api.question(question); setNlpResult(result); setItems(result.results); setError('') } catch (err) { setError(err.message) } }}><Icon name="Search" size={17} /><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex. quels transports train à Tunis ?" /><button className="btn" type="submit">Demander</button></form>
    {error && <p className="muted">Impossible de charger Fuseki : {error}</p>}<p className="muted">{loading ? 'Interrogation de Fuseki…' : nlpResult ? `Intention ${nlpResult.intent} · ${items.length} résultat(s) depuis Fuseki` : `${items.length} résultat(s) depuis Fuseki`}</p><div className="grid">{display.map(e => <EntityCard key={e.id} e={e} />)}</div>
  </>
}
