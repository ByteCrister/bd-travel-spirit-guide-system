// app/api/mock/operations/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  DB,
  seedIfNeeded,
  applyFilters,
  applySort,
  toListDTO,
  DEFAULT_TOTAL,
} from "./_mockDB";
import type { Paginated, ReviewFilters, ReviewSortField, SortDirection, ReviewListItemDTO } from "@/types/reviews.types";

seedIfNeeded(DEFAULT_TOTAL);

function paginateArray<T>(arr: T[], page = 1, limit = 10): Paginated<T> {
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const p = Math.max(1, Math.min(page, pages));
  const start = (p - 1) * limit;
  const docs = arr.slice(start, start + limit);
  return { docs, total, page: p, pages };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const offset = params.offset ? Number(params.offset) : undefined;
  const limit = params.limit ? Math.max(1, Math.min(200, Number(params.limit) || 10)) : 10;
  const page = params.page ? Math.max(1, Number(params.page) || 1) : undefined;
  const sortField = params.sortField as ReviewSortField | undefined;
  const sortDir = params.sortDir as SortDirection | undefined;

  // Build filter object
  const filters: ReviewFilters = {
    query: params.q,
    queryField: params.qField as ReviewFilters["queryField"],
    tourId: params.tourId,
    userId: params.userId,
    ratingMin: params.ratingMin ? Number(params.ratingMin) : undefined,
    ratingMax: params.ratingMax ? Number(params.ratingMax) : undefined,
    isVerified: params.isVerified ? params.isVerified === "true" : undefined,
    isApproved: params.isApproved ? params.isApproved === "true" : undefined,
    hasImages: params.hasImages ? params.hasImages === "true" : undefined,
    tripType: params.tripType as ReviewFilters["tripType"],
    dateFrom: params.dateFrom ?? undefined,
    dateTo: params.dateTo ?? undefined,
    includeDeleted: params.includeDeleted ? params.includeDeleted === "true" : undefined,
    companyId: params.companyId,
  };

  // Base list clone
  let list = DB.reviews.slice();

  // Apply includeDeleted default
  if (!filters.includeDeleted) list = list.filter(r => !r.deletedAt);

  list = applyFilters(list, filters);
  list = applySort(list, sortField, sortDir);

  if (offset !== undefined) {
    const start = Math.max(0, offset);
    const docs = list.slice(start, start + limit).map(toListDTO);
    const total = list.length;
    const pageFromOffset = Math.floor(start / limit) + 1;
    const pages = Math.max(1, Math.ceil(total / limit));
    const paginated: Paginated<ReviewListItemDTO> = { docs, total, page: pageFromOffset, pages };
    return NextResponse.json({ data: paginated });
  }

  const p = page ?? 1;
  const pag = paginateArray(list.map(toListDTO), p, limit);
  return NextResponse.json({ data: pag });
}
