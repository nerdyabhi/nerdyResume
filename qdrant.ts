import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

const client = new QdrantClient({
  url: process.env.QDRANT_ENDPOINT!,
  apiKey: process.env.QDRANT_API_KEY!,
});

async function fix() {
  const collectionName = "memories";

  try {
    await client.deleteCollection(collectionName);
    console.log("✅ Deleted old collection");
  } catch (e) {
    console.log("Collection does not exist");
  }

  await client.createCollection(collectionName, {
    vectors: {
      size: 1536,
      distance: "Cosine",
    },
  });
  console.log("✅ Collection created");

  await client.createPayloadIndex(collectionName, {
    field_name: "userId",
    field_schema: "keyword",
  });
  console.log("✅ userId index created as integer");

  await client.createPayloadIndex(collectionName, {
    field_name: "user_id",
    field_schema: "keyword",
  });
  console.log("✅ user_id index created as integer");

  console.log("🎉 Done!");
}

fix().catch(console.error);
