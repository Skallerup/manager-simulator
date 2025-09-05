import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Clean up any existing test data
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Clean up test data
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up after each test
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

