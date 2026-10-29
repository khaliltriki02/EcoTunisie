import re
from flask import Blueprint,current_app,jsonify,request
from rdflib import RDF,RDFS
from services.auth import login_required
from services.rdf import NS,iri_id,literal,local,norm
lieux_bp=Blueprint("lieux",__name__,url_prefix="/api/lieux")
TYPES={"Musée","SiteHistorique","Monument","Plage","MarchéLocal","SiteArchéologique","ParcNaturel"}
def rechercher_lieux(args):
 clauses=[]
 if args.get("type"):
  if args["type"] not in TYPES: raise ValueError("Type de lieu invalide")
  clauses.append(f"?item rdf:type eco:{args['type']} .")
 if args.get("q"): clauses.append(f"FILTER(CONTAINS(LCASE(STR(?nom)),LCASE({literal(args['q'])})))")
 q=f'''PREFIX eco:<{NS}> PREFIX rdf:<{RDF}> PREFIX rdfs:<{RDFS}> SELECT ?item ?type (SAMPLE(?nom) AS ?nom) (SAMPLE(?destination) AS ?destination) WHERE {{ ?item rdf:type ?type . ?type rdfs:subClassOf* eco:LieuTouristique . OPTIONAL{{?item eco:nom ?nom}} OPTIONAL{{?item eco:situeDans ?destination}} {' '.join(clauses)} }} GROUP BY ?item ?type ORDER BY LCASE(STR(?nom))'''
 return [{"id":local(r["item"]["value"]),"type":local(r["type"]["value"]),"nom":r.get("nom",{}).get("value") or local(r["item"]["value"]),"destination":local(r["destination"]["value"]) if r.get("destination") else None} for r in current_app.fuseki.query(q)]
def body(i,d):
 t=d.get("type"); nom=str(d.get("nom","")).strip()
 if t not in TYPES or t not in current_app.ontology.classes: raise ValueError("Type de lieu invalide")
 if not nom: raise ValueError("Le nom est obligatoire")
 v=[f"eco:{i} rdf:type eco:{t}",f"eco:{i} eco:nom {literal(nom)}"]
 if d.get("destination"): iri_id(d["destination"]);v.append(f"eco:{i} eco:situeDans eco:{d['destination']}")
 return " . ".join(v)+" ."
@lieux_bp.get("")
def list_(): return jsonify(rechercher_lieux(request.args))
@lieux_bp.post("")
@login_required
def create():
 d=request.get_json() or {};i=d.get("id") or re.sub(r"[^A-Za-z0-9]","",norm(d.get("nom","").title()));current_app.fuseki.update(f"PREFIX eco:<{NS}> PREFIX rdf:<{RDF}> INSERT DATA {{ {body(i,d)} }}");return jsonify(id=i),201
@lieux_bp.put("/<item_id>")
@login_required
def update(item_id): iri_id(item_id);current_app.fuseki.update(f"PREFIX eco:<{NS}> PREFIX rdf:<{RDF}> DELETE {{ eco:{item_id} ?p ?o }} WHERE {{ OPTIONAL{{eco:{item_id} ?p ?o}} }}; INSERT DATA {{ {body(item_id,request.get_json() or {})} }}");return jsonify(id=item_id)
@lieux_bp.delete("/<item_id>")
@login_required
def delete(item_id): iri_id(item_id);current_app.fuseki.update(f"PREFIX eco:<{NS}> DELETE {{ eco:{item_id} ?p ?o }} WHERE {{ OPTIONAL{{eco:{item_id} ?p ?o}} }}");return "",204
