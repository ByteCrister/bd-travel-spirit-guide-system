// components/ui/EmployeeDetailSkeleton.tsx
"use client";

export default function EmployeeDetailSkeleton() {
  const neumorphCard = "bg-[#E7E5E4] rounded-2xl ";
  const neumorphRaised = " bg-[#E7E5E4]";
  const placeholderBlock = "bg-[#C6C4C3] rounded-lg animate-pulse";

  return (
    <div className="min-h-screen bg-[#E7E5E4]">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className={`h-4 w-20 ${placeholderBlock}`}></div>
              {i < 2 && <div className="mx-2 text-[#C6C4C3]">/</div>}
            </div>
          ))}
        </div>

        {/* Header Card Skeleton */}
        <div className={`${neumorphCard} overflow-hidden`}>
          <div className="px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div
                  className={`w-20 h-20 rounded-2xl border-2 border-[#C6C4C3] ${placeholderBlock}`}
                />
                <div>
                  <div className={`h-8 w-48 ${placeholderBlock} mb-3`}></div>
                  <div className={`h-6 w-24 ${placeholderBlock} rounded-full`}></div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`h-10 w-32 ${neumorphRaised} rounded-lg`}></div>
                <div className={`h-10 w-24 ${neumorphRaised} rounded-lg`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className={`${neumorphCard} p-2`}>
          <div className="grid grid-cols-3 lg:grid-cols-10 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-10 ${neumorphRaised} rounded-lg`}></div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Personal Information & Employment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${neumorphCard} p-6`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-5 w-5 rounded-full ${placeholderBlock}`}></div>
                <div className={`h-6 w-40 ${placeholderBlock}`}></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className={`h-4 w-24 ${placeholderBlock}`}></div>
                    <div className={`h-10 w-full ${placeholderBlock}`}></div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg border border-[#C6C4C3]">
                <div className={`h-5 w-32 ${placeholderBlock} mb-3`}></div>
                <div className="flex items-center gap-3">
                  <div className={`h-10 flex-1 ${placeholderBlock}`}></div>
                  <div className={`h-10 w-24 ${placeholderBlock}`}></div>
                </div>
              </div>
            </div>

            <div className={`${neumorphCard} p-6`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-5 w-5 rounded-full ${placeholderBlock}`}></div>
                <div className={`h-6 w-32 ${placeholderBlock}`}></div>
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className={`h-4 w-32 ${placeholderBlock}`}></div>
                    <div className={`h-10 w-full ${placeholderBlock}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compensation & Important Dates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${neumorphCard} p-6`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-5 w-5 rounded-full ${placeholderBlock}`}></div>
                <div className={`h-6 w-32 ${placeholderBlock}`}></div>
              </div>
              <div className="space-y-4">
                <div className="p-6 text-center rounded-lg border border-[#C6C4C3]">
                  <div className={`h-4 w-32 ${placeholderBlock} mx-auto mb-2`}></div>
                  <div className={`h-12 w-48 ${placeholderBlock} mx-auto mb-2`}></div>
                  <div className={`h-6 w-16 ${placeholderBlock} mx-auto`}></div>
                </div>
                <div className="pt-4 border-t border-[#C6C4C3]">
                  <div className="space-y-2">
                    <div className={`h-4 w-32 ${placeholderBlock}`}></div>
                    <div className={`h-6 w-40 ${placeholderBlock}`}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${neumorphCard} p-6`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-5 w-5 rounded-full ${placeholderBlock}`}></div>
                <div className={`h-6 w-40 ${placeholderBlock}`}></div>
              </div>
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[#C6C4C3]">
                    <div className="mt-1 p-2 rounded-full bg-[#C6C4C3]">
                      <div className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 w-24 ${placeholderBlock}`}></div>
                      <div className={`h-5 w-32 ${placeholderBlock}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}