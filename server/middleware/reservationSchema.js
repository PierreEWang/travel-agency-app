const validerDonneesReservation = (data) => {
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
};

module.exports = { validerDonneesReservation };