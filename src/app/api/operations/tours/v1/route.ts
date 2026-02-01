// app/api/operations/tours/v1/route.ts

import GetTourListHandler from "@/lib/handler/operations/tours/get.handler";
import TourPostHandler from "@/lib/handler/operations/tours/post.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET api/operations/tours/v1
 * Fetch paginated & filtered tours
 */
export const GET = withErrorHandler(GetTourListHandler);

/**
 * POST api/operations/tours/v1
 * Upload new Tour as Draft
 */
export const POST = withErrorHandler(TourPostHandler);