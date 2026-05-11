'use client';

import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

import {
  UpdateTourLogisticsDTO,
  PackingListItemDTO,
} from '@/types/tour/tour.types';
import { TRANSPORT_MODE, CURRENCY, TransportMode, Currency } from '@/constants/tour/tour.const';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { Step3LogisticsSchema } from '@/utils/validators/tour/add-tour.validator';
import { getSortedDistricts, getDisplayName } from '@/utils/helpers/conversions.tour';

// Shadcn Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ComboBox } from '@/components/ui/combobox';
import {
  AlertCircle,
  Plus,
  Trash2,
  MapPin,
  Truck,
  Package,
  Users,
  Loader2,
  Check,
  X
} from 'lucide-react';

interface Step3LogisticsProps {
  tourId: string;
  initialData: UpdateTourLogisticsDTO;
  onUpdateSuccess?: () => void;
}

// Type-safe error getter function
type FormikTouched<T> = {
  [K in keyof T]?: T[K] extends object ? FormikTouched<T[K]> : boolean;
};

type FormikErrors<T> = {
  [K in keyof T]?: T[K] extends object ? FormikErrors<T[K]> : string;
};


export default function Step3Logistics({
  tourId,
  initialData,
  onUpdateSuccess
}: Step3LogisticsProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // District options for combobox
  const districtOptions = useMemo(() => {
    const sortedDistricts = getSortedDistricts();
    return sortedDistricts.map((district) => ({
      label: getDisplayName(district),
      value: district,
    }));
  }, []);

  // Type-safe helper to get nested value from object
  const getNestedValue = <T extends object>(
    obj: T | undefined,
    path: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    if (!obj) return undefined;

    const keys = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  };

  // Type-safe helper to check if a nested field is touched
  const isNestedTouched = (path: string): boolean => {
    const touched = getNestedValue<FormikTouched<UpdateTourLogisticsDTO>>(
      formik.touched,
      path
    );
    return Boolean(touched);
  };

  // Type-safe helper to get nested error
  const getNestedError = (path: string): string | undefined => {
    const error = getNestedValue<FormikErrors<UpdateTourLogisticsDTO>>(
      formik.errors,
      path
    );

    // If error is a string, return it
    if (typeof error === 'string') {
      return error;
    }

    // If error exists but isn't a string (shouldn't happen), convert to string
    if (error !== undefined) {
      return String(error);
    }

    return undefined;
  };

  // Helper to get field-specific error (for non-nested fields)
  const getFieldError = <K extends keyof UpdateTourLogisticsDTO>(
    fieldName: K
  ): string | undefined => {
    const touched = formik.touched[fieldName];
    const error = formik.errors[fieldName];

    if (touched && error) {
      if (typeof error === 'string') {
        return error;
      }
      return String(error);
    }

    return undefined;
  };

  const mutation = useMutation({
    mutationFn: (data: UpdateTourLogisticsDTO) =>
      tourUpdateService.updateLogistics(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Logistics updated successfully');
      onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Failed to update logistics', {
        description: error.message || 'Please try again',
      });
    },
  });

  const formik = useFormik<UpdateTourLogisticsDTO>({
    initialValues: {
      mainLocation: initialData.mainLocation,
      transportModes: initialData.transportModes || [],
      pickupOptions: initialData.pickupOptions || [],
      meetingPoint: initialData.meetingPoint || '',
      packingList: initialData.packingList || [],
    },
    validationSchema: Step3LogisticsSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setIsSubmitting(true);
      setSubmitting(true);

      try {
        // Clean up empty values
        const cleanedValues: UpdateTourLogisticsDTO = {
          mainLocation: values.mainLocation,
          transportModes: values.transportModes && values.transportModes.length > 0 ? values.transportModes : undefined,
          meetingPoint: values.meetingPoint || undefined,
        };

        // Clean pickup options
        const cleanedPickupOptions = (values.pickupOptions ?? [])
          .filter(option => option.city && option.city.trim() !== '')
          .map(option => ({
            city: option.city!.trim(),
            price: option.price || 0,
            currency: option.currency || CURRENCY.BDT
          }));

        if (cleanedPickupOptions.length > 0) {
          cleanedValues.pickupOptions = cleanedPickupOptions;
        }

        // Clean packing list
        const cleanedPackingList = (values.packingList ?? [])
          .filter(item => item.item && item.item.trim() !== '')
          .map(item => ({
            item: item.item.trim(),
            required: item.required !== undefined ? item.required : true,
            notes: item.notes?.trim() || undefined
          }));

        if (cleanedPackingList.length > 0) {
          cleanedValues.packingList = cleanedPackingList;
        }

        await mutation.mutateAsync(cleanedValues);
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  // Transport mode management
  const handleTransportModeToggle = (mode: TransportMode) => {
    const currentModes = formik.values.transportModes || [];
    const updatedModes = currentModes.includes(mode)
      ? currentModes.filter(m => m !== mode)
      : [...currentModes, mode];

    formik.setFieldValue('transportModes', updatedModes);
    formik.setFieldTouched('transportModes', true, false);
  };

  // Pickup Options management
  const addPickupOption = () => {
    const currentOptions = formik.values.pickupOptions || [];
    formik.setFieldValue('pickupOptions', [
      ...currentOptions,
      { city: '', price: 0, currency: CURRENCY.BDT }
    ]);
  };

  const removePickupOption = (index: number) => {
    const pickupOptions = [...(formik.values.pickupOptions || [])];
    pickupOptions.splice(index, 1);
    formik.setFieldValue('pickupOptions', pickupOptions);
    formik.setFieldTouched('pickupOptions', true, false);
  };

  const updatePickupOption = (index: number, field: string, value: unknown) => {
    const pickupOptions = [...(formik.values.pickupOptions || [])];
    pickupOptions[index] = { ...pickupOptions[index], [field]: value };
    formik.setFieldValue('pickupOptions', pickupOptions);
  };

  // Packing List management
  const addPackingItem = () => {
    const currentList = formik.values.packingList || [];
    formik.setFieldValue('packingList', [
      ...currentList,
      { item: '', required: true, notes: '' }
    ]);
  };

  const removePackingItem = (index: number) => {
    const packingList = [...(formik.values.packingList || [])];
    packingList.splice(index, 1);
    formik.setFieldValue('packingList', packingList);
    formik.setFieldTouched('packingList', true, false);
  };

  const updatePackingItem = (index: number, field: keyof PackingListItemDTO, value: unknown) => {
    const packingList = [...(formik.values.packingList || [])];
    packingList[index] = { ...packingList[index], [field]: value };
    formik.setFieldValue('packingList', packingList);
  };

  const transportModeLabels: Record<TransportMode, string> = {
    [TRANSPORT_MODE.BUS]: 'Bus',
    [TRANSPORT_MODE.TRAIN]: 'Train',
    [TRANSPORT_MODE.DOMESTIC_FLIGHT]: 'Domestic Flight',
    [TRANSPORT_MODE.BOAT]: 'Boat',
    [TRANSPORT_MODE.PRIVATE_CAR]: 'Private Car',
    [TRANSPORT_MODE.RIDE_SHARE]: 'Ride Share',
  };

  const currencyLabels: Record<Currency, string> = {
    [CURRENCY.BDT]: 'BDT (৳)',
    [CURRENCY.USD]: 'USD ($)',
    [CURRENCY.INR]: 'INR (₹)',
  };

  // Handle blur for nested fields
  const handleNestedBlur = (path: string) => {
    const touched = { ...formik.touched };
    const pathParts = path.split('.');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = touched;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = true;

    formik.setTouched(touched);
  };

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50/30">
      <CardHeader className="bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700 text-white border-b-2 border-slate-500/20">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <Truck className="h-6 w-6" />
          </div>
          Tour Logistics
        </CardTitle>
        <CardDescription className="text-base mt-2 text-slate-200">
          Configure transportation, pickup options, and packing requirements
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 bg-white/50">
        <form onSubmit={formik.handleSubmit} className="space-y-6">

          {/* Accordion Container */}
          <Accordion type="multiple" defaultValue={["location", "transport", "pickup", "meeting", "packing"]} className="space-y-4">
            {/* Main Location Section */}
            <AccordionItem value="location" className="border-2 border-slate-200 rounded-lg bg-white shadow-md overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Main Location & Address</h3>
                    <p className="text-sm text-slate-500 mt-0.5 font-normal">Primary location details for the tour</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="mainLocation.address.line1" className="text-sm font-medium">Address Line 1</Label>
                <Input
                  id="mainLocation.address.line1"
                  name="mainLocation.address.line1"
                  placeholder="Street address, P.O. Box"
                  value={formik.values.mainLocation?.address?.line1 || ''}
                  onChange={formik.handleChange}
                  onBlur={() => handleNestedBlur('mainLocation.address.line1')}
                  className="transition-all focus:ring-2"
                />
                {isNestedTouched('mainLocation.address.line1') && getNestedError('mainLocation.address.line1') && (
                  <p className="text-sm text-destructive">
                    {getNestedError('mainLocation.address.line1')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainLocation.address.line2">Address Line 2</Label>
                <Input
                  id="mainLocation.address.line2"
                  name="mainLocation.address.line2"
                  placeholder="Apartment, suite, unit, building, floor"
                  value={formik.values.mainLocation?.address?.line2 || ''}
                  onChange={formik.handleChange}
                  onBlur={() => handleNestedBlur('mainLocation.address.line2')}
                />
                {isNestedTouched('mainLocation.address.line2') && getNestedError('mainLocation.address.line2') && (
                  <p className="text-sm text-destructive">
                    {getNestedError('mainLocation.address.line2')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainLocation.address.city">City/Town</Label>
                <Input
                  id="mainLocation.address.city"
                  name="mainLocation.address.city"
                  placeholder="City or town name"
                  value={formik.values.mainLocation?.address?.city || ''}
                  onChange={formik.handleChange}
                  onBlur={() => handleNestedBlur('mainLocation.address.city')}
                />
                {isNestedTouched('mainLocation.address.city') && getNestedError('mainLocation.address.city') && (
                  <p className="text-sm text-destructive">
                    {getNestedError('mainLocation.address.city')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainLocation.address.district">District</Label>
                <ComboBox
                  options={districtOptions}
                  value={formik.values.mainLocation?.address?.district || ''}
                  placeholder="Select district"
                  onChange={(value) => {
                    formik.setFieldValue('mainLocation.address.district', value);
                    handleNestedBlur('mainLocation.address.district');
                  }}
                />
                {isNestedTouched('mainLocation.address.district') && getNestedError('mainLocation.address.district') && (
                  <p className="text-sm text-destructive">
                    {getNestedError('mainLocation.address.district')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainLocation.address.region">Region/Division</Label>
                <Input
                  id="mainLocation.address.region"
                  name="mainLocation.address.region"
                  placeholder="Region or division"
                  value={formik.values.mainLocation?.address?.region || ''}
                  onChange={formik.handleChange}
                  onBlur={() => handleNestedBlur('mainLocation.address.region')}
                />
                {isNestedTouched('mainLocation.address.region') && getNestedError('mainLocation.address.region') && (
                  <p className="text-sm text-destructive">
                    {getNestedError('mainLocation.address.region')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainLocation.address.postalCode">Postal Code</Label>
                <Input
                  id="mainLocation.address.postalCode"
                  name="mainLocation.address.postalCode"
                  placeholder="Postal code"
                  value={formik.values.mainLocation?.address?.postalCode || ''}
                  onChange={formik.handleChange}
                  onBlur={() => handleNestedBlur('mainLocation.address.postalCode')}
                />
                {isNestedTouched('mainLocation.address.postalCode') && getNestedError('mainLocation.address.postalCode') && (
                  <p className="text-sm text-destructive">
                    {getNestedError('mainLocation.address.postalCode')}
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-6 bg-slate-200" />

            <div className="space-y-4 mt-6 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-base font-semibold text-slate-700">Coordinates (Optional)</Label>
                <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">Optional</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="mainLocation.coordinates.lat">Latitude</Label>
                  <Input
                    id="mainLocation.coordinates.lat"
                    name="mainLocation.coordinates.lat"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 23.8103"
                    value={formik.values.mainLocation?.coordinates?.lat || ''}
                    onChange={formik.handleChange}
                    onBlur={() => handleNestedBlur('mainLocation.coordinates.lat')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Must be within Bangladesh (20.34 to 26.63)
                  </p>
                  {isNestedTouched('mainLocation.coordinates.lat') && getNestedError('mainLocation.coordinates.lat') && (
                    <p className="text-sm text-destructive">
                      {getNestedError('mainLocation.coordinates.lat')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainLocation.coordinates.lng">Longitude</Label>
                  <Input
                    id="mainLocation.coordinates.lng"
                    name="mainLocation.coordinates.lng"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 90.4125"
                    value={formik.values.mainLocation?.coordinates?.lng || ''}
                    onChange={formik.handleChange}
                    onBlur={() => handleNestedBlur('mainLocation.coordinates.lng')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Must be within Bangladesh (88.01 to 92.67)
                  </p>
                  {isNestedTouched('mainLocation.coordinates.lng') && getNestedError('mainLocation.coordinates.lng') && (
                    <p className="text-sm text-destructive">
                      {getNestedError('mainLocation.coordinates.lng')}
                    </p>
                  )}
                </div>
              </div>
            </div>
              </AccordionContent>
            </AccordionItem>

            {/* Transport Modes Section */}
            <AccordionItem value="transport" className="border-2 border-slate-200 rounded-lg bg-white shadow-md overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Transport Modes</h3>
                    <p className="text-sm text-slate-500 mt-0.5 font-normal">Select available transportation options</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.values(TRANSPORT_MODE).map((mode) => {
                  const isSelected = formik.values.transportModes?.includes(mode) || false;
                  return (
                    <div
                      key={mode}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                        ${isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-[1.02] ring-2 ring-emerald-200'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 hover:shadow-md bg-white'
                        }
                      `}
                    >
                      <Checkbox
                        id={`transport-${mode}`}
                        checked={isSelected}
                        onCheckedChange={() => handleTransportModeToggle(mode)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5 cursor-pointer"
                      />
                      <Label
                        htmlFor={`transport-${mode}`}
                        className={`font-medium cursor-pointer flex-1 text-sm ${
                          isSelected ? 'text-emerald-900' : 'text-slate-700'
                        }`}
                      >
                        {transportModeLabels[mode]}
                      </Label>
                      {isSelected && (
                        <Check className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  );
                })}
              </div>
              {formik.touched.transportModes && getFieldError('transportModes') && (
                <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getFieldError('transportModes')}
                  </AlertDescription>
                </Alert>
              )}
              </AccordionContent>
            </AccordionItem>

            {/* Pickup Options Section */}
            <AccordionItem value="pickup" className="border-2 border-slate-200 rounded-lg bg-white shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <AccordionTrigger className="flex-1 hover:no-underline hover:bg-slate-50/50 transition-colors -ml-4">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Pickup Options</h3>
                      <p className="text-sm text-slate-500 mt-0.5 font-normal">Configure pickup locations and pricing</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={addPickupOption}
                  className="shadow-sm bg-purple-600 hover:bg-purple-700 text-white ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
              <AccordionContent className="px-6 pb-6 pt-2">

              <div className="space-y-4">
                {(formik.values.pickupOptions ?? []).map((option, index) => (
                  <Card key={index} className="relative border-2 border-purple-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-purple-50/50 to-white">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          City *
                          {getNestedError(`pickupOptions[${index}].city`) && (
                            <span className="text-destructive ml-1">●</span>
                          )}
                        </Label>
                        <Input
                          placeholder="e.g., Dhaka, Chittagong"
                          value={option.city || ''}
                          onChange={(e) => updatePickupOption(index, 'city', e.target.value)}
                          onBlur={() => formik.setFieldTouched(`pickupOptions[${index}].city`, true)}
                        />
                        {isNestedTouched(`pickupOptions[${index}].city`) && getNestedError(`pickupOptions[${index}].city`) && (
                          <p className="text-sm text-destructive">
                            {getNestedError(`pickupOptions[${index}].city`)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Price
                          {getNestedError(`pickupOptions[${index}].price`) && (
                            <span className="text-destructive ml-1">●</span>
                          )}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={option.price || ''}
                          onChange={(e) => updatePickupOption(index, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                          onBlur={() => formik.setFieldTouched(`pickupOptions[${index}].price`, true)}
                        />
                        {isNestedTouched(`pickupOptions[${index}].price`) && getNestedError(`pickupOptions[${index}].price`) && (
                          <p className="text-sm text-destructive">
                            {getNestedError(`pickupOptions[${index}].price`)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Currency *
                          {getNestedError(`pickupOptions[${index}].currency`) && (
                            <span className="text-destructive ml-1">●</span>
                          )}
                        </Label>
                        <Select
                          value={option.currency || CURRENCY.BDT}
                          onValueChange={(value: Currency) => updatePickupOption(index, 'currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(CURRENCY).map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currencyLabels[currency]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isNestedTouched(`pickupOptions[${index}].currency`) && getNestedError(`pickupOptions[${index}].currency`) && (
                          <p className="text-sm text-destructive">
                            {getNestedError(`pickupOptions[${index}].currency`)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-purple-200 px-6 py-3 bg-purple-50/30">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePickupOption(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto border border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    </CardFooter>
                  </Card>
                ))}

                {(formik.values.pickupOptions ?? []).length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-purple-300 rounded-lg bg-gradient-to-br from-purple-50/50 to-white hover:from-purple-50 hover:to-purple-50/50 transition-all">
                    <div className="p-3 rounded-full bg-purple-100 w-fit mx-auto mb-4">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">No pickup options added</h4>
                    <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                      Add pickup locations and prices for additional convenience
                    </p>
                    <Button
                      type="button"
                      variant="default"
                      onClick={addPickupOption}
                      className="shadow-md bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Pickup Option
                    </Button>
                  </div>
                )}
              </div>

              {getFieldError('pickupOptions') && (
                <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getFieldError('pickupOptions')}
                  </AlertDescription>
                </Alert>
              )}
              </AccordionContent>
            </AccordionItem>

            {/* Meeting Point Section */}
            <AccordionItem value="meeting" className="border-2 border-slate-200 rounded-lg bg-white shadow-md overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Meeting Point</h3>
                    <p className="text-sm text-slate-500 mt-0.5 font-normal">Specify where participants should gather</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
              <div className="space-y-3">
                <Textarea
                  id="meetingPoint"
                  name="meetingPoint"
                  placeholder="Example: Meet at the main entrance of Hotel Sonargaon at 8:00 AM. Look for our guide holding a blue flag with 'Tour Bangladesh' logo."
                  className="min-h-[120px] resize-none border-slate-300 focus:border-amber-400 focus:ring-amber-400"
                  value={formik.values.meetingPoint}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Provide clear instructions for where participants should meet
                  </p>
                  <Badge variant="outline" className="text-xs font-medium border-amber-300 text-amber-700 bg-amber-50">
                    {(formik.values.meetingPoint?.length ?? 0)}/500 characters
                  </Badge>
                </div>
                {formik.touched.meetingPoint && formik.errors.meetingPoint && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {formik.errors.meetingPoint}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              </AccordionContent>
            </AccordionItem>

            {/* Packing List Section */}
            <AccordionItem value="packing" className="border-2 border-slate-200 rounded-lg bg-white shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <AccordionTrigger className="flex-1 hover:no-underline hover:bg-slate-50/50 transition-colors -ml-4">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Packing List</h3>
                      <p className="text-sm text-slate-500 mt-0.5 font-normal">Essential items travelers should bring</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={addPackingItem}
                  className="shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <AccordionContent className="px-6 pb-6 pt-2">

              <div className="space-y-4">
                {(formik.values.packingList ?? []).map((item, index) => (
                  <Card key={index} className="relative border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-indigo-50/50 to-white">
                    <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5 space-y-2">
                        <Label className="text-sm font-medium">
                          Item Name *
                          {getNestedError(`packingList[${index}].item`) && (
                            <span className="text-destructive ml-1">●</span>
                          )}
                        </Label>
                        <Input
                          placeholder="e.g., Passport, Hiking Boots, Water Bottle"
                          value={item.item}
                          onChange={(e) => updatePackingItem(index, 'item', e.target.value)}
                          onBlur={() => formik.setFieldTouched(`packingList[${index}].item`, true)}
                        />
                        {isNestedTouched(`packingList[${index}].item`) && getNestedError(`packingList[${index}].item`) && (
                          <p className="text-sm text-destructive">
                            {getNestedError(`packingList[${index}].item`)}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-5 space-y-2">
                        <Label className="text-sm font-medium">Notes (Optional)</Label>
                        <Input
                          placeholder="e.g., Waterproof, Size 10, At least 1 liter"
                          value={item.notes || ''}
                          onChange={(e) => updatePackingItem(index, 'notes', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm font-medium">Required</Label>
                        <div className="flex items-center h-10">
                          <Checkbox
                            id={`packing-required-${index}`}
                            checked={item.required !== false}
                            onCheckedChange={(checked) =>
                              updatePackingItem(index, 'required', checked)
                            }
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`packing-required-${index}`}
                            className="ml-2 text-sm font-normal cursor-pointer"
                          >
                            Required
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-indigo-200 px-6 py-3 bg-indigo-50/30">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePackingItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto border border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    </CardFooter>
                  </Card>
                ))}

                {(formik.values.packingList ?? []).length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-indigo-300 rounded-lg bg-gradient-to-br from-indigo-50/50 to-white hover:from-indigo-50 hover:to-indigo-50/50 transition-all">
                    <div className="p-3 rounded-full bg-indigo-100 w-fit mx-auto mb-4">
                      <Package className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">No packing items added</h4>
                    <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                      Help travelers prepare by listing essential items to bring
                    </p>
                    <Button
                      type="button"
                      variant="default"
                      onClick={addPackingItem}
                      className="shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                )}
              </div>

              {getFieldError('packingList') && (
                <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getFieldError('packingList')}
                  </AlertDescription>
                </Alert>
              )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Error/Success Alerts */}
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to update logistics: {mutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {mutation.isSuccess && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Logistics updated successfully
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>

      {/* Submit Button */}
      <CardFooter className="border-t-2 border-slate-300 px-6 py-5 bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm">
            {Object.keys(formik.errors).length > 0 && (
              <Alert variant="destructive" className="py-2 px-4 inline-flex items-center gap-2 border-red-300 bg-red-50 shadow-sm">
                <X className="h-4 w-4" />
                <span className="font-medium text-red-800">
                  {Object.keys(formik.errors).length} validation issue(s) found
                </span>
              </Alert>
            )}
            {Object.keys(formik.errors).length === 0 && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                <Check className="h-4 w-4" />
                <span className="font-medium">All fields validated</span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            onClick={() => formik.handleSubmit()}
            disabled={isSubmitting || mutation.isPending}
            className="min-w-[180px] shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-slate-700 to-blue-700 hover:from-slate-800 hover:to-blue-800 text-white font-semibold"
            size="lg"
          >
            {isSubmitting || mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Update Logistics
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}