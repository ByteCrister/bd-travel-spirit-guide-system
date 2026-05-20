// app/mock/support/tour-faq/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { FAQ, TourInfo, TravelerInfo, FAQVoteEntry, AllFAQsApiResponse, FAQListApiResponse } from '@/types/tour/faqs.types';

// ------------------------------------------------------------------
//  Helper: generate a random TourInfo
// ------------------------------------------------------------------
function createTour(): TourInfo {
  return {
    _id: faker.database.mongodbObjectId(),
    title: faker.lorem.words({ min: 2, max: 5 }),
    slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
  };
}

// ------------------------------------------------------------------
//  Helper: generate a TravelerInfo
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
//  Helper: generate a single FAQVoteEntry
// ------------------------------------------------------------------
function createVoteEntry(): FAQVoteEntry {
  return {
    _id: faker.database.mongodbObjectId(),
    user: Math.random() > 0.5 ? createTraveler() : faker.database.mongodbObjectId(),
    createdAt: faker.date.past().toISOString(),
  };
}

// ------------------------------------------------------------------
//  Helper: build a full FAQ object
// ------------------------------------------------------------------
function createFAQ(index: number): FAQ {
  const hasAnswer = faker.datatype.boolean(0.7);
  const status = hasAnswer
    ? faker.helpers.arrayElement(['approved', 'pending'] as const)
    : 'pending';
  const isActive = faker.datatype.boolean(0.8);
  const likeCount = faker.number.int({ min: 0, max: 200 });
  const dislikeCount = faker.number.int({ min: 0, max: 50 });
  const likes = Array.from({ length: likeCount }, createVoteEntry);
  const dislikes = Array.from({ length: dislikeCount }, createVoteEntry);
  const userVoteOptions: FAQ['userVote'][] = ['like', 'dislike', null];
  const userVote = faker.helpers.arrayElement(userVoteOptions);

  return {
    _id: faker.database.mongodbObjectId(),
    tour: faker.helpers.arrayElement([faker.database.mongodbObjectId(), createTour()]),
    question: faker.lorem.sentence({ min: 6, max: 15 }) + '?',
    answer: hasAnswer ? faker.lorem.paragraph() : undefined,
    status,
    isActive,
    order: index + 1, // sequential order for demonstration
    askedBy: createTraveler(),
    answeredBy: hasAnswer ? createTraveler() : undefined,
    likes,
    dislikes,
    reports: [],
    likeCount,
    dislikeCount,
    isAnswered: hasAnswer,
    userVote,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
}

// ------------------------------------------------------------------
//  GET /mock/support/tour-faq
// ------------------------------------------------------------------
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
  
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 100);
    const search = searchParams.get('search')?.toLowerCase() ?? '';
    const tourId = searchParams.get('tourId') ?? '';
    const status = searchParams.get('status') as FAQ['status'] | null;
  
    // Generate a fixed pool of FAQs so filtering feels consistent
    const totalFAQs = 50;
    const allFaqs: FAQ[] = Array.from({ length: totalFAQs }, (_, i) => createFAQ(i));
  
    // Apply filters
    let filtered = allFaqs;
    if (search) {
      filtered = filtered.filter(
        (f) =>
          f.question.toLowerCase().includes(search) ||
          (f.answer && f.answer.toLowerCase().includes(search))
      );
    }
    if (tourId) {
      filtered = filtered.filter((f) => {
        if (typeof f.tour === 'object') return f.tour._id === tourId;
        return f.tour === tourId;
      });
    }
    if (status) {
      filtered = filtered.filter((f) => f.status === status);
    }
  
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedFAQs = filtered.slice(start, start + limit);
  
    const responseBody: FAQListApiResponse = {
      success: true,
      data: {
        faqs: paginatedFAQs,
        pagination: {
          page,
          perPage: limit,
          total,
          totalPages,
        },
      },
    };
  
    return NextResponse.json(responseBody, { status: 200 });
  }