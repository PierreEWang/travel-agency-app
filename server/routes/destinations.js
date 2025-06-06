const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique avec timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'destination-' + uniqueSuffix + ext);
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Le fichier doit être une image'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// POST /api/destinations/upload-image - Upload d'une image
router.post('/upload-image', upload.single('imageFile'), async (req, res) => {
  try {
    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier n'a été uploadé"
      });
    }

    // Retourner le chemin de l'image
    const imagePath = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: "Image uploadée avec succès",
      imagePath: imagePath
    });
  } catch (error) {
    // Si une erreur survient et qu'un fichier a été uploadé, on le supprime
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload de l'image",
      error: error.message
    });
  }
});

// POST /api/destinations/:id/update-image - Mettre à jour l'image d'une destination
router.post('/:id/update-image', upload.single('imageFile'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      // Si un fichier a été uploadé mais que l'ID est invalide, on le supprime
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "ID invalide"
      });
    }

    // Vérifier si la destination existe
    const destinationExistante = await prisma.destination.findUnique({
      where: { id }
    });

    if (!destinationExistante) {
      // Si un fichier a été uploadé mais que la destination n'existe pas, on le supprime
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Destination non trouvée"
      });
    }

    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier n'a été uploadé"
      });
    }

    // Si l'ancienne image était un fichier uploadé, on la supprime
    if (destinationExistante.image && destinationExistante.image.startsWith('/uploads/')) {
      const oldImagePath = path.join('.', destinationExistante.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Mettre à jour l'image de la destination
    const imagePath = `/uploads/${req.file.filename}`;
    
    const destinationMiseAJour = await prisma.destination.update({
      where: { id },
      data: {
        image: imagePath
      }
    });

    res.json({
      success: true,
      message: "Image mise à jour avec succès",
      data: {
        id: destinationMiseAJour.id,
        imagePath: imagePath
      }
    });
  } catch (error) {
    // Si une erreur survient et qu'un fichier a été uploadé, on le supprime
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'image",
      error: error.message
    });
  }
});

// GET /api/destinations - Lister toutes les destinations
router.get('/', async (req, res) => {
    try {
        const { categorie, prix_max, disponible } = req.query;

        // Construire le filtre dynamiquement
        const where = {};

        if (categorie) {
            where.categorie = categorie.toLowerCase();
        }

        if (prix_max) {
            const prixMax = parseFloat(prix_max);
            if (!isNaN(prixMax)) {
                where.prix = { lte: prixMax };
            }
        }

        if (disponible !== undefined) {
            where.disponible = disponible === 'true';
        }

        const destinations = await prisma.destination.findMany({
            where,
            include: {
                activites: true
            }
        });

        res.json({
            success: true,
            count: destinations.length,
            data: destinations
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
router.get('/search', async (req, res) => {
    try {
        const { q, prix_min, prix_max, duree_min, duree_max } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Le terme de recherche doit contenir au moins 2 caractères"
            });
        }

        // Construire le filtre de recherche
        const where = {
            OR: [
                { nom: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { categorie: { contains: q, mode: 'insensitive' } }
            ]
        };

        // Ajouter les filtres de prix
        if (prix_min || prix_max) {
            where.prix = {};
            if (prix_min) {
                const prixMin = parseFloat(prix_min);
                if (!isNaN(prixMin)) {
                    where.prix.gte = prixMin;
                }
            }
            if (prix_max) {
                const prixMax = parseFloat(prix_max);
                if (!isNaN(prixMax)) {
                    where.prix.lte = prixMax;
                }
            }
        }

        // Ajouter les filtres de durée
        if (duree_min || duree_max) {
            where.duree = {};
            if (duree_min) {
                const dureeMin = parseInt(duree_min);
                if (!isNaN(dureeMin)) {
                    where.duree.gte = dureeMin;
                }
            }
            if (duree_max) {
                const dureeMax = parseInt(duree_max);
                if (!isNaN(dureeMax)) {
                    where.duree.lte = dureeMax;
                }
            }
        }

        const destinations = await prisma.destination.findMany({
            where,
            include: {
                activites: true
            }
        });

        res.json({
            success: true,
            query: q,
            count: destinations.length,
            data: destinations
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
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        const destination = await prisma.destination.findUnique({
            where: { id },
            include: {
                activites: true,
                reservations: true
            }
        });

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

// POST /api/destinations - Créer une nouvelle destination
router.post('/', async (req, res) => {
    try {
        const {
            nom, description, prix, duree, image,
            categorie, activites, placesDisponibles
        } = req.body;

        // Validation des données
        const erreurs = [];
        if (!nom || nom.trim().length < 3) erreurs.push("Le nom doit contenir au moins 3 caractères");
        if (!description || description.trim().length < 10) erreurs.push("La description doit contenir au moins 10 caractères");
        if (!prix || prix <= 0) erreurs.push("Le prix doit être supérieur à 0");
        if (!duree || duree <= 0) erreurs.push("La durée doit être supérieure à 0");
        if (!categorie) erreurs.push("La catégorie est obligatoire");

        if (erreurs.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Données invalides",
                erreurs
            });
        }

        // Préparer les données pour la création
        const destinationData = {
            nom: nom.trim(),
            description: description.trim(),
            prix: parseFloat(prix),
            duree: parseInt(duree),
            image: image || "https://via.placeholder.com/400x300",
            disponible: true,
            categorie: categorie.toLowerCase(),
            placesDisponibles: placesDisponibles || 20
        };

        // Ajouter les activités si fournies
        if (activites && Array.isArray(activites) && activites.length > 0) {
            destinationData.activites = {
                create: activites.map(activite => ({
                    nom: typeof activite === 'string' ? activite : activite.nom
                }))
            };
        }

        const nouvelleDestination = await prisma.destination.create({
            data: destinationData,
            include: {
                activites: true
            }
        });

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
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        const { nom, description, prix, duree, image, categorie, placesDisponibles, disponible } = req.body;

        // Vérifier si la destination existe
        const destinationExistante = await prisma.destination.findUnique({
            where: { id }
        });

        if (!destinationExistante) {
            return res.status(404).json({
                success: false,
                message: "Destination non trouvée"
            });
        }

        // Préparer les données de mise à jour
        const updateData = {};
        if (nom) updateData.nom = nom.trim();
        if (description) updateData.description = description.trim();
        if (prix) updateData.prix = parseFloat(prix);
        if (duree) updateData.duree = parseInt(duree);
        if (image) updateData.image = image;
        if (categorie) updateData.categorie = categorie.toLowerCase();
        if (placesDisponibles !== undefined) updateData.placesDisponibles = parseInt(placesDisponibles);
        if (disponible !== undefined) updateData.disponible = disponible;

        const destinationMiseAJour = await prisma.destination.update({
            where: { id },
            data: updateData,
            include: {
                activites: true
            }
        });

        res.json({
            success: true,
            message: "Destination mise à jour avec succès",
            data: destinationMiseAJour
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
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID invalide"
            });
        }

        // Vérifier si la destination existe
        const destinationExistante = await prisma.destination.findUnique({
            where: { id },
            include: {
                reservations: true
            }
        });

        if (!destinationExistante) {
            return res.status(404).json({
                success: false,
                message: "Destination non trouvée"
            });
        }

        // Vérifier s'il y a des réservations actives
        if (destinationExistante.reservations.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Impossible de supprimer: cette destination a des réservations actives"
            });
        }

        // Supprimer le fichier image si c'est un fichier uploadé
        if (destinationExistante.image && destinationExistante.image.startsWith('/uploads/')) {
            const imagePath = path.join('.', destinationExistante.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Supprimer d'abord les activités liées, puis la destination
        await prisma.activite.deleteMany({
            where: { destinationId: id }
        });

        const destinationSupprimee = await prisma.destination.delete({
            where: { id }
        });

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