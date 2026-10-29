from flask import Blueprint, current_app, jsonify, request, session
from nlp import FrenchQueryParser
from routes.hebergements import rechercher_hebergements
from routes.restaurations import rechercher_restaurations
from routes.preferences import rechercher_preferences
from routes.transports import rechercher_transports
from routes.activites import rechercher_activites
from routes.destinations import rechercher_destinations
from routes.lieux import rechercher_lieux
from routes.eco_recommandations import search as rechercher_eco

nlp_bp = Blueprint("nlp", __name__, url_prefix="/api/nlp")

@nlp_bp.post("/query")
def nlp_query():
    # Le TALN ne reçoit jamais de SPARQL libre : il appelle le CRUD du module détecté.
    parsed = FrenchQueryParser(current_app.ontology).parse((request.get_json() or {}).get("question", ""))
    if parsed["module"] == "preferences":
        if "user_id" not in session: return jsonify(error="Authentification requise pour rechercher vos préférences"), 401
        search = rechercher_preferences
    elif parsed["module"] == "transports":
        search = rechercher_transports
    elif parsed["module"] == "activites":
        search = rechercher_activites
    elif parsed["module"] == "destinations":
        search = rechercher_destinations
    elif parsed["module"] == "lieux":
        search = rechercher_lieux
    elif parsed["module"] == "ecoresponsabilites":
        search = lambda params: rechercher_eco("eco", params)
    elif parsed["module"] == "recommandations":
        search = lambda params: rechercher_eco("reco", params)
    else:
        search = rechercher_restaurations if parsed["module"] == "restaurations" else rechercher_hebergements
    return jsonify(intent=parsed["intent"], module=parsed["module"], sparql_template=parsed["template"], results=search(parsed["params"]))
