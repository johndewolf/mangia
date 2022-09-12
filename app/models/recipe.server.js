import { prisma } from "~/db.server";
import axios from "axios";
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const instance = axios.create({
  baseURL: 'https://api.openai.com/v1',
  timeout: 5000,
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

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
      ingredients: true,
      user: true
    }
  });
}

export function getRecipeBySlug(slug) {
  return prisma.recipe.findFirst({
    where: slug,
    include: {
      ingredients: true,
      steps: true,
      user: true
    }
  });
}


export function getRecipeByUser(userId) {
  return prisma.recipe.findFirst({
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
      title: true,
      slug: true,
      user: {
        select: {
          username: true
        }
      }
    }
  });
}

export function getRecipeCheckInsByUser({recipeId, userId}) {
  return prisma.checkIn.findMany({
    where: { userId, recipeId },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      createdAt: true
    }
  });
}

export function createRecipeCheckInByUser({recipeSlug, userId}) {
  return prisma.checkIn.create({
    data: {
      recipe: {
        connect: {
          slug: recipeSlug
        }
      },
      user: {
        connect: {
          id: userId
        }
      }
    }
  });
}


export function deleteRecipe(id) {
  return prisma.recipe.deleteMany({
    where: { id },
  });
}

export function createRecipe({  title, ingredients, userId, steps, slug }) {
  return prisma.recipe.create({
    data: {
      title,
      slug,
      ingredients: {
        create: ingredients
      },
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

export function getIngredientSuggestion(ingredients) {
  // return openai.createEdit(
  //   "text-davinci-edit-001", {
  //     instruction: "What is the next ingredient?",
  //     input: "cheese better garlic"
  //     timeout
  //   }
  // );
  return instance.post('/edits',
    {
      model: "text-davinci-edit-001",
      instruction: "What is the next ingredient?",
      input: ingredients
    })
}
