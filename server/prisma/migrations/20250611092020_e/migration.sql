/*
  Warnings:

  - You are about to drop the column `dateDepart` on the `Destination` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Destination" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "duree" INTEGER NOT NULL,
    "image" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "categorie" TEXT NOT NULL,
    "placesDisponibles" INTEGER NOT NULL
);
INSERT INTO "new_Destination" ("categorie", "description", "disponible", "duree", "id", "image", "nom", "placesDisponibles", "prix") SELECT "categorie", "description", "disponible", "duree", "id", "image", "nom", "placesDisponibles", "prix" FROM "Destination";
DROP TABLE "Destination";
ALTER TABLE "new_Destination" RENAME TO "Destination";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
