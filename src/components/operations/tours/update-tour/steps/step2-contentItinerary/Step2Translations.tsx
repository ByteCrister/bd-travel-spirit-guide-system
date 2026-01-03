"use client";

import { useFormikContext } from 'formik';
import { motion } from 'framer-motion';
import { Languages, Globe, Type, FileText, AlignLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UpdateTourContentItineraryDTO } from '@/types/tour.types';

const Step2Translations = () => {
  const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();

  const handleTranslationChange = (
    language: 'bn' | 'en',
    field: 'title' | 'summary' | 'description',
    value: string
  ) => {
    const translations = { ...values.translations };
    
    if (!translations[language]) {
      translations[language] = { title: '', summary: '', description: '' };
    }
    
    translations[language] = {
      ...translations[language],
      [field]: value
    };
    
    setFieldValue('translations', translations);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="translations" className="border rounded-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-sm">
        <AccordionTrigger className="px-6 py-4 hover:no-underline group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Languages className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">Translations</span>
              <Badge variant="secondary" className="text-xs">
                Multilingual
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pt-4"
          >
            {/* Bengali Section */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Bengali
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">বাংলা</p>
                </div>
              </div>
              
              <div className="space-y-4 pl-2">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="title-bn" className="flex items-center gap-2 text-sm font-medium">
                    <Type className="w-4 h-4 text-slate-500" />
                    Title
                  </Label>
                  <Input
                    id="title-bn"
                    value={values.translations?.bn?.title || ''}
                    onChange={(e) => handleTranslationChange('bn', 'title', e.target.value)}
                    placeholder="শিরোনাম লিখুন"
                    className="transition-all focus:ring-2 focus:ring-emerald-500/20 border-slate-200 dark:border-slate-700"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="summary-bn" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Summary
                  </Label>
                  <Textarea
                    id="summary-bn"
                    value={values.translations?.bn?.summary || ''}
                    onChange={(e) => handleTranslationChange('bn', 'summary', e.target.value)}
                    placeholder="সংক্ষিপ্ত বিবরণ লিখুন"
                    rows={3}
                    className="transition-all focus:ring-2 focus:ring-emerald-500/20 border-slate-200 dark:border-slate-700 resize-none"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="description-bn" className="flex items-center gap-2 text-sm font-medium">
                    <AlignLeft className="w-4 h-4 text-slate-500" />
                    Description
                  </Label>
                  <Textarea
                    id="description-bn"
                    value={values.translations?.bn?.description || ''}
                    onChange={(e) => handleTranslationChange('bn', 'description', e.target.value)}
                    placeholder="বিস্তারিত বিবরণ লিখুন"
                    rows={6}
                    className="transition-all focus:ring-2 focus:ring-emerald-500/20 border-slate-200 dark:border-slate-700 resize-none"
                  />
                </motion.div>
              </div>
            </motion.div>

            <Separator className="my-6" />

            {/* English Section */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    English
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">EN</p>
                </div>
              </div>

              <div className="space-y-4 pl-2">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="title-en" className="flex items-center gap-2 text-sm font-medium">
                    <Type className="w-4 h-4 text-slate-500" />
                    Title
                  </Label>
                  <Input
                    id="title-en"
                    value={values.translations?.en?.title || ''}
                    onChange={(e) => handleTranslationChange('en', 'title', e.target.value)}
                    placeholder="Enter title in English"
                    className="transition-all focus:ring-2 focus:ring-blue-500/20 border-slate-200 dark:border-slate-700"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="summary-en" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Summary
                  </Label>
                  <Textarea
                    id="summary-en"
                    value={values.translations?.en?.summary || ''}
                    onChange={(e) => handleTranslationChange('en', 'summary', e.target.value)}
                    placeholder="Enter summary in English"
                    rows={3}
                    className="transition-all focus:ring-2 focus:ring-blue-500/20 border-slate-200 dark:border-slate-700 resize-none"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="description-en" className="flex items-center gap-2 text-sm font-medium">
                    <AlignLeft className="w-4 h-4 text-slate-500" />
                    Description
                  </Label>
                  <Textarea
                    id="description-en"
                    value={values.translations?.en?.description || ''}
                    onChange={(e) => handleTranslationChange('en', 'description', e.target.value)}
                    placeholder="Enter description in English"
                    rows={6}
                    className="transition-all focus:ring-2 focus:ring-blue-500/20 border-slate-200 dark:border-slate-700 resize-none"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Step2Translations;