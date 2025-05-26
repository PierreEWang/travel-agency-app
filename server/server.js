const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import des routes
const destinationsRoutes = require('./routes/destinations');
const reservationsRoutes = require('./routes/reservations');

// Import des middlewares
const {
    logRequests,
    sanitizeInput,
    validateJsonData,
    handle404,
    handleErrors,
    rateLimiter
} = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://votre-domaine.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middlewares globaux
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logRequests);
app.use(rateLimiter(15 * 60 * 1000, 100)); // 100 requêtes par 15 minutes
app.use(sanitizeInput);
app.use(validateJsonData);

// Route de santé
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API opérationnelle',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Route d'accueil avec documentation
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Agence de Voyage',
        description: 'API REST pour la gestion d\'une agence de voyage',
        version: '1.0.0',
        endpoints: {
            destinations: {
                'GET /api/destinations': 'Lister toutes les destinations',
                'GET /api/destinations/search?q=terme': 'Rechercher des destinations',
                'GET /api/destinations/:id': 'Obtenir une destination',
                'POST /api/destinations': 'Créer une destination',
                'PUT /api/destinations/:id': 'Modifier une destination',
                'DELETE /api/destinations/:id': 'Supprimer une destination'
            },
            reservations: {
                'GET /api/reservations': 'Lister toutes les réservations',
                'GET /api/reservations/:id': 'Obtenir une réservation',
                'GET /api/reservations/numero/:numero': 'Rechercher par numéro',
                'POST /api/reservations': 'Créer une réservation',
                'PATCH /api/reservations/:id/statut': 'Changer le statut',
                'GET /api/reservations/stats/dashboard': 'Statistiques'
            }
        },
        documentation: 'Consultez /api/docs pour plus de détails'
    });
});

// Documentation complète
app.get('/api/docs', (req, res) => {
    res.json({
        success: true,
        title: 'Documentation API Agence de Voyage',
        version: '1.0.0',
        description: 'API REST pour gérer destinations et réservations',
        baseUrl: `http://localhost:${PORT}/api`,
        examples: {
            destination: {
                id: 1,
                nom: 'Paris, France',
                prix: 899,
                duree: 5,
                categorie: 'ville'
            },
            reservation: {
                id: 1,
                numeroReservation: 'RES-2024-001',
                destinationId: 1,
                nombrePersonnes: 2,
                statut: 'confirmee'
            }
        }
    });
});

// Routes API
app.use('/api/destinations', destinationsRoutes);
app.use('/api/reservations', reservationsRoutes);

// Test rapide
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API fonctionne correctement',
        timestamp: new Date().toISOString(),
        server: {
            node_version: process.version,
            platform: process.platform,
            uptime: process.uptime()
        }
    });
});

// Middleware 404 et gestion d'erreurs
app.use(handle404);
app.use(handleErrors);

// Démarrage du serveur
app.listen(PORT, () => {
    console.log('🚀═══════════════════════════════════════');
    console.log(`🌟 Serveur API démarré avec succès`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`💊 Health check: http://localhost:${PORT}/health`);
    console.log('🚀═══════════════════════════════════════');
    console.log('\n📋 Endpoints disponibles:');
    console.log('   GET  /api/destinations - Liste des destinations');
    console.log('   GET  /api/destinations/search - Recherche');
    console.log('   POST /api/destinations - Nouvelle destination');
    console.log('   GET  /api/reservations - Liste des réservations');
    console.log('   POST /api/reservations - Nouvelle réservation');
    console.log('   GET  /api/reservations/stats/dashboard - Stats');
    console.log('\n✨ Prêt à recevoir des requêtes!');
});

module.exports = app;