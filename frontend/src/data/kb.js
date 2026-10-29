// Base de connaissances = individus de l'ontologie (ext:false) + quelques individus
// d'extension (ext:true) pour que chaque destination soit exploitable.
// Champs: id, type (classe OWL), nom, dests (ids Destination liées), prix (TND), eco (0..1),
//         badges (classes Écoresponsabilité), co2 (g CO₂/km/pers, transports), ext.
// ⚠ Les valeurs eco / co2 / prix des individus sans valeur dans le RDF sont INDICATIVES (démo).

const D = (id, type, nom, region, lat, lng, saison, extra = {}) => ({
  id, type, nom, region, lat, lng, saison, dests: [id], ...extra,
})

export const destinations = [
  D('Tunis', 'DestinationUrbaine', 'Tunis', 'Grand Tunis', 36.8065, 10.1815, 'Oct – Mai',
    { desc: 'Médina classée, Carthage, Bardo et Sidi Bou Saïd, accessibles en tram et à pied.' }),
  D('Hammamet', 'DestinationCôtière', 'Hammamet', 'Nabeul', 36.4, 10.6167, 'Mai – Sept',
    { desc: 'Station balnéaire du Cap Bon, desservie par le train SNCFT.' }),
  D('Nabeul', 'DestinationCôtière', 'Nabeul', 'Cap Bon', 36.4513, 10.7357, 'Avr – Oct',
    { desc: 'Capitale de la poterie et de la gastronomie du Cap Bon.', ext: true }),
  D('Takrouna', 'DestinationRurale', 'Takrouna', 'Enfidha', 36.38, 10.44, 'Mar – Mai',
    { desc: 'Village berbère perché, artisanat et paysages ruraux.' }),
  D('Tozeur', 'DestinationDésertique', 'Tozeur', 'Tozeur', 33.9197, 8.1335, 'Oct – Avr',
    { desc: 'Oasis de palmiers aux portes du Sahara.' }),
  D('AinDraham', 'DestinationMontagneuse', 'Aïn Draham', 'Jendouba', 36.7833, 8.6833, 'Avr – Oct',
    { desc: 'Forêts de chênes-lièges et randonnées dans la Kroumirie.' }),
  D('Tabarka', 'DestinationCôtière', 'Tabarka', 'Jendouba', 36.9544, 8.758, 'Mai – Sept',
    { desc: 'Côte corail, kayak et cyclisme entre mer et forêt.', ext: true }),
  D('Ichkeul', 'DestinationRurale', 'Ichkeul', 'Bizerte', 37.15, 9.67, 'Nov – Avr',
    { desc: "Parc national de l'Ichkeul : lac, oiseaux migrateurs, camping.", ext: true }),
  D('Zaghouan', 'DestinationMontagneuse', 'Zaghouan', 'Zaghouan', 36.4029, 10.1429, 'Mar – Mai',
    { desc: 'Montagne sacrée, temple des Eaux et sentiers de randonnée.', ext: true }),
  D('Testour', 'DestinationRurale', 'Testour', 'Béja', 36.55, 9.44, 'Mar – Juin',
    { desc: 'Bourg andalou de la vallée de la Medjerda.', ext: true }),
]

const E = (id, type, nom, dests, o = {}) => ({ id, type, nom, dests, ...o })

export const entities = [
  // ── Lieux touristiques
  E('MedinaTunis', 'SiteHistorique', 'Médina de Tunis', ['Tunis']),
  E('Carthage', 'SiteArchéologique', 'Carthage', ['Tunis'], { prixEntree: 12 }),
  E('Bardo', 'Musée', 'Musée du Bardo', ['Tunis'], { prixEntree: 13 }),
  E('MonumentBourguiba', 'Monument', 'Monument', ['Tunis']),
  E('MarcheCentral', 'MarchéLocal', 'Marché central', ['Tunis']),
  E('PlageHammamet', 'Plage', 'Plage de Hammamet', ['Hammamet']),
  E('Ichkeul', 'ParcNaturel', "Parc national de l'Ichkeul", ['Ichkeul']),

  // ── Hébergements
  E('HotelHammamet', 'Hôtel', 'Hôtel Hammamet', ['Hammamet'], { prix: 180, eco: 0.45 }),
  E('EcolodgeTestour', 'Écolodge', 'Écolodge Testour', ['Testour'], { prix: 120, eco: 0.95, badges: ['GestionEau', 'GestionEnergie'] }),
  E('MaisonHoteSidiBou', 'MaisonDHôte', 'Maison d’hôte Sidi Bou Saïd', ['Tunis'], { prix: 150, eco: 0.7, badges: ['EconomieLocale'] }),
  E('AubergeTabarka', 'Auberge', 'Auberge Tabarka', ['Tabarka'], { prix: 60, eco: 0.75 }),
  E('CampingIchkeul', 'Camping', 'Camping Ichkeul', ['Ichkeul'], { prix: 30, eco: 0.8, badges: ['GestionDéchets'] }),
  E('EcolodgeTozeur', 'Écolodge', 'Écolodge de l’oasis de Tozeur', ['Tozeur'], { prix: 140, eco: 0.9, badges: ['GestionEau', 'GestionEnergie'], ext: true }),
  E('AubergeAinDraham', 'Auberge', 'Auberge forestière Aïn Draham', ['AinDraham'], { prix: 70, eco: 0.8, ext: true }),
  E('MaisonHoteTakrouna', 'MaisonDHôte', 'Maison d’hôte de Takrouna', ['Takrouna'], { prix: 90, eco: 0.8, badges: ['EconomieLocale'], ext: true }),
  E('AubergeNabeul', 'Auberge', 'Auberge de Nabeul', ['Nabeul'], { prix: 55, eco: 0.7, ext: true }),
  E('MaisonHoteZaghouan', 'MaisonDHôte', 'Maison d’hôte de Zaghouan', ['Zaghouan'], { prix: 80, eco: 0.8, ext: true }),

  // ── Restauration (prix = repas moyen)
  E('RestaurantVegetarienTunis', 'RestaurantVegetarien', 'Restaurant végétarien Tunis', ['Tunis'], { prix: 25, eco: 0.9, cuisine: 'Végétarienne' }),
  E('RestaurantVeganTunis', 'RestaurantVegan', 'Restaurant vegan', ['Tunis'], { prix: 28, eco: 0.95, cuisine: 'Vegan' }),
  E('RestaurantBioTunis', 'RestaurantBio', 'Restaurant Bio Tunis', ['Tunis', 'Hammamet'], { prix: 40, eco: 0.9, cuisine: 'Bio', badges: ['EconomieLocale'] }),
  E('RestaurantLocalNabeul', 'RestaurantLocal', 'Restaurant Local Nabeul', ['Nabeul'], { prix: 20, eco: 0.85, cuisine: 'Tunisienne', badges: ['EconomieLocale'] }),
  E('RestaurantTraditionnelSidiBou', 'RestaurantTraditionnel', 'Restaurant traditionnel', ['Tunis'], { prix: 35, eco: 0.7, cuisine: 'Tunisienne' }),
  E('MarcheAlimentaireTunis', 'MarchéAlimentaire', 'Marché alimentaire de Tunis', ['Tunis'], { prix: 10, eco: 0.85, badges: ['EconomieLocale'] }),
  E('RestaurantLocalTozeur', 'RestaurantLocal', 'Table d’oasis Tozeur', ['Tozeur'], { prix: 22, eco: 0.85, cuisine: 'Tunisienne', badges: ['EconomieLocale'], ext: true }),
  E('RestaurantLocalAinDraham', 'RestaurantLocal', 'Table kroumire Aïn Draham', ['AinDraham'], { prix: 20, eco: 0.85, cuisine: 'Tunisienne', ext: true }),

  // ── Activités
  E('RandonneeZaghouan', 'Randonnée', 'Randonnée Zaghouan', ['Zaghouan'], { prix: 30, eco: 0.95, niveau: 'Moyen', badges: ['ProtectionBiodiversité'] }),
  E('ObservationIchkeul', 'ObservationFaune', 'Observation des oiseaux', ['Ichkeul'], { prix: 15, eco: 0.95, badges: ['ProtectionBiodiversité'] }),
  E('ObservationFloreIchkeul', 'ObservationFlore', 'Observation de la flore', ['Ichkeul'], { prix: 15, eco: 0.95, badges: ['ProtectionBiodiversité'] }),
  E('EcotourismeIchkeul', 'Ecotourisme', 'Écotourisme Ichkeul', ['Ichkeul'], { prix: 40, eco: 0.95, badges: ['ProtectionBiodiversité'] }),
  E('VisiteCarthage', 'VisiteMonument', 'Visite de Carthage', ['Tunis'], { prix: 12, eco: 0.8 }),
  E('VisiteBardo', 'VisiteMusée', 'Visite du Bardo', ['Tunis'], { prix: 13, eco: 0.8 }),
  E('FestivalCarthage', 'Festival', 'Festival de Carthage', ['Tunis'], { prix: 35, eco: 0.6 }),
  E('YogaHammamet', 'ActivitéBienEtre', 'Yoga', ['Hammamet'], { prix: 25, eco: 0.85 }),
  E('DegustationNabeul', 'ActivitéGastronomique', 'Dégustation locale', ['Nabeul'], { prix: 20, eco: 0.8, badges: ['EconomieLocale'] }),
  E('ArtisanatNabeul', 'Artisanat', 'Artisanat de Nabeul', ['Nabeul'], { prix: 0, eco: 0.9, badges: ['EconomieLocale'] }),
  E('CyclismeTabarka', 'ActivitéSportive', 'Cyclisme', ['Tabarka'], { prix: 25, eco: 0.95, badges: ['RéductionCO2'] }),
  E('KayakTabarka', 'ActivitéAventure', 'Kayak', ['Tabarka'], { prix: 40, eco: 0.9 }),
  E('RandonneeOasisTozeur', 'Randonnée', 'Randonnée dans l’oasis', ['Tozeur'], { prix: 20, eco: 0.9, niveau: 'Facile', ext: true }),
  E('RandonneeKroumirie', 'Randonnée', 'Randonnée en forêt de Kroumirie', ['AinDraham'], { prix: 25, eco: 0.95, niveau: 'Moyen', badges: ['ProtectionBiodiversité'], ext: true }),
  E('RandonneeTakrouna', 'Randonnée', 'Randonnée autour de Takrouna', ['Takrouna'], { prix: 15, eco: 0.95, niveau: 'Facile', ext: true }),
  E('ArtisanatTakrouna', 'Artisanat', 'Atelier de poterie de Takrouna', ['Takrouna'], { prix: 18, eco: 0.9, badges: ['EconomieLocale'], ext: true }),
  E('VisiteTestour', 'VisiteMonument', 'Visite de la médina de Testour', ['Testour'], { prix: 5, eco: 0.85, ext: true }),

  // ── Transports (co2 en g/km/personne, valeurs indicatives)
  E('TrainSNCFT', 'Train', 'Train SNCFT', ['Tunis', 'Hammamet', 'Nabeul'], { co2: 14, eco: 0.92 }),
  E('TramTunis', 'Tramway', 'Tramway', ['Tunis'], { co2: 6, eco: 0.96 }),
  E('BusTunis', 'Bus', 'Bus', ['Tunis', 'Hammamet', 'Nabeul', 'Tozeur', 'AinDraham', 'Tabarka', 'Ichkeul', 'Zaghouan', 'Testour', 'Takrouna'], { co2: 68, eco: 0.6 }),
  E('CovoiturageTunis', 'Covoiturage', 'Covoiturage', ['Tunis', 'Hammamet', 'Nabeul', 'Tozeur', 'AinDraham', 'Tabarka', 'Zaghouan', 'Testour', 'Takrouna', 'Ichkeul'], { co2: 55, eco: 0.68 }),
  E('TaxiTunis', 'Taxi', 'Taxi', ['Tunis', 'Hammamet', 'Nabeul', 'Tozeur', 'Tabarka'], { co2: 150, eco: 0.12 }),
  E('VoitureEco', 'Voiture', 'Voiture', ['Tunis', 'Hammamet', 'Nabeul', 'Tozeur', 'AinDraham', 'Tabarka', 'Ichkeul', 'Zaghouan', 'Testour', 'Takrouna'], { co2: 170, eco: 0.0 }),
  E('MarchePied', 'Marche', 'Marche à pied', ['Tunis', 'Takrouna', 'Tabarka', 'Nabeul', 'Testour'], { co2: 0, eco: 1, badges: ['MobilitéDurable', 'RéductionCO2'] }),
  E('VeloVert', 'Vélo', 'Vélo', ['Hammamet', 'Nabeul', 'Tozeur', 'Tabarka', 'Ichkeul', 'Zaghouan', 'Testour'], { co2: 0, eco: 1, badges: ['MobilitéDurable', 'RéductionCO2'] }),
]

// Individus d'Écoresponsabilité (badges)
export const ecoPractices = {
  EconomieLocale: 'Soutien aux producteurs locaux',
  GestionDéchets: 'Tri et recyclage',
  MobilitéDurable: 'Mobilité douce',
  GestionEnergie: 'Énergie renouvelable',
  ProtectionBiodiversité: 'Protection de la biodiversité',
  RéductionCO2: 'Réduction des émissions',
  GestionEau: "Économie d'eau",
}

// Préférences (individus Pref*) → classes de l'ontologie qu'elles activent
export const preferences = [
  { id: 'PrefNature', type: 'PréférenceNature', label: 'Nature et paysages', matches: ['ActivitéNature', 'ParcNaturel', 'Plage'] },
  { id: 'PrefSport', type: 'PréférenceSportive', label: 'Sport', matches: ['ActivitéSportive', 'Randonnée'] },
  { id: 'PrefAventure', type: 'PréférenceAventure', label: 'Aventure', matches: ['ActivitéAventure', 'ActivitéSportive'] },
  { id: 'PrefGastro', type: 'PréférenceGastronomique', label: 'Cuisine locale', matches: ['ActivitéGastronomique', 'RestaurantLocal', 'RestaurantTraditionnel', 'MarchéAlimentaire'] },
  { id: 'PrefBienEtre', type: 'PréférenceBienEtre', label: 'Bien-être', matches: ['ActivitéBienEtre'] },
  { id: 'PrefCulture', type: 'PréférenceCulturelle', label: 'Patrimoine et musées', matches: ['ActivitéCulturelle', 'SiteHistorique', 'Musée', 'Monument', 'SiteArchéologique'] },
]

// Profils de voyageurs (sous-classes de Voyageur)
export const profils = [
  { id: 'VoyageurIndividuel', label: 'Voyageur individuel' },
  { id: 'Couple', label: 'Couple' },
  { id: 'Famille', label: 'Famille' },
  { id: 'Groupe', label: 'Groupe' },
]

// Individus nommés du RDF (pour la page Ontologie)
export const rdfPersons = [
  { id: 'Ahmed', type: 'VoyageurIndividuel', age: 25, prefs: ['PrefNature'], visite: 'Hammamet', utilise: 'TrainSNCFT' },
  { id: 'Sara', type: 'Touriste', age: 28, prefs: ['PrefCulture'], guide: 'GuideAli' },
  { id: 'GuideAli', type: 'Guide', tel: '20111222' },
]
