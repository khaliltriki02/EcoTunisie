"""Routes CRUD du module Activité."""
from flask import Blueprint, jsonify, request
from services.auth import login_required
from services.catalogue import create, remove, search, update
from services.rdf import iri_id

activites_bp = Blueprint("activites", __name__, url_prefix="/api/activites")
def rechercher_activites(args): return search("activites", args)
@activites_bp.get("")
def lister_activites(): return jsonify(rechercher_activites(request.args))
@activites_bp.get("/<item_id>")
def lire_activite(item_id):
    iri_id(item_id); item=next((x for x in rechercher_activites({}) if x["id"]==item_id),None)
    return (jsonify(item),200) if item else (jsonify(error="Activité introuvable"),404)
@activites_bp.post("")
@login_required
def creer_activite(): return create("activites")
@activites_bp.put("/<item_id>")
@login_required
def modifier_activite(item_id): return update("activites",item_id)
@activites_bp.delete("/<item_id>")
@login_required
def supprimer_activite(item_id): return remove("activites",item_id)
