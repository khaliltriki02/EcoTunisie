import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const blankProfile = { nom: '', prenom: '', email: '', telephone: '', age: '' }

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [profile, setProfile] = useState(blankProfile)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const change = (field) => (event) => setProfile({ ...profile, [field]: event.target.value })
  const submit = async (event) => {
    event.preventDefault(); setError('')
    try {
      const account = mode === 'register' ? await api.register(profile.email, password, profile) : await api.login(profile.email, password)
      localStorage.setItem('ecoTunisieUser', JSON.stringify(account))
      navigate('/accueil')
    } catch (e) { setError(e.message) }
  }
  return <section className="account-page auth-page">
    <span className="eyebrow">EcoTunisie · compte voyageur</span><h1>Voyagez avec un profil <em>responsable</em></h1>
    <p className="lead">Votre inscription crée un compte sécurisé et un individu <code>Personne</code> dans l’ontologie EcoTunisie.</p>
    <div className="auth-tabs"><button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Connexion</button><button className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>Inscription</button></div>
    <form className="panel profile-form" onSubmit={submit}>
      {mode === 'register' && <><label>Nom<input value={profile.nom} onChange={change('nom')} required /></label><label>Prénom<input value={profile.prenom} onChange={change('prenom')} /></label></>}
      <label>E-mail<input type="email" value={profile.email} onChange={change('email')} required /></label>
      {mode === 'register' && <><label>Téléphone<input value={profile.telephone} onChange={change('telephone')} /></label><label>Âge<input type="number" min="0" max="130" value={profile.age} onChange={change('age')} /></label></>}
      <label>Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength="8" required /></label>
      <div className="form-actions"><button className="btn" type="submit">{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</button></div>
    </form>{error && <p className="notice error">{error}</p>}
  </section>
}
