"""Routes CRUD du module Transport."""
from flask import Blueprint, jsonify, request
from services.auth import login_required
from services.catalogue import create, remove, search, update
from services.rdf import iri_id

transports_bp = Blueprint("transports", __name__, url_prefix="/api/transports")
def rechercher_transports(args): return search("transports", args)
@transports_bp.get("")
def lister_transports(): return jsonify(rechercher_transports(request.args))
@transports_bp.get("/<item_id>")
def lire_transport(item_id):
    iri_id(item_id); item=next((x for x in rechercher_transports({}) if x["id"]==item_id),None)
    return (jsonify(item),200) if item else (jsonify(error="Transport introuvable"),404)
@transports_bp.post("")
@login_required
def creer_transport(): return create("transports")
@transports_bp.put("/<item_id>")
@login_required
def modifier_transport(item_id): return update("transports",item_id)
@transports_bp.delete("/<item_id>")
@login_required
def supprimer_transport(item_id): return remove("transports",item_id)
