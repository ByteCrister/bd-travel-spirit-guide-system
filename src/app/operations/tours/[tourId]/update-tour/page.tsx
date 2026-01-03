// app/operations/tours/[tourId]/update-tour/page.tsx
import MainUpdateTourContainer from '@/components/operations/tours/update-tour/MainUpdateTourContainer';
// import { decodeId } from '@/utils/helpers/mongodb-id-conversions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ tourId: string }>;
}

export default async function UpdateTourPage({ params }: PageProps) {
  const { tourId } = await params;

  if (!tourId) {
    notFound();
  }

  // const decoded = decodeId(decodeURIComponent(tourId));
  // if (!decoded) {
  //   // decodeId failed to produce a valid id
  //   notFound();
  // }

  return <MainUpdateTourContainer tourId={tourId} />;
}