// components/ui/ShiftEditor.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DayOfWeek, ShiftDTO } from "@/types/employee/employee.types";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import FormRow from "./FormRow";
import { Input } from "@/components/ui/input";

export default function ShiftEditor({
  shifts,
  onChange,
}: {
  shifts: ShiftDTO[];
  onChange: (next: ShiftDTO[] | undefined) => void;
}) {
  const add = () =>
    onChange([
      ...shifts,
      { startTime: "09:00", endTime: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    ]);

  const update = (idx: number, patch: Partial<ShiftDTO>) =>
    onChange(shifts.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const remove = (idx: number) => onChange(shifts.filter((_, i) => i !== idx));

  const neumorphCard = "bg-[#E7E5E4] rounded-xl shadow-[8px_8px_16px_#C6C4C3,-8px_-8px_16px_#ffffff]";
  const neumorphButtonBase =
    "bg-[#E7E5E4] shadow-[4px_4px_8px_#C6C4C3,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#C6C4C3,-2px_-2px_4px_#ffffff] active:shadow-[inset_4px_4px_8px_#C6C4C3,inset_-4px_-4px_8px_#ffffff] transition-shadow focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#006666]";
  const neumorphInput =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#C6C4C3,inset_-2px_-2px_4px_#ffffff] rounded-lg px-3 py-2 focus-visible:shadow-[inset_2px_2px_4px_#C6C4C3,inset_-2px_-2px_4px_#ffffff,0_0_0_2px_#006666] outline-none transition-shadow";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p
          className="text-sm text-[#1E2938]"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          Configure employee work schedules
        </p>
        <button
          onClick={add}
          className={`${neumorphButtonBase} px-4 py-2 rounded-lg flex items-center`}
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </button>
      </div>

      {shifts.length === 0 ? (
        <div className={`${neumorphCard} text-center py-12 text-[#1E2938]`}>
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p style={{ fontFamily: "var(--font-space-mono)" }}>No shifts assigned yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map((s, idx) => (
            <div key={idx} className={`${neumorphCard} p-5`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full ${neumorphButtonBase} flex items-center justify-center text-[#006666] font-semibold text-sm`}
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className="font-medium text-[#1E2938]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    Shift {idx + 1}
                  </span>
                </div>
                <button
                  onClick={() => remove(idx)}
                  className={`${neumorphButtonBase} w-8 h-8 rounded-full flex items-center justify-center text-[#FF2157] hover:text-[#FF2157]`}
                  aria-label="Delete shift"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormRow label="Start Time" icon={Clock}>
                  <input
                    type="time"
                    value={s.startTime}
                    onChange={(e) => update(idx, { startTime: e.target.value })}
                    className={`${neumorphInput} w-full`}
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  />
                </FormRow>

                <FormRow label="End Time" icon={Clock}>
                  <input
                    type="time"
                    value={s.endTime}
                    onChange={(e) => update(idx, { endTime: e.target.value })}
                    className={`${neumorphInput} w-full`}
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  />
                </FormRow>

                <div className="col-span-1 md:col-span-2">
                  <FormRow label="Working Days" icon={Calendar}>
                    <div className="flex flex-wrap gap-2">
                      {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as DayOfWeek[]).map(
                        (day) => {
                          const isSelected = s.days.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const days = isSelected
                                  ? s.days.filter((d) => d !== day)
                                  : [...s.days, day];
                                update(idx, { days });
                              }}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-shadow ${
                                isSelected
                                  ? "shadow-[inset_2px_2px_4px_#C6C4C3,inset_-2px_-2px_4px_#ffffff] bg-[#E7E5E4] text-[#006666]"
                                  : "shadow-[4px_4px_8px_#C6C4C3,-4px_-4px_8px_#ffffff] bg-[#E7E5E4] text-[#1E2938] hover:shadow-[2px_2px_4px_#C6C4C3,-2px_-2px_4px_#ffffff]"
                              } focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#006666]`}
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
          ))}
        </div>
      )}
    </div>
  );
}