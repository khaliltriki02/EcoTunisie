import re
import spacy

class FrenchQueryParser:
    def __init__(self, ontology):
        self.ontology = ontology
        try: self.nlp = spacy.load(__import__('os').getenv('SPACY_MODEL', 'fr_core_news_sm'))
        except OSError: self.nlp = spacy.blank('fr')

    def parse(self, question):
        if not question or not question.strip(): raise ValueError("Question vide")
        doc, text = self.nlp(question), question.lower()
        words = {
            "preferences": ("préférence", "preference", "mes goûts", "mes gouts"),
            "transports": ("transport", "train", "bus", "tramway", "taxi", "vélo", "velo", "covoiturage", "marche à pied"),
            "activites": ("activité", "activite", "randonnée", "randonnee", "kayak", "festival", "cyclisme", "visite", "observation"),
            "lieux": ("lieu touristique", "musée", "musee", "monument", "plage", "parc", "site archéologique"),
            "destinations": ("destination", "ville", "séjour", "sejour"),
            "restaurations": ("restaurant", "restauration", "vegan", "végétar", "bio", "marché", "manger"),
        }
        module = next((name for name, values in words.items() if any(value in text for value in values)), "hebergements")
        params, intent = {}, "recherche"
        maps = {
            "preferences": {"nature": "PréférenceNature", "culture": "PréférenceCulturelle", "gastronom": "PréférenceGastronomique", "sport": "PréférenceSportive", "aventure": "PréférenceAventure", "bien-être": "PréférenceBienEtre"},
            "transports": {"train": "Train", "bus": "Bus", "tramway": "Tramway", "taxi": "Taxi", "covoiturage": "Covoiturage", "vélo": "Vélo", "velo": "Vélo", "marche": "Marche", "voiture": "Voiture"},
            "activites": {"randonnée": "Randonnée", "randonnee": "Randonnée", "kayak": "ActivitéAventure", "festival": "Festival", "cyclisme": "ActivitéSportive", "observation": "ActivitéNature", "culture": "ActivitéCulturelle", "sport": "ActivitéSportive"},
            "lieux": {"musée": "Musée", "musee": "Musée", "monument": "Monument", "plage": "Plage", "parc": "ParcNaturel", "archéologique": "SiteArchéologique"},
            "destinations": {"côtière": "DestinationCôtière", "cotiere": "DestinationCôtière", "rurale": "DestinationRurale", "urbaine": "DestinationUrbaine", "désert": "DestinationDésertique"},
        }
        if module in maps:
            for word, type_ in maps[module].items():
                if word in text: params["type"] = type_; break
        elif "vegan" in text: params["type"] = "RestaurantVegan"
        elif "végétar" in text: params["type"] = "RestaurantVegetarien"
        elif "bio" in text: params["type"] = "RestaurantBio"
        elif "écolodge" in text: params["type"] = "Écolodge"
        elif "camping" in text: params["type"] = "Camping"
        prices = re.findall(r"(?:moins de|maximum|max|budget de?)\s*(\d+(?:[.,]\d+)?)", text)
        if prices and module != "preferences": params["maxPrix"] = prices[-1].replace(',', '.')
        if module not in ("preferences",):
            for destination in sorted(self.ontology.destinations, key=len, reverse=True):
                if destination.lower() in text: params["destination"] = destination; break
            names = [token.text for token in doc if token.pos_ in {"PROPN", "NOUN"}]
            if not params.get("destination") and len(names) >= 2 and "nommé" in text: params["q"] = " ".join(names[-2:])
        if any(word in text for word in ("combien", "liste", "trouve", "cherche", "quels", "quel")): intent = "recherche_filtrée"
        return {"intent": intent, "module": module, "params": params, "template": f"LIST_{module.upper()}_WITH_FILTERS"}
