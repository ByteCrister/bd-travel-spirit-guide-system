import ConnectDB from '@/config/db';
import TourModel from '@/models/tours/tour.model';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await ConnectDB();

    // Fetch all tours using lean to bypass strict schema constraints
    // this allows us to read legacy fields like 'departures'
    const tours = await TourModel.find({}).lean();
    let migratedCount = 0;

    for (const doc of tours) {
      let needsUpdate = false;
      const updateQuery: any = { $set: {}, $unset: {} };

      const legacyDoc = doc as any;

      // 1. Move first departure to 'departure' object
      if (legacyDoc.departures && Array.isArray(legacyDoc.departures)) {
        if (legacyDoc.departures.length > 0) {
          updateQuery.$set.departure = legacyDoc.departures[0];
        }
        updateQuery.$unset.departures = 1;
        needsUpdate = true;
      }

      // 2. Move first operating window to 'operatingWindow' object
      if (legacyDoc.operatingWindows && Array.isArray(legacyDoc.operatingWindows)) {
        if (legacyDoc.operatingWindows.length > 0) {
          const firstWindow = legacyDoc.operatingWindows[0];
          const { seatsTotal, seatsBooked, ...rest } = firstWindow;
          updateQuery.$set.operatingWindow = rest;
        }
        updateQuery.$unset.operatingWindows = 1;
        needsUpdate = true;
      }

      if (needsUpdate) {
        if (Object.keys(updateQuery.$set).length === 0) delete updateQuery.$set;
        if (Object.keys(updateQuery.$unset).length === 0) delete updateQuery.$unset;

        await TourModel.collection.updateOne(
          { _id: doc._id },
          updateQuery
        );
        migratedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedCount} tours.`,
      migratedCount
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
