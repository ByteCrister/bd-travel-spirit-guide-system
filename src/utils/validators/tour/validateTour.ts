import * as Yup from "yup";
import { TourDetailDTO } from "@/types/tour.types";
import {
  Step0BasicInfoSchema,
  Step1BangladeshSchema,
  Step2ContentSchema,
  Step3LogisticsSchema,
  Step4PricingSchema,
  Step5ComplianceSchema,
  Step6PolicySchema,
} from "./add-tour.validator";

export interface ValidationError {
  step: number;
  field?: string;
  message: string;
}

// Define step names for error messages
const stepNames = [
  "Basic Information",
  "Bangladesh Information",
  "Content & Itinerary",
  "Logistics",
  "Pricing & Commerce",
  "Compliance",
  "Policies",
];

// Create an array of schemas
const schemas = [
  Step0BasicInfoSchema,
  Step1BangladeshSchema,
  Step2ContentSchema,
  Step3LogisticsSchema,
  Step4PricingSchema,
  Step5ComplianceSchema,
  Step6PolicySchema,
];

// Helper function to extract relevant data for each schema
const getDataForSchema = (tourData: TourDetailDTO, stepIndex: number) => {
  switch (stepIndex) {
    case 0:
      return {
        title: tourData.title,
        summary: tourData.summary,
        heroImage: tourData.heroImage,
        gallery: tourData.gallery,
        seo: tourData.seo,
        tags: tourData.tags,
      };
    case 1:
      return {
        tourType: tourData.tourType,
        division: tourData.division,
        district: tourData.district,
        accommodationType: tourData.accommodationType,
        guideIncluded: tourData.guideIncluded,
        transportIncluded: tourData.transportIncluded,
        emergencyContacts: tourData.emergencyContacts,
      };
    case 2:
      return {
        destinations: tourData.destinations,
        itinerary: tourData.itinerary,
        inclusions: tourData.inclusions,
        exclusions: tourData.exclusions,
        difficulty: tourData.difficulty,
        bestSeason: tourData.bestSeason,
        audience: tourData.audience,
        categories: tourData.categories,
        translations: tourData.translations,
      };
    case 3:
      return {
        mainLocation: tourData.mainLocation,
        transportModes: tourData.transportModes,
        pickupOptions: tourData.pickupOptions,
        meetingPoint: tourData.meetingPoint,
        packingList: tourData.packingList,
      };
    case 4:
      return {
        basePrice: tourData.basePrice,
        discounts: tourData.discounts,
        duration: tourData.duration,
        operatingWindows: tourData.operatingWindows,
        departures: tourData.departures,
        paymentMethods: tourData.paymentMethods,
      };
    case 5:
      return {
        licenseRequired: tourData.licenseRequired,
        ageSuitability: tourData.ageSuitability,
        accessibility: tourData.accessibility,
      };
    case 6:
      return {
        cancellationPolicy: tourData.cancellationPolicy,
        refundPolicy: tourData.refundPolicy,
        terms: tourData.terms,
      };
    default:
      return {};
  }
};

export async function validateTourDataStepByStep(
  tourData: TourDetailDTO
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  for (let i = 0; i < schemas.length; i++) {
    try {
      // Get only the relevant data for this schema
      const dataForSchema = getDataForSchema(tourData, i);
      
      // Validate with the specific schema
      await schemas[i].validate(dataForSchema, { abortEarly: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((yupError) => {
          errors.push({
            step: i,
            field: yupError.path,
            message: `${stepNames[i]}: ${yupError.message}`,
          });
        });
      }
    }
  }

  return errors;
}

// Helper to format validation errors for display
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";

  const stepGroups: Record<number, string[]> = {};
  
  errors.forEach((error) => {
    if (!stepGroups[error.step]) {
      stepGroups[error.step] = [];
    }
    
    // Remove the step name prefix from the message if present
    const message = error.message.replace(`${stepNames[error.step]}: `, "");
    stepGroups[error.step].push(message);
  });

  const messages: string[] = [];
  
  Object.entries(stepGroups).forEach(([step, stepErrors]) => {
    const stepNum = parseInt(step);
    const stepName = stepNum >= 0 && stepNum < stepNames.length 
      ? stepNames[stepNum] 
      : `Step ${stepNum + 1}`;
    
    messages.push(`\n${stepName}:`);
    stepErrors.forEach((err, index) => {
      messages.push(`  ${index + 1}. ${err}`);
    });
  });

  return messages.join('\n');
}

// Alternative: Validate specific steps
export async function validateSpecificStep(
  tourData: TourDetailDTO,
  stepIndex: number
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  try {
    const dataForSchema = getDataForSchema(tourData, stepIndex);
    await schemas[stepIndex].validate(dataForSchema, { abortEarly: false });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      error.inner.forEach((yupError) => {
        errors.push({
          step: stepIndex,
          field: yupError.path,
          message: yupError.message,
        });
      });
    }
  }

  return errors;
}