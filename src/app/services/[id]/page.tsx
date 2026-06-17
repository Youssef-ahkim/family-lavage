import React from "react";
import { getServices, getServiceOffers } from "@/app/admin/services/service-actions";
import ServiceDetailsClient from "./service-details-client";

// Ensure dynamic rendering to fetch fresh database records
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const [servicesData, offersData] = await Promise.all([
    getServices(),
    getServiceOffers(id)
  ]);

  const foundService = servicesData.find(s => s.id === id) || null;
  const activeOffers = offersData.filter(o => o.active);

  return (
    <ServiceDetailsClient 
      service={foundService}
      allServices={servicesData}
      offers={activeOffers}
    />
  );
}
