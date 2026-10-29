"""CRUD des préférences personnelles liées à l'individu Personne connecté."""
import uuid

from flask import Blueprint, current_app, jsonify, request, session
from rdflib import RDF, RDFS

from services.auth import login_required
from services.rdf import NS, PREFERENCE_TYPES, iri_id, literal, local, preference_triples

preferences_bp = Blueprint("preferences", __name__, url_prefix="/api/preferences")

def rechercher_preferences(args):
    person_id = iri_id(session.get("person_id", ""))
    clauses = []
    if args.get("type"):
        if args["type"] not in PREFERENCE_TYPES: raise ValueError("Type de préférence invalide")
        clauses.append(f"FILTER(?type = eco:{args['type']})")
    if args.get("q"):
        clauses.append(f"FILTER(CONTAINS(LCASE(STR(?description)), LCASE({literal(args['q'])})))")
    query = f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}>
SELECT DISTINCT ?item ?type ?description ?label WHERE {{
  {person_id} eco:aPourPreference ?item .
  ?item rdf:type ?type . ?type rdfs:subClassOf* eco:Préférence .
  OPTIONAL {{ ?item eco:description ?description }} OPTIONAL {{ ?item rdfs:label ?label }}
  {' '.join(clauses)}
}} ORDER BY LCASE(STR(?description))'''
    values = []
    for row in current_app.fuseki.query(query):
        get = lambda key: row.get(key, {}).get("value", "")
        values.append({"id": local(get("item")), "type": local(get("type")), "description": get("description") or get("label")})
    return values

def _preferences():
    return rechercher_preferences({})

def _own_preference(item_id):
    iri_id(item_id)
    return next((item for item in _preferences() if item["id"] == item_id), None)

@preferences_bp.get("")
@login_required
def lister_preferences():
    args = {key: request.args.get(key, "") for key in ("type", "q")}
    return jsonify(rechercher_preferences(args))

@preferences_bp.post("")
@login_required
def creer_preference():
    item_id = f"Preference{session['user_id']}{uuid.uuid4().hex[:8]}"
    body = preference_triples(item_id, request.get_json() or {}, current_app.ontology)
    person_id = iri_id(session["person_id"])
    current_app.fuseki.update(f"PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}> INSERT DATA {{ {body} {person_id} eco:aPourPreference eco:{item_id} . }}")
    return jsonify(id=item_id, message="Préférence créée dans Fuseki"), 201

@preferences_bp.put("/<item_id>")
@login_required
def modifier_preference(item_id):
    if not _own_preference(item_id): return jsonify(error="Préférence introuvable"), 404
    body = preference_triples(item_id, request.get_json() or {}, current_app.ontology)
    current_app.fuseki.update(f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}>
DELETE {{ eco:{item_id} ?p ?o }} WHERE {{ OPTIONAL {{ eco:{item_id} ?p ?o }} }};
INSERT DATA {{ {body} }}''')
    return jsonify(id=item_id, message="Préférence mise à jour dans Fuseki")

@preferences_bp.delete("/<item_id>")
@login_required
def supprimer_preference(item_id):
    if not _own_preference(item_id): return jsonify(error="Préférence introuvable"), 404
    person_id = iri_id(session["person_id"])
    current_app.fuseki.update(f'''PREFIX eco: <{NS}>
DELETE {{ eco:{item_id} ?p ?o . {person_id} eco:aPourPreference eco:{item_id} }}
WHERE {{ OPTIONAL {{ eco:{item_id} ?p ?o }} OPTIONAL {{ {person_id} eco:aPourPreference eco:{item_id} }} }}''')
    return "", 204
