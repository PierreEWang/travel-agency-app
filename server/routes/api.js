const express = require('express');
const router = express.Router();

// Route de test
router.get('/test', (req, res) => {
    res.json({
        message: 'Routes API fonctionnelles',
        endpoint: '/api/test'
    });
});

module.exports = router;