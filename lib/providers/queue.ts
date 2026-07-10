import { QueueProvider } from "@/features/jobs/providers/QueueProvider";
import { MongoQueueProvider } from "@/features/jobs/providers/MongoQueueProvider";

let activeQueueProvider: QueueProvider | null = null;

export function getQueueProvider(): QueueProvider {
  if (activeQueueProvider) return activeQueueProvider;

  const providerType = process.env.QUEUE_PROVIDER || "MONGO";

  if (providerType === "MONGO") {
    activeQueueProvider = new MongoQueueProvider();
  } else {
    // Scaffolded for future
    throw new Error(`Queue provider ${providerType} is not implemented yet.`);
  }

  return activeQueueProvider;
}
