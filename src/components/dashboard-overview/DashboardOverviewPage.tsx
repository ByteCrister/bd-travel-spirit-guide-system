// src/components/dashboard-overview/DashboardOverviewPage.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useGuideOverviewStore } from "@/store/useGuideOverviewStore";
import OverviewHeader from "./OverviewHeader";
import StatsCards from "./StatsCards";
import EditableField from "./EditableField";
import DocumentsList from "./DocumentsList";
import SubscriptionsPanel from "./SubscriptionsPanel";
import OwnerCard from "./OwnerCard";
import SaveBar from "./SaveBar";
import LoadingSkeleton from "./LoadingSkeleton";
import SocialLinks from "./SocialLinks";
import ScrollToTopButton from "./ScrollToTopButton";
import CurrentSubscriptionCard from "./CurrentSubscriptionCard";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardOverviewPage() {
  const { load, draft, loading, error } = useGuideOverviewStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !draft) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <motion.div
        ref={containerRef}
        className="container mx-auto max-w-7xl space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <OverviewHeader
            companyName={draft.companyName}
            status={draft.status}
            isActive={draft.isActive}
            isSuspended={draft.isSuspended}
            hasActiveSubscription={draft.hasActiveSubscription}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <SaveBar />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCards aggregates={draft.aggregates} />
        </motion.div>

        <motion.section
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          <motion.div className="lg:col-span-2 space-y-6" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <EditableField
                    label="Company name"
                    value={draft.companyName.value}
                    dirty={!!draft.companyName.dirty}
                    onChange={(v) =>
                      useGuideOverviewStore.getState().patchField("companyName", { value: v })
                    }
                    onBlur={() => useGuideOverviewStore.getState().markDirty("companyName")}
                  />
                  <EditableField
                    label="Bio"
                    value={draft.bio.value ?? ""}
                    multiline
                    onChange={(v) => useGuideOverviewStore.getState().patchField("bio", { value: v })}
                    onBlur={() => useGuideOverviewStore.getState().markDirty("bio")}
                  />

                  {/* Edit social links of the company  */}
                  <SocialLinks draft={draft} />

                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentsList documents={draft.documents.value} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    Subscription History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SubscriptionsPanel />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.aside className="space-y-6" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <OwnerCard />
            </motion.div>
            <motion.div variants={itemVariants}>
            <CurrentSubscriptionCard />
            </motion.div>
          </motion.aside>
        </motion.section>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </motion.div>
      {/* Scroll to Top Button */}
      <ScrollToTopButton containerRef={containerRef} />
    </>
  );
}
