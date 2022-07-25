/*
  Warnings:

  - Added the required column `metric` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Ingredient` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ingredient" ("body", "id", "recipeId") SELECT "body", "id", "recipeId" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
