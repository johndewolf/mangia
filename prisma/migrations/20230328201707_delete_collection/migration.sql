-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecipeOnCollection" (
    "recipeId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,

    PRIMARY KEY ("recipeId", "collectionId"),
    CONSTRAINT "RecipeOnCollection_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeOnCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecipeOnCollection" ("collectionId", "recipeId") SELECT "collectionId", "recipeId" FROM "RecipeOnCollection";
DROP TABLE "RecipeOnCollection";
ALTER TABLE "new_RecipeOnCollection" RENAME TO "RecipeOnCollection";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
