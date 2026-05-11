'use client';

import { DIFFICULTY_LEVEL, DifficultyLevel } from '@/constants/tour/tour.const';
import { useFormikContext } from 'formik';
import { UpdateTourContentItineraryDTO } from '@/types/tour/tour.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Mountain,
    Leaf,
    MountainIcon,
    Activity,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Define the interface for difficulty config
interface DifficultyConfig {
    [key: string]: {
        color: string;
        icon: React.ReactNode;
        description: string;
    };
}

// Difficulty Component
function Step2Difficulty() {
    const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();

    const difficultyConfig: DifficultyConfig = {
        [DIFFICULTY_LEVEL.EASY]: {
            color: 'bg-green-500',
            icon: <Leaf className="h-4 w-4" />,
            description: 'Suitable for beginners and families'
        },
        [DIFFICULTY_LEVEL.MODERATE]: {
            color: 'bg-blue-500',
            icon: <MountainIcon className="h-4 w-4" />,
            description: 'Some physical effort required'
        },
        [DIFFICULTY_LEVEL.CHALLENGING]: {
            color: 'bg-yellow-500',
            icon: <Activity className="h-4 w-4" />,
            description: 'Requires good physical fitness'
        },
    };

    // Get all difficulty levels as an array
    const difficultyLevels = Object.values(DIFFICULTY_LEVEL) as DIFFICULTY_LEVEL[];

    // Helper to get current difficulty config
    const getCurrentDifficulty = () => {
        if (!values.difficulty) return null;
        return difficultyConfig[values.difficulty];
    };

    // Handle difficulty change
    const handleDifficultyChange = (value: string) => {
        setFieldValue('difficulty', value as DifficultyLevel);
    };

    // Get the index of the current difficulty for the progress indicator
    const getSelectedIndex = (): number => {
        if (!values.difficulty) return -1;
        return difficultyLevels.indexOf(values.difficulty as DIFFICULTY_LEVEL);
    };

    return (
        <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Mountain className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Difficulty Level</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                    Select the physical difficulty of this tour. This helps travelers understand the physical requirements.
                </p>
            </CardHeader>
            <CardContent>
                <Select
                    value={values.difficulty || ''}
                    onValueChange={handleDifficultyChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                        {difficultyLevels.map((level) => {
                            const config = difficultyConfig[level];
                            return (
                                <SelectItem key={level} value={level}>
                                    <div className="flex items-center gap-2 py-1">
                                        <div className={`w-8 h-8 rounded-lg ${config?.color} flex items-center justify-center`}>
                                            {config?.icon}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium capitalize">{level}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {config?.description}
                                            </span>
                                        </div>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                {/* Current selection display */}
                {values.difficulty && getCurrentDifficulty() && (
                    <div className="mt-4 p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`h-8 w-8 rounded-lg ${getCurrentDifficulty()?.color} flex items-center justify-center`}>
                                {getCurrentDifficulty()?.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold capitalize">Selected: {values.difficulty}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {getCurrentDifficulty()?.description}
                                </p>
                            </div>
                        </div>

                        {/* Difficulty indicators */}
                        <div className="mt-3 flex items-center gap-2">
                            {difficultyLevels.map((level, index) => {
                                const isSelected = values.difficulty === level;
                                const selectedIndex = getSelectedIndex();
                                const isBeforeSelected = selectedIndex >= index;
                                
                                return (
                                    <div key={level} className="flex items-center">
                                        <div
                                            className={cn(
                                                "h-3 w-3 rounded-full transition-all duration-200",
                                                isSelected
                                                    ? difficultyConfig[level]?.color
                                                    : isBeforeSelected
                                                        ? difficultyConfig[level]?.color?.replace('bg-', 'bg-').replace('500', '300')
                                                        : 'bg-gray-200'
                                            )}
                                        />
                                        {index < difficultyLevels.length - 1 && (
                                            <div
                                                className={cn(
                                                    "h-1 w-6 transition-all duration-200",
                                                    isBeforeSelected
                                                        ? difficultyConfig[level]?.color?.replace('bg-', 'bg-').replace('500', '300')
                                                        : 'bg-gray-200'
                                                )}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Additional info based on difficulty */}
                        <div className="mt-4 text-sm text-muted-foreground border-t pt-3">
                            {values.difficulty === DIFFICULTY_LEVEL.EASY && (
                                <div className="space-y-1">
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Flat terrain with minimal elevation gain
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Suitable for all ages and fitness levels
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Typically involves walking on paved or well-maintained paths
                                    </p>
                                </div>
                            )}
                            {values.difficulty === DIFFICULTY_LEVEL.MODERATE && (
                                <div className="space-y-1">
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        May include some hills or uneven terrain
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        Requires basic level of fitness
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        Suitable for most active travelers
                                    </p>
                                </div>
                            )}
                            {values.difficulty === DIFFICULTY_LEVEL.CHALLENGING && (
                                <div className="space-y-1">
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                        Significant elevation changes and uneven terrain
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                        Requires good physical condition
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                        May involve longer distances or time commitments
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty state guidance */}
                {!values.difficulty && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-dashed">
                        <div className="flex items-center gap-3">
                            <Mountain className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">No difficulty level selected</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Select a difficulty level above to help travelers understand the physical requirements of this tour.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default Step2Difficulty;