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


// Fonction pour valider les données de réservation (VERSION CORRIGÉE)
function validerDonneesReservation(data) {
  const erreurs = [];

  // Validation ID destination
  if (!data.destinationId || isNaN(parseInt(data.destinationId))) {
    erreurs.push("ID de destination invalide");
  }

  // Validation informations client
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

    // 🔧 CORRECTION : Téléphone optionnel mais validé si fourni
    if (data.client.telephone && data.client.telephone.trim().length > 0) {
      const telephoneClean = data.client.telephone.replace(/\s/g, ''); // Enlever les espaces
      if (telephoneClean.length < 10) {
        erreurs.push("Le téléphone doit contenir au moins 10 chiffres");
      }
    }
  }

  // Validation nombre de personnes
  if (!data.nombrePersonnes || data.nombrePersonnes < 1 || data.nombrePersonnes > 10) {
    erreurs.push("Le nombre de personnes doit être entre 1 et 10");
  }

  // Validation date de voyage
  if (!data.dateVoyage) {
    erreurs.push("Date de voyage manquante");
  } else {
    const dateVoyage = new Date(data.dateVoyage);
    const aujourdhui = new Date();

    // Réinitialiser les heures pour comparer uniquement les dates
    aujourdhui.setHours(0, 0, 0, 0);
    dateVoyage.setHours(0, 0, 0, 0);

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

    // Vérifier s'il y a assez de places disponibles
    if (destinationExistante.placesDisponibles < nombrePersonnes) {
      return res.status(400).json({
        success: false,
        message: "Pas assez de places disponibles pour cette réservation"
      });
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
    const prixTotal = destinationExistante.prix * nombrePersonnes;

    // Utiliser une transaction pour créer la réservation et mettre à jour les places disponibles
    const nouvelleReservation = await prisma.$transaction(async (prisma) => {
      // Créer la réservation
      const reservation = await prisma.reservation.create({
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

      // Mettre à jour les places disponibles de la destination
      await prisma.destination.update({
        where: { id: destinationExistante.id },
        data: {
          placesDisponibles: destinationExistante.placesDisponibles - parseInt(nombrePersonnes)
        }
      });

      return reservation;
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

    // Récupérer la réservation actuelle avec sa destination
    const reservationActuelle = await prisma.reservation.findUnique({
      where: { id },
      include: { destination: true }
    });

    if (!reservationActuelle) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée"
      });
    }

    // Utiliser une transaction pour mettre à jour le statut et gérer les places disponibles
    const resultat = await prisma.$transaction(async (prisma) => {
      // Si le statut passe à "annulee" et n'était pas déjà "annulee", restaurer les places
      if (statut === 'annulee' && reservationActuelle.statut !== 'annulee') {
        await prisma.destination.update({
          where: { id: reservationActuelle.destinationId },
          data: {
            placesDisponibles: reservationActuelle.destination.placesDisponibles + reservationActuelle.nombrePersonnes
          }
        });
      }
      // Si le statut passe de "annulee" à un autre statut, réduire à nouveau les places
      else if (reservationActuelle.statut === 'annulee' && statut !== 'annulee') {
        await prisma.destination.update({
          where: { id: reservationActuelle.destinationId },
          data: {
            placesDisponibles: reservationActuelle.destination.placesDisponibles - reservationActuelle.nombrePersonnes
          }
        });
      }

      // Mettre à jour le statut de la réservation
      return await prisma.reservation.update({
        where: { id },
        data: { statut }
      });
    });

    res.json({
      success: true,
      message: `Statut mis à jour vers "${statut}"`,
      data: resultat
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


// DELETE /api/reservations/:id - Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID invalide"
      });
    }

    // Récupérer la réservation avec sa destination pour connaître le nombre de personnes
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { destination: true }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée"
      });
    }

    // Utiliser une transaction pour supprimer la réservation et restaurer les places
    const resultat = await prisma.$transaction(async (prisma) => {
      // Supprimer la réservation
      const reservationSupprimee = await prisma.reservation.delete({
        where: { id }
      });

      // Restaurer les places disponibles si la réservation n'était pas annulée
      if (reservation.statut !== 'annulee') {
        await prisma.destination.update({
          where: { id: reservation.destinationId },
          data: {
            placesDisponibles: reservation.destination.placesDisponibles + reservation.nombrePersonnes
          }
        });
      }

      return reservationSupprimee;
    });

    res.json({
      success: true,
      message: "Réservation supprimée avec succès",
      data: resultat
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la réservation",
      error: error.message
    });
  }
});

module.exports = router;