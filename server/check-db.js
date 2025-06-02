const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking database state...');

    // Check if there are any destinations
    const destinations = await prisma.destination.findMany();
    console.log(`Found ${destinations.length} destinations:`);
    destinations.forEach(dest => {
        console.log(`ID: ${dest.id}, Name: ${dest.nom}`);
    });

    // Check if there are any clients
    const clients = await prisma.client.findMany();
    console.log(`\nFound ${clients.length} clients:`);
    clients.forEach(client => {
        console.log(`ID: ${client.id}, Name: ${client.nom} ${client.prenom}`);
    });

    // Check if there are any reservations
    const reservations = await prisma.reservation.findMany();
    console.log(`\nFound ${reservations.length} reservations:`);
    reservations.forEach(res => {
        console.log(`ID: ${res.id}, Destination ID: ${res.destinationId}, Client ID: ${res.clientId}`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });