import { useState } from 'react'
import { api } from '../services/api'

export default function Auth() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const submit = async (mode) => {
    setError(''); setMessage('')
    try { const user = mode === 'register' ? await api.register(email, password) : await api.login(email, password); setMessage(`Connecté(e) : ${user.email}`) }
    catch (e) { setError(e.message) }
  }
  return <><h1>Compte</h1><div className="panel form">
    <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
    <label>Mot de passe<input type="password" minLength="8" value={password} onChange={e => setPassword(e.target.value)} required /></label>
    <div className="chips"><button className="btn" type="button" onClick={() => submit('login')}>Connexion</button><button className="btn" type="button" onClick={() => submit('register')}>Inscription</button><button className="chip" type="button" onClick={() => api.logout().then(() => setMessage('Déconnecté(e)')).catch(e => setError(e.message))}>Déconnexion</button></div>
    {message && <p>{message}</p>}{error && <p className="muted">{error}</p>}
  </div></>
}
