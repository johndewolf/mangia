import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByUsername(username) {
  return prisma.user.findUnique({ where: { username: username } });
}

export async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export function getUsers() {
  return prisma.user.findMany({
    select: { id: true, username: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createUser(email, password, username) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
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
}

export async function deleteUserByEmail(email) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(email, password) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { username, password: _password, ...userWithoutPassword } = userWithPassword;

  return {username, ...userWithoutPassword};
}

export function getUserCheckIns({userId}) {
  return prisma.checkIn.findMany({
    where: { userId},
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    select: {
      id: true,
      recipe: {
        select: {
          title: true,
          slug: true
        }
      },
      user: {
        select: {
          username: true
        }
      },
      createdAt: true
    }
  });
}
