import { NextResponse } from "next/server";
import { getAdminPB } from "@/lib/pocketbase";

export async function GET() {
  try {
    const adminPb = await getAdminPB();
    
    let res1, res2;
    try {
        res1 = await adminPb.collection("users").getList(1, 1, { sort: '-created' });
    } catch(e: any) { res1 = e.response || e.message; }
    
    try {
        res2 = await adminPb.collection("users").getList(1, 1, {});
    } catch(e: any) { res2 = e.response || e.message; }

    return NextResponse.json({ sortCreated: res1, noSort: res2 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
