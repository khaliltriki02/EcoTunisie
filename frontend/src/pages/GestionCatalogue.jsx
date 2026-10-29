import { useEffect, useState } from 'react'
import { api } from '../services/api'

const modules = {
  destinations: { title: 'Destinations', types: ['DestinationUrbaine', 'DestinationCôtière', 'DestinationRurale', 'DestinationDésertique', 'DestinationMontagneuse'], fields: ['pays'] },
  lieux: { title: 'Lieux touristiques', types: ['Musée', 'SiteHistorique', 'Monument', 'Plage', 'MarchéLocal', 'SiteArchéologique', 'ParcNaturel'], fields: [] },
  hebergements: { title: 'Hébergements', types: ['Hôtel', 'Camping', 'Écolodge', 'Auberge', 'MaisonDHôte'], fields: [] },
  restaurations: { title: 'Restauration', types: ['Restaurant', 'MarchéAlimentaire', 'RestaurantLocal', 'RestaurantTraditionnel', 'RestaurantBio', 'RestaurantVegetarien', 'RestaurantVegan'], fields: ['cuisine', 'produitsLocaux', 'optionVegan'] },
  transports: { title: 'Transports', types: ['Train', 'Bus', 'Tramway', 'Taxi', 'Covoiturage', 'Vélo', 'Marche', 'Voiture'], fields: ['emissionCO2', 'dureeTrajet', 'frequenceTransport', 'accessiblePMRTransport'] },
  activites: { title: 'Activités', types: ['ActivitéNature', 'ActivitéSportive', 'ActivitéAventure', 'ActivitéCulturelle', 'ActivitéBienEtre', 'ActivitéGastronomique', 'Randonnée', 'Festival', 'Ecotourisme'], fields: ['niveauDifficulte'] },
}
const blank = kind => ({ nom: '', type: modules[kind].types[0], prix: '', destination: '', pays: '', cuisine: '', produitsLocaux: false, optionVegan: false, emissionCO2: '', dureeTrajet: '', frequenceTransport: '', accessiblePMRTransport: false, niveauDifficulte: '' })

export default function GestionCatalogue() {
  const [kind, setKind] = useState('destinations'); const [items, setItems] = useState([]); const [form, setForm] = useState(blank('destinations')); const [editing, setEditing] = useState(null); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const load = () => { api.list(kind).then(setItems).catch(e => setError(e.message)) }
  useEffect(() => { load() }, [kind])
  const change = key => e => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const save = async event => { event.preventDefault(); setError(''); try { editing ? await api.update(kind, editing, form) : await api.create(kind, form); setMessage('Enregistré dans Fuseki.'); setEditing(null); setForm(blank(kind)); load() } catch (err) { setError(err.message) } }
  const edit = item => { setEditing(item.id); setForm({ ...blank(kind), ...item }) }
  const remove = async id => { if (!window.confirm('Supprimer cet élément ?')) return; try { await api.remove(kind, id); setMessage('Élément supprimé.'); load() } catch (err) { setError(err.message) } }
  const fields = modules[kind].fields
  return <section className="account-page"><span className="eyebrow">Gestion Fuseki</span><h1>Gérer le <em>catalogue</em></h1><div className="tabs">{Object.entries(modules).map(([key, value]) => <button key={key} className={kind === key ? 'on' : ''} onClick={() => { setKind(key); setForm(blank(key)); setEditing(null); setError('') }}>{value.title}</button>)}</div>
    <form className="panel profile-form" onSubmit={save}><label>Nom<input value={form.nom} onChange={change('nom')} required /></label><label>Type<select value={form.type} onChange={change('type')}>{modules[kind].types.map(type => <option key={type}>{type}</option>)}</select></label>{kind !== 'destinations' && <label>Prix (TND)<input type="number" min="0" value={form.prix} onChange={change('prix')} /></label>}{kind !== 'destinations' && <label>Destination (identifiant RDF)<input value={form.destination} onChange={change('destination')} placeholder="Tunis" /></label>}{fields.includes('pays') && <label>Pays<input value={form.pays} onChange={change('pays')} placeholder="Tunisie" /></label>}
      {fields.includes('cuisine') && <label>Type de cuisine<input value={form.cuisine} onChange={change('cuisine')} placeholder="Locale, vegan…" /></label>}{fields.includes('emissionCO2') && <label>Émission CO₂<input type="number" min="0" value={form.emissionCO2} onChange={change('emissionCO2')} /></label>}{fields.includes('dureeTrajet') && <label>Durée trajet (min)<input type="number" min="0" value={form.dureeTrajet} onChange={change('dureeTrajet')} /></label>}{fields.includes('frequenceTransport') && <label>Fréquence<input value={form.frequenceTransport} onChange={change('frequenceTransport')} /></label>}{fields.includes('niveauDifficulte') && <label>Niveau de difficulté<input value={form.niveauDifficulte} onChange={change('niveauDifficulte')} /></label>}
      {fields.includes('produitsLocaux') && <label className="check-label"><input type="checkbox" checked={form.produitsLocaux} onChange={change('produitsLocaux')} /> Produits locaux</label>}{fields.includes('optionVegan') && <label className="check-label"><input type="checkbox" checked={form.optionVegan} onChange={change('optionVegan')} /> Option vegan</label>}{fields.includes('accessiblePMRTransport') && <label className="check-label"><input type="checkbox" checked={form.accessiblePMRTransport} onChange={change('accessiblePMRTransport')} /> Accessible PMR</label>}
      <div className="form-actions"><button className="btn">{editing ? 'Modifier' : 'Créer'}</button>{editing && <button className="chip" type="button" onClick={() => { setEditing(null); setForm(blank(kind)) }}>Annuler</button>}</div></form>
    <div className="preference-list">{items.map(item => <article className="card" key={item.id}><span className="tag">{item.type}</span><h3>{item.nom}</h3><p className="muted">{item.prix != null ? `${item.prix} TND` : 'Sans prix'} {item.destination && `· ${item.destination}`}</p><div className="card-actions"><button className="chip" onClick={() => edit(item)}>Modifier</button><button className="text-danger" onClick={() => remove(item.id)}>Supprimer</button></div></article>)}</div>{message && <p className="notice success">{message}</p>}{error && <p className="notice error">{error}</p>}
  </section>
}
