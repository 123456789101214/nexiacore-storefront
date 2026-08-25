import { ReactNode } from "react";
import { notFound } from 'next/navigation';
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { StoreFrontHeader } from "@/components/storefront/StoreFrontHeader";
import { CartDrawerProvider } from "@/components/storefront/CartDrawerProvider";
import { storefrontKeys } from "@/hooks/useStorefront";
import { apiClient } from "@/lib/api/client";
import type { Shop, SingleEnvelope } from "@/types/storefront";




async function getShopData(shopSlug: string) {
  try {
    const res = await apiClient.get<SingleEnvelope<Shop>>(`/api/storefront/${shopSlug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}): Promise<Metadata> {
  const { shopSlug } = await params;
  const shop = await getShopData(shopSlug);

  if (!shop) {
    return {
      title: "Store Not Found | NexiaCore",
    };
  }

  return {
    title: `${shop.name} | Official Store`,
    description: `Shop online at ${shop.name}.`,
  };
}

export default async function ShopLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { shopSlug: string };
}) {
  const { shopSlug } = await params;
  const shop = await getShopData(shopSlug);

  // ⚠️ Data Integrity Gate: if shop is null (404 or isActive: false), block render
  if (!shop) {
    notFound();
  }

  // Hydrate query client so client components don't need to refetch shop data
  const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
    queryKey: storefrontKeys.shop(params.shopSlug),
    queryFn: () => getShopData(params.shopSlug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <StoreFrontHeader />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </HydrationBoundary>
  );
}