import React from "react";
import { getServices } from "../admin/services/service-actions";
import ServicesClient from "./services-client";

// Ensure the page is dynamically rendered so it fetches fresh data from DB on each request
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const dbServices = await getServices();
  const parentServices = dbServices.filter(s => !s.parent_service);

  return <ServicesClient dbServices={parentServices} />;
}