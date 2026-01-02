"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormikContext } from "formik";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronDown } from "lucide-react";
import {
    MdLocationOn,
    MdMap,
    MdTour,
    MdHotel,
    MdSupportAgent,
    MdDirectionsBus,
    MdLocalPolice,
    MdLocalHospital,
    MdFireTruck,
    MdPhone
} from "react-icons/md";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { CreateTourDTO } from "@/types/tour.types";
import {
    TRAVEL_TYPE,
    ACCOMMODATION_TYPE,
    DIVISION,
    DISTRICT,
} from "@/constants/tour.const";
import { getDistrictsByDivision } from "@/utils/helpers/conversions.tour";

const MotionDiv = motion.div;

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export default function BangladeshFieldsStep() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

    const [openTourType, setOpenTourType] = useState<boolean>(false);
    const [openDivision, setOpenDivision] = useState<boolean>(false);
    const [openDistrict, setOpenDistrict] = useState<boolean>(false);

    const filteredDistricts = useMemo(() => {
        if (!values.division) return [];
        return getDistrictsByDivision(values.division);
    }, [values.division]);

    useEffect(() => {
        if (
            values.district &&
            !filteredDistricts.includes(values.district)
        ) {
            setFieldValue("district", "");
        }
    }, [filteredDistricts, values.district, setFieldValue]);


    const findLabel = (value: string, options: string[]): string => {
        return options.find((option) => option === value) || "";
    };

    const handleDivisionChange = (division: string) => {
        setFieldValue("division", division);
        setOpenDivision(false);
        // District will be reset by the useEffect above
    };

    return (
        <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants}>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20">
                            <MdMap className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                Bangladesh Tour Configuration
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Configure location-specific details and services for your Bangladesh tour
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Separator className="my-6" />

            {/* Location & Type Selection */}
            <MotionDiv variants={itemVariants}>
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MdLocationOn className="w-5 h-5 text-emerald-600" />
                            Location & Tour Details
                        </CardTitle>
                        <CardDescription>
                            Select tour type and destination information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Tour Type */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MdTour className="w-4 h-4 text-emerald-600" />
                                    Tour Type
                                    <Badge variant="outline" className="ml-1 text-xs">Required</Badge>
                                </Label>
                                <Popover open={openTourType} onOpenChange={setOpenTourType}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openTourType}
                                            className={cn(
                                                "w-full justify-between h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                touched.tourType && errors.tourType && "border-red-500 ring-1 ring-red-500"
                                            )}
                                        >
                                            <span className={values.tourType ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}>
                                                {values.tourType
                                                    ? findLabel(values.tourType, Object.values(TRAVEL_TYPE))
                                                    : "Select tour type"}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search tour type..." />
                                            <CommandList>
                                                <CommandEmpty>No tour type found.</CommandEmpty>
                                                <CommandGroup>
                                                    {Object.values(TRAVEL_TYPE).map((type) => (
                                                        <CommandItem
                                                            key={type}
                                                            value={type}
                                                            onSelect={() => {
                                                                setFieldValue("tourType", type);
                                                                setOpenTourType(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 text-emerald-600",
                                                                    values.tourType === type
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {type}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {touched.tourType && errors.tourType && (
                                    <p className="text-xs text-red-500">
                                        {errors.tourType}
                                    </p>
                                )}
                            </div>

                            {/* Division */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MdMap className="w-4 h-4 text-emerald-600" />
                                    Division
                                    <Badge variant="outline" className="ml-1 text-xs">Required</Badge>
                                </Label>
                                <Popover open={openDivision} onOpenChange={setOpenDivision}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openDivision}
                                            className={cn(
                                                "w-full justify-between h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                touched.division && errors.division && "border-red-500 ring-1 ring-red-500"
                                            )}
                                        >
                                            <span className={values.division ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}>
                                                {values.division
                                                    ? findLabel(values.division, Object.values(DIVISION))
                                                    : "Select division"}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search division..." />
                                            <CommandList>
                                                <CommandEmpty>No division found.</CommandEmpty>
                                                <CommandGroup>
                                                    {Object.values(DIVISION).map((division) => (
                                                        <CommandItem
                                                            key={division}
                                                            value={division}
                                                            onSelect={() => {
                                                                handleDivisionChange(division);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 text-emerald-600",
                                                                    values.division === division
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {division}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {touched.division && errors.division && (
                                    <p className="text-xs text-red-500">
                                        {errors.division}
                                    </p>
                                )}
                            </div>

                            {/* District */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MdLocationOn className="w-4 h-4 text-emerald-600" />
                                    District
                                    <Badge variant="outline" className="ml-1 text-xs">Required</Badge>
                                </Label>
                                <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openDistrict}
                                            className={cn(
                                                "w-full justify-between h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                                touched.district && errors.district && "border-red-500 ring-1 ring-red-500"
                                            )}
                                        >
                                            <span className={values.district ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}>
                                                {values.district
                                                    ? findLabel(values.district, Object.values(DISTRICT))
                                                    : "Select district"}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search district..." />
                                            <CommandList>
                                                <CommandEmpty>No district found.</CommandEmpty>
                                                <CommandGroup>
                                                    {filteredDistricts.map((district) => (
                                                        <CommandItem
                                                            key={district}
                                                            value={district}
                                                            onSelect={() => {
                                                                setFieldValue("district", district);
                                                                setOpenDistrict(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 text-emerald-600",
                                                                    values.district === district
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {district}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {touched.district && errors.district && (
                                    <p className="text-xs text-red-500">
                                        {errors.district}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </MotionDiv>

            {/* Accommodation Section */}
            <MotionDiv variants={itemVariants}>
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MdHotel className="w-5 h-5 text-amber-600" />
                            Accommodation Options
                        </CardTitle>
                        <CardDescription>
                            Select available accommodation types for this tour
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.values(ACCOMMODATION_TYPE).map((type) => (
                                <MotionDiv
                                    key={type}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "border rounded-lg p-4 transition-all",
                                        values.accommodationType?.includes(type)
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                                            : "border-gray-200 dark:border-gray-700"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            checked={values.accommodationType?.includes(type)}
                                            onCheckedChange={(checked) => {
                                                const current = values.accommodationType || [];
                                                const next = checked
                                                    ? [...current, type]
                                                    : current.filter((t) => t !== type);
                                                setFieldValue("accommodationType", next);
                                            }}
                                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                        />
                                        <Label className="text-sm font-medium cursor-pointer">
                                            {type}
                                        </Label>
                                    </div>
                                </MotionDiv>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </MotionDiv>

            {/* Services Section */}
            <MotionDiv variants={itemVariants}>
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MdSupportAgent className="w-5 h-5 text-violet-600" />
                            Included Services
                        </CardTitle>
                        <CardDescription>
                            Select services that are included in the tour package
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <MotionDiv
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "border rounded-lg p-5 cursor-pointer transition-all",
                                    values.guideIncluded
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                )}
                            >
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={values.guideIncluded || false}
                                        onCheckedChange={(checked) => setFieldValue("guideIncluded", checked)}
                                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                    <div className="flex items-center gap-2">
                                        <MdSupportAgent className="w-5 h-5 text-violet-600" />
                                        <Label className="font-medium cursor-pointer">Professional Guide</Label>
                                    </div>
                                </div>
                            </MotionDiv>

                            <MotionDiv
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "border rounded-lg p-5 cursor-pointer transition-all",
                                    values.transportIncluded
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                )}
                            >
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={values.transportIncluded || false}
                                        onCheckedChange={(checked) => setFieldValue("transportIncluded", checked)}
                                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                    <div className="flex items-center gap-2">
                                        <MdDirectionsBus className="w-5 h-5 text-orange-600" />
                                        <Label className="font-medium cursor-pointer">Transportation</Label>
                                    </div>
                                </div>
                            </MotionDiv>
                        </div>
                    </CardContent>
                </Card>
            </MotionDiv>

            {/* Emergency Contacts */}
            <MotionDiv variants={itemVariants}>
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MdPhone className="w-5 h-5 text-red-600" />
                            Emergency Contact Information
                        </CardTitle>
                        <CardDescription>
                            Provide essential emergency numbers for tour safety
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MdLocalPolice className="w-4 h-4 text-red-600" />
                                    Police Number
                                </Label>
                                <Input
                                    name="emergencyContacts.policeNumber"
                                    placeholder="e.g., +880-XXX-XXXX"
                                    value={values.emergencyContacts?.policeNumber || ""}
                                    onChange={(e) =>
                                        setFieldValue("emergencyContacts.policeNumber", e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MdLocalHospital className="w-4 h-4 text-red-600" />
                                    Ambulance Number
                                </Label>
                                <Input
                                    name="emergencyContacts.ambulanceNumber"
                                    placeholder="e.g., +880-XXX-XXXX"
                                    value={values.emergencyContacts?.ambulanceNumber || ""}
                                    onChange={(e) =>
                                        setFieldValue("emergencyContacts.ambulanceNumber", e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MdFireTruck className="w-4 h-4 text-red-600" />
                                    Fire Service Number
                                </Label>
                                <Input
                                    name="emergencyContacts.fireServiceNumber"
                                    placeholder="e.g., +880-XXX-XXXX"
                                    value={values.emergencyContacts?.fireServiceNumber || ""}
                                    onChange={(e) =>
                                        setFieldValue("emergencyContacts.fireServiceNumber", e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MdPhone className="w-4 h-4 text-red-600" />
                                    Local Emergency
                                </Label>
                                <Input
                                    name="emergencyContacts.localEmergency"
                                    placeholder="e.g., +880-XXX-XXXX"
                                    value={values.emergencyContacts?.localEmergency || ""}
                                    onChange={(e) =>
                                        setFieldValue("emergencyContacts.localEmergency", e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </MotionDiv>
        </MotionDiv>
    );
}