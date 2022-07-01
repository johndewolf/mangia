import { prisma } from "~/db.server";

export function getRecipes() {
  return prisma.recipe.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export function getRecipe(id) {
  return prisma.recipe.findFirst({
    where: id,
    include: {
      steps: true,
      user: true
    }
  });
}

export function getRecipeByUser(userId) {
  return prisma.findFirst.findFirst({
    where: { userId },
  });
}
