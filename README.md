# EcoTunisie — front-end React (Vite)

Application de tourisme éco-responsable en Tunisie, structurée sur l'ontologie `ontologie_tourisme_corrigee_protege.rdf`.

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production → dist/
```

## Structure

| Fichier | Rôle |
|---|---|
| `src/ontology/schema.js` | Hiérarchie de classes (subClassOf), propriétés objet, helpers `isA`, `descendantsOf` |
| `src/data/kb.js` | Individus du RDF + individus d'extension (`ext: true`), préférences, profils |
| `src/services/provider.js` | Accès aux données (interface provider-agnostic, `setProvider()` pour brancher SPARQL/API) |
| `src/services/recommender.js` | Génère des individus `Recommandation` : 50 % éco-score, 35 % préférences, 15 % budget |
| `src/pages/*` | Home, Explorer (filtres subsumption-aware), Destination, Recommandations, Ontologie |

## Notes

- Les éco-scores, émissions CO₂ (g/km/pers.) et prix absents du RDF sont **indicatifs** ; à remplacer par des données réelles.
- Les individus `ext: true` complètent les destinations sans activité/hébergement dans le RDF.
- Les coordonnées GPS sont approximatives.
- Pour brancher un triple store, implémentez `destinations()`, `entities()`, `all()`, `byId()`, `query({cls, dest})` et appelez `setProvider(...)` dans `main.jsx`.
