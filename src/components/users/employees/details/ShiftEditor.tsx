// components/ui/ShiftEditor.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DayOfWeek, ShiftDTO } from "@/types/employee/employee.types";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import FormRow from "./FormRow";
import { Input } from "@/components/ui/input";

const neumorphCard =
  "bg-[#E7E5E4] rounded-[24px] shadow-[8px_8px_16px_#c4c2c1,-8px_-8px_16px_#ffffff]";
const neumorphInput =
  "bg-[#E7E5E4] rounded-[12px] shadow-[inset_4px_4px_8px_#c4c2c1,inset_-4px_-4px_8px_#ffffff] border-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006666]/20 transition-all text-[#1E2938]";

export default function ShiftEditor({
  shifts,
  onChange,
}: {
  shifts: ShiftDTO[];
  onChange: (next: ShiftDTO[] | undefined) => void;
}) {
  const shift = shifts[0] || { startTime: "09:00", endTime: "17:00", days: [] };

  const update = (patch: Partial<ShiftDTO>) =>
    onChange([{ ...shift, ...patch }]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p
          className="text-sm text-[#1E2938]"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          Configure employee work schedule
        </p>
      </div>

      <div className={`${neumorphCard} p-5`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormRow label="Start Time" icon={Clock}>
            <input
              type="time"
              value={shift.startTime}
              onChange={(e) => update({ startTime: e.target.value })}
              className={`${neumorphInput} w-full`}
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            />
          </FormRow>

          <FormRow label="End Time" icon={Clock}>
            <input
              type="time"
              value={shift.endTime}
              onChange={(e) => update({ endTime: e.target.value })}
              className={`${neumorphInput} w-full`}
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            />
          </FormRow>

          <div className="col-span-1 md:col-span-2">
            <FormRow label="Working Days" icon={Calendar}>
              <div className="flex flex-wrap gap-2">
                {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as DayOfWeek[]).map(
                  (day) => {
                    const isSelected = shift.days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const days = isSelected
                            ? shift.days.filter((d) => d !== day)
                            : [...shift.days, day];
                          update({ days });
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-[#006644] text-white shadow-[3px_3px_6px_#004d33,-3px_-3px_6px_#008055]"
                            : "bg-[#E7E5E4] text-[#1E2938] shadow-[3px_3px_6px_#d1cfce,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_5px_#d1cfce,inset_-2px_-2px_5px_#ffffff]"
                        } focus-visible:outline-none`}
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        {day}
                      </button>
                    );
                  }
                )}
              </div>
            </FormRow>
          </div>
        </div>
      </div>
    </div>
  );
}