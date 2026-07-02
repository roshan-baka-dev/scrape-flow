import "server-only";
import Stripe from "stripe";
import { getCreditsPack, PackId } from "@/types/billing";
// import prisma from "../prisma";
import prisma from "@/lib/prisma";

export async function HandleCheckoutSessionCompleted(
  event: Stripe.Checkout.Session
) {
  console.log("Handling checkout session completed event");
  if (!event.metadata) {
    throw new Error("No metadata found");
  }
  const { userId, packId } = event.metadata;
  if (!userId) {
    throw new Error("Missing userId");
  }
  if (!packId) {
    throw new Error("Missing packId");
  }
  const purchasePack = getCreditsPack(packId as PackId);
  if (!purchasePack) {
    throw new Error("Invalid Package");
  }
  await prisma.$transaction(async (tx) => {
    // Implement idempotency: check if the purchase already exists
    const existingPurchase = await tx.userPurchase.findUnique({
      where: { stripeId: event.id },
    });

    if (existingPurchase) {
      console.log(`Purchase ${event.id} already processed, skipping.`);
      return;
    }

    await tx.userBalance.upsert({
      where: { userId },
      create: {
        userId,
        credits: purchasePack.credits,
      },
      update: {
        credits: {
          increment: purchasePack.credits,
        },
      },
    });

    await tx.userPurchase.create({
      data: {
        userId,
        stripeId: event.id,
        description: `${purchasePack.name} - ${purchasePack.credits} credits`,
        amount: event.amount_total!,
        currency: event.currency!,
      },
    });
  });

  console.log("Checkout session completed event handled successfully");
}
