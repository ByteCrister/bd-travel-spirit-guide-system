'use client';

export default function LoadingUpdateTourContainer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs Skeleton */}
        <div className="pb-3.5">
          <div className="flex items-center space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                {i < 3 && <div className="mx-2 text-slate-300">/</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Header Section Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
            <div>
              <div className="h-8 bg-slate-200 rounded w-64 animate-pulse mb-2" />
              <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
            </div>
          </div>

          {/* Progress Bar Skeleton */}
          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-1/4" />
          </div>
          <div className="flex justify-between mt-2 px-1">
            <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
          </div>
        </div>

        {/* Main Card Skeleton */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-blue-100/50">
          {/* Custom Stepper Skeleton */}
          <div className="bg-white p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              {[...Array(7)].map((_, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
                    <div className="mt-2 h-3 bg-slate-200 rounded w-12 animate-pulse hidden lg:block" />
                  </div>
                  {index < 6 && (
                    <div className="flex-1 h-1 mx-2 bg-slate-200 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content Skeleton */}
          <div className="p-6 lg:p-8 bg-gradient-to-br from-white to-slate-50">
            {/* Hero Image Section Skeleton */}
            <div className="mb-6">
              <div className="border-slate-200 shadow-sm rounded-lg overflow-hidden">
                <div className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-slate-200 rounded w-24 animate-pulse" />
                    <div className="h-10 bg-slate-200 rounded w-32 animate-pulse" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Image Preview Skeleton */}
                    <div className="w-full md:w-56 h-56 rounded-xl bg-slate-200 animate-pulse" />
                    
                    {/* Action Buttons & Info Skeleton */}
                    <div className="flex-1 space-y-5 w-full">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="h-10 bg-slate-200 rounded w-32 animate-pulse" />
                        <div className="h-10 bg-slate-200 rounded w-24 animate-pulse" />
                      </div>
                      
                      {/* Guidelines Skeleton */}
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images Section Skeleton */}
            <div className="mb-6">
              <div className="border-slate-200 shadow-sm rounded-lg overflow-hidden">
                <div className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse" />
                      <div className="h-6 bg-slate-200 rounded w-40 animate-pulse" />
                    </div>
                    <div className="ml-12 h-4 bg-slate-200 rounded w-24 animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-slate-200 rounded w-28 animate-pulse" />
                    <div className="h-10 bg-slate-200 rounded w-28 animate-pulse" />
                    <div className="h-10 bg-slate-200 rounded w-24 animate-pulse" />
                  </div>
                </div>
                <div className="p-6">
                  {/* Gallery Grid Skeleton */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {[...Array(8)].map((_, index) => (
                      <div
                        key={index}
                        className="relative group h-32 rounded-lg bg-slate-200 animate-pulse"
                      />
                    ))}
                  </div>

                  {/* Guidelines Skeleton */}
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info Form Skeleton */}
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-32 animate-pulse" />
                  <div className="h-12 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons Skeleton */}
          <div className="p-6 bg-white border-t border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div className="h-12 bg-slate-200 rounded-xl w-24 animate-pulse" />
              <div className="h-12 bg-blue-600 rounded-xl w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}