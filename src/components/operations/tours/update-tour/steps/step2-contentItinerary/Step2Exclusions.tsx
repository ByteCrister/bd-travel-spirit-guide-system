'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    ExclusionDTO,
    UpdateTourContentItineraryDTO,
} from '@/types/tour.types';
import { useFormikContext } from 'formik';
import { Plus, Trash2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Step2Exclusions() {
    const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();

    // =============== EXCLUSION MANAGEMENT ===============
    const addExclusion = () => {
        const newExclusion: ExclusionDTO = { label: '', description: '' };
        const currentExclusions = values.exclusions || [];
        setFieldValue('exclusions', [...currentExclusions, newExclusion]);
    };

    const removeExclusion = (index: number) => {
        const currentExclusions = values.exclusions || [];
        if (index < 0 || index >= currentExclusions.length) return;

        const updatedExclusions = [...currentExclusions];
        updatedExclusions.splice(index, 1);
        setFieldValue('exclusions', updatedExclusions);
    };

    const updateExclusion = (
        index: number,
        field: keyof ExclusionDTO,
        value: string
    ) => {
        const currentExclusions = values.exclusions || [];
        if (index < 0 || index >= currentExclusions.length) return;

        const updatedExclusions = [...currentExclusions];
        updatedExclusions[index] = {
            ...updatedExclusions[index],
            [field]: value
        };
        setFieldValue('exclusions', updatedExclusions);
    };

    const exclusions = values.exclusions || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <h3 className="text-xl font-semibold">Exclusions</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Specify what&apos;s not included in the tour package
                    </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                    {exclusions.length} {exclusions.length === 1 ? 'item' : 'items'}
                </Badge>
            </div>

            <div className="space-y-4">
                {exclusions.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="pt-12 pb-12">
                            <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">No exclusions added yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Add items that are not covered in your tour
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {exclusions.map((exclusion, index) => (
                            <Card
                                key={index}
                                className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-red-500"
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            </div>
                                            <Label className="font-semibold text-base">
                                                Exclusion #{index + 1}
                                            </Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeExclusion(index)}
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`exclusion-${index}-label`} className="text-sm font-medium">
                                                Label
                                            </Label>
                                            <Input
                                                id={`exclusion-${index}-label`}
                                                placeholder="e.g., International Flights, Travel Insurance"
                                                value={exclusion.label}
                                                onChange={(e) => updateExclusion(index, 'label', e.target.value)}
                                                className="border-2 focus:border-red-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`exclusion-${index}-description`} className="text-sm font-medium">
                                                Description
                                            </Label>
                                            <Textarea
                                                id={`exclusion-${index}-description`}
                                                placeholder="Explain what's not covered and why..."
                                                value={exclusion.description}
                                                onChange={(e) => updateExclusion(index, 'description', e.target.value)}
                                                rows={3}
                                                className="border-2 focus:border-red-500 resize-none"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Button
                    type="button"
                    onClick={addExclusion}
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Exclusion
                </Button>
            </div>
        </div>
    );
}