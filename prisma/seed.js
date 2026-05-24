const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Senha123!', 10);
  
  const user = await prisma.user.create({
    data: {
      name: "Gilberto Padilha",
      email: "gilberto.padilha2001@gmail.com",
      hashedPassword: hashedPassword,
      role: "ADMIN",
      phone: "+55 11 99999-9999",
      active: true
    }
  });
  
  console.log("✅ Usuário criado!");
  console.log(`Email: ${user.email}`);
  console.log(`Senha: Senha123!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
