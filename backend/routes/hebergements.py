"""CRUD propre au module Hébergement.

Un autre membre peut reproduire cette structure dans son propre fichier de route
avec les classes et relations RDF de son module.
"""
import re

from flask import Blueprint, current_app, jsonify, request
from rdflib import RDF, RDFS

from services.auth import login_required
from services.rdf import MODULE_ROOTS, NS, decimal, entity_from_binding, iri_id, literal, norm, triples_from_data

hebergements_bp = Blueprint("hebergements", __name__, url_prefix="/api/hebergements")

def rechercher_hebergements(args):
    """Lecture SPARQL avec filtres réservés aux hébergements."""
    clauses = []
    if destination := args.get("destination"):
        iri_id(destination)
        clauses += ["?destination eco:possedeHebergement ?item .", f"FILTER(?destination = eco:{destination})"]
    if query := args.get("q"):
        clauses.append("FILTER(CONTAINS(LCASE(STR(?nom)), LCASE(%s)))" % literal(query))
    if type_ := args.get("type"):
        if not current_app.ontology.allowed_type("hebergements", type_): raise ValueError("Type d'hébergement non autorisé")
        clauses.append(f"?item rdf:type eco:{type_} .")
    if args.get("maxPrix"):
        clauses.append(f"FILTER(!BOUND(?prix) || ?prix <= {decimal(args['maxPrix'])})")
    sparql = f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}>
SELECT DISTINCT ?item ?type ?nom ?label ?prix ?destination WHERE {{
  ?item rdf:type ?type . ?type rdfs:subClassOf* <{MODULE_ROOTS['hebergements']}> .
  OPTIONAL {{ ?item eco:nom ?nom }} OPTIONAL {{ ?item rdfs:label ?label }} OPTIONAL {{ ?item eco:prix ?prix }}
  OPTIONAL {{ ?destination eco:possedeHebergement ?item }}
  {' '.join(clauses)}
}} ORDER BY LCASE(STR(?nom))'''
    return [entity_from_binding(row) for row in current_app.fuseki.query(sparql)]

@hebergements_bp.get("")
def lister_hebergements():
    return jsonify(rechercher_hebergements(request.args))

@hebergements_bp.get("/<item_id>")
def lire_hebergement(item_id):
    # Recherche par URI RDF, pas uniquement par nom affiché.
    iri_id(item_id)
    rows = [item for item in rechercher_hebergements({}) if item["id"] == item_id]
    return (jsonify(rows[0]), 200) if rows else (jsonify(error="Hébergement introuvable"), 404)

@hebergements_bp.post("")
@login_required
def creer_hebergement():
    data = request.get_json() or {}
    item_id = data.get("id") or re.sub(r"[^A-Za-z0-9]", "", norm(data.get("nom", "").title()))
    # L'écriture utilise uniquement les classes/propriétés autorisées par rdf.py.
    body = triples_from_data("hebergements", item_id, data, current_app.ontology)
    current_app.fuseki.update(f"PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> INSERT DATA {{ {body} }}")
    return jsonify({"id": item_id, "message": "Hébergement créé dans Fuseki"}), 201

@hebergements_bp.put("/<item_id>")
@login_required
def modifier_hebergement(item_id):
    item = iri_id(item_id); data = request.get_json() or {}
    body = triples_from_data("hebergements", item_id, data, current_app.ontology)
    # Suppression des anciennes propriétés et de l'ancienne destination avant réinsertion.
    current_app.fuseki.update(f"""PREFIX eco: <{NS}>
DELETE {{ {item} ?p ?o . ?d eco:possedeHebergement {item} }}
WHERE {{ OPTIONAL {{ {item} ?p ?o }} OPTIONAL {{ ?d eco:possedeHebergement {item} }} }};
INSERT DATA {{ {body} }}""")
    return jsonify({"id": item_id, "message": "Hébergement modifié dans Fuseki"})

@hebergements_bp.delete("/<item_id>")
@login_required
def supprimer_hebergement(item_id):
    item = iri_id(item_id)
    current_app.fuseki.update(f"""PREFIX eco: <{NS}>
DELETE {{ {item} ?p ?o . ?d eco:possedeHebergement {item} }}
WHERE {{ OPTIONAL {{ {item} ?p ?o }} OPTIONAL {{ ?d eco:possedeHebergement {item} }} }}""")
    return "", 204
