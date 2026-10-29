// Moteur de recommandation sémantique: produit des individus de classe `Recommandation`
// (ecoScore, note, baseeSur, recommandeVoyage/Activité/Hébergement/Restauration/Transport/Lieu).

import { getProvider } from './provider'
import { preferences } from '../data/kb'
import { isA } from '../ontology/schema'

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const prefMatch = (e, prefIds) =>
  prefIds.some((pid) => preferences.find((p) => p.id === pid)?.matches.some((c) => isA(e.type, c)))

const best = (items, scoreFn) =>
  items.map((e) => ({ e, s: scoreFn(e) })).sort((a, b) => b.s - a.s)[0]?.e

export function recommend({ prefs = [], budget = 300, jours = 3, personnes = 1, maxCo2 = 170 }) {
  const P = getProvider()
  const budgetJour = budget / Math.max(jours, 1)

  const results = P.destinations().map((d) => {
    const q = (cls) => P.query({ cls, dest: d.id })
    const budgetOk = (e) => (e.prix == null ? true : e.prix <= budgetJour)

    const hebergement = best(q('Hébergement').filter(budgetOk), (e) => e.eco - e.prix / 1000)
    const activites = q('Activité')
      .filter(budgetOk)
      .sort((a, b) => (prefMatch(b, prefs) - prefMatch(a, prefs)) || b.eco - a.eco)
      .slice(0, 2)
    const restauration = best(q('Restauration'), (e) => e.eco + (prefMatch(e, prefs) ? 0.3 : 0))
    const transport = best(q('Transport').filter((t) => t.co2 <= maxCo2), (e) => e.eco)
    const lieu = best(q('LieuTouristique'), (e) => (prefMatch(e, prefs) ? 1 : 0))

    const picks = [hebergement, ...activites, restauration, transport].filter(Boolean)
    const eco = avg(picks.map((e) => e.eco ?? 0))
    const prefHits = [...activites, restauration, lieu].filter((e) => e && prefMatch(e, prefs)).length
    const prefScore = prefs.length ? Math.min(prefHits / 2, 1) : 0.5
    const cout = ((hebergement?.prix ?? 0) + activites.reduce((s, a) => s + (a.prix ?? 0), 0) + (restauration?.prix ?? 0) * 2) * personnes
    const budgetScore = cout <= budgetJour * personnes ? 1 : Math.max(0, 1 - (cout - budgetJour * personnes) / (budgetJour * personnes))
    const score = 0.5 * eco + 0.35 * prefScore + 0.15 * budgetScore

    return {
      destination: d, hebergement, activites, restauration, transport, lieu,
      ecoScore: Number(eco.toFixed(2)),
      score: Number(score.toFixed(3)),
      note: Number((3 + score * 2).toFixed(1)), // 3.0 – 5.0
      coutJour: Math.round(cout),
      raisons: [
        eco >= 0.85 && 'Empreinte carbone très faible sur l’ensemble du séjour',
        prefHits > 0 && 'Correspond à vos préférences',
        transport?.co2 === 0 && 'Déplacements sans émission (marche / vélo)',
        hebergement?.badges?.length && 'Hébergement engagé (eau, énergie, déchets…)',
      ].filter(Boolean),
    }
  })

  return results
    .filter((r) => r.hebergement || r.activites.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
