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


export function createRecipe({  title, ingredients, userId, steps }) {
  return prisma.recipe.create({
    data: {
      title,
      ingredients,
      steps: {
        create: steps
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
