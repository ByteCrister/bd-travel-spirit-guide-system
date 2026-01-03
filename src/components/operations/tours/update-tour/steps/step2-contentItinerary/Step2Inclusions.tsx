'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    InclusionDTO,
    UpdateTourContentItineraryDTO,
} from '@/types/tour.types';
import { useFormikContext } from 'formik';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Step2Inclusions() {
    const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();

    // =============== INCLUSION/EXCLUSION MANAGEMENT ===============
    const addInclusion = () => {
        const newInclusion: InclusionDTO = { label: '', description: '' };
        const currentInclusions = values.inclusions || [];
        setFieldValue('inclusions', [...currentInclusions, newInclusion]);
    };

    const removeInclusion = (index: number) => {
        const currentInclusions = values.inclusions || [];
        if (index < 0 || index >= currentInclusions.length) return;

        const updatedInclusions = [...currentInclusions];
        updatedInclusions.splice(index, 1);
        setFieldValue('inclusions', updatedInclusions);
    };

    const updateInclusion = (
        index: number,
        field: keyof InclusionDTO,
        value: string
    ) => {
        const currentInclusions = values.inclusions || [];
        if (index < 0 || index >= currentInclusions.length) return;

        const updatedInclusions = [...currentInclusions];
        updatedInclusions[index] = {
            ...updatedInclusions[index],
            [field]: value
        };
        setFieldValue('inclusions', updatedInclusions);
    };

    const inclusions = values.inclusions || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h3 className="text-xl font-semibold">Inclusions</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Add what&apos;s included in the tour package
                    </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                    {inclusions.length} {inclusions.length === 1 ? 'item' : 'items'}
                </Badge>
            </div>

            <div className="space-y-4">
                {inclusions.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="pt-12 pb-12">
                            <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">No inclusions added yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Start by adding what&apos;s included in your tour
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {inclusions.map((inclusion, index) => (
                            <Card
                                key={index}
                                className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500"
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            </div>
                                            <Label className="font-semibold text-base">
                                                Inclusion #{index + 1}
                                            </Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeInclusion(index)}
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`inclusion-${index}-label`} className="text-sm font-medium">
                                                Label
                                            </Label>
                                            <Input
                                                id={`inclusion-${index}-label`}
                                                placeholder="e.g., Hotel Accommodation, Airport Transfer"
                                                value={inclusion.label}
                                                onChange={(e) => updateInclusion(index, 'label', e.target.value)}
                                                className="border-2 focus:border-green-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`inclusion-${index}-description`} className="text-sm font-medium">
                                                Description
                                            </Label>
                                            <Textarea
                                                id={`inclusion-${index}-description`}
                                                placeholder="Provide detailed information about this inclusion..."
                                                value={inclusion.description}
                                                onChange={(e) => updateInclusion(index, 'description', e.target.value)}
                                                rows={3}
                                                className="border-2 focus:border-green-500 resize-none"
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
                    onClick={addInclusion}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Inclusion
                </Button>
            </div>
        </div>
    );
}