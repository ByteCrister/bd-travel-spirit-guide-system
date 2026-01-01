"use client";

import { Field, FieldArray, useFormikContext } from "formik";
import { CreateTourDTO } from "@/types/tour.types";
import { useState } from "react";
import HeroAndGalleryUpload from "./ImageUpload/HeroAndGalleryUpload";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus, FiTag, FiSearch } from "react-icons/fi";
import { HiOutlineTag } from "react-icons/hi";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BasicInfoStep() {
  const { values, errors, touched } = useFormikContext<CreateTourDTO>();
  const [tagInput, setTagInput] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Basic Information
        </h2>
        <p className="text-sm text-gray-600">
          Provide essential details about your tour package. Fields marked with * are required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Tour Title *
          </Label>
          <Field
            as={Input}
            id="title"
            name="title"
            placeholder="Enter tour title"
            className={`${touched.title && errors.title ? "border-red-500" : ""}`}
          />
          {touched.title && errors.title && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600"
            >
              {errors.title}
            </motion.p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <Label htmlFor="summary" className="text-sm font-medium">
            Tour Summary *
          </Label>
          <Field
            as={Textarea}
            id="summary"
            name="summary"
            placeholder="Brief description of your tour"
            rows={4}
            className={`resize-none ${touched.summary && errors.summary ? "border-red-500" : ""}`}
          />
          {touched.summary && errors.summary && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600"
            >
              {errors.summary}
            </motion.p>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tour Images</Label>
          <HeroAndGalleryUpload
            heroImageError={touched.heroImage ? (errors.heroImage as string) : undefined}
            galleryError={touched.gallery ? (errors.gallery as string) : undefined}
          />
        </div>

        {/* SEO Section */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FiSearch className="h-4 w-4 text-gray-700" />
              <CardTitle className="text-lg font-medium">SEO Information</CardTitle>
            </div>
            <CardDescription>
              Optimize your tour for search engines
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-sm font-medium">
                Meta Title
              </Label>
              <Field
                as={Input}
                id="metaTitle"
                name="seo.metaTitle"
                placeholder="Enter meta title for search engines"
              />
              <p className="text-xs text-gray-500">
                Recommended: 50–60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription" className="text-sm font-medium">
                Meta Description
              </Label>
              <Field
                as={Textarea}
                id="metaDescription"
                name="seo.metaDescription"
                placeholder="Enter meta description for search engines"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Recommended: 150–160 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tags Section */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <HiOutlineTag className="h-4 w-4 text-gray-700" />
              <CardTitle className="text-lg font-medium">Tour Tags</CardTitle>
            </div>
            <CardDescription>
              Add relevant tags to help users find your tour
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <FieldArray name="tags">
              {({ push, remove }) => (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag (max 20 characters)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = tagInput.trim();
                          if (value && !values.tags?.includes(value) && value.length <= 20) {
                            push(value);
                            setTagInput("");
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const value = tagInput.trim();
                          if (value && !values.tags?.includes(value) && value.length <= 20) {
                            push(value);
                            setTagInput("");
                          }
                        }}
                        className="border-gray-300"
                      >
                        <FiPlus className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>

                  {values.tags && values.tags.length > 0 && (
                    <motion.div
                      layout
                      className="flex flex-wrap gap-2 pt-2"
                    >
                      <AnimatePresence>
                        {values.tags?.map((tag, index) => (
                          <motion.div
                            key={`${tag}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            layout
                          >
                            <Badge
                              variant="secondary"
                              className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <FiTag className="h-3 w-3" />
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="ml-1.5 rounded-full hover:bg-gray-300 p-0.5"
                                >
                                  <span className="sr-only">Remove</span>
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              )}
            </FieldArray>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}