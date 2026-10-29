"""Application entry point: register modules only; no business logic here."""
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from routes.auth import auth_bp
from routes.hebergements import hebergements_bp
from routes.restaurations import restaurations_bp
from routes.nlp import nlp_bp
from routes.system import system_bp
from services.rdf import Fuseki, Ontology

BASE = Path(__file__).resolve().parent

def create_app(test_config=None):
    # Configuration locale : les secrets et URLs sont hors du code source.
    load_dotenv(BASE / ".env")
    app = Flask(__name__)
    database_path = Path(os.getenv("DATABASE_PATH", "users.db"))
    ontology_path = Path(os.getenv("ONTOLOGY_PATH", "../ontologie finale.rdf"))
    # Les chemins relatifs du .env sont toujours interprétés depuis backend/.
    if not database_path.is_absolute(): database_path = BASE / database_path
    if not ontology_path.is_absolute(): ontology_path = BASE / ontology_path
    app.config.from_mapping(SECRET_KEY=os.getenv("SECRET_KEY", "dev-only-change-me"), DATABASE=str(database_path))
    if test_config: app.config.update(test_config)
    CORS(app, origins=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"), supports_credentials=True)
    # RDFLib valide le modèle OWL ; Fuseki exécute les requêtes sur les données.
    app.ontology = Ontology(ontology_path)
    app.fuseki = Fuseki(os.getenv("FUSEKI_QUERY_URL", "http://localhost:3030/eco/query"), os.getenv("FUSEKI_UPDATE_URL", "http://localhost:3030/eco/update"))
    # Chaque blueprint porte son URL complète /api/... afin d'éviter que Flask
    # n'écrase son préfixe lors de l'enregistrement.
    for blueprint in (auth_bp, system_bp, hebergements_bp, restaurations_bp, nlp_bp): app.register_blueprint(blueprint)

    @app.errorhandler(ValueError)
    def invalid(error): return jsonify(error=str(error)), 400
    @app.errorhandler(requests.RequestException)
    def fuseki_error(error): return jsonify(error="Fuseki indisponible", detail=str(error)), 503
    return app

if __name__ == "__main__": create_app().run(debug=True, port=5000)
