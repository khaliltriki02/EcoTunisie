import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from nlp import FrenchQueryParser

class OntologyStub:
    destinations = {"Tunis", "Nabeul", "Hammamet"}

class TestFrenchQueryParser(unittest.TestCase):
  def test_vegan_tunis(self):
    parsed = FrenchQueryParser(OntologyStub()).parse("Quels restaurants vegan à Tunis à moins de 30 dinars ?")
    self.assertEqual(parsed["module"], "restaurations")
    self.assertEqual(parsed["params"], {"type": "RestaurantVegan", "destination": "Tunis", "maxPrix": "30"})

  def test_ecolodge(self):
    parsed = FrenchQueryParser(OntologyStub()).parse("Je cherche un écolodge à Nabeul")
    self.assertEqual(parsed["module"], "hebergements")
    self.assertEqual(parsed["params"]["type"], "Écolodge")
