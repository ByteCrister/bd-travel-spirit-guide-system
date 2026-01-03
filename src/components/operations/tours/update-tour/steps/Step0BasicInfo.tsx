// app/operations/tours/[tourId]/update-tour/components/steps/Step0BasicInfo.tsx
'use client';

import { useFormik } from 'formik';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Autocomplete,
  Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourBasicInfoDTO } from '@/types/tour.types';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { Step0BasicInfoSchema } from '@/utils/validators/add-tour.validator';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FileText, Tag, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ValidationError } from 'yup';

interface Step0BasicInfoProps {
  tourId: string;
  initialData: UpdateTourBasicInfoDTO;
}

export default function Step0BasicInfo({ tourId, initialData }: Step0BasicInfoProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateTourBasicInfoDTO) =>
      tourUpdateService.updateBasicInfo(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
  });

  const formik = useFormik({
    initialValues: {
      title: initialData.title || '',
      summary: initialData.summary || '',
      seo: {
        metaTitle: initialData.seo?.metaTitle || '',
        metaDescription: initialData.seo?.metaDescription || '',
      },
      tags: initialData.tags || [],
    },
    validationSchema: Step0BasicInfoSchema,
    onSubmit: async (values) => {
      try {
        // Validate the form before submission
        await Step0BasicInfoSchema.validate(values, { abortEarly: false });

        // Only submit if validation passes
        mutation.mutate(values);
      } catch (error) {
        // Handle validation errors
        if (error instanceof ValidationError) {
          const errors: { [key: string]: string } = {};
          error.inner.forEach((err) => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });
          formik.setErrors(errors);
        }
      }
    },
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const alertVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'primary.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={20} style={{ color: '#3b82f6' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Basic Information
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <motion.div variants={sectionVariants}>
                <TextField
                  name="title"
                  label="Tour Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'background.paper',
                      }
                    }
                  }}
                />
              </motion.div>

              <motion.div variants={sectionVariants}>
                <TextField
                  name="summary"
                  label="Summary"
                  multiline
                  rows={3}
                  value={formik.values.summary}
                  onChange={formik.handleChange}
                  error={formik.touched.summary && Boolean(formik.errors.summary)}
                  helperText={formik.touched.summary && formik.errors.summary}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'background.paper',
                      }
                    }
                  }}
                />
              </motion.div>

              <motion.div variants={sectionVariants}>
                <Box sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <Search size={18} style={{ color: '#64748b' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      SEO Information
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      name="seo.metaTitle"
                      label="Meta Title"
                      value={formik.values.seo.metaTitle}
                      onChange={formik.handleChange}
                      error={formik.touched.seo?.metaTitle && Boolean(formik.errors.seo?.metaTitle)}
                      helperText={formik.touched.seo?.metaTitle && formik.errors.seo?.metaTitle}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }
                      }}
                    />

                    <TextField
                      name="seo.metaDescription"
                      label="Meta Description"
                      multiline
                      rows={2}
                      value={formik.values.seo.metaDescription}
                      onChange={formik.handleChange}
                      error={formik.touched.seo?.metaDescription && Boolean(formik.errors.seo?.metaDescription)}
                      helperText={formik.touched.seo?.metaDescription && formik.errors.seo?.metaDescription}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </motion.div>

              <motion.div variants={sectionVariants}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Tag size={16} style={{ color: '#64748b' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    Tags
                  </Typography>
                </Box>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formik.values.tags}
                  onChange={(_, value) => formik.setFieldValue('tags', value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option}
                          {...tagProps}
                          sx={{
                            borderRadius: 1.5,
                            bgcolor: 'primary.50',
                            color: 'primary.700',
                            border: '1px solid',
                            borderColor: 'primary.200',
                            '& .MuiChip-deleteIcon': {
                              color: 'primary.500',
                              '&:hover': {
                                color: 'primary.700'
                              }
                            }
                          }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Add tags"
                      error={formik.touched.tags && Boolean(formik.errors.tags)}
                      helperText={formik.touched.tags && formik.errors.tags}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }
                      }}
                    />
                  )}
                />
              </motion.div>

              <AnimatePresence mode="wait">
                {mutation.isError && (
                  <motion.div
                    key="error"
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Alert
                      severity="error"
                      icon={<AlertCircle size={20} />}
                      sx={{
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'error.200',
                        bgcolor: 'error.50'
                      }}
                    >
                      Failed to update basic information
                    </Alert>
                  </motion.div>
                )}

                {mutation.isSuccess && (
                  <motion.div
                    key="success"
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Alert
                      severity="success"
                      icon={<CheckCircle2 size={20} />}
                      sx={{
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'success.200',
                        bgcolor: 'success.50'
                      }}
                    >
                      Basic information updated successfully
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={mutation.isPending}
                    sx={{
                      px: 4,
                      py: 1.25,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      bgcolor: 'primary.main',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      },
                      '&:disabled': {
                        bgcolor: 'action.disabledBackground'
                      }
                    }}
                    startIcon={mutation.isPending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  >
                    {mutation.isPending ? 'Updating...' : 'Update Basic Info'}
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}