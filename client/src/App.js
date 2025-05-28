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
    dateDepart: ''
  });
  
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
        setMessage('Erreur lors de la récupération des destinations');
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les réservations
  const fetchReservations = async () => {
    try {
      const response = await fetch(`${API_URL}/reservations`);
      if (response.ok) {
        const data = await response.json();
        setReservations(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
    }
  };

  // Fonction pour ajouter une destination
  const addDestination = async () => {
    if (!destinationForm.nom.trim() || !destinationForm.description.trim() || !destinationForm.prix) {
      setMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/destinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...destinationForm,
          prix: parseFloat(destinationForm.prix),
          duree: parseInt(destinationForm.duree),
          placesDisponibles: parseInt(destinationForm.placesDisponibles),
          dateDepart: destinationForm.dateDepart || new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const result = await response.json();
        await fetchDestinations();
        setDestinationForm({
          nom: '',
          description: '',
          prix: '',
          duree: '',
          categorie: 'ville',
          placesDisponibles: '',
          dateDepart: ''
        });
        setMessage(`Destination "${result.data.nom}" créée avec succès !`);
      } else {
        const error = await response.json();
        setMessage(`Erreur: ${error.message || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour faire une réservation
  const addReservation = async () => {
    if (!reservationForm.destinationId || !reservationForm.client.nom.trim() || 
        !reservationForm.client.prenom.trim() || !reservationForm.client.email.trim() ||
        !reservationForm.dateVoyage) {
      setMessage('Veuillez remplir tous les champs obligatoires de la réservation');
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
          destinationId: parseInt(reservationForm.destinationId),
          nombrePersonnes: parseInt(reservationForm.nombrePersonnes)
        })
      });

      if (response.ok) {
        const result = await response.json();
        await fetchReservations();
        setReservationForm({
          destinationId: '',
          client: { nom: '', prenom: '', email: '', telephone: '' },
          nombrePersonnes: '1',
          dateVoyage: '',
          commentaires: ''
        });
        setMessage(`Réservation ${result.data.numeroReservation} créée avec succès !`);
        setActiveTab('reservations');
      } else {
        const error = await response.json();
        setMessage(`Erreur: ${error.message || 'Erreur lors de la réservation'}`);
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
        color: 'white', 
        padding: '40px', 
        borderRadius: '15px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>
          ✈️ Agence de Voyage
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          🌍 Découvrez le monde avec nous
        </p>
      </header>

      {/* Message de statut */}
      {message && (
        <div style={{ 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '8px',
          backgroundColor: message.includes('Erreur') ? '#fee2e2' : '#d1fae5',
          color: message.includes('Erreur') ? '#dc2626' : '#059669',
          border: `3px solid ${message.includes('Erreur') ? '#fca5a5' : '#86efac'}`
        }}>
          <strong>{message.includes('Erreur') ? '❌' : '✅'} {message}</strong>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', marginBottom: '30px', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => setActiveTab('destinations')}
          style={{
            flex: 1,
            padding: '15px 30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'destinations' ? '#3b82f6' : 'white',
            color: activeTab === 'destinations' ? 'white' : '#374151'
          }}
        >
          🏖️ Destinations ({destinations.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          style={{
            flex: 1,
            padding: '15px 30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'reservations' ? '#10b981' : 'white',
            color: activeTab === 'reservations' ? 'white' : '#374151'
          }}
        >
          📋 Réservations ({reservations.length})
        </button>
      </div>

      {/* Onglet Destinations */}
      {activeTab === 'destinations' && (
        <div>
          {/* Formulaire d'ajout */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' }}>
              ➕ Ajouter une destination
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <input
                type="text"
                value={destinationForm.nom}
                onChange={(e) => setDestinationForm({...destinationForm, nom: e.target.value})}
                placeholder="🏷️ Nom de la destination"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />
              
              <input
                type="number"
                value={destinationForm.prix}
                onChange={(e) => setDestinationForm({...destinationForm, prix: e.target.value})}
                placeholder="💰 Prix (€)"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />
              
              <input
                type="number"
                value={destinationForm.duree}
                onChange={(e) => setDestinationForm({...destinationForm, duree: e.target.value})}
                placeholder="⏰ Durée (jours)"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />
              
              <select
                value={destinationForm.categorie}
                onChange={(e) => setDestinationForm({...destinationForm, categorie: e.target.value})}
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              >
                <option value="ville">🏙️ Ville</option>
                <option value="plage">🏖️ Plage</option>
                <option value="culture">🎭 Culture</option>
                <option value="aventure">🏔️ Aventure</option>
              </select>
              
              <input
                type="number"
                value={destinationForm.placesDisponibles}
                onChange={(e) => setDestinationForm({...destinationForm, placesDisponibles: e.target.value})}
                placeholder="👥 Places disponibles"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            
            <textarea
              value={destinationForm.description}
              onChange={(e) => setDestinationForm({...destinationForm, description: e.target.value})}
              placeholder="📝 Description de la destination..."
              rows="3"
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', marginBottom: '20px', resize: 'vertical' }}
            />

            <button
              onClick={addDestination}
              disabled={loading}
              style={{
                padding: '15px 30px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white'
              }}
            >
              {loading ? '⏳ Création...' : '➕ Créer la destination'}
            </button>
          </div>

          {/* Liste des destinations */}
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' }}>
              🌍 Destinations disponibles ({destinations.length})
            </h2>

            {destinations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '10px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏖️</div>
                <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                  Aucune destination disponible. Ajoutez-en une !
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
                {destinations.map((destination) => (
                  <div 
                    key={destination.id} 
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '15px', 
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    {destination.image && (
                      <img 
                        src={destination.image} 
                        alt={destination.nom}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
                        {destination.nom}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4' }}>
                        {destination.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{destination.prix}€</span>
                        <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem' }}>
                          {destination.duree} jours
                        </span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px' }}>
                        📍 {destination.placesDisponibles} places • 🏷️ {destination.categorie}
                      </div>
                      <button
                        onClick={() => {
                          setReservationForm({...reservationForm, destinationId: destination.id.toString()});
                          setActiveTab('reservations');
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        📝 Réserver maintenant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet Réservations */}
      {activeTab === 'reservations' && (
        <div>
          {/* Formulaire de réservation */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' }}>
              📝 Nouvelle réservation
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <select
                value={reservationForm.destinationId}
                onChange={(e) => setReservationForm({...reservationForm, destinationId: e.target.value})}
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              >
                <option value="">🏖️ Choisir une destination</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>
                    {dest.nom} - {dest.prix}€
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={reservationForm.client.nom}
                onChange={(e) => setReservationForm({
                  ...reservationForm, 
                  client: {...reservationForm.client, nom: e.target.value}
                })}
                placeholder="👤 Nom du client"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />

              <input
                type="text"
                value={reservationForm.client.prenom}
                onChange={(e) => setReservationForm({
                  ...reservationForm, 
                  client: {...reservationForm.client, prenom: e.target.value}
                })}
                placeholder="👤 Prénom du client"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />

              <input
                type="email"
                value={reservationForm.client.email}
                onChange={(e) => setReservationForm({
                  ...reservationForm, 
                  client: {...reservationForm.client, email: e.target.value}
                })}
                placeholder="📧 Email"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />

              <input
                type="tel"
                value={reservationForm.client.telephone}
                onChange={(e) => setReservationForm({
                  ...reservationForm, 
                  client: {...reservationForm.client, telephone: e.target.value}
                })}
                placeholder="📱 Téléphone"
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />

              <select
                value={reservationForm.nombrePersonnes}
                onChange={(e) => setReservationForm({...reservationForm, nombrePersonnes: e.target.value})}
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>👥 {num} personne{num > 1 ? 's' : ''}</option>
                ))}
              </select>

              <input
                type="date"
                value={reservationForm.dateVoyage}
                onChange={(e) => setReservationForm({...reservationForm, dateVoyage: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>

            <textarea
              value={reservationForm.commentaires}
              onChange={(e) => setReservationForm({...reservationForm, commentaires: e.target.value})}
              placeholder="💭 Commentaires ou demandes spéciales..."
              rows="3"
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', marginBottom: '20px', resize: 'vertical' }}
            />

            <button
              onClick={addReservation}
              disabled={loading}
              style={{
                padding: '15px 30px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white'
              }}
            >
              {loading ? '⏳ Réservation...' : '🎫 Confirmer la réservation'}
            </button>
          </div>

          {/* Liste des réservations */}
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' }}>
              📋 Réservations en cours ({reservations.length})
            </h2>

            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '10px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
                <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                  Aucune réservation pour le moment.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reservations.map((reservation) => (
                  <div key={reservation.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        🎫 {reservation.numeroReservation}
                      </h3>
                      <span style={{ 
                        padding: '5px 15px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        backgroundColor: reservation.statut === 'confirmee' ? '#d1fae5' : '#fef3c7',
                        color: reservation.statut === 'confirmee' ? '#059669' : '#d97706'
                      }}>
                        {reservation.statut === 'confirmee' ? '✅ Confirmée' : '⏳ En attente'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '0.9rem' }}>
                      <div>
                        <strong>👤 Client:</strong><br />
                        {reservation.client?.nom} {reservation.client?.prenom}
                      </div>
                      <div>
                        <strong>👥 Personnes:</strong><br />
                        {reservation.nombrePersonnes}
                      </div>
                      <div>
                        <strong>💰 Prix total:</strong><br />
                        {reservation.prixTotal}€
                      </div>
                      <div>
                        <strong>📅 Date voyage:</strong><br />
                        {new Date(reservation.dateVoyage).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    {reservation.commentaires && (
                      <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
                        💭 <strong>Commentaires:</strong> {reservation.commentaires}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '50px', padding: '30px', backgroundColor: 'white', borderRadius: '10px', textAlign: 'center', color: '#6b7280' }}>
        <p style={{ marginBottom: '10px' }}>
          🚀 <strong>Backend:</strong> Express.js + Prisma + SQLite sur http://localhost:5000
        </p>
        <p style={{ marginBottom: '10px' }}>
          ⚛️ <strong>Frontend:</strong> React sur http://localhost:3000
        </p>
        <p>
          💾 Les données sont persistantes et survivent au redémarrage !
        </p>
      </footer>
    </div>
  );
}

export default App;