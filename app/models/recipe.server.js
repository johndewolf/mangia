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

export function getRecipesByUser(username) {
  return prisma.recipe.findMany({
    where: { user: username },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      title: true
    }
  });
}

export function deleteRecipe({ id, userId }) {
  return prisma.recipe.deleteMany({
    where: { id, userId },
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
