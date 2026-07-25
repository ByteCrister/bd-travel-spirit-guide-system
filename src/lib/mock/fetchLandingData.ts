import { HERO_STAT } from "@/constants/landing-page.const";
import { HomePageDataTypes } from "@/types/landing-page.types";

import ConnectDB from "@/config/db";
import GuideModel from "@/models/guide/guide.model";
import EmployeeModel from "@/models/employees/employees.model";
import TourModel from "@/models/tours/tour.model";
import { ReviewModel } from "@/models/tours/review.model";
import SocialLinkSetting from "@/models/site-settings/socialLink.model";
import LocationSetting from "@/models/site-settings/location.model";

import { GUIDE_STATUS } from "@/constants/guide/guide.const";
import { EMPLOYEE_STATUS } from "@/constants/employee/employee.const";
import { TOUR_STATUS } from "@/constants/tour/tour.const";

export default async function fetchLandingData(): Promise<HomePageDataTypes> {
    try {
        await ConnectDB();

        const [
            registeredGuides,
            assistanceVerified,
            toursManaged,
            avgSatisfactionResult,
            citiesCoveredDistricts,
            socialLinksData,
            locationsData
        ] = await Promise.all([
            GuideModel.countDocuments({ status: GUIDE_STATUS.APPROVED, deletedAt: null }),
            EmployeeModel.countDocuments({ status: EMPLOYEE_STATUS.ACTIVE, deletedAt: null }),
            TourModel.countDocuments({ status: TOUR_STATUS.ACTIVE, deletedAt: null }),
            ReviewModel.aggregate([
                { $match: { isApproved: true, deletedAt: null } },
                { $group: { _id: null, avgRating: { $avg: "$rating" } } }
            ]),
            TourModel.distinct("district", { status: TOUR_STATUS.ACTIVE, deletedAt: null }),
            SocialLinkSetting.find({ active: true, deleteAt: null }).sort({ order: 1 }).lean(),
            LocationSetting.find({ active: true, deleteAt: null }).lean()
        ]);

        const avgSatisfaction = avgSatisfactionResult.length > 0 ? Number(avgSatisfactionResult[0].avgRating.toFixed(1)) : 4.8;
        const citiesCovered = citiesCoveredDistricts.length || 0;
        
        const socialLinks = socialLinksData.map(link => ({
            label: link.label,
            icon: link.icon,
            url: link.url,
            order: link.order
        }));

        const locations = locationsData.map(loc => ({
            country: loc.country,
            city: loc.city,
            region: loc.region
        }));
        
        // Mocking partners and vendors count as it doesn't have a direct model in the current scope
        const partnersAndVendors = 200;

        return {
            heroStats: [
                { label: HERO_STAT.REGISTERED_GUIDES, value: registeredGuides || 1200 },
                { label: HERO_STAT.ASSISTANCE_VERIFIED, value: assistanceVerified || 2800 },
                { label: HERO_STAT.TOURS_MANAGED, value: toursManaged || 8500 },
                { label: HERO_STAT.AVG_SATISFACTION, value: avgSatisfaction, suffix: "/5" },
                { label: HERO_STAT.CITIES_COVERED, value: citiesCovered || 60 },
                { label: HERO_STAT.PARTNERS_AND_VENDORS, value: partnersAndVendors },
            ],
            socialLinks,
            locations
        };
    } catch (error) {
        console.error("Error fetching landing data:", error);
        
        // Fallback to mock data in case of any database connection or query issues
        return {
            heroStats: [
                { label: HERO_STAT.REGISTERED_GUIDES, value: 1200 },
                { label: HERO_STAT.ASSISTANCE_VERIFIED, value: 2800 },
                { label: HERO_STAT.TOURS_MANAGED, value: 8500 },
                { label: HERO_STAT.AVG_SATISFACTION, value: 4.8, suffix: "/5" },
                { label: HERO_STAT.CITIES_COVERED, value: 60 },
                { label: HERO_STAT.PARTNERS_AND_VENDORS, value: 200 },
            ],
            socialLinks: [],
            locations: []
        };
    }
}