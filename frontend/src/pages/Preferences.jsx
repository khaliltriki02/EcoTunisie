import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const TYPES = ['PréférenceNature', 'PréférenceCulturelle', 'PréférenceGastronomique', 'PréférenceSportive', 'PréférenceAventure', 'PréférenceBienEtre']
const empty = { type: TYPES[0], description: '' }
const label = (type) => type.replace('Préférence', '').replace('BienEtre', 'Bien-être')

export default function Preferences() {
  const account = JSON.parse(localStorage.getItem('ecoTunisieUser') || 'null')
  const [items, setItems] = useState([])
  const [filterType, setFilterType] = useState('')
  const [query, setQuery] = useState('')
  const [question, setQuestion] = useState('')
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const load = (filters = {}) => api.list('preferences', filters).then(setItems).catch(e => setError(e.message))
  useEffect(() => { if (account) load() }, [])
  if (!account) return <section className="account-page"><h1>Mes préférences</h1><p>Connectez-vous pour gérer vos préférences de voyage.</p><Link className="btn" to="/">Connexion</Link></section>
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  const filter = (event) => { event.preventDefault(); setError(''); load({ type: filterType, q: query }) }
  const ask = async (event) => {
    event.preventDefault(); setError(''); setMessage('')
    try { const result = await api.question(question); setItems(result.results); setMessage(`${result.results.length} préférence(s) trouvée(s) par recherche en langage naturel.`) }
    catch (e) { setError(e.message) }
  }
  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage('')
    try {
      if (editing) await api.updatePreference(editing, form)
      else await api.createPreference(form)
      setForm(empty); setEditing(null); setMessage(editing ? 'Préférence modifiée dans Fuseki.' : 'Préférence ajoutée dans Fuseki.'); load()
    } catch (e) { setError(e.message) }
  }
  const edit = (item) => { setEditing(item.id); setForm({ type: item.type, description: item.description }); setMessage('') }
  const remove = async (id) => { if (!window.confirm('Supprimer cette préférence ?')) return; try { await api.deletePreference(id); setMessage('Préférence supprimée.'); load() } catch (e) { setError(e.message) } }
  return <section className="account-page"><span className="eyebrow">Vos choix de voyage</span><h1>Mes <em>préférences</em></h1><p className="lead">Chaque préférence est liée à votre <code>Personne</code> via la relation <code>aPourPreference</code> de l’ontologie.</p>
    <form className="filters preference-filters" onSubmit={filter}><div className="search-input"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une préférence…" /></div><select value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">Tous les types</option>{TYPES.map(type => <option key={type} value={type}>{label(type)}</option>)}</select><button className="chip" type="submit">Filtrer</button><button className="chip" type="button" onClick={() => { setQuery(''); setFilterType(''); load() }}>Réinitialiser</button></form>
    <form className="search-input preference-question" onSubmit={ask}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex. liste mes préférences nature" /><button className="btn" type="submit">Demander</button></form>
    <form className="panel preference-form" onSubmit={submit}><label>Catégorie<select value={form.type} onChange={change('type')}>{TYPES.map(type => <option key={type} value={type}>{label(type)}</option>)}</select></label><label>Description<input value={form.description} onChange={change('description')} placeholder="Ex. Cuisine locale" required /></label><div className="form-actions"><button className="btn" type="submit">{editing ? 'Enregistrer la modification' : 'Ajouter la préférence'}</button>{editing && <button className="chip" type="button" onClick={() => { setEditing(null); setForm(empty) }}>Annuler</button>}</div></form>
    <div className="preference-list">{items.map(item => <article className="card preference-card" key={item.id}><span className="tag">{label(item.type)}</span><h3>{item.description}</h3><div className="card-actions"><button className="chip" onClick={() => edit(item)}>Modifier</button><button className="text-danger" onClick={() => remove(item.id)}>Supprimer</button></div></article>)}</div>
    {!items.length && <p className="muted">Aucune préférence enregistrée pour le moment.</p>}{message && <p className="notice success">{message}</p>}{error && <p className="notice error">{error}</p>}
  </section>
}
