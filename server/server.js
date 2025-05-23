const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route Hello World
app.get('/', (req, res) => {
    res.json({
        message: 'Hello World - API Agence de Voyage',
        status: 'Serveur Express démarré avec succès !',
        port: PORT
    });
});

// Route API test
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API fonctionne correctement',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 API accessible sur http://localhost:${PORT}`);
});