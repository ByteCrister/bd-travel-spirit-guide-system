// app/operations/tours/[tourId]/page.tsx
import TourDetailPage from '@/components/operations/tours/tour-details/TourDetailPage';
// import { decodeId } from '@/utils/helpers/mongodb-id-conversions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ tourId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { tourId } = await params;

  if (!tourId) {
    notFound();
  }

  // const decoded = decodeId(decodeURIComponent(tourId));
  // if (!decoded) {
  //   // decodeId failed to produce a valid id
  //   notFound();
  // }

  return <TourDetailPage tourId={tourId} />;
}