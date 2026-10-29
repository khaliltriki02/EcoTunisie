import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Profile() {
  const account = JSON.parse(localStorage.getItem('ecoTunisieUser') || 'null')
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!account?.person_id) return
    api.person(account.person_id).then(person => setProfile({ nom: person.nom || '', prenom: person.prenom || '', email: person.email || account.email, telephone: person.telephone || '', age: person.age || '' })).catch(e => setError(e.message))
  }, [account?.person_id])
  if (!account) return <section className="account-page"><h1>Profil</h1><p>Connectez-vous pour consulter votre profil.</p><Link className="btn" to="/">Connexion</Link></section>
  const set = (field) => (event) => setProfile({ ...profile, [field]: event.target.value })
  const save = async (event) => { event.preventDefault(); setError(''); try { await api.updatePerson(account.person_id, profile); setMessage('Profil mis à jour dans Fuseki.') } catch (e) { setError(e.message) } }
  const remove = async () => {
    if (!window.confirm('Supprimer votre compte et votre profil Personne ?')) return
    try { await api.deletePerson(account.person_id); localStorage.removeItem('ecoTunisieUser'); navigate('/') } catch (e) { setError(e.message) }
  }
  if (!profile) return <section className="account-page"><h1>Profil</h1><p>{error || 'Chargement du profil…'}</p></section>
  return <section className="account-page"><span className="eyebrow">Espace personnel</span><h1>Votre profil <em>voyageur</em></h1><p className="lead">Informations de l’individu <code>{account.person_id}</code> enregistré dans Fuseki.</p>
    <form className="panel profile-form" onSubmit={save}><label>Nom<input value={profile.nom} onChange={set('nom')} required /></label><label>Prénom<input value={profile.prenom} onChange={set('prenom')} /></label><label>E-mail<input type="email" value={profile.email} onChange={set('email')} required /></label><label>Téléphone<input value={profile.telephone} onChange={set('telephone')} /></label><label>Âge<input type="number" min="0" max="130" value={profile.age} onChange={set('age')} /></label><div className="form-actions"><button className="btn" type="submit">Enregistrer dans Fuseki</button><button className="text-danger" type="button" onClick={remove}>Supprimer mon compte</button></div></form>
    {message && <p className="notice success">{message}</p>}{error && <p className="notice error">{error}</p>}
  </section>
}
