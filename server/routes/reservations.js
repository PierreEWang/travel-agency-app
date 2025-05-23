const express = require('express');
const router = express.Router();

// Données simulées pour les réservations
let reservations = [
    {
        id: 1,
        destinationId: 1,
        numeroReservation: "RES-2024-001",
        client: {
            nom: "Dupont",
            prenom: "Jean",
            email: "jean.dupont@email.com",
            telephone: "0123456789"
        },
        nombrePersonnes: 2,
        dateReservation: "2024-05-20T10:30:00.000Z",
        dateVoyage: "2024-07-15",
        prixTotal: 1798,
        statut: "confirmee",
        commentaires: "Voyage de noces"
    },
    {
        id: 2,
        destinationId: 2,
        numeroReservation: "RES-2024-002",
        client: {
            nom: "Martin",
            prenom: "Sophie",
            email: "sophie.martin@email.com",
            telephone: "0123456790"
        },
        nombrePersonnes: 4,
        dateReservation: "2024-05-21T14:15:00.000Z",
        dateVoyage: "2024-08-01",
        prixTotal: 5196,
        statut: "en_attente",
        commentaires: "Voyage en famille"
    }
];

// Fonction pour générer un numéro de réservation unique
function genererNumeroReservation() {
    const date = new Date();
    const annee = date.getFullYear();
    const numero = (reservations.length + 1).toString().padStart(3, '0');
    return `RES-${annee}-${numero}`;
}

// Fonction pour valider les données de réservation
function validerDonneesReservation(data) {
    const erreurs = [];

    if (!data.destinationId || isNaN(parseInt(data.destinationId))) {
        erreurs.push("ID de destination invalide");
    }

    if (!data.client) {
        erreurs.push("Informations client manquantes");
    } else {
        if (!data.client.nom || data.client.nom.trim().length < 2) {
            erreurs.push("Le nom du client doit contenir au moins 2 caractères");
        }
        if (!data.client.prenom || data.client.prenom.trim().length < 2) {
            erreurs.push("Le prénom du client doit contenir au moins 2 caractères");
        }
        if (!data.client.email || !data.client.email.includes('@')) {
            erreurs.push("Email invalide");
        }
        if (!data.client.telephone || data.client.telephone.length < 10) {
            erreurs.push("Numéro de téléphone invalide");
        }
    }

    if (!data.nombrePersonnes || data.nombrePersonnes < 1 || data.nombrePersonnes > 10) {
        erreurs.push("Le nombre de personnes doit être entre 1 et 10");
    }

    if (!data.dateVoyage) {
        erreurs.push("Date de voyage manquante");
    } else {
        const dateVoyage = new Date(data.dateVoyage);
        const aujourdhui = new Date();
        if (dateVoyage <= aujourdhui) {
            erreurs.push("La date de voyage doit être dans le futur");
        }
    }

    return erreurs;
}

// GET /api/reservations - Lister toutes les réservations
router.get('/', (req, res) => {
    try {
        const { statut, email, date_debut, date_fin } = req.query;
        let resultats = [...reservations];

        // Filtrage par statut
        if (statut) {
            resultats = resultats.filter(res => res.statut === statut);
        }

        // Filtrage par email client
        if (email) {
            resultats = resultats.filter(res =>
                res.client.email.toLowerCase().includes(email.toLowerCase())
            );
        }

        // Filtrage par période
        if (date_debut) {
            const dateDebut = new Date(date_debut);
            resultats = resultats.filter(res =>
                new Date(res.dateVoyage) >= dateDebut
            );
        }

        if (date_fin) {
            const dateFin = new Date(date_fin);
            resultats = resultats.filter(res =>
                new Date(res.dateVoyage) <= dateFin
            );
        }

        res.json({
            success: true,
            count: resultats.length,
            data: resultats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des réservations",
            error: error.message
        });
    }
});

// GET /api/reservations/:id - Obtenir une réservation spécifique
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        const reservation = reservations.find(res => res.id === id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Réservation non trouvée"
            });
        }

        res.json({
            success: true,
            data: reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de la réservation",
            error: error.message
        });
    }
});

// GET /api/reservations/numero/:numero - Rechercher par numéro de réservation
router.get('/numero/:numero', (req, res) => {
    try {
        const numero = req.params.numero;

        const reservation = reservations.find(res => res.numeroReservation === numero);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Réservation non trouvée avec ce numéro"
            });
        }

        res.json({
            success: true,
            data: reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la recherche",
            error: error.message
        });
    }
});

// POST /api/reservations - Créer une nouvelle réservation
router.post('/', (req, res) => {
    try {
        const { destinationId, client, nombrePersonnes, dateVoyage, commentaires } = req.body;

        // Validation des données
        const erreurs = validerDonneesReservation(req.body);

        if (erreurs.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Données invalides",
                erreurs: erreurs
            });
        }

        // Vérifier si la destination existe (simulation)
        const destinationsDisponibles = [1, 2, 3, 4]; // IDs des destinations existantes
        if (!destinationsDisponibles.includes(parseInt(destinationId))) {
            return res.status(404).json({
                success: false,
                message: "Destination non trouvée"
            });
        }

        // Calculer le prix total (simulation)
        const prixParPersonne = 899; // Prix de base
        const prixTotal = prixParPersonne * nombrePersonnes;

        // Créer la nouvelle réservation
        const nouvelleReservation = {
            id: Math.max(...reservations.map(r => r.id)) + 1,
            destinationId: parseInt(destinationId),
            numeroReservation: genererNumeroReservation(),
            client: {
                nom: client.nom.trim(),
                prenom: client.prenom.trim(),
                email: client.email.trim().toLowerCase(),
                telephone: client.telephone.trim()
            },
            nombrePersonnes: parseInt(nombrePersonnes),
            dateReservation: new Date().toISOString(),
            dateVoyage: dateVoyage,
            prixTotal: prixTotal,
            statut: "en_attente",
            commentaires: commentaires || ""
        };

        reservations.push(nouvelleReservation);

        res.status(201).json({
            success: true,
            message: "Réservation créée avec succès",
            data: nouvelleReservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la réservation",
            error: error.message
        });
    }
});

// PATCH /api/reservations/:id/statut - Changer le statut d'une réservation
router.patch('/:id/statut', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { statut } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        const statutsValides = ['en_attente', 'confirmee', 'annulee', 'terminee'];
        if (!statutsValides.includes(statut)) {
            return res.status(400).json({
                success: false,
                message: "Statut invalide. Valeurs possibles: " + statutsValides.join(', ')
            });
        }

        const index = reservations.findIndex(res => res.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Réservation non trouvée"
            });
        }

        reservations[index].statut = statut;

        res.json({
            success: true,
            message: `Statut mis à jour vers "${statut}"`,
            data: reservations[index]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du statut",
            error: error.message
        });
    }
});

// GET /api/reservations/stats/dashboard - Statistiques pour le tableau de bord
router.get('/stats/dashboard', (req, res) => {
    try {
        const stats = {
            total: reservations.length,
            en_attente: reservations.filter(r => r.statut === 'en_attente').length,
            confirmees: reservations.filter(r => r.statut === 'confirmee').length,
            annulees: reservations.filter(r => r.statut === 'annulee').length,
            chiffre_affaires: reservations
                .filter(r => r.statut === 'confirmee')
                .reduce((total, r) => total + r.prixTotal, 0),
            moyenne_prix: reservations.length > 0
                ? reservations.reduce((total, r) => total + r.prixTotal, 0) / reservations.length
                : 0
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors du calcul des statistiques",
            error: error.message
        });
    }
});

module.exports = router;