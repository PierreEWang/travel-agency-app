const { execSync } = require('child_process');

// Configuration Jest pour les tests Prisma
beforeAll(async () => {
  // S'assurer que la base de données de test est configurée
  try {
    // Définir l'URL de la base de données de test
    process.env.DATABASE_URL = "file:./test.db";
    
    // Pousser le schéma vers la base de données de test
    execSync('npx prisma db push', { 
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('✅ Base de données de test initialisée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de test:', error.message);
  }
});

// Timeout plus long pour les tests de base de données
jest.setTimeout(30000);