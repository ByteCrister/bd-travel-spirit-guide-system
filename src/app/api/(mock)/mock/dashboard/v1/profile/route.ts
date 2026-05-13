import { NextResponse } from 'next/server';
import { getProfileMock } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

export async function GET() {
    try {
        return NextResponse.json({
            data: getProfileMock(),
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
