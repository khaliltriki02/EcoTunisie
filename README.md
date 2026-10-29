# Eco Tunisie — Hébergement et Restauration

Cette livraison couvre uniquement les modules **Hébergement** et **Restauration** de l'ontologie existante. Elle ne modifie pas `ontologie finale.rdf`.

Le frontend conserve son design React et l'écran **Explorer** lit désormais les résultats de Fuseki pour ces deux catégories. Il n'y a pas de repli vers les données de démonstration pour ces résultats : si Fuseki n'est pas disponible, l'interface signale l'erreur.

## Architecture

- `eco-tourisme-tn/` : interface React/Vite.
- `backend/app.py` : point d'entrée Flask et enregistrement des blueprints.
- `backend/routes/` : un module par responsabilité (`hebergements.py`, `restaurations.py`, `auth.py`, `nlp.py`, `system.py`). Chaque module possède son propre CRUD ; les futurs modules des autres membres doivent suivre ce modèle.
- `backend/services/` : éléments partagés (Fuseki/RDFLib, sécurité SPARQL et SQLite), à réutiliser sans duplication.
- `backend/nlp.py` : analyse française déterministe avec spaCy (intention, destination, type et budget), puis application d'un template SPARQL contrôlé.
- `ontologie finale.rdf` : source RDF/OWL fournie, inchangée.

Les écritures passent par les endpoints SPARQL Update de Fuseki. RDFLib charge l'ontologie au démarrage pour vérifier les classes RDF autorisées. Les mots de passe sont stockés avec le hachage Werkzeug, jamais en clair.

## Installation

1. Créer un dataset persistant nommé `eco` dans Apache Jena Fuseki, puis charger l'ontologie :

```powershell
curl.exe -X POST -H "Content-Type: application/rdf+xml" --data-binary "@ontologie finale.rdf" http://localhost:3030/eco/data
```

2. Configurer et démarrer l'API :

```powershell
Copy-Item backend/.env.example backend/.env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m spacy download fr_core_news_sm
python backend/app.py
```

`SPACY_MODEL` peut rester absent : le module emploie alors le tokenizer français minimal de spaCy, mais le modèle `fr_core_news_sm` est recommandé.

3. Dans un second terminal, démarrer React :

```powershell
cd eco-tourisme-tn
npm install
npm run dev
```

Optionnellement, définir `VITE_API_URL=http://localhost:5000/api` dans `eco-tourisme-tn/.env`.

## API REST

| Méthode | Route | Rôle |
| --- | --- | --- |
| GET | `/api/hebergements`, `/api/restaurations` | Lecture et recherche (`q`, `type`, `destination`, `maxPrix`) |
| GET/PUT/DELETE | `/api/{module}/{id}` | Lire, modifier, supprimer (écriture authentifiée) |
| POST | `/api/{module}` | Créer un individu RDF (authentifié) |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Inscription, session, déconnexion |
| POST | `/api/nlp/query` | Question française vers recherche SPARQL contrôlée |
| GET | `/api/health` | Vérification de Fuseki |

Exemple TALN :

```json
POST /api/nlp/query
{ "question": "Quels restaurants vegan à Tunis à moins de 30 dinars ?" }
```

La réponse contient l'intention, les paramètres extraits, le nom du template et les résultats réellement retournés par Fuseki. Les paramètres sont validés contre les classes de l'ontologie et les littéraux sont échappés ; l'utilisateur ne peut donc pas envoyer du SPARQL brut.

## Tests

Après installation des dépendances :

```powershell
python -m unittest discover backend/tests -v
```

Ils couvrent les intentions et entités principales de la conversion TALN. Les tests d'intégration nécessitent un Fuseki démarré avec le dataset `eco` chargé, car l'application ne simule pas de résultats RDF.
