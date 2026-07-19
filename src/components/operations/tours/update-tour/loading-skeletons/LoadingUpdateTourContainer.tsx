'use client';

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE = 'bg-[#E7E5E4]';
const NEU_SURFACE_RAISED = 'bg-[#E7E5E4] ';
const NEU_CARD = 'rounded-2xl bg-[#E7E5E4]  border border-white/60';
const NEU_SURFACE_INSET = 'bg-[#E7E5E4] ';
const NEU_SKELETON = 'rounded-lg bg-[#d0cecd] animate-pulse';
const NEU_DIVIDER = 'border-[#1E2938]/10';
const NEU_PAGE_BG = 'min-h-screen bg-[#E7E5E4]';
// ─────────────────────────────────────────────────────────────

export default function LoadingUpdateTourContainer() {
  return (
    <div className={`${NEU_PAGE_BG} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Breadcrumbs Skeleton ── */}
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`${NEU_SKELETON} h-4 w-16`} />
              {i < 3 && <span className="text-[#1E2938]/20 text-sm">/</span>}
            </div>
          ))}
        </div>

        {/* ── Header Skeleton ── */}
        <div className={`${NEU_CARD} p-6`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`${NEU_SKELETON} w-12 h-12 rounded-2xl`} />
            <div className="space-y-2 flex-1">
              <div className={`${NEU_SKELETON} h-7 w-64`} />
              <div className={`${NEU_SKELETON} h-4 w-48`} />
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`${NEU_SURFACE_INSET} rounded-full h-2.5 overflow-hidden`}>
            <div className="h-full w-1/4 bg-[#006666]/30 rounded-full animate-pulse" />
          </div>
          <div className="flex justify-between mt-2">
            <div className={`${NEU_SKELETON} h-3.5 w-20`} />
            <div className={`${NEU_SKELETON} h-3.5 w-16`} />
          </div>
        </div>

        {/* ── Main Card Skeleton ── */}
        <div className={`${NEU_CARD} overflow-hidden`}>

          {/* Custom Stepper */}
          <div className={`${NEU_SURFACE} px-6 py-5 border-b ${NEU_DIVIDER}`}>
            <div className="flex items-center justify-between">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`${NEU_SKELETON} w-11 h-11 rounded-2xl`} />
                    <div className={`${NEU_SKELETON} mt-2 h-3 w-12 hidden lg:block`} />
                  </div>
                  {i < 6 && (
                    <div className={`flex-1 h-1 mx-2 ${NEU_SKELETON}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className={`${NEU_SURFACE} p-6 lg:p-8 space-y-6`}>

            {/* Hero Image Section */}
            <div className={`${NEU_SURFACE_RAISED} rounded-2xl overflow-hidden`}>
              {/* Section header */}
              <div className={`flex flex-row items-center justify-between border-b ${NEU_DIVIDER} px-6 py-4`}>
                <div className="flex items-center gap-3">
                  <div className={`${NEU_SKELETON} w-9 h-9 rounded-xl`} />
                  <div className={`${NEU_SKELETON} h-5 w-32`} />
                </div>
                <div className="flex gap-2">
                  <div className={`${NEU_SKELETON} h-9 w-24 rounded-xl`} />
                  <div className={`${NEU_SKELETON} h-9 w-32 rounded-xl`} />
                </div>
              </div>
              {/* Section body */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className={`${NEU_SKELETON} w-full md:w-56 h-56 rounded-2xl`} />
                  <div className="flex-1 space-y-5 w-full">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className={`${NEU_SKELETON} h-9 w-32 rounded-xl`} />
                      <div className={`${NEU_SKELETON} h-9 w-24 rounded-xl`} />
                    </div>
                    <div className="space-y-2.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`${NEU_SKELETON} w-1.5 h-1.5 rounded-full`} />
                          <div className={`${NEU_SKELETON} h-3.5 flex-1`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images Section */}
            <div className={`${NEU_SURFACE_RAISED} rounded-2xl overflow-hidden`}>
              {/* Section header */}
              <div className={`flex flex-row items-center justify-between border-b ${NEU_DIVIDER} px-6 py-4`}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className={`${NEU_SKELETON} w-9 h-9 rounded-xl`} />
                    <div className={`${NEU_SKELETON} h-5 w-40`} />
                  </div>
                  <div className={`${NEU_SKELETON} h-3.5 w-24 ml-12`} />
                </div>
                <div className="flex gap-2">
                  <div className={`${NEU_SKELETON} h-9 w-28 rounded-xl`} />
                  <div className={`${NEU_SKELETON} h-9 w-28 rounded-xl`} />
                  <div className={`${NEU_SKELETON} h-9 w-24 rounded-xl`} />
                </div>
              </div>
              {/* Section body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`${NEU_SKELETON} h-32 rounded-xl`} />
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`${NEU_SKELETON} w-1.5 h-1.5 rounded-full`} />
                      <div className={`${NEU_SKELETON} h-3.5 flex-1`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Basic Info Form Skeleton */}
            <div className={`${NEU_SURFACE_RAISED} rounded-2xl p-6 space-y-6`}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className={`${NEU_SKELETON} h-4 w-32`} />
                  <div className={`${NEU_SURFACE_INSET} rounded-xl h-11 animate-pulse`} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className={`${NEU_SURFACE} px-6 py-5 border-t ${NEU_DIVIDER}`}>
            <div className="flex items-center justify-between gap-4">
              <div className={`${NEU_SKELETON} h-11 w-24 rounded-xl`} />
              <div className="h-11 w-32 rounded-xl bg-[#006666]/30 animate-pulse" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}