"""Logique RDF partagée par les routes Transport et Activité."""
import re
from flask import current_app, jsonify, request
from rdflib import RDF, RDFS
from services.rdf import NS, decimal, iri_id, literal, local, norm

CONFIG = {
 "transports": {"root":"Transport","relation":"transportDessert","price":"prixTransport","types":{"Taxi","Voiture","Marche","Vélo","Covoiturage","Tramway","Train","Bus"},"strings":("frequenceTransport",),"numbers":("emissionCO2","dureeTrajet","capaciteTransport"),"booleans":("accessiblePMRTransport",)},
 "activites": {"root":"Activité","relation":"proposeActivite","price":"prix","types":{"ActivitéAventure","ActivitéBienEtre","ActivitéGastronomique","ActivitéCulturelle","ActivitéNature","ActivitéSportive","Festival","Artisanat","VisiteMusée","VisiteMonument","Randonnée","ObservationFaune","ObservationFlore","Ecotourisme"},"strings":("niveauDifficulte",),"numbers":(),"booleans":()},
}
def search(kind,args):
 cfg=CONFIG[kind]; clauses=[]
 if args.get("type"):
  if args["type"] not in cfg["types"] or args["type"] not in current_app.ontology.classes: raise ValueError("Type RDF invalide")
  clauses.append(f"?item rdf:type eco:{args['type']} .")
 if args.get("q"): clauses.append(f"FILTER(CONTAINS(LCASE(STR(?nom)), LCASE({literal(args['q'])})))")
 if args.get("maxPrix"): clauses.append(f"FILTER(!BOUND(?prix) || ?prix <= {decimal(args['maxPrix'])})")
 if args.get("destination"):
  iri_id(args["destination"]); clauses += [f"?destination eco:{cfg['relation']} ?item .",f"FILTER(?destination = eco:{args['destination']})"]
 q=f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> PREFIX rdfs: <{RDFS}>
SELECT ?item ?type (SAMPLE(?nom) AS ?nom) (SAMPLE(?label) AS ?label) (SAMPLE(?prix) AS ?prix) (SAMPLE(?destination) AS ?destination) (SAMPLE(?niveau) AS ?niveau) (SAMPLE(?emission) AS ?emission) (SAMPLE(?duree) AS ?duree) (SAMPLE(?frequence) AS ?frequence) (SAMPLE(?pmr) AS ?pmr) WHERE {{ ?item rdf:type ?type . ?type rdfs:subClassOf* eco:{cfg['root']} . OPTIONAL {{ ?item eco:nom ?nom }} OPTIONAL {{ ?item rdfs:label ?label }} OPTIONAL {{ ?item eco:{cfg['price']} ?prix }} OPTIONAL {{ ?destination eco:{cfg['relation']} ?item }} OPTIONAL {{ ?item eco:niveauDifficulte ?niveau }} OPTIONAL {{ ?item eco:emissionCO2 ?emission }} OPTIONAL {{ ?item eco:dureeTrajet ?duree }} OPTIONAL {{ ?item eco:frequenceTransport ?frequence }} OPTIONAL {{ ?item eco:accessiblePMRTransport ?pmr }} {' '.join(clauses)} }} GROUP BY ?item ?type ORDER BY LCASE(STR(?nom))'''
 out=[]
 for row in current_app.fuseki.query(q):
  get=lambda k:row.get(k,{}).get("value")
  out.append({"id":local(get("item")),"type":local(get("type")),"nom":get("nom") or get("label") or local(get("item")),"prix":float(get("prix")) if get("prix") else None,"destination":local(get("destination")) if get("destination") else None,"niveauDifficulte":get("niveau"),"emissionCO2":float(get("emission")) if get("emission") else None,"dureeTrajet":int(float(get("duree"))) if get("duree") else None,"frequenceTransport":get("frequence"),"accessiblePMRTransport":get("pmr")=="true" if get("pmr") else None})
 return out
def triples(kind,item_id,data):
 cfg=CONFIG[kind]; item=iri_id(item_id); type_=data.get("type")
 if type_ not in cfg["types"] or type_ not in current_app.ontology.classes: raise ValueError("Type RDF invalide")
 nom=str(data.get("nom","")).strip()
 if not nom: raise ValueError("Le nom est obligatoire")
 values=[f"{item} rdf:type eco:{type_}",f"{item} eco:nom {literal(nom)}"]
 if data.get("prix") not in (None,""): values.append(f"{item} eco:{cfg['price']} {decimal(data['prix'])}")
 for field in cfg["strings"]:
  if data.get(field): values.append(f"{item} eco:{field} {literal(data[field])}")
 for field in cfg["numbers"]:
  if data.get(field) not in (None,""):
   number=float(data[field]);
   if number<0: raise ValueError(f"{field} doit être positif")
   values.append(f"{item} eco:{field} {number}")
 for field in cfg["booleans"]:
  if field in data: values.append(f"{item} eco:{field} {'true' if data[field] else 'false'}")
 if data.get("destination"): iri_id(data["destination"]); values.append(f"eco:{data['destination']} eco:{cfg['relation']} {item}")
 return " . ".join(values)+" ."
def create(kind):
 data=request.get_json() or {}; item_id=data.get("id") or re.sub(r"[^A-Za-z0-9]","",norm(data.get("nom","").title()))
 if any(item["id"]==item_id for item in search(kind,{})): return jsonify(error="Un élément avec cet identifiant existe déjà ; utilisez Modifier."),409
 current_app.fuseki.update(f"PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> INSERT DATA {{ {triples(kind,item_id,data)} }}")
 return jsonify(id=item_id,message="Élément créé dans Fuseki"),201
def update(kind,item_id):
 iri_id(item_id); relation=CONFIG[kind]["relation"]
 current_app.fuseki.update(f'''PREFIX eco: <{NS}> PREFIX rdf: <{RDF}> DELETE {{ eco:{item_id} ?p ?o . ?d eco:{relation} eco:{item_id} }} WHERE {{ OPTIONAL {{ eco:{item_id} ?p ?o }} OPTIONAL {{ ?d eco:{relation} eco:{item_id} }} }}; INSERT DATA {{ {triples(kind,item_id,request.get_json() or {})} }}''')
 return jsonify(id=item_id,message="Élément mis à jour dans Fuseki")
def remove(kind,item_id):
 iri_id(item_id); relation=CONFIG[kind]["relation"]
 current_app.fuseki.update(f'''PREFIX eco: <{NS}> DELETE {{ eco:{item_id} ?p ?o . ?d eco:{relation} eco:{item_id} }} WHERE {{ OPTIONAL {{ eco:{item_id} ?p ?o }} OPTIONAL {{ ?d eco:{relation} eco:{item_id} }} }}''')
 return "",204
