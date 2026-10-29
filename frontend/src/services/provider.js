// Couche d'accès aux données, indépendante de la source (provider-agnostic).
// Interface: { destinations(), entities(), byId(id), query({cls, dest}) }.
// Aujourd'hui: provider statique (src/data/kb.js). Pour brancher un triple store
// (Fuseki, GraphDB, API REST…), implémenter la même interface et l'injecter via setProvider().

import { destinations, entities } from '../data/kb'
import { isA } from '../ontology/schema'

export const createStaticProvider = () => {
  const all = [...destinations, ...entities]
  return {
    destinations: () => destinations,
    entities: () => entities,
    all: () => all,
    byId: (id) => all.find((e) => e.id === id),
    // Requête subsumption-aware: query({cls:'Hébergement'}) renvoie aussi Écolodge, Auberge…
    query: ({ cls, dest } = {}) =>
      all.filter((e) => (!cls || isA(e.type, cls)) && (!dest || e.dests?.includes(dest))),
  }
}

let current = createStaticProvider()
export const setProvider = (p) => { current = p }
export const getProvider = () => current
