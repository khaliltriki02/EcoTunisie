"""CRUD RDF des écoresponsabilités et recommandations."""
import re
from flask import Blueprint,current_app,jsonify,request
from rdflib import RDF,RDFS
from services.auth import login_required
from services.rdf import NS,iri_id,literal,local,norm

eco_bp=Blueprint("ecoresponsabilites",__name__,url_prefix="/api/ecoresponsabilites")
recommandations_bp=Blueprint("recommandations",__name__,url_prefix="/api/recommandations")
TYPES={"MobilitéDurable","GestionEau","EconomieLocale","ProtectionBiodiversité","GestionEnergie","RéductionCO2","GestionDéchets"}
def search(kind,args):
 root="Écoresponsabilité" if kind=="eco" else "Recommandation"; clauses=[]
 if args.get("type") and kind=="eco":
  if args["type"] not in TYPES: raise ValueError("Type écoresponsable invalide")
  clauses.append(f"?item rdf:type eco:{args['type']} .")
 if args.get("q"): clauses.append(f"FILTER(CONTAINS(LCASE(STR(?description)),LCASE({literal(args['q'])})))")
 q=f'''PREFIX eco:<{NS}> PREFIX rdf:<{RDF}> PREFIX rdfs:<{RDFS}> SELECT ?item ?type (SAMPLE(?description) AS ?description) (SAMPLE(?label) AS ?label) (SAMPLE(?score) AS ?score) WHERE {{ ?item rdf:type ?type . ?type rdfs:subClassOf* eco:{root} . OPTIONAL{{?item eco:description ?description}} OPTIONAL{{?item rdfs:label ?label}} OPTIONAL{{?item eco:ecoScore ?score}} {' '.join(clauses)} }} GROUP BY ?item ?type ORDER BY LCASE(STR(?description))'''
 return [{"id":local(r["item"]["value"]),"type":local(r["type"]["value"]),"description":r.get("description",{}).get("value") or r.get("label",{}).get("value") or local(r["item"]["value"]),"ecoScore":float(r["score"]["value"]) if r.get("score") else None} for r in current_app.fuseki.query(q)]
def body(kind,i,d):
 text=str(d.get("description","")).strip()
 if not text: raise ValueError("La description est obligatoire")
 t=d.get("type") if kind=="eco" else "Recommandation"
 if kind=="eco" and (t not in TYPES or t not in current_app.ontology.classes): raise ValueError("Type écoresponsable invalide")
 values=[f"eco:{i} rdf:type eco:{t}",f"eco:{i} rdfs:label {literal(text)}",f"eco:{i} eco:description {literal(text)}"]
 if kind=="reco" and d.get("ecoScore") not in (None,""):
  score=float(d["ecoScore"])
  if not 0<=score<=1: raise ValueError("ecoScore doit être entre 0 et 1")
  values.append(f"eco:{i} eco:ecoScore {score}")
 return " . ".join(values)+" ."
def make(kind):
 def list_(): return jsonify(search(kind,request.args))
 def create():
  d=request.get_json() or {};i=d.get("id") or re.sub(r"[^A-Za-z0-9]","",norm(d.get("description","").title()))
  current_app.fuseki.update(f"PREFIX eco:<{NS}> PREFIX rdf:<{RDF}> PREFIX rdfs:<{RDFS}> INSERT DATA {{ {body(kind,i,d)} }}");return jsonify(id=i),201
 def update(i): iri_id(i);current_app.fuseki.update(f"PREFIX eco:<{NS}> PREFIX rdf:<{RDF}> PREFIX rdfs:<{RDFS}> DELETE {{ eco:{i} ?p ?o }} WHERE {{ OPTIONAL{{eco:{i} ?p ?o}} }}; INSERT DATA {{ {body(kind,i,request.get_json() or {})} }}");return jsonify(id=i)
 def delete(i): iri_id(i);current_app.fuseki.update(f"PREFIX eco:<{NS}> DELETE {{ eco:{i} ?p ?o }} WHERE {{ OPTIONAL{{eco:{i} ?p ?o}} }}");return "",204
 return list_,login_required(create),login_required(update),login_required(delete)
for bp,kind in ((eco_bp,"eco"),(recommandations_bp,"reco")):
 l,c,u,d=make(kind);bp.add_url_rule("","list",l,methods=["GET"]);bp.add_url_rule("","create",c,methods=["POST"]);bp.add_url_rule("/<item_id>","update",u,methods=["PUT"]);bp.add_url_rule("/<item_id>","delete",d,methods=["DELETE"])
