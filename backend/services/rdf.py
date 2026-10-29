import re
import unicodedata
import requests
from rdflib import Graph, Namespace, OWL, RDF

"""Couche RDF commune : ontologie locale, sécurité SPARQL et client Fuseki."""

# Namespace défini dans l'ontologie Protégé fournie.
NS = Namespace("http://example.org/eco-tourism#")
# Racine de chaque module et sous-classes explicitement autorisées au CRUD.
MODULE_ROOTS = {"hebergements": NS["Hébergement"], "restaurations": NS.Restauration}
TYPE_BY_MODULE = {"hebergements": {"Hôtel", "Camping", "Écolodge", "Auberge", "MaisonDHôte"}, "restaurations": {"Restaurant", "MarchéAlimentaire", "RestaurantLocal", "RestaurantTraditionnel", "RestaurantBio", "RestaurantVegetarien", "RestaurantVegan"}}
def local(uri): return str(uri).rsplit("#", 1)[-1]
def norm(value): return "".join(c for c in unicodedata.normalize("NFD", value.lower()) if unicodedata.category(c) != "Mn")
# Échappe les textes avant insertion dans une requête SPARQL.
def literal(value): return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'
def iri_id(value):
    # Un identifiant RDF ne peut jamais être du SPARQL arbitraire.
    if not re.fullmatch(r"[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]*", value or ""): raise ValueError("Identifiant RDF invalide")
    return f"eco:{value}"
def decimal(value):
    if value is None or value == "": return None
    number = float(value)
    if number < 0: raise ValueError("Le prix doit être positif")
    return number
class Ontology:
    def __init__(self, filename):
        self.graph = Graph(); self.graph.parse(filename)
        # Les classes réellement déclarées dans le RDF sont la source de vérité.
        self.classes = {local(c) for c in self.graph.subjects(RDF.type, OWL.Class)}
        self.destinations = {local(s) for s in self.graph.subjects(RDF.type, None) if any(str(t).startswith(str(NS)) and "Destination" in local(t) for t in self.graph.objects(s, RDF.type))}
    def allowed_type(self, module, value): return value in TYPE_BY_MODULE[module] and value in self.classes
class Fuseki:
    def __init__(self, query_url, update_url): self.query_url, self.update_url = query_url, update_url
    def query(self, sparql):
        # Endpoint SPARQL Query : attendu au format JSON standard.
        response = requests.post(self.query_url, data={"query": sparql}, headers={"Accept": "application/sparql-results+json"}, timeout=12); response.raise_for_status(); return response.json()["results"]["bindings"]
    def update(self, sparql):
        # Endpoint SPARQL Update : POST séparé des requêtes de lecture.
        response = requests.post(self.update_url, data={"update": sparql}, timeout=12); response.raise_for_status()
def entity_from_binding(row):
    get = lambda key: row.get(key, {}).get("value")
    return {"id": local(get("item")), "uri": get("item"), "type": local(get("type")), "nom": get("nom") or get("label") or local(get("item")), "prix": float(get("prix")) if get("prix") else None, "cuisine": get("cuisine"), "destination": local(get("destination")) if get("destination") else None, "produitsLocaux": get("produitsLocaux") == "true" if get("produitsLocaux") else None, "optionVegan": get("optionVegan") == "true" if get("optionVegan") else None}
def triples_from_data(module, item_id, data, ontology):
    # Transforme exclusivement les champs connus de l'API en triplets RDF.
    item, type_ = iri_id(item_id), data.get("type")
    if not ontology.allowed_type(module, type_): raise ValueError("Type RDF invalide pour ce module")
    nom = data.get("nom", "").strip()
    if not nom: raise ValueError("Le nom est obligatoire")
    triples = [f"{item} rdf:type eco:{type_}", f"{item} eco:nom {literal(nom)}"]
    if data.get("prix") not in (None, ""): triples.append(f"{item} eco:prix {decimal(data['prix'])}")
    if module == "restaurations":
        if data.get("cuisine"): triples.append(f"{item} eco:typeCuisine {literal(data['cuisine'])}")
        for field in ("produitsLocaux", "optionVegan"):
            if field in data: triples.append(f"{item} eco:{field} {'true' if data[field] else 'false'}")
    if destination := data.get("destination"):
        iri_id(destination); relation = "possedeHebergement" if module == "hebergements" else "possedeRestauration"; triples.append(f"eco:{destination} eco:{relation} {item}")
    return " . ".join(triples) + " ."
