from flask import Blueprint, current_app, jsonify
from rdflib import RDF, RDFS
from services.rdf import NS, local
system_bp = Blueprint("system", __name__, url_prefix="/api")
@system_bp.get("/health")
def health():
    # SELECT (et non ASK) car le client Fuseki attend un tableau de bindings JSON.
    current_app.fuseki.query("SELECT ?s WHERE { ?s ?p ?o } LIMIT 1"); return jsonify(status="ok", ontology_classes=len(current_app.ontology.classes))
@system_bp.get("/destinations")
def destinations():
    rows = current_app.fuseki.query(f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}> SELECT DISTINCT ?id ?nom WHERE {{ ?id rdf:type ?type . ?type rdfs:subClassOf* eco:Destination . OPTIONAL {{ ?id eco:nom ?nom }} }} ORDER BY LCASE(STR(?nom))''')
    return jsonify([{"id": local(x["id"]["value"]), "nom": x.get("nom", {}).get("value") or local(x["id"]["value"])} for x in rows])
