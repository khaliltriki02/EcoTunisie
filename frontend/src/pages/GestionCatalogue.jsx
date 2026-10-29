import { useEffect, useState } from 'react'
import { api } from '../services/api'

const modules = {
  transports: { title: 'Transports', types: ['Train', 'Bus', 'Tramway', 'Taxi', 'Covoiturage', 'Vélo', 'Marche', 'Voiture'], extra: ['emissionCO2', 'dureeTrajet', 'frequenceTransport'] },
  activites: { title: 'Activités', types: ['ActivitéNature', 'ActivitéSportive', 'ActivitéAventure', 'ActivitéCulturelle', 'ActivitéBienEtre', 'ActivitéGastronomique', 'Randonnée', 'Festival', 'Ecotourisme'], extra: ['niveauDifficulte'] },
}
const blank = (kind) => ({ nom: '', type: modules[kind].types[0], prix: '', destination: '', emissionCO2: '', dureeTrajet: '', frequenceTransport: '', niveauDifficulte: '' })

export default function GestionCatalogue() {
  const [kind, setKind] = useState('transports'); const [items, setItems] = useState([]); const [form, setForm] = useState(blank('transports')); const [editing, setEditing] = useState(null); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const load = () => { api.list(kind).then(setItems).catch(e => setError(e.message)) }
  useEffect(() => { load() }, [kind])
  const change = key => e => setForm({ ...form, [key]: e.target.value })
  const save = async e => { e.preventDefault(); try { editing ? await api.update(kind, editing, form) : await api.create(kind, form); setMessage('Enregistré dans Fuseki.'); setEditing(null); setForm(blank(kind)); load() } catch (err) { setError(err.message) } }
  const edit = item => { setEditing(item.id); setForm({ ...blank(kind), ...item }) }
  const remove = async id => { if (!window.confirm('Supprimer cet élément ?')) return; try { await api.remove(kind, id); setMessage('Élément supprimé.'); load() } catch (err) { setError(err.message) } }
  return <section className="account-page"><span className="eyebrow">Gestion Fuseki</span><h1>Transports et <em>activités</em></h1><div className="tabs">{Object.entries(modules).map(([key, value]) => <button key={key} className={kind === key ? 'on' : ''} onClick={() => { setKind(key); setForm(blank(key)); setEditing(null) }}>{value.title}</button>)}</div>
    <form className="panel profile-form" onSubmit={save}><label>Nom<input value={form.nom} onChange={change('nom')} required /></label><label>Type<select value={form.type} onChange={change('type')}>{modules[kind].types.map(type => <option key={type}>{type}</option>)}</select></label><label>Prix (TND)<input type="number" min="0" value={form.prix} onChange={change('prix')} /></label><label>Destination (identifiant RDF)<input value={form.destination} onChange={change('destination')} placeholder="Tunis" /></label>{modules[kind].extra.includes('emissionCO2') && <label>Émission CO₂<input type="number" min="0" value={form.emissionCO2} onChange={change('emissionCO2')} /></label>}{modules[kind].extra.includes('dureeTrajet') && <label>Durée trajet (min)<input type="number" min="0" value={form.dureeTrajet} onChange={change('dureeTrajet')} /></label>}{modules[kind].extra.includes('frequenceTransport') && <label>Fréquence<input value={form.frequenceTransport} onChange={change('frequenceTransport')} /></label>}{modules[kind].extra.includes('niveauDifficulte') && <label>Niveau de difficulté<input value={form.niveauDifficulte} onChange={change('niveauDifficulte')} /></label>}<div className="form-actions"><button className="btn">{editing ? 'Modifier' : 'Créer'}</button>{editing && <button className="chip" type="button" onClick={() => { setEditing(null); setForm(blank(kind)) }}>Annuler</button>}</div></form>
    <div className="preference-list">{items.map(item => <article className="card" key={item.id}><span className="tag">{item.type}</span><h3>{item.nom}</h3><p className="muted">{item.prix != null ? `${item.prix} TND` : 'Sans prix'} {item.destination && `· ${item.destination}`}</p><div className="card-actions"><button className="chip" onClick={() => edit(item)}>Modifier</button><button className="text-danger" onClick={() => remove(item.id)}>Supprimer</button></div></article>)}</div>{message && <p className="notice success">{message}</p>}{error && <p className="notice error">{error}</p>}
  </section>
}
