import { prisma } from "~/db.server";

export function createCollection({ slug, title, userId, recipeSlug }) {
  const data = {
    title,
    slug,
    user: {
      connect: {
        id: userId,
      },
    },

  }
  if (recipeSlug) {
    data.recipes = {
      create: [
        {
          recipe: {
            connect: {
              slug: recipeSlug,
            },
          },
        }
      ]
    }
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
          recipe: {
            select: {
              title: true,
              slug: true,
              user: {
                select: {
                  username: true
                }
              }
            }
            
          },
        }
      }
    }
  });
}
