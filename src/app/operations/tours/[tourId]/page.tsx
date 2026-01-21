// app/operations/tours/[tourId]/page.tsx
import TourDetailPage from '@/components/operations/tours/tour-details/TourDetailPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ tourId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { tourId } = await params;

  if (!tourId) {
    notFound();
  }

  return <TourDetailPage tourId={tourId} />;
}