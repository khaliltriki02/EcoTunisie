from flask import Blueprint, current_app, jsonify, request, session
from nlp import FrenchQueryParser
from routes.hebergements import rechercher_hebergements
from routes.restaurations import rechercher_restaurations
from routes.preferences import rechercher_preferences

nlp_bp = Blueprint("nlp", __name__, url_prefix="/api/nlp")

@nlp_bp.post("/query")
def nlp_query():
    # Le TALN ne reçoit jamais de SPARQL libre : il appelle le CRUD du module détecté.
    parsed = FrenchQueryParser(current_app.ontology).parse((request.get_json() or {}).get("question", ""))
    if parsed["module"] == "preferences":
        if "user_id" not in session: return jsonify(error="Authentification requise pour rechercher vos préférences"), 401
        search = rechercher_preferences
    else:
        search = rechercher_restaurations if parsed["module"] == "restaurations" else rechercher_hebergements
    return jsonify(intent=parsed["intent"], module=parsed["module"], sparql_template=parsed["template"], results=search(parsed["params"]))
