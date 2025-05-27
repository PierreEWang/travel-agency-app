const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du seeding...');

    // Nettoyer les données existantes
    await prisma.reservation.deleteMany();
    await prisma.activite.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.client.deleteMany();

    // Créer des destinations avec activités
    const destinations = await Promise.all([
        prisma.destination.create({
            data: {
                nom: "Paris, France",
                description: "La ville lumière avec ses monuments iconiques. Découvrez l'art, la culture et la gastronomie française dans cette métropole emblématique.",
                prix: 899,
                duree: 5,
                image: "https://files.catbox.moe/dtixs8.jpg",
                categorie: "ville",
                dateDepart: new Date('2024-07-15'),
                placesDisponibles: 25,
                activites: {
                    create: [
                        { nom: "Visite de la Tour Eiffel" },
                        { nom: "Musée du Louvre" },
                        { nom: "Quartier de Montmartre" },
                        { nom: "Croisière sur la Seine" }
                    ]
                }
            },
            include: { activites: true }
        }),

        prisma.destination.create({
            data: {
                nom: "Bali, Indonésie",
                description: "Île paradisiaque avec plages de rêve et temples mystiques. Immergez-vous dans la culture balinaise entre détente et spiritualité.",
                prix: 1299,
                duree: 8,
                image: "https://files.catbox.moe/q5gimm.jpg",
                categorie: "plage",
                dateDepart: new Date('2024-08-01'),
                placesDisponibles: 15,
                activites: {
                    create: [
                        { nom: "Plongée sous-marine" },
                        { nom: "Visite des temples" },
                        { nom: "Randonnée dans les rizières" },
                        { nom: "Cours de cuisine balinaise" }
                    ]
                }
            },
            include: { activites: true }
        }),

        prisma.destination.create({
            data: {
                nom: "Tokyo, Japon",
                description: "Métropole moderne entre tradition et innovation. Explorez cette fascinante capitale où le futur rencontre le passé.",
                prix: 1599,
                duree: 7,
                image: "https://files.catbox.moe/o8agfi.jpg",
                categorie: "ville",
                dateDepart: new Date('2024-09-10'),
                placesDisponibles: 20,
                activites: {
                    create: [
                        { nom: "Temples traditionnels" },
                        { nom: "Quartier d'Akihabara" },
                        { nom: "Excursion au Mont Fuji" },
                        { nom: "Marché aux poissons de Tsukiji" }
                    ]
                }
            },
            include: { activites: true }
        }),

        prisma.destination.create({
            data: {
                nom: "Marrakech, Maroc",
                description: "Ville impériale aux mille couleurs. Perdez-vous dans les souks animés et découvrez l'hospitalité marocaine.",
                prix: 699,
                duree: 4,
                image: "https://files.catbox.moe/f0enrb.jpg",
                categorie: "culture",
                dateDepart: new Date('2024-06-20'),
                placesDisponibles: 30,
                activites: {
                    create: [
                        { nom: "Exploration de la Médina" },
                        { nom: "Jardins Majorelle" },
                        { nom: "Excursion dans le désert" },
                        { nom: "Hammam traditionnel" }
                    ]
                }
            },
            include: { activites: true }
        }),

        prisma.destination.create({
            data: {
                nom: "New York, États-Unis",
                description: "La ville qui ne dort jamais. Vivez l'effervescence de Manhattan et découvrez l'énergie unique de la Big Apple.",
                prix: 1199,
                duree: 6,
                image: "https://files.catbox.moe/stn5pg.jpeg",
                categorie: "ville",
                dateDepart: new Date('2024-10-01'),
                placesDisponibles: 18,
                activites: {
                    create: [
                        { nom: "Statue de la Liberté" },
                        { nom: "Times Square" },
                        { nom: "Central Park" },
                        { nom: "Broadway Show" }
                    ]
                }
            },
            include: { activites: true }
        }),

        prisma.destination.create({
            data: {
                nom: "Maldives",
                description: "Paradis tropical avec eaux cristallines et plages de sable blanc. L'escapade parfaite pour une lune de miel ou des vacances de rêve.",
                prix: 2299,
                duree: 10,
                image: "https://files.catbox.moe/0ifwwj.jpg",
                categorie: "plage",
                dateDepart: new Date('2024-11-15'),
                placesDisponibles: 12,
                activites: {
                    create: [
                        { nom: "Plongée avec les raies manta" },
                        { nom: "Spa en overwater" },
                        { nom: "Pêche au coucher du soleil" },
                        { nom: "Excursion en dhoni" }
                    ]
                }
            },
            include: { activites: true }
        })
    ]);

    console.log('✅ Destinations créées:', destinations.length);

    // Créer des clients
    const clients = await Promise.all([
        prisma.client.create({
            data: {
                nom: "Brouzes",
                prenom: "Antoine",
                email: "antoine.brouzes@email.com",
                telephone: "0123456789"
            }
        }),
        prisma.client.create({
            data: {
                nom: "Rothschild",
                prenom: "Arnaud",
                email: "arnaud.rothschild@email.com",
                telephone: "0123456790"
            }
        }),
        prisma.client.create({
            data: {
                nom: "Martin",
                prenom: "Sophie",
                email: "sophie.martin@email.com",
                telephone: "0123456791"
            }
        })
    ]);

    console.log('✅ Clients créés:', clients.length);

    // Créer des réservations
    const reservations = await Promise.all([
        prisma.reservation.create({
            data: {
                numeroReservation: "RES-2024-001",
                destinationId: destinations[0].id, // Paris
                clientId: clients[0].id, // Antoine
                nombrePersonnes: 2,
                dateVoyage: new Date('2024-07-15'),
                prixTotal: 1798, // 899 * 2
                statut: "confirmee",
                commentaires: "Voyage de noces"
            }
        }),
        prisma.reservation.create({
            data: {
                numeroReservation: "RES-2024-002",
                destinationId: destinations[1].id, // Bali
                clientId: clients[1].id, // Arnaud
                nombrePersonnes: 1,
                dateVoyage: new Date('2024-08-01'),
                prixTotal: 51433,
                statut: "en_attente",
                commentaires: "Voyage solo"
            }
        }),
        prisma.reservation.create({
            data: {
                numeroReservation: "RES-2024-003",
                destinationId: destinations[2].id, // Tokyo
                clientId: clients[2].id, // Sophie
                nombrePersonnes: 3,
                dateVoyage: new Date('2024-09-10'),
                prixTotal: 4797, // 1599 * 3
                statut: "confirmee",
                commentaires: "Voyage en famille"
            }
        })
    ]);

    console.log('✅ Réservations créées:', reservations.length);

    console.log('\n🎉 Seeding terminé avec succès!');
    console.log('📊 Résumé:');
    console.log(`   - ${destinations.length} destinations`);
    console.log(`   - ${clients.length} clients`);
    console.log(`   - ${reservations.length} réservations`);
    console.log(`   - ${destinations.reduce((acc, dest) => acc + dest.activites.length, 0)} activités`);
}

main()
    .catch((e) => {
        console.error('❌ Erreur pendant le seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });