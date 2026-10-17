
import "dotenv/config";
import prisma from "./src/lib/prisma";

async function main() {
  const opportunityId = 1;
  const catalogItemName = "EDR";

  const catalogItem = await prisma.catalogItem.findFirst({
    where: {
      name: catalogItemName,
      type: "Product",
    },
  });

  if (!catalogItem) {
    throw new Error("EDR Product was not found in the catalog.");
  }

  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      catalogItemId: catalogItem.id,
    },
    include: {
      catalogItem: true,
      lead: true,
    },
  });

  console.log("Opportunity linked successfully:");
  console.log(JSON.stringify(opportunity, null, 2));
}

main()
  .catch((error) => {
    console.error("Linking failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
