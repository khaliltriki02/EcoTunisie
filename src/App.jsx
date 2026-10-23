import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Explorer from './pages/Explorer'
import Destination from './pages/Destination'
import Recommandations from './pages/Recommandations'
import Ontologie from './pages/Ontologie'
import { Icon } from './components/ui'

export default function App() {
  return (
    <HashRouter>
      <header className="nav">
        <NavLink to="/" className="logo"><Icon name="Leaf" size={21} />Eco<b>Tunisie</b></NavLink>
        <nav>
          <NavLink to="/explorer">Explorer</NavLink>
          <NavLink to="/recommandations">Recommandations</NavLink>
          <NavLink to="/ontologie">Ontologie</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/destination/:id" element={<Destination />} />
          <Route path="/recommandations" element={<Recommandations />} />
          <Route path="/ontologie" element={<Ontologie />} />
        </Routes>
      </main>
      <footer>Basé sur l’ontologie eco-tourism · éco-scores et émissions indicatifs</footer>
    </HashRouter>
  )
}
