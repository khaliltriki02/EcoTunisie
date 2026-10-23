// Hiérarchie de classes extraite de ontologie_tourisme_corrigee_protege.rdf
// (namespace http://example.org/eco-tourism#). Clé = classe, valeur = super-classe.

export const NS = 'http://example.org/eco-tourism#'

export const PARENT = {
  // Activité
  ActivitéAventure: 'Activité', ActivitéBienEtre: 'Activité', ActivitéGastronomique: 'Activité',
  ActivitéCulturelle: 'Activité', ActivitéNature: 'Activité', ActivitéSportive: 'Activité',
  Festival: 'ActivitéCulturelle', Artisanat: 'ActivitéCulturelle',
  VisiteMusée: 'ActivitéCulturelle', VisiteMonument: 'ActivitéCulturelle',
  Randonnée: 'ActivitéNature', ObservationFaune: 'ActivitéNature',
  ObservationFlore: 'ActivitéNature', Ecotourisme: 'ActivitéNature',
  // Hébergement
  Hôtel: 'Hébergement', Camping: 'Hébergement', Écolodge: 'Hébergement',
  Auberge: 'Hébergement', MaisonDHôte: 'Hébergement',
  // Restauration
  Restaurant: 'Restauration', MarchéAlimentaire: 'Restauration',
  RestaurantLocal: 'Restaurant', RestaurantTraditionnel: 'Restaurant', RestaurantBio: 'Restaurant',
  RestaurantVegetarien: 'Restaurant', RestaurantVegan: 'Restaurant',
  // Transport
  TransportPrivé: 'Transport', TransportDoux: 'Transport',
  TransportPartagé: 'Transport', TransportPublic: 'Transport',
  Taxi: 'TransportPrivé', Voiture: 'TransportPrivé',
  Marche: 'TransportDoux', Vélo: 'TransportDoux',
  Covoiturage: 'TransportPartagé',
  Tramway: 'TransportPublic', Train: 'TransportPublic', Bus: 'TransportPublic',
  // Destination
  DestinationUrbaine: 'Destination', DestinationCôtière: 'Destination',
  DestinationRurale: 'Destination', DestinationDésertique: 'Destination',
  DestinationMontagneuse: 'Destination',
  // Lieu touristique
  Musée: 'LieuTouristique', SiteHistorique: 'LieuTouristique', Monument: 'LieuTouristique',
  Plage: 'LieuTouristique', MarchéLocal: 'LieuTouristique',
  SiteArchéologique: 'LieuTouristique', ParcNaturel: 'LieuTouristique',
  // Personne
  Voyageur: 'Personne', Guide: 'Personne', Touriste: 'Personne',
  Famille: 'Voyageur', Groupe: 'Voyageur', Couple: 'Voyageur', VoyageurIndividuel: 'Voyageur',
  // Préférence
  PréférenceNature: 'Préférence', PréférenceSportive: 'Préférence', PréférenceAventure: 'Préférence',
  PréférenceGastronomique: 'Préférence', PréférenceBienEtre: 'Préférence',
  PréférenceCulturelle: 'Préférence',
  // Écoresponsabilité
  MobilitéDurable: 'Écoresponsabilité', GestionEau: 'Écoresponsabilité',
  EconomieLocale: 'Écoresponsabilité', ProtectionBiodiversité: 'Écoresponsabilité',
  GestionEnergie: 'Écoresponsabilité', RéductionCO2: 'Écoresponsabilité',
  GestionDéchets: 'Écoresponsabilité',
}

export const ROOTS = [
  'Personne', 'Destination', 'LieuTouristique', 'Activité', 'Hébergement',
  'Restauration', 'Transport', 'Préférence', 'Écoresponsabilité', 'Recommandation',
]

export const CATEGORIES = ['Destination', 'Hébergement', 'Activité', 'Restauration', 'Transport', 'LieuTouristique']

// Propriétés objet (domain → range) de l'ontologie
export const OBJECT_PROPERTIES = [
  ['visite', 'Personne', 'Destination'], ['utilise', 'Personne', 'Transport'],
  ['aPourPreference', 'Personne', 'Préférence'], ['accessiblePar', 'Destination', 'Transport'],
  ['contient', 'Destination', 'LieuTouristique'], ['possedeHebergement', 'Destination', 'Hébergement'],
  ['possedeRestauration', 'Destination', 'Restauration'], ['proposeActivite', 'Destination', 'Activité'],
  ['seDerouleDans', 'Activité', 'LieuTouristique'], ['respecte', 'Activité', 'Écoresponsabilité'],
  ['guide', 'Guide', 'Touriste'], ['baseeSur', 'Recommandation', 'Préférence'],
  ['recommandeVoyage', 'Recommandation', 'Destination'], ['recommandeActivite', 'Recommandation', 'Activité'],
  ['recommandeHebergement', 'Recommandation', 'Hébergement'], ['recommandeTransport', 'Recommandation', 'Transport'],
  ['recommandeRestauration', 'Recommandation', 'Restauration'], ['recommandeLieu', 'Recommandation', 'LieuTouristique'],
]

export const LABELS = {
  Activité: 'Activité', ActivitéAventure: 'Aventure', ActivitéBienEtre: 'Bien-être',
  ActivitéGastronomique: 'Gastronomie', ActivitéCulturelle: 'Culture', ActivitéNature: 'Nature',
  ActivitéSportive: 'Sport', VisiteMusée: 'Visite de musée', VisiteMonument: 'Visite de monument',
  Ecotourisme: 'Écotourisme', MaisonDHôte: "Maison d'hôte", MarchéAlimentaire: 'Marché alimentaire',
  MarchéLocal: 'Marché local', RestaurantLocal: 'Restaurant local', RestaurantTraditionnel: 'Restaurant traditionnel',
  RestaurantBio: 'Restaurant bio', RestaurantVegetarien: 'Restaurant végétarien', RestaurantVegan: 'Restaurant vegan',
  TransportPrivé: 'Transport privé', TransportDoux: 'Transport doux', TransportPartagé: 'Transport partagé',
  TransportPublic: 'Transport public', DestinationUrbaine: 'Urbaine', DestinationCôtière: 'Côtière',
  DestinationRurale: 'Rurale', DestinationDésertique: 'Désertique', DestinationMontagneuse: 'Montagneuse',
  LieuTouristique: 'Lieu touristique', SiteHistorique: 'Site historique', SiteArchéologique: 'Site archéologique',
  ParcNaturel: 'Parc naturel', Tramway: 'Tramway', Vélo: 'Vélo', Randonnée: 'Randonnée',
  ObservationFaune: 'Observation de la faune', ObservationFlore: 'Observation de la flore',
  GestionEau: "Gestion de l'eau", GestionEnergie: "Gestion de l'énergie", GestionDéchets: 'Gestion des déchets',
  EconomieLocale: 'Économie locale', ProtectionBiodiversité: 'Protection de la biodiversité',
  RéductionCO2: 'Réduction CO₂', MobilitéDurable: 'Mobilité durable', Écoresponsabilité: 'Écoresponsabilité',
  VoyageurIndividuel: 'Voyageur individuel', Hébergement: 'Hébergement', LieuTouristique_: '',
}

export const label = (cls) =>
  LABELS[cls] || cls.replace(/([a-zà-ÿ])([A-ZÀ-Ý])/g, '$1 $2')

export const isA = (type, cls) => {
  let t = type
  while (t) {
    if (t === cls) return true
    t = PARENT[t]
  }
  return false
}

export const rootOf = (type) => {
  let t = type
  while (PARENT[t]) t = PARENT[t]
  return t
}

export const subclassesOf = (cls) => Object.keys(PARENT).filter((c) => PARENT[c] === cls)

export const descendantsOf = (cls) =>
  subclassesOf(cls).flatMap((c) => [c, ...descendantsOf(c)])
