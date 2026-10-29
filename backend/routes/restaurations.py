"""CRUD propre au module Restauration."""
import re

from flask import Blueprint, current_app, jsonify, request
from rdflib import RDF, RDFS

from services.auth import login_required
from services.rdf import MODULE_ROOTS, NS, decimal, entity_from_binding, iri_id, literal, norm, triples_from_data

restaurations_bp = Blueprint("restaurations", __name__, url_prefix="/api/restaurations")

def rechercher_restaurations(args):
    """Lecture SPARQL avec cuisine, options et lien possedeRestauration."""
    clauses = []
    if destination := args.get("destination"):
        iri_id(destination)
        clauses += ["?destination eco:possedeRestauration ?item .", f"FILTER(?destination = eco:{destination})"]
    if query := args.get("q"):
        clauses.append("FILTER(CONTAINS(LCASE(STR(?nom)), LCASE(%s)))" % literal(query))
    if type_ := args.get("type"):
        if not current_app.ontology.allowed_type("restaurations", type_): raise ValueError("Type de restauration non autorisé")
        clauses.append(f"?item rdf:type eco:{type_} .")
    if args.get("maxPrix"):
        clauses.append(f"FILTER(!BOUND(?prix) || ?prix <= {decimal(args['maxPrix'])})")
    sparql = f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}>
SELECT DISTINCT ?item ?type ?nom ?label ?prix ?cuisine ?destination ?produitsLocaux ?optionVegan WHERE {{
  ?item rdf:type ?type . ?type rdfs:subClassOf* <{MODULE_ROOTS['restaurations']}> .
  OPTIONAL {{ ?item eco:nom ?nom }} OPTIONAL {{ ?item rdfs:label ?label }} OPTIONAL {{ ?item eco:prix ?prix }} OPTIONAL {{ ?item eco:typeCuisine ?cuisine }} OPTIONAL {{ ?item eco:produitsLocaux ?produitsLocaux }} OPTIONAL {{ ?item eco:optionVegan ?optionVegan }}
  OPTIONAL {{ ?destination eco:possedeRestauration ?item }}
  {' '.join(clauses)}
}} ORDER BY LCASE(STR(?nom))'''
    return [entity_from_binding(row) for row in current_app.fuseki.query(sparql)]

@restaurations_bp.get("")
def lister_restaurations(): return jsonify(rechercher_restaurations(request.args))

@restaurations_bp.get("/<item_id>")
def lire_restauration(item_id):
    iri_id(item_id); rows = [item for item in rechercher_restaurations({}) if item["id"] == item_id]
    return (jsonify(rows[0]), 200) if rows else (jsonify(error="Restauration introuvable"), 404)

@restaurations_bp.post("")
@login_required
def creer_restauration():
    data = request.get_json() or {}; item_id = data.get("id") or re.sub(r"[^A-Za-z0-9]", "", norm(data.get("nom", "").title()))
    body = triples_from_data("restaurations", item_id, data, current_app.ontology)
    current_app.fuseki.update(f"PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> INSERT DATA {{ {body} }}")
    return jsonify({"id": item_id, "message": "Restauration créée dans Fuseki"}), 201

@restaurations_bp.put("/<item_id>")
@login_required
def modifier_restauration(item_id):
    item = iri_id(item_id); data = request.get_json() or {}; body = triples_from_data("restaurations", item_id, data, current_app.ontology)
    current_app.fuseki.update(f"""PREFIX eco: <{NS}>
DELETE {{ {item} ?p ?o . ?d eco:possedeRestauration {item} }}
WHERE {{ OPTIONAL {{ {item} ?p ?o }} OPTIONAL {{ ?d eco:possedeRestauration {item} }} }};
INSERT DATA {{ {body} }}""")
    return jsonify({"id": item_id, "message": "Restauration modifiée dans Fuseki"})

@restaurations_bp.delete("/<item_id>")
@login_required
def supprimer_restauration(item_id):
    item = iri_id(item_id)
    current_app.fuseki.update(f"""PREFIX eco: <{NS}>
DELETE {{ {item} ?p ?o . ?d eco:possedeRestauration {item} }}
WHERE {{ OPTIONAL {{ {item} ?p ?o }} OPTIONAL {{ ?d eco:possedeRestauration {item} }} }}""")
    return "", 204
