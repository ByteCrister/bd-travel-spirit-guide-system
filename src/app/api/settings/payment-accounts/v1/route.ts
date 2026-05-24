// api/site-settings/payment-accounts/v1/route.ts

import GetPaymentAccountsHandler from "@/lib/handler/settings/payment-accounts/get.handler";
import PostPaymentAccountHandler from "@/lib/handler/settings/payment-accounts/post.handler";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

export const GET = withErrorHandler(GetPaymentAccountsHandler);

export const POST = withErrorHandler(PostPaymentAccountHandler);
