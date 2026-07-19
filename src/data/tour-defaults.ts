import { AGE_SUITABILITY, AUDIENCE_TYPE, DIFFICULTY_LEVEL, DISTRICT, DIVISION, PAYMENT_METHOD, SEASON, TOUR_CATEGORIES, TOUR_DISCOUNT, TOUR_DISCOUNT_TYPE, TRANSPORT_MODE, TRAVEL_TYPE } from "@/constants/tour/tour.const";
import { CreateTourDTO } from "@/types/tour/tour.types";

export const GUIDE_DEFAULT: CreateTourDTO = {
    "title": "",
    "summary": "",
    "heroImage": undefined,
    "gallery": [],
    "seo": {
        "metaTitle": "",
        "metaDescription": ""
    },
    "tags": [],
    "tourType": TRAVEL_TYPE.CULTURE_HISTORY,
    "division": DIVISION.BARISHAL,
    "district": DISTRICT.BHOLA,
    "accommodationType": [],
    "guideIncluded": false,
    "transportIncluded": true,
    "emergencyContacts": {
        "policeNumber": "999",
        "ambulanceNumber": "16263",
        "fireServiceNumber": "102",
        "localEmergency": "01310235914"
    },
    "destinations": [],
    "itinerary": [],
    "inclusions": [],
    "exclusions": [],
    "difficulty": DIFFICULTY_LEVEL.EASY,
    "bestSeason": [SEASON.WINTER, SEASON.YEAR_ROUND],
    "audience": [AUDIENCE_TYPE.FAMILIES, AUDIENCE_TYPE.GROUPS, AUDIENCE_TYPE.BUSINESS, AUDIENCE_TYPE.SENIORS],
    "categories": [TOUR_CATEGORIES.CRUISE, TOUR_CATEGORIES.FOOD_DRINK, TOUR_CATEGORIES.CITY],
    "translations": {
        "bn": {
            "title": "",
            "summary": "",
            "description": ""
        },
        "en": {
            "title": "",
            "summary": "",
            "description": ""
        }
    },
    "mainLocation": {
        "address": {
            "line1": "414 মেইন রোড",
            "line2": "শান্ত এলাকা",
            "city": "Bhola",
            "district": "bhola",
            "region": "Barishal",
            "postalCode": "1747"
        },
        "coordinates": {
            "lat": 22.980167,
            "lng": 90.492074
        }
    },
    "transportModes": [TRANSPORT_MODE.TRAIN, TRANSPORT_MODE.RIDE_SHARE],
    "pickupOptions": [
        {
            "city": "Barishal",
            "price": 1712,
            "currency": "BDT"
        }
    ],
    "meetingPoint": "",
    "packingList": [],
    "basePrice": {
        "amount": 7386,
        "currency": "BDT"
    },
    "discounts": [
        {
            "type": TOUR_DISCOUNT_TYPE.PERCENTAGE,
            "discount": TOUR_DISCOUNT.PROMO,
            "value": 10,
            "code": "SAVE41",
            "validFrom": "2026-01-20",
            "validUntil": "2026-03-28"
        }
    ],
    "duration": {
        "days": 8,
        "nights": 7
    },
    "operatingWindow": {
        "startDate": "2026-02-01",
        "endDate": "2026-07-01"
    },
    "departure": undefined,
    "paymentMethods": [PAYMENT_METHOD.CARD],
    "licenseRequired": true,
    "ageSuitability": AGE_SUITABILITY.ALL,
    "accessibility": {
        "wheelchair": false,
        "familyFriendly": false,
        "petFriendly": false,
        "notes": "নির্দিষ্ট অ্যাক্সেসিবিলিটি প্রয়োজনের জন্য যোগাযোগ করুন"
    },
    "cancellationPolicy": {
        "refundable": true,
        "rules": [
            {
                "daysBefore": 7,
                "refundPercent": 100
            },
            {
                "daysBefore": 3,
                "refundPercent": 50
            },
            {
                "daysBefore": 0,
                "refundPercent": 0
            }
        ]
    },
    "refundPolicy": {
        "method": [PAYMENT_METHOD.CARD],
        "processingDays": 13
    },
    "terms": ""
};

export const GUIDE_DEFAULT_1: CreateTourDTO = {
    "title": "Historical & Cultural Tour in Bhola, Barishal",
    "summary": "Dive deep into Bangladesh's rich history and vibrant culture in the Barishal region.",
    "heroImage": undefined,
    "gallery": [],
    "seo": {
        "metaTitle": "Tour Package to Bhola - Experience Barishal",
        "metaDescription": "Book your 8-day tour to Bhola with local guides and authentic experiences in Barishal region."
    },
    "tags": ["bhola", "barishal", "culture_history", "8_days", "bdt", "nature"],
    "tourType": TRAVEL_TYPE.CULTURE_HISTORY,
    "division": DIVISION.BARISHAL,
    "district": DISTRICT.BHOLA,
    "accommodationType": ["cottage"],
    "guideIncluded": false,
    "transportIncluded": true,
    "emergencyContacts": {
        "policeNumber": "999",
        "ambulanceNumber": "16263",
        "fireServiceNumber": "102",
        "localEmergency": "01310235914"
    },
    "destinations": [
        {
            "description": "Bhola এর প্রধান আকর্ষণ ও গোপন রত্নগুলি অন্বেষণ করুন।",
            "highlights": [
                "ঐতিহাসিক স্থানগুলিতে গাইডেড ট্যুর",
                "স্থানীয় রন্ধনসম্পর্কীয় অভিজ্ঞতা",
                "প্রাকৃতিক হাঁটা পথ",
                "সাংস্কৃতিক পরিবেশনা"
            ],
            "attractions": [
                {
                    "title": "স্থানীয় বাজার",
                    "description": "এটি একটি দর্শনীয় স্থান যা বাংলাদেশের সৌন্দর্য ও সংস্কৃতিকে উপস্থাপন করে।",
                    "bestFor": "গ্রুপ",
                    "insiderTip": "সকালের দিকে যাওয়ার চেষ্টা করুন ভিড় এড়ানোর জন্য।",
                    "address": "প্রধান সড়ক, স্থানীয় এলাকা",
                    "openingHours": "সকাল ৯টা - সন্ধ্যা ৬টা",
                    "imageIds": [],
                    "coordinates": {
                        "lat": 24.914359,
                        "lng": 90.273882
                    }
                },
                {
                    "title": "ঐতিহাসিক স্থান",
                    "description": "এটি একটি দর্শনীয় স্থান যা বাংলাদেশের সৌন্দর্য ও সংস্কৃতিকে উপস্থাপন করে।",
                    "bestFor": "দম্পতি",
                    "insiderTip": "সকালের দিকে যাওয়ার চেষ্টা করুন ভিড় এড়ানোর জন্য।",
                    "address": "প্রধান সড়ক, স্থানীয় এলাকা",
                    "openingHours": "সকাল ৯টা - সন্ধ্যা ৬টা",
                    "imageIds": [],
                    "coordinates": {
                        "lat": 22.586546,
                        "lng": 89.535167
                    }
                },
                {
                    "title": "প্রাকৃতিক দৃশ্য",
                    "description": "এটি একটি দর্শনীয় স্থান যা বাংলাদেশের সৌন্দর্য ও সংস্কৃতিকে উপস্থাপন করে।",
                    "bestFor": "পরিবার",
                    "insiderTip": "সকালের দিকে যাওয়ার চেষ্টা করুন ভিড় এড়ানোর জন্য।",
                    "address": "প্রধান সড়ক, স্থানীয় এলাকা",
                    "openingHours": "সকাল ৯টা - সন্ধ্যা ৬টা",
                    "imageIds": [],
                    "coordinates": {
                        "lat": 24.330516,
                        "lng": 88.351695
                    }
                }
            ],
            "activities": [
                {
                    "title": "স্থানীয় বাজার ঘুরে দেখা",
                    "url": "https://example.com/activity",
                    "provider": "প্রিমিয়াম ট্যুর সার্ভিসেস",
                    "duration": "3 ঘণ্টা",
                    "price": {
                        "amount": 2168,
                        "currency": "BDT"
                    },
                    "rating": 4.7
                },
                {
                    "title": "প্রাকৃতিক সৌন্দর্য উপভোগ",
                    "url": "https://example.com/activity",
                    "provider": "প্রিমিয়াম ট্যুর সার্ভিসেস",
                    "duration": "1 ঘণ্টা",
                    "price": {
                        "amount": 1640,
                        "currency": "BDT"
                    },
                    "rating": 4.7
                },
                {
                    "title": "স্থানীয় সংস্কৃতি অভিজ্ঞতা",
                    "url": "https://example.com/activity",
                    "provider": "স্থানীয় ট্যুর সার্ভিসেস",
                    "duration": "4 ঘণ্টা",
                    "price": {
                        "amount": 2461,
                        "currency": "BDT"
                    },
                    "rating": 4.6
                }
            ],
            "imageIds": [],
            "coordinates": {
                "lat": 24.523852,
                "lng": 90.466178
            }
        }
    ],
    "itinerary": [
        {
            "day": 1,
            "title": "দিন 1: আগমন ও অভিযোজন",
            "description": "দিন 1 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Lunch", "Dinner"],
            "accommodation": "ডিলাক্স হোটেল",
            "activities": ["হোটেল চেক-ইন", "স্থানীয় এলাকার পরিচিতি", "বিকেলের বিশ্রাম"],
            "travelDistance": "103 কিমি",
            "travelMode": "train",
            "estimatedTime": "6 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        },
        {
            "day": 2,
            "title": "দিন 2: অঞ্চল অন্বেষণ",
            "description": "দিন 2 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Dinner", "Breakfast"],
            "accommodation": "ডিলাক্স হোটেল",
            "activities": [
                "স্থানীয় রেস্তোরাঁয়ে মধ্যাহ্নভোজ",
                "সাংস্কৃতিক কার্যকলাপ অধিবেশন",
                "সকালের দর্শনীয় স্থান ভ্রমণ"
            ],
            "travelDistance": "194 কিমি",
            "travelMode": "ride_share",
            "estimatedTime": "6 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        },
        {
            "day": 3,
            "title": "দিন 3: অঞ্চল অন্বেষণ",
            "description": "দিন 3 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Dinner", "Lunch", "Breakfast"],
            "accommodation": "স্ট্যান্ডার্ড হোটেল",
            "activities": [
                "বিকেলের অবসর সময়",
                "সকালের দর্শনীয় স্থান ভ্রমণ",
                "সাংস্কৃতিক কার্যকলাপ অধিবেশন",
                "স্থানীয় রেস্তোরাঁয়ে মধ্যাহ্নভোজ"
            ],
            "travelDistance": "82 কিমি",
            "travelMode": "private_car",
            "estimatedTime": "5 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        },
        {
            "day": 4,
            "title": "দিন 4: অঞ্চল অন্বেষণ",
            "description": "দিন 4 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Lunch"],
            "accommodation": "স্ট্যান্ডার্ড হোটেল",
            "activities": [
                "সাংস্কৃতিক কার্যকলাপ অধিবেশন",
                "বিকেলের অবসর সময়",
                "স্থানীয় রেস্তোরাঁয়ে মধ্যাহ্নভোজ"
            ],
            "travelDistance": "77 কিমি",
            "travelMode": "private_car",
            "estimatedTime": "7 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        },
        {
            "day": 5,
            "title": "দিন 5: অঞ্চল অন্বেষণ",
            "description": "দিন 5 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Breakfast", "Lunch"],
            "accommodation": "স্ট্যান্ডার্ড হোটেল",
            "activities": [
                "স্থানীয় রেস্তোরাঁয়ে মধ্যাহ্নভোজ",
                "সকালের দর্শনীয় স্থান ভ্রমণ",
                "বিকেলের অবসর সময়"
            ],
            "travelDistance": "163 কিমি",
            "travelMode": "bus",
            "estimatedTime": "7 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        },
        {
            "day": 6,
            "title": "দিন 6: অঞ্চল অন্বেষণ",
            "description": "দিন 6 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Breakfast", "Dinner"],
            "accommodation": "স্ট্যান্ডার্ড হোটেল",
            "activities": [
                "সাংস্কৃতিক কার্যকলাপ অধিবেশন",
                "সকালের দর্শনীয় স্থান ভ্রমণ",
                "স্থানীয় রেস্তোরাঁয়ে মধ্যাহ্নভোজ"
            ],
            "travelDistance": "124 কিমি",
            "travelMode": "boat",
            "estimatedTime": "4 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        },
        {
            "day": 7,
            "title": "দিন 7: অঞ্চল অন্বেষণ",
            "description": "দিন 7 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Dinner", "Breakfast", "Lunch"],
            "accommodation": "স্ট্যান্ডার্ড হোটেল",
            "activities": [
                "সাংস্কৃতিক কার্যকলাপ অধিবেশন",
                "বিকেলের অবসর সময়",
                "স্থানীয় রেস্তোরাঁয়ে মধ্যাহ্নভোজ",
                "সকালের দর্শনীয় স্থান ভ্রমণ"
            ],
            "travelDistance": "53 কিমি",
            "travelMode": "train",
            "estimatedTime": "5 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        },
        {
            "day": 8,
            "title": "দিন 8: বিদায় ও প্রত্যাবর্তন",
            "description": "দিন 8 স্থানীয় আকর্ষণ ও সাংস্কৃতিক অভিজ্ঞতায় পূর্ণ।",
            "mealsProvided": ["Dinner", "Lunch", "Breakfast"],
            "accommodation": "ডিলাক্স হোটেল",
            "activities": ["সকালের নাস্তা", "চেক-আউট", "বাড়ির পথে যাত্রা"],
            "travelDistance": "175 কিমি",
            "travelMode": "domestic_flight",
            "estimatedTime": "8 ঘণ্টা",
            "importantNotes": [
                "আরামদায়ক হাঁটার জুতা সুপারিশ করা হয়",
                "ফটোগ্রাফির জন্য ক্যামেরা আনুন"
            ]
        }
    ],
    "inclusions": [
        {
            "label": "পরিবহন",
            "description": "সমস্ত অভ্যন্তরীণ পরিবহন"
        },
        {
            "label": "কার্যকলাপ",
            "description": "সমস্ত নির্ধারিত কার্যকলাপ"
        },
        {
            "label": "গাইড সার্ভিস",
            "description": "পেশাদার ট্যুর গাইড"
        },
        {
            "label": "প্রবেশ ফি",
            "description": "সমস্ত স্মৃতিস্তম্ভ ও উদ্যান প্রবেশ ফি"
        },
        {
            "label": "আবাসন",
            "description": "সমস্ত রাতের জন্য হোটেল থাকা"
        },
        {
            "label": "খাবার",
            "description": "ইটিনারি অনুযায়ী নির্দিষ্ট"
        }
    ],
    "exclusions": [
        {
            "label": "ঐচ্ছিক কার্যকলাপ",
            "description": "ইটিনারিতে উল্লিখিত নয়"
        },
        {
            "label": "ভ্রমণ বীমা",
            "description": "চিকিৎসা ও ট্রিপ বাতিলকরণ"
        }
    ],
    "difficulty": DIFFICULTY_LEVEL.EASY,
    "bestSeason": [SEASON.WINTER, SEASON.YEAR_ROUND],
    "audience": [AUDIENCE_TYPE.FAMILIES, AUDIENCE_TYPE.GROUPS, AUDIENCE_TYPE.BUSINESS, AUDIENCE_TYPE.SENIORS],
    "categories": [TOUR_CATEGORIES.CRUISE, TOUR_CATEGORIES.FOOD_DRINK, TOUR_CATEGORIES.CITY],
    "translations": {
        "bn": {
            "title": "বাংলাদেশের অদেখা রূপ - 10",
            "summary": "বাংলাদেশের হৃদয় স্পর্শ করে এমন স্মরণীয় ভ্রমণ",
            "description": "স্থানীয় সম্প্রদায়ের সাথে যোগাযোগ করুন, তাদের জীবনযাত্রা দেখুন এবং বাংলাদেশের প্রকৃত সৌন্দর্য আবিষ্কার করুন।"
        },
        "en": {
            "title": "Tour 1: Exploring Bhola",
            "summary": "Discover the beauty and culture of Bhola",
            "description": "A comprehensive tour package to Bhola in Barishal region."
        }
    },
    "mainLocation": {
        "address": {
            "line1": "414 মেইন রোড",
            "line2": "শান্ত এলাকা",
            "city": "Bhola",
            "district": "bhola",
            "region": "Barishal",
            "postalCode": "1747"
        },
        "coordinates": {
            "lat": 22.980167,
            "lng": 90.492074
        }
    },
    "transportModes": [TRANSPORT_MODE.TRAIN, TRANSPORT_MODE.RIDE_SHARE],
    "pickupOptions": [
        {
            "city": "Barishal",
            "price": 1712,
            "currency": "BDT"
        }
    ],
    "meetingPoint": "প্রধান হোটেল লবি বা বিমানবন্দর আগমন গেট",
    "packingList": [
        {
            "item": "পাসপোর্ট ও নথিপত্র",
            "required": true,
            "notes": "হাতের লাগেজে রাখুন"
        },
        {
            "item": "আরামদায়ক জুতা",
            "required": true,
            "notes": "হাঁটার ট্যুরের জন্য"
        },
        {
            "item": "রেইন জ্যাকেট",
            "required": true,
            "notes": "বর্ষা মৌসুমে"
        },
        {
            "item": "ক্যামেরা",
            "required": false,
            "notes": "ফটোগ্রাফির জন্য ঐচ্ছিক"
        }
    ],
    "basePrice": {
        "amount": 7386,
        "currency": "BDT"
    },
    "discounts": [
        {
            "type": TOUR_DISCOUNT_TYPE.PERCENTAGE,
            "discount": TOUR_DISCOUNT.PROMO,
            "value": 10,
            "code": "SAVE41",
            "validFrom": "2026-01-20",
            "validUntil": "2026-03-28"
        }
    ],
    "duration": {
        "days": 8,
        "nights": 7
    },
    "operatingWindow": {
        "startDate": "2026-02-01",
        "endDate": "2026-07-01"
    },
    "departure": {
        "date": "2026-03-12",
        "seatsTotal": 15,
        "meetingPoint": "প্রধান হোটেল লবি",
        "meetingCoordinates": {
            "lat": 23.761981,
            "lng": 90.304162
        }
    },
    "paymentMethods": [PAYMENT_METHOD.CARD],
    "licenseRequired": true,
    "ageSuitability": AGE_SUITABILITY.ALL,
    "accessibility": {
        "wheelchair": false,
        "familyFriendly": false,
        "petFriendly": false,
        "notes": "নির্দিষ্ট অ্যাক্সেসিবিলিটি প্রয়োজনের জন্য যোগাযোগ করুন"
    },
    "cancellationPolicy": {
        "refundable": true,
        "rules": [
            {
                "daysBefore": 7,
                "refundPercent": 100
            },
            {
                "daysBefore": 3,
                "refundPercent": 50
            },
            {
                "daysBefore": 0,
                "refundPercent": 0
            }
        ]
    },
    "refundPolicy": {
        "method": [PAYMENT_METHOD.CARD],
        "processingDays": 13
    },
    "terms": "এই ট্যুর বুকিংয়ের মাধ্যমে, আপনি আমাদের শর্তাবলী ও শর্তাদি মেনে নেন। সব মূল্য নির্দিষ্ট না হলে কর সহ।"
};