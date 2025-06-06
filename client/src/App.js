import React, { useState, useEffect } from 'react';

// Configuration API pour l'agence de voyage
const API_URL = 'http://localhost:5000/api';

function App() {
  // États pour les destinations
  const [destinations, setDestinations] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  // États pour les formulaires
  const [destinationForm, setDestinationForm] = useState({
    nom: '',
    description: '',
    prix: '',
    duree: '',
    categorie: 'ville',
    placesDisponibles: '',
    imageUrl: ''
  });
  
  // État pour le fichier image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [reservationForm, setReservationForm] = useState({
    destinationId: '',
    client: {
      nom: '',
      prenom: '',
      email: '',
      telephone: ''
    },
    nombrePersonnes: '1',
    dateVoyage: '',
    commentaires: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('destinations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Récupérer les données au chargement
  useEffect(() => {
    fetchDestinations();
    fetchReservations();
  }, []);

  // Fonction pour récupérer les destinations
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/destinations`);
      if (response.ok) {
        const data = await response.json();
        setDestinations(data.data || []);
        setMessage(`${data.count || 0} destination(s) disponible(s)`);
      } else {
        setMessage('❌ Erreur lors de la récupération des destinations');
        // Scroll vers le message d'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les réservations
 // Fonction pour récupérer les réservations avec infos destinations
const fetchReservations = async () => {
  try {
    const response = await fetch(`${API_URL}/reservations`);
    if (response.ok) {
      const data = await response.json();
      
      // Enrichir chaque réservation avec les données de la destination
      const reservationsEnrichies = await Promise.all(
        (data.data || []).map(async (reservation) => {
          try {
            // Récupérer les détails de la destination
            const destResponse = await fetch(`${API_URL}/destinations/${reservation.destinationId}`);
            if (destResponse.ok) {
              const destData = await destResponse.json();
              return {
                ...reservation,
                destination: destData.data // Ajouter les infos de la destination
              };
            }
          } catch (error) {
            console.error('Erreur destination:', error);
          }
          
          // Si erreur, retourner la réservation avec destination basique
          return {
            ...reservation,
            destination: {
              nom: 'Destination inconnue',
              description: 'Informations non disponibles',
              prix: reservation.prixTotal / reservation.nombrePersonnes || 0,
              duree: 'Non spécifié',
              categorie: 'Non spécifié'
            }
          };
        })
      );
      
      setReservations(reservationsEnrichies);
    } else {
      setMessage('❌ Erreur lors de la récupération des réservations');
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    setMessage('❌ Erreur de connexion au serveur');
    console.error('Erreur lors de la récupération des réservations:', error);
    // Scroll vers le message d'erreur
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

  // Fonction pour gérer la sélection d'un fichier image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Créer une URL pour la prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Fonction pour réinitialiser l'image
  const resetImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setDestinationForm({...destinationForm, imageUrl: ''});
  };

  // Fonction pour ajouter une destination
  const addDestination = async () => {
    // Validation des champs obligatoires
    const erreurs = [];
    
    if (!destinationForm.nom.trim()) {
      erreurs.push("Le nom de la destination est obligatoire");
    }
    
    if (!destinationForm.description.trim()) {
      erreurs.push("La description est obligatoire");
    }
    
    if (!destinationForm.prix) {
      erreurs.push("Le prix est obligatoire");
    }
    
    if (!destinationForm.duree) {
      erreurs.push("La durée est obligatoire");
    }
    
    if (!destinationForm.placesDisponibles) {
      erreurs.push("Le nombre de places disponibles est obligatoire");
    }
    
    if (erreurs.length > 0) {
      setMessage(`❌ ${erreurs.join('. ')}`);
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      
      // Déterminer l'image à utiliser
      let imagePath = null;
      
      // Si un fichier a été sélectionné, l'uploader d'abord
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('imageFile', imageFile);
        
        const imageUploadResponse = await fetch(`${API_URL}/destinations/upload-image`, {
          method: 'POST',
          body: imageFormData
        });
        
        if (imageUploadResponse.ok) {
          const imageResult = await imageUploadResponse.json();
          imagePath = imageResult.imagePath;
        } else {
          const error = await imageUploadResponse.json();
          setMessage(`❌ Erreur lors de l'upload de l'image: ${error.message || 'Erreur inconnue'}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setLoading(false);
          return;
        }
      } else if (destinationForm.imageUrl) {
        // Utiliser l'URL fournie
        imagePath = destinationForm.imageUrl;
      }
      
      // Créer l'objet de données pour la destination
      const destinationData = {
        nom: destinationForm.nom.trim(),
        description: destinationForm.description.trim(),
        prix: parseFloat(destinationForm.prix),
        duree: parseInt(destinationForm.duree),
        categorie: destinationForm.categorie.toLowerCase(),
        placesDisponibles: parseInt(destinationForm.placesDisponibles),
        image: imagePath || "https://via.placeholder.com/400x300"
      };
      
      // Si des activités sont fournies, les ajouter
      if (destinationForm.activites) {
        destinationData.activites = destinationForm.activites;
      }
      
      // Envoyer les données de la destination en JSON
      const response = await fetch(`${API_URL}/destinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(destinationData)
      });

      if (response.ok) {
        const result = await response.json();
        await fetchDestinations();
        // Réinitialiser le formulaire
        setDestinationForm({
          nom: '',
          description: '',
          prix: '',
          duree: '',
          categorie: 'ville',
          placesDisponibles: '',
          imageUrl: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setMessage(`🎉 Destination "${result.data.nom}" créée avec succès !`);
      } else {
        const error = await response.json();
        
        // Afficher les erreurs spécifiques si disponibles
        if (error.erreurs && Array.isArray(error.erreurs) && error.erreurs.length > 0) {
          setMessage(`❌ ${error.erreurs.join('. ')}`);
        } else {
          setMessage(`❌ ${error.message || 'Erreur lors de la création'}`);
        }
        
        // Scroll vers le message d'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour faire une réservation
  const addReservation = async () => {
    // Validation des champs obligatoires
    const erreurs = [];
    
    if (!reservationForm.destinationId) {
      erreurs.push("Veuillez sélectionner une destination");
    }
    
    if (!reservationForm.client.nom.trim()) {
      erreurs.push("Le nom du client est obligatoire");
    }
    
    if (!reservationForm.client.prenom.trim()) {
      erreurs.push("Le prénom du client est obligatoire");
    }
    
    if (!reservationForm.client.email.trim()) {
      erreurs.push("L'email du client est obligatoire");
    } else if (!reservationForm.client.email.includes('@')) {
      erreurs.push("L'email doit contenir un '@'");
    }
    
    if (!reservationForm.dateVoyage) {
      erreurs.push("La date de voyage est obligatoire");
    }
    
    if (erreurs.length > 0) {
      setMessage(`❌ ${erreurs.join('. ')}`);
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Vérifier s'il y a assez de places disponibles
    const destinationId = parseInt(reservationForm.destinationId);
    const nombrePersonnes = parseInt(reservationForm.nombrePersonnes);
    const destinationSelectionnee = destinations.find(d => d.id === destinationId);
    
    if (destinationSelectionnee && destinationSelectionnee.placesDisponibles < nombrePersonnes) {
      setMessage(`❌ Pas assez de places disponibles ! Cette destination ne dispose que de ${destinationSelectionnee.placesDisponibles} places.`);
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reservationForm,
          destinationId: destinationId,
          nombrePersonnes: nombrePersonnes
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Mettre à jour les destinations pour avoir le nombre de places à jour
        await fetchDestinations();
        await fetchReservations();
        setReservationForm({
          destinationId: '',
          client: { nom: '', prenom: '', email: '', telephone: '' },
          nombrePersonnes: '1',
          dateVoyage: '',
          commentaires: ''
        });
        setMessage(`🎫 Réservation ${result.data.numeroReservation} créée avec succès !`);
        // Scroll vers le message de succès
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveTab('reservations');
      } else {
        const error = await response.json();
        
        // Afficher les erreurs spécifiques si disponibles
        if (error.erreurs && Array.isArray(error.erreurs) && error.erreurs.length > 0) {
          setMessage(`❌ ${error.erreurs.join('. ')}`);
        } else {
          setMessage(`❌ ${error.message || 'Erreur lors de la réservation'}`);
        }
        
        // Scroll vers le message d'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une destination
  const deleteDestination = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette destination ?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/destinations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchDestinations();
        setMessage('🗑️ Destination supprimée avec succès !');
      } else {
        const error = await response.json();
        // Afficher un message plus clair pour les réservations actives
        if (error.message && error.message.includes('réservations actives')) {
          setMessage(`❌ Impossible de supprimer cette destination car elle a des réservations actives.`);
        } else {
          setMessage(`❌ ${error.message || 'Erreur lors de la suppression'}`);
        }
        // Scroll vers le message d'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
      // Scroll vers le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les destinations par recherche et catégorie
  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || dest.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les catégories uniques
  const categories = [...new Set(destinations.map(dest => dest.categorie))];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header avec gradient */}
      <header className="text-center mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-6xl font-bold mb-4">
          ✈️ Agence de Voyage
        </h1>
        <div className="text-2xl font-light mb-4">
          Découvrez le monde avec nous
        </div>
        <div className="flex justify-center space-x-8 text-lg opacity-90">
          <span className="flex items-center">🌍 Destinations de rêve</span>
          <span className="flex items-center">🎯 Réservations simplifiées</span>
          <span className="flex items-center">🏆 Service premium</span>
        </div>
      </header>

      {/* Message de statut */}
      {message && (
        <div
          id="message-alert"
          className={`p-4 mb-6 rounded-xl shadow-lg border-l-4 transition-all duration-500 ${
            message.includes('Erreur') || message.includes('❌')
              ? 'bg-red-50 text-red-800 border-red-500'
              : 'bg-green-50 text-green-800 border-green-500'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {message.includes('Erreur') || message.includes('❌') ? '❌' : '✅'}
              </span>
              <span className="font-medium">{message}</span>
            </div>
            <button
              onClick={() => setMessage('')}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex mb-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <button
          onClick={() => setActiveTab('destinations')}
          className={`flex-1 py-5 px-8 text-center font-bold text-lg transition-all duration-300 ${
            activeTab === 'destinations'
              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🏖️</span>
            <span>Destinations</span>
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
              {destinations.length}
            </span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 py-5 px-8 text-center font-bold text-lg transition-all duration-300 ${
            activeTab === 'reservations'
              ? 'bg-green-600 text-white shadow-lg transform scale-105'
              : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">📋</span>
            <span>Réservations</span>
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
              {reservations.length}
            </span>
          </div>
        </button>
      </div>

      {/* Onglet Destinations */}
      {activeTab === 'destinations' && (
        <div className="space-y-8">
          {/* Formulaire d'ajout de destination */}
          <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-4xl mr-3">➕</span>
              Ajouter une nouvelle destination
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🏷️ Nom de la destination *
                </label>
                <input
                  type="text"
                  value={destinationForm.nom}
                  onChange={(e) => setDestinationForm({...destinationForm, nom: e.target.value})}
                  placeholder="Ex: Paris, France"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  💰 Prix (€) *
                </label>
                <input
                  type="number"
                  value={destinationForm.prix}
                  onChange={(e) => setDestinationForm({...destinationForm, prix: e.target.value})}
                  placeholder="Ex: 899"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ⏰ Durée (jours) *
                </label>
                <input
                  type="number"
                  value={destinationForm.duree}
                  onChange={(e) => setDestinationForm({...destinationForm, duree: e.target.value})}
                  placeholder="Ex: 7"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🏷️ Catégorie *
                </label>
                <select
                  value={destinationForm.categorie}
                  onChange={(e) => setDestinationForm({...destinationForm, categorie: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  <option value="ville">🏙️ Ville</option>
                  <option value="plage">🏖️ Plage</option>
                  <option value="culture">🎭 Culture</option>
                  <option value="aventure">🏔️ Aventure</option>
                  <option value="detente">🧘 Détente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👥 Places disponibles *
                </label>
                <input
                  type="number"
                  value={destinationForm.placesDisponibles}
                  onChange={(e) => setDestinationForm({...destinationForm, placesDisponibles: e.target.value})}
                  placeholder="Ex: 20"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

            </div>

            {/* Section pour l'image */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <span className="text-xl mr-2">🖼️</span>
                Image de la destination
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option 1: URL d'image */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🔗 URL de l'image
                  </label>
                  <input
                    type="text"
                    value={destinationForm.imageUrl}
                    onChange={(e) => setDestinationForm({...destinationForm, imageUrl: e.target.value})}
                    placeholder="https://exemple.com/image.jpg"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={loading || imageFile !== null}
                  />
                  {imageFile && (
                    <p className="text-sm text-blue-600 mt-1">
                      ℹ️ Supprimez d'abord le fichier pour utiliser une URL
                    </p>
                  )}
                </div>
                
                {/* Option 2: Upload de fichier */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📤 Télécharger une image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={loading || destinationForm.imageUrl !== ''}
                  />
                  {destinationForm.imageUrl && (
                    <p className="text-sm text-blue-600 mt-1">
                      ℹ️ Supprimez d'abord l'URL pour télécharger un fichier
                    </p>
                  )}
                </div>
              </div>
              
              {/* Prévisualisation de l'image */}
              {(imagePreview || destinationForm.imageUrl) && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Prévisualisation :</p>
                  <div className="relative w-full max-w-md mx-auto">
                    <img
                      src={imagePreview || destinationForm.imageUrl}
                      alt="Prévisualisation"
                      className="w-full h-48 object-cover rounded-lg border-2 border-blue-200"
                    />
                    <button
                      onClick={resetImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      title="Supprimer l'image"
                    >
                      ✖️
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📝 Description *
              </label>
              <textarea
                value={destinationForm.description}
                onChange={(e) => setDestinationForm({...destinationForm, description: e.target.value})}
                placeholder="Décrivez cette magnifique destination..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                disabled={loading}
              />
            </div>

            <button
              onClick={addDestination}
              disabled={loading}
              className={`mt-6 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '⏳ Création en cours...' : '➕ Créer la destination'}
            </button>
          </section>

          {/* Barre de recherche et filtres */}
          <section className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xl">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une destination..."
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xl">🌍</span>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-8 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Catalogue des destinations */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <span className="text-4xl mr-3">🌍</span>
                Catalogue des destinations
              </h2>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">
                {filteredDestinations.length} destination{filteredDestinations.length > 1 ? 's' : ''}
              </div>
            </div>

            {loading && destinations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-xl text-gray-500">Chargement des destinations...</p>
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">🏖️</div>
                <p className="text-gray-500 text-xl mb-4">
                  {searchTerm || selectedCategory ? 
                    "Aucune destination ne correspond à vos critères" : 
                    "Aucune destination disponible"}
                </p>
                {!searchTerm && !selectedCategory && (
                  <p className="text-gray-400">Ajoutez votre première destination !</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDestinations.map((destination) => (
                  <div 
                    key={destination.id} 
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100"
                  >
                    {destination.image && (
                      <div className="relative">
                        <img
                          src={destination.image.startsWith('http') ? destination.image : `http://localhost:5000${destination.image}`}
                          alt={destination.nom}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="bg-white bg-opacity-95 backdrop-blur-sm px-3 py-2 rounded-full text-lg font-bold text-gray-800 shadow-lg">
                            {destination.prix}€
                          </span>
                        </div>
                        <div className="absolute top-4 left-4">
                          <button
                            onClick={() => deleteDestination(destination.id)}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                            title="Supprimer cette destination"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-blue-600 mb-3">
                        {destination.nom}
                      </h3>
                      
                      <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                        {destination.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          ⏰ {destination.duree} jours
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                          destination.placesDisponibles <= 0
                            ? 'bg-red-100 text-red-800'
                            : destination.placesDisponibles < 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          👥 {destination.placesDisponibles <= 0
                              ? 'Complet'
                              : `${destination.placesDisponibles} place${destination.placesDisponibles > 1 ? 's' : ''}`}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          {destination.categorie === 'ville' && '🏙️'} 
                          {destination.categorie === 'plage' && '🏖️'} 
                          {destination.categorie === 'culture' && '🎭'} 
                          {destination.categorie === 'aventure' && '🏔️'} 
                          {destination.categorie === 'detente' && '🧘'} 
                          {destination.categorie}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="text-3xl font-bold text-gray-800">
                            {destination.prix}€
                          </div>
                          <div className="text-sm text-gray-500">
                            par personne
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            // Vérifier s'il y a assez de places disponibles
                            if (destination.placesDisponibles <= 0) {
                              setMessage(`❌ Désolé, il n'y a plus de places disponibles pour ${destination.nom}.`);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              return;
                            }
                            
                            setReservationForm({...reservationForm, destinationId: destination.id.toString()});
                            setActiveTab('reservations');
                            // Ajouter un délai court pour permettre le changement d'onglet avant de scroller
                            setTimeout(() => {
                              // Scroll vers le formulaire de réservation
                              const reservationForm = document.querySelector('.reservation-form');
                              if (reservationForm) {
                                reservationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }}
                          className={`font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg ${
                            destination.placesDisponibles <= 0
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          disabled={destination.placesDisponibles <= 0}
                        >
                          {destination.placesDisponibles <= 0 ? '❌ Complet' : '📝 Réserver'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Onglet Réservations */}
      {activeTab === 'reservations' && (
        <div className="space-y-8">
          {/* Formulaire de réservation */}
          <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 reservation-form">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-4xl mr-3">📝</span>
              Nouvelle réservation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🏖️ Destination *
                </label>
                <select
                  value={reservationForm.destinationId}
                  onChange={(e) => setReservationForm({...reservationForm, destinationId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  <option value="">Choisir une destination</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.nom} - {dest.prix}€ ({dest.duree} jours)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Nom du client *
                </label>
                <input
                  type="text"
                  value={reservationForm.client.nom}
                  onChange={(e) => setReservationForm({
                    ...reservationForm, 
                    client: {...reservationForm.client, nom: e.target.value}
                  })}
                  placeholder="Nom de famille"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Prénom du client *
                </label>
                <input
                  type="text"
                  value={reservationForm.client.prenom}
                  onChange={(e) => setReservationForm({
                    ...reservationForm, 
                    client: {...reservationForm.client, prenom: e.target.value}
                  })}
                  placeholder="Prénom"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📧 Email *
                </label>
                <input
                  type="email"
                  value={reservationForm.client.email}
                  onChange={(e) => setReservationForm({
                    ...reservationForm, 
                    client: {...reservationForm.client, email: e.target.value}
                  })}
                  placeholder="email@exemple.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📱 Téléphone
                </label>
                <input
                  type="tel"
                  value={reservationForm.client.telephone}
                  onChange={(e) => setReservationForm({
                    ...reservationForm, 
                    client: {...reservationForm.client, telephone: e.target.value}
                  })}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👥 Nombre de personnes *
                </label>
                <select
                  value={reservationForm.nombrePersonnes}
                  onChange={(e) => setReservationForm({...reservationForm, nombrePersonnes: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} personne{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📅 Date de voyage *
                </label>
                <input
                  type="date"
                  value={reservationForm.dateVoyage}
                  onChange={(e) => setReservationForm({...reservationForm, dateVoyage: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                💭 Commentaires
              </label>
              <textarea
                value={reservationForm.commentaires}
                onChange={(e) => setReservationForm({...reservationForm, commentaires: e.target.value})}
                placeholder="Demandes spéciales, allergies, préférences..."
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-vertical"
                disabled={loading}
              />
            </div>

            <button
              onClick={addReservation}
              disabled={loading}
              className={`mt-6 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? '⏳ Réservation en cours...' : '🎫 Confirmer la réservation'}
            </button>
          </section>

          {/* Liste des réservations */}
          <section>
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
      <span className="text-4xl mr-3">📋</span>
      Réservations en cours
    </h2>
    <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold">
      {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
    </div>
  </div>

  {reservations.length === 0 ? (
    <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
      <div className="text-6xl mb-4">📝</div>
      <p className="text-gray-500 text-xl mb-4">
        Aucune réservation pour le moment
      </p>
      <p className="text-gray-400">
        Les réservations apparaîtront ici une fois créées
      </p>
    </div>
  ) : (
    <div className="space-y-6">
      {reservations.map((reservation) => (
        <div 
          key={reservation.id} 
          className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="flex items-center mb-4 lg:mb-0">
              <span className="text-2xl mr-3">🎫</span>
              <div>
                <h3 className="text-xl font-bold text-blue-600">
                  {reservation.numeroReservation}
                </h3>
                {/* 🎯 NOUVEAU : Affichage du nom de la destination */}
                <h4 className="text-lg font-semibold text-gray-800 mt-1">
                  📍 {reservation.destination?.nom || 'Destination inconnue'}
                </h4>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                reservation.statut === 'confirmee' 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : reservation.statut === 'en_attente'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {reservation.statut === 'confirmee' && '✅ Confirmée'}
                {reservation.statut === 'en_attente' && '⏳ En attente'}
                {reservation.statut === 'annulee' && '❌ Annulée'}
              </span>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {reservation.prixTotal}€
                </div>
                <div className="text-sm text-gray-500">
                  Prix total
                </div>
              </div>
            </div>
          </div>
          
          {/* 🎯 NOUVEAU : Informations détaillées de la destination */}
          {reservation.destination && (
            <div className="bg-blue-50 p-4 rounded-xl mb-4">
              {/* Image de la destination */}
              {reservation.destination.image && (
                <div className="mb-4">
                  <img
                    src={reservation.destination.image.startsWith('http') ? reservation.destination.image : `http://localhost:5000${reservation.destination.image}`}
                    alt={reservation.destination.nom}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                <span className="mr-2">🌍</span>
                Détails de la destination
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Catégorie :</span>
                  <div className="text-blue-800 capitalize font-semibold">
                    {reservation.destination.categorie === 'ville' && '🏙️'} 
                    {reservation.destination.categorie === 'plage' && '🏖️'} 
                    {reservation.destination.categorie === 'culture' && '🎭'} 
                    {reservation.destination.categorie === 'aventure' && '🏔️'} 
                    {reservation.destination.categorie === 'detente' && '🧘'} 
                    {reservation.destination.categorie}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Durée :</span>
                  <div className="text-blue-800 font-semibold">
                    ⏰ {reservation.destination.duree} jours
                  </div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Prix/pers :</span>
                  <div className="text-blue-800 font-semibold">
                    💰 {reservation.destination.prix}€
                  </div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Places restantes :</span>
                  <div className={`font-semibold ${
                    reservation.destination.placesDisponibles <= 0
                      ? 'text-red-600'
                      : reservation.destination.placesDisponibles < 5
                        ? 'text-yellow-600'
                        : 'text-blue-800'
                  }`}>
                    👥 {reservation.destination.placesDisponibles <= 0
                        ? 'Complet'
                        : `${reservation.destination.placesDisponibles} place${reservation.destination.placesDisponibles > 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
              
              {/* Description de la destination */}
              {reservation.destination.description && (
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <span className="text-blue-700 font-medium text-sm">Description :</span>
                  <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                    {reservation.destination.description}
                  </p>
                </div>
              )}
              
              {/* Activités si disponibles */}
              {reservation.destination.activites && reservation.destination.activites.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <span className="text-blue-700 font-medium text-sm flex items-center mb-2">
                    <span className="mr-1">✨</span>
                    Activités incluses :
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {reservation.destination.activites.map((activite, index) => (
                      <div key={index} className="text-gray-700 text-sm flex items-center">
                        <span className="text-green-500 mr-1 text-xs">✓</span>
                        {activite.nom}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Informations client et voyage (existant) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center md:text-left">
              <div className="text-sm font-medium text-gray-500 mb-1">👤 Client</div>
              <div className="font-semibold text-gray-800">
                {reservation.client?.nom} {reservation.client?.prenom}
              </div>
              {reservation.client?.email && (
                <div className="text-sm text-gray-600">
                  📧 {reservation.client.email}
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <div className="text-sm font-medium text-gray-500 mb-1">👥 Voyageurs</div>
              <div className="font-semibold text-gray-800">
                {reservation.nombrePersonnes} personne{reservation.nombrePersonnes > 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="text-sm font-medium text-gray-500 mb-1">📅 Date voyage</div>
              <div className="font-semibold text-gray-800">
                {new Date(reservation.dateVoyage).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="text-sm font-medium text-gray-500 mb-1">📋 Réservé le</div>
              <div className="font-semibold text-gray-800">
                {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
          
          {/* Commentaires */}
          {reservation.commentaires && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
              <div className="flex items-start">
                <span className="text-xl mr-2">💭</span>
                <div>
                  <div className="text-sm font-medium text-green-800 mb-1">Commentaires :</div>
                  <div className="text-green-700 italic">
                    {reservation.commentaires}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</section>
        </div>
      )}

      {/* Footer avec style moderne */}
      <footer className="mt-16 p-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
            <span className="text-3xl mr-3">⚡</span>
            Informations techniques
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-lg mb-2">🚀 Backend</div>
              <div className="opacity-90">
                Express.js + Prisma + SQLite<br />
                <span className="text-blue-300">http://localhost:5000</span>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-lg mb-2">⚛️ Frontend</div>
              <div className="opacity-90">
                React + Tailwind CSS<br />
                <span className="text-green-300">http://localhost:3000</span>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-lg mb-2">💾 Base de données</div>
              <div className="opacity-90">
                Données persistantes<br />
                <span className="text-yellow-300">Survit aux redémarrages</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-600 opacity-75">
            <p className="flex items-center justify-center">
              <span className="text-xl mr-2">✨</span>
              Application d'agence de voyage - Interface moderne avec Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;