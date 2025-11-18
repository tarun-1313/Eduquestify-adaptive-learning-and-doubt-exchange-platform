const { prisma } = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return existingUser;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.users.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'student'
      }
    });

    console.log('Test user created successfully:', user);
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();