// app/operations/tours/[tourId]/history/page.tsx
import TourHistoryPage from '@/components/operations/tours/details/history/TourHistoryPage';
import { decodeId } from '@/utils/helpers/mongodb-id-conversions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ tourId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { tourId } = await params;

  if (!tourId) {
    notFound();
  }

  return <TourHistoryPage tourId={decodeId(decodeURIComponent(tourId)) ?? '-'} />;
}
