import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { FAQVoteRecord, FAQVotesApiResponse, TravelerInfo } from '@/types/tour/faqs.types';

function createTraveler(): TravelerInfo {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
        _id: faker.database.mongodbObjectId(),
        name: `${firstName} ${lastName}`,
        avatar: faker.image.avatar(),
        email: faker.internet.email({ firstName, lastName }),
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ faqId: string }> }
) {
    // Await the params Promise to get the actual object
    const { faqId } = await params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 100);
    const voteType = searchParams.get('type') as 'like' | 'dislike' | null;

    // Simulate a large number of votes (e.g., 85)
    const totalVotes = 85;
    let allVotes: FAQVoteRecord[] = Array.from({ length: totalVotes }, () => ({
        _id: faker.database.mongodbObjectId(),
        faqId: faqId, // Now using the awaited faqId
        userId: createTraveler(),
        type: faker.helpers.arrayElement(['like', 'dislike']),
        createdAt: faker.date.past().toISOString(),
    }));

    if (voteType) {
        allVotes = allVotes.filter((v) => v.type === voteType);
    }

    const total = allVotes.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedVotes = allVotes.slice(start, start + limit);

    const response: FAQVotesApiResponse = {
        success: true,
        data: {
            votes: paginatedVotes,
            pagination: { page, perPage: limit, total, totalPages },
        },
    };

    return NextResponse.json(response, { status: 200 });
}