import { getAdminPB } from './src/lib/pocketbase.ts';

async function test() {
  try {
    const pb = await getAdminPB();
    const data = {
      full_name: "Test Name",
      phone: "0600000000",
      plate_number: "Test Plate",
      service_type: "Simple",
      price: 0,
      status: "pending",
      notes: "Test",
      date: new Date(Date.now() + 86400000).toISOString(),
    };
    const record = await pb.collection("bookings").create(data);
    console.log("Success:", record.id);
  } catch (e: any) {
    console.error("Error creating booking:", e.response || e);
  }
}
test();
