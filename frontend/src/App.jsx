import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Explorer from './pages/Explorer'
import Destination from './pages/Destination'
import Recommandations from './pages/Recommandations'
import Ontologie from './pages/Ontologie'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Preferences from './pages/Preferences'
import GestionCatalogue from './pages/GestionCatalogue'
import { Icon } from './components/ui'
import { api } from './services/api'

export default function App() {
  return <HashRouter><AppLayout /></HashRouter>
}

function AppLayout() {
  // S'abonne à la route : après la connexion, la navigation se met à jour immédiatement.
  useLocation()
  const account = JSON.parse(localStorage.getItem('ecoTunisieUser') || 'null')
  const logout = async () => {
    try { await api.logout() } finally { localStorage.removeItem('ecoTunisieUser'); window.location.hash = '#/' }
  }
  return <>
    <header className="nav">
      <NavLink to="/accueil" className="logo"><Icon name="Leaf" size={21} />Eco<b>Tunisie</b></NavLink>
      <nav>
        <NavLink to="/accueil">Accueil</NavLink>{account && <><NavLink to="/explorer">Explorer</NavLink><NavLink to="/recommandations">Recommandations</NavLink></>}<NavLink to="/ontologie">Ontologie</NavLink>
        {account ? <><NavLink to="/profil">Profil</NavLink><NavLink to="/preferences">Préférences</NavLink><NavLink to="/gestion">Gestion</NavLink><button className="nav-logout" onClick={logout}>Déconnexion</button></> : <NavLink to="/compte">Connexion</NavLink>}
      </nav>
    </header>
    <main><Routes>
      <Route path="/" element={<Auth />} /><Route path="/accueil" element={<Home />} /><Route path="/explorer" element={<Explorer />} />
      <Route path="/destination/:id" element={<Destination />} /><Route path="/recommandations" element={<Recommandations />} />
      <Route path="/ontologie" element={<Ontologie />} /><Route path="/compte" element={<Auth />} /><Route path="/profil" element={<Profile />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/gestion" element={<GestionCatalogue />} />
    </Routes></main>
    <footer>Basé sur l’ontologie eco-tourism · éco-scores et émissions indicatifs</footer>
  </>
}
