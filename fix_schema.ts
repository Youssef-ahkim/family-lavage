import { getAdminPB } from './src/lib/pocketbase.ts';

async function fixSchema() {
  try {
    const pb = await getAdminPB();
    const collection = await pb.collections.getOne("bookings");
    
    const priceField = collection.fields.find((f: any) => f.name === 'price');
    if (priceField) {
      priceField.required = false; 
    }

    await pb.collections.update("bookings", collection);
    console.log("Successfully updated schema");
  } catch (e: any) {
    console.error("Error updating schema:", e.response || e);
  }
}
fixSchema();
