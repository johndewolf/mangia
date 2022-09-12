const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = "jdewolf06@gmail.com";
  const username = "jdewolf06"
  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("password", 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  const recipe = await prisma.recipe.create({
    data: {
      title: "My recipe",
      slug: "my-recipe",
      userId: user.id,
    },
  });

  await prisma.collection.create({
    data: {
      title: 'My collection',
      slug: 'my-collection',
      recipes: {
        create: {
          recipe: {
            connect: {
              id: recipe.id
            }
          }
        }
      },
      userId: user.id
    }
  })
  await prisma.ingredient.create({
    data:{
        quantity: '1',
        metric:'cup',
        body: 'basil',
        recipeId: recipe.id
    }
  })

  await prisma.ingredient.create({
    data:{
        quantity: '1/4',
        metric:'cup',
        body: 'parm',
        recipeId: recipe.id
    }
  })

  await prisma.ingredient.create({
    data:{
        quantity: '1/4',
        metric:'cup',
        body: 'olive oil',
        recipeId: recipe.id
    }
  })
  await prisma.step.create({
    data:{
        body: 'this is an important step',
        recipeId: recipe.id
    }
  })

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
