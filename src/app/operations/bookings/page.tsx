import type { Metadata } from 'next';
import { BookingsPage } from '@/components/operations/bookings/BookingsPage';

export const metadata: Metadata = {
    title: 'Bookings — BD Travel Spirit',
    description: 'View and manage all tour bookings across your operations.',
};

export default function Page() {
    return <BookingsPage />;
}