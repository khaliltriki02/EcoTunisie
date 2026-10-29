import re
import spacy

class FrenchQueryParser:
    """TALN déterministe : spaCy extrait les critères, un template construit la requête."""
    def __init__(self, ontology):
        self.ontology = ontology
        # Le modèle français apporte POS/NER ; le tokenizer reste disponible hors ligne.
        try: self.nlp = spacy.load(__import__('os').getenv('SPACY_MODEL', 'fr_core_news_sm'))
        except OSError: self.nlp = spacy.blank('fr')

    def parse(self, question):
        # 1) intention/module ; 2) type, budget, destination ; 3) paramètres de template.
        if not question or not question.strip(): raise ValueError("Question vide")
        doc, text = self.nlp(question), question.lower()
        restaurant_words = ("restaurant", "restauration", "vegan", "végétar", "bio", "marché", "manger")
        module = "restaurations" if any(w in text for w in restaurant_words) else "hebergements"
        params, intent = {}, "recherche"
        if "vegan" in text: params["type"] = "RestaurantVegan"
        elif "végétar" in text: params["type"] = "RestaurantVegetarien"
        elif "bio" in text: params["type"] = "RestaurantBio"
        elif "local" in text and module == "restaurations": params["type"] = "RestaurantLocal"
        elif "écolodge" in text: params["type"] = "Écolodge"
        elif "camping" in text: params["type"] = "Camping"
        prices = re.findall(r"(?:moins de|maximum|max|budget de?)\s*(\d+(?:[.,]\d+)?)", text)
        if prices: params["maxPrix"] = prices[-1].replace(',', '.')
        destinations = sorted(self.ontology.destinations, key=len, reverse=True)
        for destination in destinations:
            if destination.lower() in text: params["destination"] = destination; break
        names = [t.text for t in doc if t.pos_ in {"PROPN", "NOUN"}]
        if not params.get("destination") and len(names) >= 2 and any(x in text for x in ("nommé", "appelle", "chercher")): params["q"] = " ".join(names[-2:])
        if any(x in text for x in ("combien", "liste", "trouve", "cherche", "quels", "quel")): intent = "recherche_filtrée"
        return {"intent": intent, "module": module, "params": params, "template": "LIST_MODULE_WITH_FILTERS"}
