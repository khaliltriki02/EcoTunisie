import re
import spacy

class FrenchQueryParser:
    """TALN déterministe : sélection d'un module et de paramètres validés."""
    def __init__(self, ontology):
        self.ontology = ontology
        try: self.nlp = spacy.load(__import__('os').getenv('SPACY_MODEL', 'fr_core_news_sm'))
        except OSError: self.nlp = spacy.blank('fr')

    def parse(self, question):
        if not question or not question.strip(): raise ValueError("Question vide")
        doc, text = self.nlp(question), question.lower()
        restaurant_words = ("restaurant", "restauration", "vegan", "végétar", "bio", "marché", "manger")
        preference_words = ("préférence", "preference", "mes goûts", "mes gouts", "j'aime", "j aime")
        if any(word in text for word in preference_words): module = "preferences"
        elif any(word in text for word in restaurant_words): module = "restaurations"
        else: module = "hebergements"
        params, intent = {}, "recherche"
        if module == "preferences":
            mapping = {"nature": "PréférenceNature", "culture": "PréférenceCulturelle", "gastronom": "PréférenceGastronomique", "sport": "PréférenceSportive", "aventure": "PréférenceAventure", "bien-être": "PréférenceBienEtre", "bien etre": "PréférenceBienEtre"}
            for word, type_ in mapping.items():
                if word in text: params["type"] = type_; break
        elif "vegan" in text: params["type"] = "RestaurantVegan"
        elif "végétar" in text: params["type"] = "RestaurantVegetarien"
        elif "bio" in text: params["type"] = "RestaurantBio"
        elif "local" in text and module == "restaurations": params["type"] = "RestaurantLocal"
        elif "écolodge" in text: params["type"] = "Écolodge"
        elif "camping" in text: params["type"] = "Camping"
        prices = re.findall(r"(?:moins de|maximum|max|budget de?)\s*(\d+(?:[.,]\d+)?)", text)
        if prices and module != "preferences": params["maxPrix"] = prices[-1].replace(',', '.')
        if module != "preferences":
            for destination in sorted(self.ontology.destinations, key=len, reverse=True):
                if destination.lower() in text: params["destination"] = destination; break
            names = [token.text for token in doc if token.pos_ in {"PROPN", "NOUN"}]
            if not params.get("destination") and len(names) >= 2 and any(word in text for word in ("nommé", "appelle", "chercher")): params["q"] = " ".join(names[-2:])
        if any(word in text for word in ("combien", "liste", "trouve", "cherche", "quels", "quel")): intent = "recherche_filtrée"
        return {"intent": intent, "module": module, "params": params, "template": "LIST_PREFERENCES_WITH_FILTERS" if module == "preferences" else "LIST_MODULE_WITH_FILTERS"}
