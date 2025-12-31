// components/ui/multi-select.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption<T extends string = string> = {
    value: T;
    label: string;
};

interface MultiSelectProps<T extends string = string> {
    options: MultiSelectOption<T>[];
    selected: T[];
    onChange: (selected: T[]) => void;
    placeholder?: string;
    className?: string;
    maxDisplay?: number;
}

export function MultiSelect<T extends string>({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
    maxDisplay = 2,
}: MultiSelectProps<T>) {

    const [open, setOpen] = React.useState(false);

    const handleSelect = (value: T) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const removeItem = (value: T) => {
        onChange(selected.filter((item) => item !== value));
    };

    const displayedItems = selected.slice(0, maxDisplay);
    const moreCount = selected.length - maxDisplay;

    return (
        <div className={className}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <div className="flex flex-wrap gap-1 overflow-hidden">
                            {selected.length === 0 && (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                            {displayedItems.map((value) => {
                                const option = options.find((opt) => opt.value === value);
                                return (
                                    <Badge key={value} variant="secondary" className="mr-1">
                                        {option?.label || value}
                                    </Badge>
                                );
                            })}
                            {moreCount > 0 && (
                                <Badge variant="secondary" className="mr-1">
                                    +{moreCount} more
                                </Badge>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search options..." />
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            selected.includes(option.value)
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50"
                                        )}
                                    >
                                        {selected.includes(option.value) && (
                                            <span className="text-xs">✓</span>
                                        )}
                                    </div>
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {selected.length > maxDisplay && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {selected.map((value) => {
                        const option = options.find((opt) => opt.value === value);
                        return (
                            <Badge key={value} variant="secondary" className="flex items-center gap-1">
                                {option?.label || value}
                                <button
                                    type="button"
                                    onClick={() => removeItem(value)}
                                    className="ml-1 hover:text-destructive"
                                    aria-label={`Remove ${option?.label || value}`}
                                >
                                    <X size={12} />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}