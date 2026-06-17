import React from "react";
import { getServices, getServiceOffers } from "@/app/admin/services/service-actions";
import OfferDetailsClient from "./offer-details-client";

// Ensure dynamic rendering to fetch fresh database records
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string; offerId: string }>;
}

export default async function OfferDetailsPage({ params }: PageProps) {
  const { id: serviceId, offerId } = await params;

  const [servicesData, offersData] = await Promise.all([
    getServices(),
    getServiceOffers(serviceId)
  ]);

  const foundService = servicesData.find(s => s.id === serviceId) || null;
  const foundOffer = offersData.find(o => o.id === offerId && o.active) || null;

  return (
    <OfferDetailsClient 
      service={foundService} 
      offer={foundOffer} 
      serviceId={serviceId} 
    />
  );
}
