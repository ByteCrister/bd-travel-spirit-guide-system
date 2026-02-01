// app/operations/tours/[tourId]/page.tsx
import TourDetailPage from '@/components/operations/tours/details/TourDetailPage';
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

  return <TourDetailPage tourId={decodeId(decodeURIComponent(tourId)) ?? '-'} />;
}