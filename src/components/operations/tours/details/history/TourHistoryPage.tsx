"use client";

import React, { useEffect } from "react";
import { useTourHistoryStore } from "@/store/operations/tour-history.store";
import { Loader2, TrendingUp, Users, Calendar, Star, IndianRupee, Eye, Heart, Share2 } from "lucide-react";
import dayjs from "dayjs";

interface TourHistoryPageProps {
    tourId: string;
}

export default function TourHistoryPage({ tourId }: TourHistoryPageProps) {
    const { data, isLoading, error, fetchHistory, clear } = useTourHistoryStore();

    useEffect(() => {
        fetchHistory(tourId);
        return () => clear();
    }, [tourId, fetchHistory, clear]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Error loading history: {error}
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { aggregate, runs } = data;

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900">Tour History & Analytics</h1>

            {/* Aggregate Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Runs" 
                    value={aggregate.totalRuns} 
                    icon={<Calendar className="w-5 h-5 text-blue-500" />} 
                />
                <StatCard 
                    title="Total Bookings" 
                    value={aggregate.totalBookingsAllRuns} 
                    icon={<Users className="w-5 h-5 text-green-500" />} 
                />
                <StatCard 
                    title="Avg Occupancy" 
                    value={`${aggregate.averageOccupancyRate}%`} 
                    icon={<TrendingUp className="w-5 h-5 text-purple-500" />} 
                />
                <StatCard 
                    title="Overall Rating" 
                    value={`${aggregate.overallAverageRating} / 5`} 
                    icon={<Star className="w-5 h-5 text-yellow-500" />} 
                    subtitle={`${aggregate.totalReviewsAllRuns} reviews`}
                />
                <StatCard 
                    title="Total Views" 
                    value={aggregate.totalViewsAllRuns} 
                    icon={<Eye className="w-5 h-5 text-indigo-500" />} 
                />
                <StatCard 
                    title="Total Likes" 
                    value={aggregate.totalLikesAllRuns} 
                    icon={<Heart className="w-5 h-5 text-pink-500" />} 
                />
                <StatCard 
                    title="Total Shares" 
                    value={aggregate.totalSharesAllRuns} 
                    icon={<Share2 className="w-5 h-5 text-teal-500" />} 
                />
                {aggregate.totalRevenueAllRuns !== undefined && (
                    <StatCard 
                        title="Total Revenue" 
                        value={`BDT ${aggregate.totalRevenueAllRuns.toLocaleString()}`} 
                        icon={<IndianRupee className="w-5 h-5 text-emerald-600" />} 
                    />
                )}
            </div>

            {/* Monthly Revenue Section (Only visible to GUIDE roles due to API response) */}
            {aggregate.monthlyRevenue && aggregate.monthlyRevenue.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {aggregate.monthlyRevenue.map((mr) => (
                            <div key={mr.month} className="border rounded-md p-4 bg-gray-50">
                                <div className="text-sm text-gray-500 font-medium">{mr.month}</div>
                                <div className="text-xl font-bold text-gray-900 mt-1">
                                    BDT {mr.revenue.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Runs List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Tour Runs</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings / Seats</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                                {aggregate.totalRevenueAllRuns !== undefined && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {runs.map((run) => (
                                <tr key={run.analyticsId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {run.departure?.date ? dayjs(run.departure.date).format("DD MMM, YYYY") : dayjs(run.createdAt).format("DD MMM, YYYY")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {run.bookingStats.seatsBooked} / {run.bookingStats.seatsTotal}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            run.bookingStats.occupancyRate > 80 ? 'bg-green-100 text-green-800' :
                                            run.bookingStats.occupancyRate > 50 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {run.bookingStats.occupancyRate}%
                                        </span>
                                    </td>
                                    {run.bookingStats.totalRevenue !== undefined && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                            BDT {run.bookingStats.totalRevenue.toLocaleString()}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                            <span>{run.reviewSummary.averageRating}</span>
                                            <span className="text-gray-400 ml-1">({run.reviewSummary.totalReviews})</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: React.ReactNode; icon: React.ReactNode; subtitle?: string }) {
    return (
        <div className="bg-white rounded-lg shadow p-5 flex items-start">
            <div className="flex-shrink-0 p-3 bg-gray-50 rounded-md">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
                {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
            </div>
        </div>
    );
}
