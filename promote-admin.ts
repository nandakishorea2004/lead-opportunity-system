
import "dotenv/config";
import prisma from "./src/lib/prisma";

async function main() {
  const email = "nandu@abc.com";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(
      `No account found for ${email}. Register first.`
    );
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Admin role assigned successfully:");
  console.log(updatedUser);
}

main()
  .catch((error) => {
    console.error("Admin setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
