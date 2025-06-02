const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Fonction pour générer un numéro de réservation unique
function genererNumeroReservation() {
  const date = new Date();
  const timestamp = date.getTime();
  return `RES-${date.getFullYear()}-${timestamp}`;
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

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID invalide" });
    }

    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation non trouvée" });
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la réservation",
      error: error.message
    });
  }
});


router.post('/', async (req, res) => {
  try {
    const { destinationId, client, nombrePersonnes, dateVoyage, commentaires } = req.body;

    // Validation
    const erreurs = validerDonneesReservation(req.body);
    if (erreurs.length > 0) {
      return res.status(400).json({ success: false, message: "Données invalides", erreurs });
    }

    // Vérifier que la destination existe
    const destinationExistante = await prisma.destination.findUnique({
      where: { id: parseInt(destinationId) }
    });
    if (!destinationExistante) {
      return res.status(404).json({ success: false, message: "Destination non trouvée" });
    }

    // Vérifier si client existe par email
    let clientExistant = await prisma.client.findUnique({
      where: { email: client.email.trim().toLowerCase() }
    });

    // Sinon créer le client
    if (!clientExistant) {
      clientExistant = await prisma.client.create({
        data: {
          nom: client.nom.trim(),
          prenom: client.prenom.trim(),
          email: client.email.trim().toLowerCase(),
          telephone: client.telephone ? client.telephone.trim() : null,
        }
      });
    }

    // Calcul du prix total
    const prixTotal = destinationExistante.price * nombrePersonnes;

    // Créer la réservation
    const nouvelleReservation = await prisma.reservation.create({
      data: {
        destinationId: destinationExistante.id,
        clientId: clientExistant.id,
        numeroReservation: genererNumeroReservation(),
        nombrePersonnes: parseInt(nombrePersonnes),
        dateVoyage: new Date(dateVoyage),
        prixTotal,
        statut: "en_attente",
        commentaires: commentaires || ""
      }
    });

    res.status(201).json({
      success: true,
      message: "Réservation créée avec succès",
      data: nouvelleReservation
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la réservation",
      error: error.message
    });
  }
});

router.patch('/:id/statut', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

    const statutsValides = ['en_attente', 'confirmee', 'annulee', 'terminee'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide. Valeurs possibles: " + statutsValides.join(', ')
      });
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { statut }
    });

    res.json({
      success: true,
      message: `Statut mis à jour vers "${statut}"`,
      data: reservation
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
router.get('/', async (req, res) => {
  try {
    const { statut, email, date_debut, date_fin } = req.query;

    let conditions = {};

    if (statut) {
      conditions.statut = statut;
    }

    if (date_debut || date_fin) {
      conditions.dateVoyage = {};
      if (date_debut) {
        conditions.dateVoyage.gte = new Date(date_debut);
      }
      if (date_fin) {
        conditions.dateVoyage.lte = new Date(date_fin);
      }
    }

    // Inclure le client et la destination dans la réponse
    const reservations = await prisma.reservation.findMany({
      where: {
        ...conditions,
        ...(email ? {
          client: {
            email: {
              contains: email,
              mode: 'insensitive'
            }
          }
        } : {})
      },
      include: {
        client: true,
        destination: true
      }
    });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des réservations",
      error: error.message
    });
  }
});


module.exports = router;