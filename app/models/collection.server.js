import { prisma } from "~/db.server";

export function createCollection({ slug, title, userId, recipeId }) {
  const data = {
    title,
    slug,
    user: {
      connect: {
        id: userId,
      },
    },
  }
  if (recipeId) {
    data.recipes = recipeId
  }
  return prisma.collection.create({
    data
  })
}

export function getCollectionsByUser(username) {
  return prisma.collection.findMany({
    where: { user: {username: username} },
    orderBy: {
      title: 'desc'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      recipes: {
        select: {
          title: true,
          slug: true,
          user: {
            select: {
              username: true
            }
          }
        }
      }
    }
  });
}
