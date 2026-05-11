"use client";

import { FieldArray, useFormikContext } from "formik";
import {
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { TRANSPORT_MODE, CURRENCY, DISTRICT } from "@/constants/tour/tour.const";
import { useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Map,
  Navigation,
  Package,
  Users,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
} from "lucide-react";
import { MapPickerDialog } from "@/components/global/MapPickerDialog";
import { ComboBox } from "@/components/ui/combobox";

export default function LogisticsStep() {
  const { values, setFieldValue } =
    useFormikContext<CreateTourDTO>();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  // Validate coordinates when they change
  const validateCoordinates = (lat: number, lng: number): boolean => {
    if (isNaN(lat) || isNaN(lng)) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // Update form values when map selection is made
  const handleMapSelect = (lat: number, lng: number) => {
    if (validateCoordinates(lat, lng)) {
      setFieldValue("mainLocation.coordinates.lat", lat);
      setFieldValue("mainLocation.coordinates.lng", lng);
    }
  };


  // Check if current coordinates are valid
  const currentCoordsValid = validateCoordinates(
    values.mainLocation?.coordinates?.lat || 0,
    values.mainLocation?.coordinates?.lng || 0
  );

  // Get initial position for map dialog
  const getInitialPosition = (): [number, number] | undefined => {
    const lat = values.mainLocation?.coordinates?.lat;
    const lng = values.mainLocation?.coordinates?.lng;

    if (lat && lng && validateCoordinates(lat, lng)) {
      return [lat, lng];
    }
    return undefined;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ mb: 4 }}>
        <motion.div variants={itemVariants}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Navigation className="w-6 h-6 text-white" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                Logistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure transport, location details, and packing requirements
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        {/* Main Location */}
        <Grid size={12}>
          <motion.div variants={itemVariants}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin className="w-4 h-4 text-white" />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Main Location
              </Typography>
            </Box>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Building2 className="w-4 h-4 text-primary" />
                    <Typography variant="subtitle2" fontWeight="600">
                      Address
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Line 1"
                    value={values.mainLocation?.address?.line1 || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "mainLocation.address.line1",
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Line 2"
                    value={values.mainLocation?.address?.line2 || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "mainLocation.address.line2",
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="City"
                    value={values.mainLocation?.address?.city || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "mainLocation.address.city",
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">District</label>

                    <ComboBox
                      value={values.mainLocation?.address?.district || ""}
                      placeholder="Select District"
                      options={Object.values(DISTRICT).map((district) => ({
                        label: district,
                        value: district,
                      }))}
                      onChange={(value) =>
                        setFieldValue("mainLocation.address.district", value)
                      }
                    />
                  </div>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Region"
                    value={values.mainLocation?.address?.region || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "mainLocation.address.region",
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Postal Code"
                    value={values.mainLocation?.address?.postalCode || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "mainLocation.address.postalCode",
                        e.target.value
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Map className="w-4 h-4 text-primary" />
                    <Typography variant="subtitle2" fontWeight="600" sx={{ flex: 1 }}>
                      Coordinates (Optional)
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MapPin className="w-4 h-4" />}
                      onClick={() => setMapDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                    >
                      Pick on Map
                    </Button>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Latitude"
                    error={
                      Boolean(values.mainLocation?.coordinates?.lat) &&
                      !validateCoordinates(
                        values.mainLocation?.coordinates?.lat || 0,
                        values.mainLocation?.coordinates?.lng || 0
                      )
                    }
                    helperText={
                      values.mainLocation?.coordinates?.lat &&
                        (values.mainLocation.coordinates.lat < -90 ||
                          values.mainLocation.coordinates.lat > 90)
                        ? "Latitude must be between -90 and 90"
                        : ""
                    }
                    inputProps={{
                      step: "any",
                      min: -90,
                      max: 90,
                    }}
                    value={values.mainLocation?.coordinates?.lat || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      setFieldValue(
                        "mainLocation.coordinates.lat",
                        value
                      );
                    }}
                    placeholder="e.g., 23.8103"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Longitude"
                    error={
                      Boolean(values.mainLocation?.coordinates?.lng) &&
                      !validateCoordinates(
                        values.mainLocation?.coordinates?.lat || 0,
                        values.mainLocation?.coordinates?.lng || 0
                      )
                    }
                    helperText={
                      values.mainLocation?.coordinates?.lng &&
                        (values.mainLocation.coordinates.lng < -180 ||
                          values.mainLocation.coordinates.lng > 180)
                        ? "Longitude must be between -180 and 180"
                        : ""
                    }
                    inputProps={{
                      step: "any",
                      min: -180,
                      max: 180,
                    }}
                    value={values.mainLocation?.coordinates?.lng || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      setFieldValue(
                        "mainLocation.coordinates.lng",
                        value
                      );
                    }}
                    placeholder="e.g., 90.4125"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                {/* Coordinate Status Display */}
                <AnimatePresence>
                  {currentCoordsValid && (
                    <Grid size={12}>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "rgba(76, 175, 80, 0.1)",
                            border: "1px solid",
                            borderColor: "success.light",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-success" />
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              Valid coordinates
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {values.mainLocation?.coordinates?.lat?.toFixed(6)}, {values.mainLocation?.coordinates?.lng?.toFixed(6)}
                            </Typography>
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  )}

                  {values.mainLocation?.coordinates?.lat !== undefined &&
                    values.mainLocation?.coordinates?.lng !== undefined &&
                    !currentCoordsValid && (
                      <Grid size={12}>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: "rgba(244, 67, 54, 0.1)",
                              border: "1px solid",
                              borderColor: "error.light",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <AlertCircle className="w-5 h-5 text-error" />
                            <Typography variant="body2" color="error.main">
                              Invalid coordinates. Please enter valid values or use the map picker.
                            </Typography>
                          </Paper>
                        </motion.div>
                      </Grid>
                    )}
                </AnimatePresence>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        {/* Transport Modes */}
        <Grid size={12}>
          <motion.div variants={itemVariants}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Truck className="w-4 h-4 text-white" />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Transport Modes
              </Typography>
            </Box>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                },
              }}
            >
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 500 }}>Select Transport Modes</InputLabel>
                <Select
                  multiple
                  value={values.transportModes || []}
                  label="Select Transport Modes"
                  onChange={(e) =>
                    setFieldValue("transportModes", e.target.value)
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", py: 0.5 }}>
                      {selected.map((v) => (
                        <Chip
                          key={v}
                          label={v.replace("_", " ")}
                          size="small"
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 28,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  {Object.values(TRANSPORT_MODE).map((mode) => (
                    <MenuItem
                      key={mode}
                      value={mode}
                      sx={{
                        borderRadius: 1.5,
                        my: 0.5,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <Checkbox
                        checked={values.transportModes?.includes(mode)}
                        sx={{
                          color: "primary.main",
                          "&.Mui-checked": {
                            color: "primary.main",
                          },
                        }}
                      />
                      {mode.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </motion.div>
        </Grid>

        {/* Pickup Options */}
        <Grid size={12}>
          <motion.div variants={itemVariants}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users className="w-4 h-4 text-white" />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Pickup Options
              </Typography>
            </Box>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
              }}
            >
              <FieldArray name="pickupOptions">
                {({ push, remove }) => (
                  <Box>
                    <TableContainer
                      component={Paper}
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "action.hover" }}>
                            <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Currency</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <AnimatePresence mode="popLayout">
                            {values.pickupOptions?.map((opt, i) => (
                              <TableRow
                                key={i}
                                component={motion.tr}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                              >
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={opt.city}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `pickupOptions[${i}].city`,
                                        e.target.value
                                      )
                                    }
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 1.5,
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    fullWidth
                                    value={opt.price}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `pickupOptions[${i}].price`,
                                        Number(e.target.value)
                                      )
                                    }
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 1.5,
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormControl fullWidth size="small">
                                    <Select
                                      value={opt.currency}
                                      onChange={(e) =>
                                        setFieldValue(
                                          `pickupOptions[${i}].currency`,
                                          e.target.value
                                        )
                                      }
                                      sx={{
                                        borderRadius: 1.5,
                                      }}
                                    >
                                      {Object.values(CURRENCY).map((c) => (
                                        <MenuItem key={c} value={c}>
                                          {c}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => remove(i)}
                                    sx={{
                                      borderRadius: 1.5,
                                      "&:hover": {
                                        backgroundColor: "error.light",
                                        color: "error.dark",
                                      },
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Button
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                      startIcon={<Plus className="w-4 h-4" />}
                      variant="outlined"
                      onClick={() =>
                        push({ city: "", price: 0, currency: CURRENCY.BDT })
                      }
                    >
                      Add Pickup Option
                    </Button>
                  </Box>
                )}
              </FieldArray>
            </Paper>
          </motion.div>
        </Grid>

        {/* Meeting Point */}
        <Grid size={12}>
          <motion.div variants={itemVariants}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin className="w-4 h-4 text-white" />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Meeting Point
              </Typography>
            </Box>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                },
              }}
            >
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Meeting Point Description"
                value={values.meetingPoint || ""}
                onChange={(e) =>
                  setFieldValue("meetingPoint", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Paper>
          </motion.div>
        </Grid>

        {/* Packing List */}
        <Grid size={12}>
          <motion.div variants={itemVariants}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package className="w-4 h-4 text-white" />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Packing List
              </Typography>
            </Box>
          </motion.div>
          <motion.div variants={itemVariants}>
            <FieldArray name="packingList">
              {({ push, remove }) => (
                <Box>
                  <AnimatePresence mode="popLayout">
                    {values.packingList?.map((item, i) => (
                      <motion.div
                        key={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            mb: 2,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              borderColor: "primary.main",
                            },
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Item *"
                                value={item.item}
                                onChange={(e) =>
                                  setFieldValue(
                                    `packingList[${i}].item`,
                                    e.target.value
                                  )
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                  },
                                }}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Notes"
                                value={item.notes || ""}
                                onChange={(e) =>
                                  setFieldValue(
                                    `packingList[${i}].notes`,
                                    e.target.value
                                  )
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                  },
                                }}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  height: "100%",
                                  justifyContent: { xs: "flex-start", sm: "center" },
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={item.required}
                                      onChange={(e) =>
                                        setFieldValue(
                                          `packingList[${i}].required`,
                                          e.target.checked
                                        )
                                      }
                                      sx={{
                                        color: "primary.main",
                                        "&.Mui-checked": {
                                          color: "primary.main",
                                        },
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography variant="body2" fontWeight={500}>
                                      Required
                                    </Typography>
                                  }
                                />
                              </Box>
                            </Grid>

                            <Grid size={12} sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => remove(i)}
                                sx={{
                                  borderRadius: 1.5,
                                  "&:hover": {
                                    backgroundColor: "error.light",
                                    color: "error.dark",
                                  },
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Paper>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button
                    startIcon={<Plus className="w-4 h-4" />}
                    variant="outlined"
                    onClick={() =>
                      push({ item: "", required: true, notes: "" })
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    Add Packing Item
                  </Button>
                </Box>
              )}
            </FieldArray>
          </motion.div>
        </Grid>
      </Grid>

      {/* Map Picker Dialog */}
      <MapPickerDialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        onSelect={handleMapSelect}
        initialPosition={getInitialPosition()}
      />
    </motion.div>
  );
}