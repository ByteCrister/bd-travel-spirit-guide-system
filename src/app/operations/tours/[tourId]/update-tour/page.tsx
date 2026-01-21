// app/operations/tours/[tourId]/update-tour/page.tsx
import MainUpdateTourContainer from '@/components/operations/tours/update-tour/MainUpdateTourContainer';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ tourId: string }>;
}

export default async function UpdateTourPage({ params }: PageProps) {
  const { tourId } = await params;

  if (!tourId) {
    notFound();
  }

  return <MainUpdateTourContainer tourId={tourId} />;
}