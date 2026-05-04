import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const cookieStore = await cookies();
    pb.authStore.loadFromCookie(`pb_auth=${cookieStore.get('pb_auth')?.value}`);
    
    let res1, res2;
    try {
        res1 = await pb.collection("users").getList(1, 1, { sort: '-created' });
    } catch(e: any) { res1 = e.response || e.message; }
    
    try {
        res2 = await pb.collection("users").getList(1, 1, {});
    } catch(e: any) { res2 = e.response || e.message; }

    return NextResponse.json({ sortCreated: res1, noSort: res2 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
