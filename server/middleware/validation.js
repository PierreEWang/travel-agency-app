// middleware/validation.js

// Middleware pour valider les données JSON
function validateJsonData(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type doit être application/json'
      });
    }
  }
  next();
}


// Middleware pour valider les paramètres de pagination
const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;

    if (page && (isNaN(page) || parseInt(page) < 1)) {
        return res.status(400).json({
            success: false,
            message: "Le paramètre 'page' doit être un nombre positif"
        });
    }

    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        return res.status(400).json({
            success: false,
            message: "Le paramètre 'limit' doit être entre 1 et 100"
        });
    }

    // Ajouter les valeurs par défaut
    req.pagination = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
    };

    next();
};

// Middleware pour valider les dates
const validateDateRange = (req, res, next) => {
    const { date_debut, date_fin } = req.query;

    if (date_debut && isNaN(Date.parse(date_debut))) {
        return res.status(400).json({
            success: false,
            message: "Format de date_debut invalide. Utilisez YYYY-MM-DD"
        });
    }

    if (date_fin && isNaN(Date.parse(date_fin))) {
        return res.status(400).json({
            success: false,
            message: "Format de date_fin invalide. Utilisez YYYY-MM-DD"
        });
    }

    if (date_debut && date_fin && new Date(date_debut) > new Date(date_fin)) {
        return res.status(400).json({
            success: false,
            message: "La date de début doit être antérieure à la date de fin"
        });
    }

    next();
};

// Middleware pour valider l'email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Middleware pour valider le numéro de téléphone
const validatePhone = (phone) => {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Middleware pour sanitiser les données d'entrée
const sanitizeInput = (req, res, next) => {
    // Fonction récursive pour nettoyer les strings
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // Nettoyer les caractères dangereux
                obj[key] = obj[key].trim().replace(/[<>]/g, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body && typeof req.body === 'object') {
        sanitize(req.body);
    }

    next();
};

// Middleware pour loguer les requêtes
const logRequests = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

    next();
};

// Middleware pour gérer les erreurs 404
const handle404 = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Endpoint non trouvé",
        endpoint: req.originalUrl,
        method: req.method
    });
};

// Middleware pour gérer les erreurs globales
const handleErrors = (error, req, res, next) => {
    console.error('Erreur:', error);

    // Erreur de validation JSON
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            success: false,
            message: "JSON invalide",
            error: "Vérifiez la syntaxe de votre JSON"
        });
    }

    // Erreur de base de données (simulation)
    if (error.code === 'DB_ERROR') {
        return res.status(503).json({
            success: false,
            message: "Erreur de base de données",
            error: "Service temporairement indisponible"
        });
    }

    // Erreur par défaut
    res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: process.env.NODE_ENV === 'development' ? error.message : "Une erreur inattendue s'est produite"
    });
};

// Middleware pour limiter le taux de requêtes (simple)
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requests.has(ip)) {
            requests.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const requestData = requests.get(ip);

        if (now > requestData.resetTime) {
            requests.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (requestData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: "Trop de requêtes",
                error: `Limite de ${maxRequests} requêtes par ${windowMs / 1000 / 60} minutes atteinte`
            });
        }

        requestData.count++;
        next();
    };
};

module.exports = {
    validateJsonData,
    validatePagination,
    validateDateRange,
    validateEmail,
    validatePhone,
    sanitizeInput,
    logRequests,
    handle404,
    handleErrors,
    rateLimiter
};