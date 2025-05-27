const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

beforeAll(async () => {
  // Générer et appliquer les migrations pour la base de test
  try {
    execSync('npx prisma migrate dev --name init', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: "file:./test.db" }
    });
  } catch (error) {
    // Si la migration échoue, on force la création du schéma
    execSync('npx prisma db push', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: "file:./test.db" }
    });
  }
  
  await prisma.$connect();
  
  // Nettoyer les données existantes
  await prisma.reservation.deleteMany();
  await prisma.activite.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.client.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Nettoyer après chaque test
  await prisma.reservation.deleteMany();
  await prisma.activite.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.client.deleteMany();
});

describe('Destination Model', () => {
  it('devrait créer une destination', async () => {
    const destination = await prisma.destination.create({
      data: {
        nom: 'Testville',
        description: 'Ville test pour Jest',
        prix: 500,
        duree: 3,
        image: null,
        categorie: 'test',
        dateDepart: new Date('2025-08-01'),
        placesDisponibles: 5
      }
    });

    expect(destination.nom).toBe('Testville');
    expect(destination.id).toBeGreaterThan(0);
    expect(destination.prix).toBe(500);
    expect(destination.duree).toBe(3);
    expect(destination.categorie).toBe('test');
    expect(destination.placesDisponibles).toBe(5);
  });

  it('devrait créer une destination avec des activités', async () => {
    const destination = await prisma.destination.create({
      data: {
        nom: 'Paris Test',
        description: 'Paris pour les tests',
        prix: 899,
        duree: 5,
        categorie: 'ville',
        dateDepart: new Date('2025-07-15'),
        placesDisponibles: 25,
        activites: {
          create: [
            { nom: 'Tour Eiffel' },
            { nom: 'Louvre' },
            { nom: 'Montmartre' }
          ]
        }
      },
      include: {
        activites: true
      }
    });

    expect(destination.nom).toBe('Paris Test');
    expect(destination.activites).toHaveLength(3);
    expect(destination.activites[0].nom).toBe('Tour Eiffel');
  });

  it('devrait pouvoir filtrer les destinations disponibles', async () => {
    // Créer des destinations de test
    await prisma.destination.createMany({
      data: [
        {
          nom: 'Destination Disponible',
          description: 'Test disponible',
          prix: 500,
          duree: 3,
          categorie: 'test',
          dateDepart: new Date('2025-08-01'),
          placesDisponibles: 5,
          disponible: true
        },
        {
          nom: 'Destination Indisponible',
          description: 'Test indisponible',
          prix: 600,
          duree: 4,
          categorie: 'test',
          dateDepart: new Date('2025-09-01'),
          placesDisponibles: 0,
          disponible: false
        }
      ]
    });

    const destinationsDisponibles = await prisma.destination.findMany({
      where: { disponible: true }
    });

    const destinationsIndisponibles = await prisma.destination.findMany({
      where: { disponible: false }
    });

    expect(destinationsDisponibles).toHaveLength(1);
    expect(destinationsIndisponibles).toHaveLength(1);
    expect(destinationsDisponibles[0].nom).toBe('Destination Disponible');
  });
});