import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Migrating BusinessContact statuses...");

  const contacts = await prisma.businessContact.findMany();

  for (const contact of contacts) {
    if (contact.status === "REPLIED") {
      await prisma.businessContact.update({
        where: { id: contact.id },
        data: { status: "ESTIMATING" },
      });
      console.log(`Updated ${contact.id} from REPLIED to ESTIMATING`);
    } else if (contact.status === "CLOSED") {
      await prisma.businessContact.update({
        where: { id: contact.id },
        data: { status: "COMPLETED" },
      });
      console.log(`Updated ${contact.id} from CLOSED to COMPLETED`);
    }
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
