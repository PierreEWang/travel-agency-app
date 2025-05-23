const express = require('express');
const router = express.Router();

// Données simulées pour les destinations (en attendant une vraie base de données)
let destinations = [
    {
        id: 1,
        nom: "Paris, France",
        description: "La ville lumière avec ses monuments iconiques",
        prix: 899,
        duree: 5,
        image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52",
        disponible: true,
        categorie: "ville",
        activites: ["Visite de la Tour Eiffel", "Louvre", "Montmartre"],
        dateDepart: "2024-07-15",
        placesDisponibles: 25
    },
    {
        id: 2,
        nom: "Bali, Indonésie",
        description: "Île paradisiaque avec plages et temples",
        prix: 1299,
        duree: 8,
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2",
        disponible: true,
        categorie: "plage",
        activites: ["Plongée", "Temples", "Rizières"],
        dateDepart: "2024-08-01",
        placesDisponibles: 15
    },
    {
        id: 3,
        nom: "Tokyo, Japon",
        description: "Métropole moderne entre tradition et innovation",
        prix: 1599,
        duree: 7,
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        disponible: true,
        categorie: "ville",
        activites: ["Temples", "Quartier d'Akihabara", "Mont Fuji"],
        dateDepart: "2024-09-10",
        placesDisponibles: 20
    },
    {
        id: 4,
        nom: "Marrakech, Maroc",
        description: "Ville impériale aux mille couleurs",
        prix: 699,
        duree: 4,
        image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e",
        disponible: true,
        categorie: "culture",
        activites: ["Médina", "Jardins Majorelle", "Désert"],
        dateDepart: "2024-06-20",
        placesDisponibles: 30
    }
];

// GET /api/destinations - Lister toutes les destinations
router.get('/', (req, res) => {
    try {
        const { categorie, prix_max, disponible } = req.query;
        let resultats = [...destinations];

        // Filtrage par catégorie
        if (categorie) {
            resultats = resultats.filter(dest =>
                dest.categorie.toLowerCase() === categorie.toLowerCase()
            );
        }

        // Filtrage par prix maximum
        if (prix_max) {
            const prixMax = parseFloat(prix_max);
            if (!isNaN(prixMax)) {
                resultats = resultats.filter(dest => dest.prix <= prixMax);
            }
        }

        // Filtrage par disponibilité
        if (disponible !== undefined) {
            const estDisponible = disponible === 'true';
            resultats = resultats.filter(dest => dest.disponible === estDisponible);
        }

        res.json({
            success: true,
            count: resultats.length,
            data: resultats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des destinations",
            error: error.message
        });
    }
});

// GET /api/destinations/search - Rechercher des destinations
router.get('/search', (req, res) => {
    try {
        const { q, prix_min, prix_max, duree_min, duree_max } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Le terme de recherche doit contenir au moins 2 caractères"
            });
        }

        let resultats = destinations.filter(dest =>
            dest.nom.toLowerCase().includes(q.toLowerCase()) ||
            dest.description.toLowerCase().includes(q.toLowerCase()) ||
            dest.activites.some(activite =>
                activite.toLowerCase().includes(q.toLowerCase())
            )
        );

        // Filtrage par prix
        if (prix_min) {
            const prixMin = parseFloat(prix_min);
            if (!isNaN(prixMin)) {
                resultats = resultats.filter(dest => dest.prix >= prixMin);
            }
        }

        if (prix_max) {
            const prixMax = parseFloat(prix_max);
            if (!isNaN(prixMax)) {
                resultats = resultats.filter(dest => dest.prix <= prixMax);
            }
        }

        // Filtrage par durée
        if (duree_min) {
            const dureeMin = parseInt(duree_min);
            if (!isNaN(dureeMin)) {
                resultats = resultats.filter(dest => dest.duree >= dureeMin);
            }
        }

        if (duree_max) {
            const dureeMax = parseInt(duree_max);
            if (!isNaN(dureeMax)) {
                resultats = resultats.filter(dest => dest.duree <= dureeMax);
            }
        }

        res.json({
            success: true,
            query: q,
            count: resultats.length,
            data: resultats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la recherche",
            error: error.message
        });
    }
});

// GET /api/destinations/:id - Obtenir une destination spécifique
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        const destination = destinations.find(dest => dest.id === id);

        if (!destination) {
            return res.status(404).json({
                success: false,
                message: "Destination non trouvée"
            });
        }

        res.json({
            success: true,
            data: destination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de la destination",
            error: error.message
        });
    }
});

// POST /api/destinations - Ajouter une nouvelle destination (admin)
router.post('/', (req, res) => {
    try {
        const { nom, description, prix, duree, image, categorie, activites, dateDepart, placesDisponibles } = req.body;

        // Validation des données
        const erreurs = [];

        if (!nom || nom.trim().length < 3) {
            erreurs.push("Le nom doit contenir au moins 3 caractères");
        }

        if (!description || description.trim().length < 10) {
            erreurs.push("La description doit contenir au moins 10 caractères");
        }

        if (!prix || prix <= 0) {
            erreurs.push("Le prix doit être supérieur à 0");
        }

        if (!duree || duree <= 0) {
            erreurs.push("La durée doit être supérieure à 0");
        }

        if (!categorie) {
            erreurs.push("La catégorie est obligatoire");
        }

        if (erreurs.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Données invalides",
                erreurs: erreurs
            });
        }

        // Créer nouvelle destination
        const nouvelleDestination = {
            id: Math.max(...destinations.map(d => d.id)) + 1,
            nom: nom.trim(),
            description: description.trim(),
            prix: parseFloat(prix),
            duree: parseInt(duree),
            image: image || "https://via.placeholder.com/400x300",
            disponible: true,
            categorie: categorie.toLowerCase(),
            activites: activites || [],
            dateDepart: dateDepart || new Date().toISOString().split('T')[0],
            placesDisponibles: placesDisponibles || 20
        };

        destinations.push(nouvelleDestination);

        res.status(201).json({
            success: true,
            message: "Destination créée avec succès",
            data: nouvelleDestination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la destination",
            error: error.message
        });
    }
});

// PUT /api/destinations/:id - Mettre à jour une destination
router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        const index = destinations.findIndex(dest => dest.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Destination non trouvée"
            });
        }

        const { nom, description, prix, duree, image, categorie, activites, dateDepart, placesDisponibles, disponible } = req.body;

        // Mise à jour des champs fournis
        if (nom) destinations[index].nom = nom.trim();
        if (description) destinations[index].description = description.trim();
        if (prix) destinations[index].prix = parseFloat(prix);
        if (duree) destinations[index].duree = parseInt(duree);
        if (image) destinations[index].image = image;
        if (categorie) destinations[index].categorie = categorie.toLowerCase();
        if (activites) destinations[index].activites = activites;
        if (dateDepart) destinations[index].dateDepart = dateDepart;
        if (placesDisponibles !== undefined) destinations[index].placesDisponibles = parseInt(placesDisponibles);
        if (disponible !== undefined) destinations[index].disponible = disponible;

        res.json({
            success: true,
            message: "Destination mise à jour avec succès",
            data: destinations[index]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour",
            error: error.message
        });
    }
});

// DELETE /api/destinations/:id - Supprimer une destination
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        const index = destinations.findIndex(dest => dest.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Destination non trouvée"
            });
        }

        const destinationSupprimee = destinations.splice(index, 1)[0];

        res.json({
            success: true,
            message: "Destination supprimée avec succès",
            data: destinationSupprimee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression",
            error: error.message
        });
    }
});

module.exports = router;