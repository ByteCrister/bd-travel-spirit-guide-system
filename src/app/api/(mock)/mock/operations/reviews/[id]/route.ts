// app/api/mock/operations/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { seedIfNeeded, toDetailDTO, DEFAULT_TOTAL, makeReviewDetail } from "../_mockDB";

seedIfNeeded(DEFAULT_TOTAL);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const rev = makeReviewDetail({ _id: id });
    if (!rev) {
        return NextResponse.json({ success: false, error: { message: "Not found", status: 404 } }, { status: 404 });
    }

    return NextResponse.json({ data: toDetailDTO(rev) });
}
