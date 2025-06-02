-- CreateTable
CREATE TABLE "Destination" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "duree" INTEGER NOT NULL,
    "image" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "categorie" TEXT NOT NULL,
    "dateDepart" DATETIME NOT NULL,
    "placesDisponibles" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Activite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "destinationId" INTEGER NOT NULL,
    CONSTRAINT "Activite_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroReservation" TEXT NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "nombrePersonnes" INTEGER NOT NULL,
    "dateReservation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateVoyage" DATETIME NOT NULL,
    "prixTotal" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "commentaires" TEXT,
    CONSTRAINT "Reservation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_numeroReservation_key" ON "Reservation"("numeroReservation");
