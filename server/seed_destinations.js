const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌍 Création des destinations...');

    // Nettoyer les données existantes
    await prisma.reservation.deleteMany();
    await prisma.activite.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.client.deleteMany();

    // Destinations avec vos données actuelles
    const destinations = await Promise.all([
        prisma.destination.create({
            data: {
                nom: "Paris, France",
                description: "La ville lumière avec ses monuments iconiques",
                prix: 899,
                duree: 5,
                image: "https://images.pexels.com/photos/161853/eiffel-tower-paris-france-tower-161853.jpeg?w=800",
                categorie: "ville",
                dateDepart: new Date('2024-07-15'),
                placesDisponibles: 25
            }
        }),
        prisma.destination.create({
            data: {
                nom: "Rome, Italie",
                description: "Ville éternelle riche en histoire et culture",
                prix: 750,
                duree: 4,
                image: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?w=800",
                categorie: "culture",
                dateDepart: new Date('2024-08-15'),
                placesDisponibles: 20
            }
        }),
        prisma.destination.create({
            data: {
                nom: "Barcelone, Espagne",
                description: "Architecture moderniste et plages méditerranéennes",
                prix: 650,
                duree: 5,
                image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
                categorie: "ville",
                dateDepart: new Date('2024-09-01'),
                placesDisponibles: 25
            }
        }),
        prisma.destination.create({
            data: {
                nom: "Tokyo, Japon",
                description: "Métropole moderne entre tradition et innovation",
                prix: 1599,
                duree: 7,
                image: "https://images.pexels.com/photos/2835436/pexels-photo-2835436.jpeg?w=800",
                categorie: "ville",
                dateDepart: new Date('2024-09-10'),
                placesDisponibles: 20,
                activites: {
                    create: [
                        { nom: "Temples traditionnels" },
                        { nom: "Quartier Shibuya" },
                        { nom: "Mont Fuji" },
                        { nom: "Marché Tsukiji" }
                    ]
                }
            }
        }),
        prisma.destination.create({
            data: {
                nom: "Bali, Indonésie", 
                description: "Île paradisiaque avec plages de rêve et temples mystiques",
                prix: 1299,
                duree: 8,
                image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?w=800",
                categorie: "plage",
                dateDepart: new Date('2024-08-01'),
                placesDisponibles: 15,
                activites: {
                    create: [
                        { nom: "Plongée sous-marine" },
                        { nom: "Temples sacrés" },
                        { nom: "Rizières d'Ubud" },
                        { nom: "Cours de cuisine" }
                    ]
                }
            }
        })
    ]);

    console.log(`✅ ${destinations.length} destinations créées`);
    console.log('🎉 Base de données initialisée !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });