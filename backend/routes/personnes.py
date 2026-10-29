"""CRUD des profils Personne stockés dans Apache Jena Fuseki."""
from flask import Blueprint, current_app, jsonify, request, session
from rdflib import RDF, RDFS

from services.auth import database, login_required
from services.rdf import NS, iri_id, local, person_triples

personnes_bp = Blueprint("personnes", __name__, url_prefix="/api/personnes")

def _people():
    query = f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}>
SELECT DISTINCT ?item ?type ?nom ?prenom ?email ?telephone ?age WHERE {{
  ?item rdf:type ?type . ?type rdfs:subClassOf* eco:Personne .
  OPTIONAL {{ ?item eco:nom ?nom }} OPTIONAL {{ ?item eco:prenom ?prenom }}
  OPTIONAL {{ ?item eco:email ?email }} OPTIONAL {{ ?item eco:telephone ?telephone }} OPTIONAL {{ ?item eco:age ?age }}
}} ORDER BY LCASE(STR(?nom))'''
    people = []
    for row in current_app.fuseki.query(query):
        get = lambda field: row.get(field, {}).get("value", "")
        people.append({"id": local(get("item")), "nom": get("nom") or local(get("item")), "prenom": get("prenom"),
                       "email": get("email"), "telephone": get("telephone"), "age": get("age"), "type": local(get("type"))})
    return people

def _can_change(item_id):
    return session.get("person_id") == item_id

@personnes_bp.get("")
@login_required
def lister_personnes():
    # Les données personnelles de l'ontologie ne sont pas exposées aux autres comptes.
    return jsonify([item for item in _people() if item["id"] == session.get("person_id")])

@personnes_bp.get("/<item_id>")
@login_required
def lire_personne(item_id):
    iri_id(item_id)
    if not _can_change(item_id): return jsonify(error="Vous ne pouvez lire que votre profil"), 403
    person = next((item for item in _people() if item["id"] == item_id), None)
    return (jsonify(person), 200) if person else (jsonify(error="Personne introuvable"), 404)

@personnes_bp.post("")
@login_required
def creer_personne():
    """Point CRUD également utile aux anciens comptes sans profil RDF."""
    if session.get("person_id"):
        return jsonify(error="Un profil Personne est déjà lié à ce compte"), 409
    item_id = f"Personne{session['user_id']}"
    body = person_triples(item_id, request.get_json() or {})
    current_app.fuseki.update(f"PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> INSERT DATA {{ {body} }}")
    con = database(); con.execute("UPDATE users SET person_id=? WHERE id=?", (item_id, session["user_id"])); con.commit()
    session["person_id"] = item_id
    return jsonify(id=item_id, message="Profil créé dans Fuseki"), 201

@personnes_bp.put("/<item_id>")
@login_required
def modifier_personne(item_id):
    iri_id(item_id)
    if not _can_change(item_id): return jsonify(error="Vous ne pouvez modifier que votre profil"), 403
    body = person_triples(item_id, request.get_json() or {})
    current_app.fuseki.update(f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}>
DELETE {{ eco:{item_id} ?p ?o }} WHERE {{ OPTIONAL {{ eco:{item_id} ?p ?o }} }};
INSERT DATA {{ {body} }}''')
    return jsonify(id=item_id, message="Profil mis à jour dans Fuseki")

@personnes_bp.delete("/<item_id>")
@login_required
def supprimer_personne(item_id):
    iri_id(item_id)
    if not _can_change(item_id): return jsonify(error="Vous ne pouvez supprimer que votre profil"), 403
    current_app.fuseki.update(f"PREFIX eco: <{NS}> DELETE {{ eco:{item_id} ?p ?o }} WHERE {{ OPTIONAL {{ eco:{item_id} ?p ?o }} }}")
    # La suppression du profil correspond aussi à la fermeture du compte lié.
    con = database(); con.execute("DELETE FROM users WHERE person_id=?", (item_id,)); con.commit()
    session.clear()
    return "", 204
