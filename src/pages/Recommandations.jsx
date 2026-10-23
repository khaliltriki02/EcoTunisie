import { useState } from 'react'
import { Link } from 'react-router-dom'
import { preferences, profils } from '../data/kb'
import { recommend } from '../services/recommender'
import { label } from '../ontology/schema'
import { EcoBar, Icon } from '../components/ui'

const Row = ({ icon, k, e, extra }) =>
  e ? (
    <li><span className="row-label"><Icon name={icon} size={16} /><b>{k}</b></span><span>{e.nom} {e.prix != null && <small>· {e.prix} TND</small>} {extra}</span></li>
  ) : null

export default function Recommandations() {
  const [form, setForm] = useState({ nom: '', profil: 'VoyageurIndividuel', personnes: 1, jours: 3, budget: 400, maxCo2: 170, prefs: ['PrefNature'] })
  const [res, setRes] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (id) => set('prefs', form.prefs.includes(id) ? form.prefs.filter((p) => p !== id) : [...form.prefs, id])

  return (
    <>
      <h1>Ma recommandation éco-responsable</h1>
      <form className="panel form" onSubmit={(ev) => { ev.preventDefault(); setRes(recommend(form)) }}>
        <label>Prénom<input value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Ahmed" /></label>
        <label>Profil
          <select value={form.profil} onChange={(e) => set('profil', e.target.value)}>
            {profils.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <label>Personnes<input type="number" min="1" max="20" value={form.personnes} onChange={(e) => set('personnes', +e.target.value)} /></label>
        <label>Durée (jours)<input type="number" min="1" max="30" value={form.jours} onChange={(e) => set('jours', +e.target.value)} /></label>
        <label>Budget total (TND)<input type="number" min="50" step="50" value={form.budget} onChange={(e) => set('budget', +e.target.value)} /></label>
        <label>Transport max {form.maxCo2} g CO₂/km
          <input type="range" min="0" max="170" step="5" value={form.maxCo2} onChange={(e) => set('maxCo2', +e.target.value)} />
        </label>
        <fieldset>
          <legend>Préférences</legend>
          <div className="chips">
            {preferences.map((p) => (
              <button type="button" key={p.id} className={`chip ${form.prefs.includes(p.id) ? 'on' : ''}`} onClick={() => toggle(p.id)}>{p.label}</button>
            ))}
          </div>
        </fieldset>
        <button className="btn" type="submit">Recommander</button>
      </form>

      {res && (
        <section>
          <h2>{form.nom ? `${form.nom}, v` : 'V'}oici vos {res.length} meilleures options</h2>
          {res.length === 0 && <p className="muted">Aucun résultat : augmentez le budget ou la limite d’émissions.</p>}
          <div className="grid wide">
            {res.map((r, i) => (
              <article className="card reco" key={r.destination.id}>
                <div className="card-top"><span className="rank">#{i + 1}</span><span className="tag">{label(r.destination.type)}</span><span className="note"><Icon name="Star" size={15} /> {r.note}</span></div>
                <h3><Link to={`/destination/${r.destination.id}`}>{r.destination.nom}</Link></h3>
                <EcoBar value={r.ecoScore} />
                <ul className="rows">
                  <Row icon="Hébergement" k="Hébergement" e={r.hebergement} />
                  {r.activites.map((a) => <Row key={a.id} icon="Activité" k="Activité" e={a} />)}
                  <Row icon="Restauration" k="Restauration" e={r.restauration} />
                  <Row icon="Transport" k="Transport" e={r.transport} extra={<small>· {r.transport?.co2} g/km</small>} />
                  <Row icon="LieuTouristique" k="Lieu" e={r.lieu} />
                </ul>
                <ul className="why">{r.raisons.map((x) => <li key={x}><Icon name="Check" size={15} />{x}</li>)}</ul>
                <p className="muted">≈ {r.coutJour} TND / jour pour {form.personnes} pers.</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
