/**
 * Middleware de validation sans dépendance externe
 * @param {Function} validateFn - Fonction retournant un tableau d'erreurs
 */
const validerAvecFonction = (validateFn) => {
  return (req, res, next) => {
    const erreurs = validateFn(req.body);

    if (erreurs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        erreurs
      });
    }

    next();
  };
};

module.exports = validerAvecFonction;