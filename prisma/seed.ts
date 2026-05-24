import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@nexusimoveis.com.br" },
  });

  if (!existingAdmin) {
    const hashedPassword = await hash("nexus2026", 12);

    await prisma.user.create({
      data: {
        name: "Gilberto Padilha",
        username: "GILBERTO",
        email: "admin@nexusimoveis.com.br",
        hashedPassword,
        role: "ADMIN",
        phone: "(41) 99999-0000",
        avatar: "GP",
        active: true,
      },
    });
    console.log("Admin created: GILBERTO / nexus2026");
  } else {
    console.log("Admin already exists, skipping...");
  }

  // Create sample agents
  const agents = [
    { name: "Carlos Mendes", username: "CARLOS", email: "carlos@nexusimoveis.com.br", phone: "(41) 99999-0001", creci: "CRECI F-45231" },
    { name: "Ana Rodrigues", username: "ANA", email: "ana@nexusimoveis.com.br", phone: "(41) 99999-0002", creci: "CRECI F-38921" },
    { name: "Pedro Lima", username: "PEDRO", email: "pedro@nexusimoveis.com.br", phone: "(41) 99999-0003", creci: "CRECI F-52018" },
  ];

  for (const agent of agents) {
    const existing = await prisma.user.findUnique({
      where: { email: agent.email },
    });

    if (!existing) {
      const hashedPassword = await hash("corretor123", 12);
      await prisma.user.create({
        data: {
          ...agent,
          hashedPassword,
          role: "AGENT",
          avatar: agent.name.split(" ").map(n => n[0]).join("").slice(0, 2),
          active: true,
        },
      });
      console.log(`Agent created: ${agent.email} / corretor123`);
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
