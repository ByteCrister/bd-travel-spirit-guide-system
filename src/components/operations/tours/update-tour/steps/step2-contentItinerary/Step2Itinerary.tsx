"use client";

import { useFormikContext } from "formik";
import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  Calendar,
  MapPin,
  Utensils,
  Hotel,
  Activity,
  Navigation,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItineraryEntryDTO, UpdateTourContentItineraryDTO } from "@/types/tour.types";
import { MealsProvided, TransportMode } from "@/constants/tour.const";
// Mock constants - replace with your actual imports
const MEALS_PROVIDED = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACKS: "Snacks",
};

const TRANSPORT_MODE = {
  BUS: "Bus",
  FLIGHT: "Flight",
  TRAIN: "Train",
  BOAT: "Boat",
  WALKING: "Walking",
};

export default function Step2Itinerary() {
  const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const addItineraryDay = () => {
    const newDay: ItineraryEntryDTO = {
      day: (values.itinerary ?? []).length + 1,
      title: "",
      description: "",
      mealsProvided: [],
      accommodation: "",
      activities: [],
      travelDistance: "",
      travelMode: TRANSPORT_MODE.BUS as TransportMode,
      estimatedTime: "",
      importantNotes: [],
    };
    const newIndex = (values.itinerary ?? []).length;
    setFieldValue("itinerary", [...(values.itinerary ?? []), newDay]);
    setTimeout(() => setExpandedDays((prev) => [...prev, newIndex]), 50);
  };

  const removeItineraryDay = (index: number) => {
    const itinerary = [...(values.itinerary ?? [])];
    itinerary.splice(index, 1);
    const renumbered = itinerary.map((day, idx) => ({ ...day, day: idx + 1 }));
    setFieldValue("itinerary", renumbered);
    setExpandedDays((prev) =>
      prev.filter((dayIdx) => dayIdx !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  const updateItineraryField = (
    index: number,
    field: keyof ItineraryEntryDTO,
    value: unknown
  ) => {
    const itinerary = [...(values.itinerary ?? [])];
    itinerary[index] = { ...itinerary[index], [field]: value };
    setFieldValue("itinerary", itinerary);
  };

  const toggleDay = (index: number) => {
    setExpandedDays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleMeal = (index: number, meal: MealsProvided) => {
    const currentMeals = values.itinerary?.[index]?.mealsProvided || [];
    const newMeals = currentMeals.includes(meal)
      ? currentMeals.filter((m) => m !== meal)
      : [...currentMeals, meal];
    updateItineraryField(index, "mealsProvided", newMeals);
  };

  return (
    <div className="space-y-6">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 2000px;
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
          overflow: hidden;
        }

        .rotate-180 {
          transform: rotate(180deg);
        }

        .transition-transform {
          transition: transform 0.2s ease;
        }

        .scale-hover:hover {
          transform: scale(1.05);
        }
      `}</style>

      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tour Itinerary</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your day-by-day tour schedule
          </p>
        </div>
        <Button onClick={addItineraryDay} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Day
        </Button>
      </div>

      {(values.itinerary ?? []).length === 0 ? (
        <Card className="border-dashed animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <p className="text-muted-foreground text-center font-medium">
              No itinerary days added yet
            </p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Start building your tour schedule by adding your first day
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(values.itinerary ?? []).map((day, index) => (
            <Card key={index} className="overflow-hidden animate-fade-in">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleDay(index)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                    {day.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {day.title || "Untitled Day"}
                    </h3>
                    {day.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {day.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {day.mealsProvided && day.mealsProvided.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Utensils className="h-3 w-3" />
                      {day.mealsProvided.length}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItineraryDay(index);
                    }}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div
                    className={`transition-transform ${expandedDays.includes(index) ? "rotate-180" : ""
                      }`}
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {expandedDays.includes(index) && (
                <div className="border-t p-6 space-y-6 bg-muted/20 animate-slide-down">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor={`title-${index}`}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Day Title
                      </Label>
                      <Input
                        id={`title-${index}`}
                        placeholder="e.g., Arrival in Paris"
                        value={day.title || ""}
                        onChange={(e) =>
                          updateItineraryField(index, "title", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor={`description-${index}`}
                        className="flex items-center gap-2"
                      >
                        <Activity className="h-4 w-4" />
                        Description
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        placeholder="Describe the day's activities and highlights..."
                        rows={4}
                        value={day.description || ""}
                        onChange={(e) =>
                          updateItineraryField(index, "description", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Meals Provided
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(MEALS_PROVIDED).map((meal) => (
                          <Badge
                            key={meal}
                            variant={
                              (day.mealsProvided || []).includes(meal as MealsProvided)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer transition-all scale-hover"
                            onClick={() => toggleMeal(index, meal as MealsProvided)}
                          >
                            {meal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor={`accommodation-${index}`}
                        className="flex items-center gap-2"
                      >
                        <Hotel className="h-4 w-4" />
                        Accommodation
                      </Label>
                      <Input
                        id={`accommodation-${index}`}
                        placeholder="e.g., 4-star Hotel in City Center"
                        value={day.accommodation || ""}
                        onChange={(e) =>
                          updateItineraryField(index, "accommodation", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor={`activities-${index}`}
                        className="flex items-center gap-2"
                      >
                        <Activity className="h-4 w-4" />
                        Activities
                      </Label>
                      <Input
                        id={`activities-${index}`}
                        placeholder="Comma-separated activities (e.g., Museum tour, City walk)"
                        value={day.activities?.join(", ") || ""}
                        onChange={(e) =>
                          updateItineraryField(
                            index,
                            "activities",
                            e.target.value
                              .split(",")
                              .map((a) => a.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                      {day.activities && day.activities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {day.activities.map((activity, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`distance-${index}`}
                        className="flex items-center gap-2"
                      >
                        <Navigation className="h-4 w-4" />
                        Travel Distance
                      </Label>
                      <Input
                        id={`distance-${index}`}
                        placeholder="e.g., 150 km"
                        value={day.travelDistance || ""}
                        onChange={(e) =>
                          updateItineraryField(index, "travelDistance", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`mode-${index}`}
                        className="flex items-center gap-2"
                      >
                        <Navigation className="h-4 w-4" />
                        Travel Mode
                      </Label>
                      <Select
                        value={day.travelMode || ""}
                        onValueChange={(value) =>
                          updateItineraryField(index, "travelMode", value)
                        }
                      >
                        <SelectTrigger id={`mode-${index}`}>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TRANSPORT_MODE).map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`time-${index}`}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Estimated Time
                      </Label>
                      <Input
                        id={`time-${index}`}
                        placeholder="e.g., 3 hours"
                        value={day.estimatedTime || ""}
                        onChange={(e) =>
                          updateItineraryField(index, "estimatedTime", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor={`notes-${index}`}
                        className="flex items-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Important Notes
                      </Label>
                      <Textarea
                        id={`notes-${index}`}
                        placeholder="Comma-separated notes (e.g., Passport required, Dress code: formal)"
                        rows={2}
                        value={day.importantNotes?.join(", ") || ""}
                        onChange={(e) =>
                          updateItineraryField(
                            index,
                            "importantNotes",
                            e.target.value
                              .split(",")
                              .map((n) => n.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                      {day.importantNotes && day.importantNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {day.importantNotes.map((note, i) => (
                            <Badge
                              key={i}
                              variant="destructive"
                              className="text-xs gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {note}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}