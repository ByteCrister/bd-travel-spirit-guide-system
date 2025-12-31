// types/tour.const.ts

/**
 * Target audience classification for tour packages
 * Used for marketing segmentation and tour recommendations
 */
export enum AUDIENCE_TYPE {
  /** Romantic getaways and honeymoon packages */
  COUPLES = "couples",
  /** Family-friendly tours with kid-appropriate activities */
  FAMILIES = "families",
  /** Independent travelers and solo adventure packages */
  SOLO = "solo",
  /** Tours designed for older travelers with comfort-focused amenities */
  SENIORS = "seniors",
  /** Group bookings and packages for travel parties */
  GROUPS = "groups",
  /** Corporate travel and business-focused itineraries */
  BUSINESS = "business",
  /** Thrill-seeking experiences and extreme activities */
  ADVENTURE = "adventure",
}
export type AudienceType = `${AUDIENCE_TYPE}`;

/**
 * Publishing status of the tour
 */
export enum TOUR_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
  COMPLETED = "completed",
  PENDING_REAPPROVAL = "pending_reapproval",
}
export type TourStatus = `${TOUR_STATUS}`;

/**
 * Content moderation workflow statuses
 * Tracks approval lifecycle for user-generated content
 */
export enum MODERATION_STATUS {
  /** Awaiting administrator review */
  PENDING = "pending",
  /** Content approved for public viewing */
  APPROVED = "approved",
  /** Content rejected for policy violations */
  REJECTED = "rejected",

  SUSPENDED = "suspended",

  TERMINATED = "terminated",

}
export type ModerationStatus = `${MODERATION_STATUS}`;

/**
 * Types of travelers this tour is suited for
 */
export enum TRAVEL_TYPE {
  COUPLES = "Couples",
  GROUP_OF_FRIENDS = "Group of friends",
  SOLO = "Solo",
  FAMILIES = "Families",
  BUSINESS = "Business",
  ADVENTURE_SEEKERS = "Adventure Seekers",
  DESTINATION_GUIDE = "destination_guide",
  BEACHES = "beaches",
  FOOD_DRINK = "food_drink",
  CULTURE_HISTORY = "culture_history",
}
export type TravelType = `${TRAVEL_TYPE}`;

/**
 * Primary content categories for tour classification
 * Determines tour discovery in category-based browsing
 */
export enum CONTENT_CATEGORY {
  /** Coastal and beach destination tours */
  BEACHES = "beaches",
  /** Historical sites, museums, and cultural experiences */
  CULTURE_HISTORY = "culture_history",
  /** Culinary tours, food tasting, and beverage experiences */
  FOOD_DRINK = "food_drink",
  /** Outdoor activities in natural environments */
  NATURE = "nature",
  /** Wildlife safaris and animal watching experiences */
  WILDLIFE = "wildlife",
  /** Urban exploration and metropolitan tours */
  CITY = "city",
  /** Spiritual and pilgrimage destinations */
  RELIGIOUS = "religious",
  /** UNESCO sites and heritage location tours */
  HERITAGE = "heritage",
  /** Cruise-based travel packages */
  CRUISE = "cruise",
}
export type ContentCategory = `${CONTENT_CATEGORY}`;

/**
 * Physical challenge level ratings for tours
 * Helps travelers assess fitness requirements
 */
export enum DIFFICULTY_LEVEL {
  /** Minimal physical effort required */
  EASY = "easy",
  /** Moderate activity level, average fitness recommended */
  MODERATE = "moderate",
  /** High physical demands, good fitness required */
  CHALLENGING = "challenging",
}
export type DifficultyLevel = `${DIFFICULTY_LEVEL}`;

/**
 * Seasonal classifications for tour operations
 * Determines optimal travel times and availability
 */
export enum SEASON {
  /** Hot and dry season (typically March-June) */
  SUMMER = "summer",
  /** Cool and dry season (typically November-February) */
  WINTER = "winter",
  /** Rainy season (typically June-October) */
  MONSOON = "monsoon",
  /** Suitable for travel throughout the year */
  YEAR_ROUND = "year_round",
}
export type Season = `${SEASON}`;

/**
 * Available transportation modes for tour itineraries
 * Defines primary travel methods between locations
 */
export enum TRANSPORT_MODE {
  /** Coach or public bus transportation */
  BUS = "bus",
  /** Railway travel */
  TRAIN = "train",
  /** Domestic air travel */
  DOMESTIC_FLIGHT = "domestic_flight",
  /** Water transport including ferries and boats */
  BOAT = "boat",
  /** Private car or taxi service */
  PRIVATE_CAR = "private_car",
  /** Ride-sharing services */
  RIDE_SHARE = "ride_share",
}
export type TransportMode = `${TRANSPORT_MODE}`;

/**
 * Accepted payment methods for booking transactions
 * Integrated with payment gateway configurations
 */
export enum PAYMENT_METHOD {
  /** Bangladeshi mobile payment service */
  BKASH = "bkash",
  /** Bangladeshi mobile financial service */
  NAGAD = "nagad",
  /** Credit/Debit card payments */
  CARD = "card",
  /** International online payment processor */
  STRIPE = "stripe",
  /** Cash on delivery or in-person payment */
  CASH = "cash",
  /** Direct bank wire transfer */
  BANK_TRANSFER = "bank_transfer",
}
export type PaymentMethod = `${PAYMENT_METHOD}`;

/**
 * Supported currency codes for pricing
 * ISO 4217 currency codes for financial transactions
 */
export enum CURRENCY {
  /** Bangladeshi Taka - Local currency */
  BDT = "BDT",
  /** United States Dollar - International currency */
  USD = "USD",
  /** Indian Rupee - Regional currency */
  INR = "INR",
}
export type Currency = `${CURRENCY}`;

/**
 * Discount types applicable to tour bookings
 * Defines promotional pricing strategies
 */
export enum TOUR_DISCOUNT {
  /** Seasonal promotions (off-season rates) */
  SEASONAL = "seasonal",
  /** Advance booking discounts */
  EARLY_BIRD = "early_bird",
  /** Volume-based group discounts */
  GROUP = "group",
  /** Promotional or coupon-based discounts */
  PROMO = "promo",
}
export type TourDiscount = `${TOUR_DISCOUNT}`;

/**
 * Content type classification for translation blocks
 * Determines rendering behavior in multilingual interfaces
 */
export enum TRANSLATION_CONTENT {
  /** Standard paragraph text blocks */
  PARAGRAPH = "paragraph",
  /** Section headings and titles */
  HEADING = "heading",
  /** Hyperlinks and navigation elements */
  LINK = "link"
}
export type TranslationContent = `${TRANSLATION_CONTENT}`;

/**
 * Age-based suitability classifications
 * Guides age-appropriate tour recommendations
 */
export enum AGE_SUITABILITY {
  /** Suitable for all age groups */
  ALL = "all",
  /** Specifically designed for children */
  KIDS = "kids",
  /** Adult-only tours and experiences */
  ADULTS = "adults",
  /** Optimized for senior travelers */
  SENIORS = "seniors",
}
export type AgeSuitability = `${AGE_SUITABILITY}`;

export enum MEALS_PROVIDED {
  BREAKFAST = "Breakfast",
  LUNCH = "Lunch",
  DINNER = "Dinner",
}
export type MealsProvided = `${MEALS_PROVIDED}`;

export enum WATER_SAFETY {
  DRINKABLE = "drinkable",
  BOIL_FIRST = "boil_first",
  BOTTLED_ONLY = "bottled_only",
}

export type WaterSafety = `${WATER_SAFETY}`;

export enum ACCOMMODATION_TYPE {
  HOTEL = "hotel",
  RESORT = "resort",
  HOMESTAY = "homestay",
  GUEST_HOUSE = "guest_house",
  COTTAGE = "cottage",
  CAMPING = "camping"
}

export type AccommodationType = `${ACCOMMODATION_TYPE}`;

// ! laiter these enums will be filled on enums model and use on the required fileds
// Add these to constants/tour.const.ts:
export enum DIVISION {
  DHAKA = "dhaka",
  CHATTOGRAM = "chattogram",
  RAJSHAHI = "rajshahi",
  KHULNA = "khulna",
  BARISHAL = "barishal",
  SYLHET = "sylhet",
  RANGPUR = "rangpur",
  MYMENSINGH = "mymensingh"
}
export type Division = `${DIVISION}`;


export enum DISTRICT {
  // Add common tour districts
  COX_BAZAR = "cox_bazar",
  SAINT_MARTIN = "saint_martin",
  BANDARBAN = "bandarban",
  RANGAMATI = "rangamati",
  SUNAMGANJ = "sunamganj",
  SYLHET_DISTRICT = "sylhet"
}
export type District = `${DISTRICT}`;
