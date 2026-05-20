"use client";

import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, FieldArray, FieldProps, FormikErrors, FormikHelpers } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Plus, Trash2, RefreshCw, Upload, File, Image as ImageIcon, X, AlertCircle,
    Loader2, User, Mail, Phone, Calendar, Briefcase, Clock,
    FileText, Shield, Heart, Sparkles, CheckCircle2,
    CreditCard,
    Info
} from "lucide-react";
import Image from "next/image";

import { CreateEmployeeFormValues, createEmployeeValidationSchema } from "@/utils/validators/employee/employee.validator";
import { CreateEmployeePayload, ShiftDTO, DayOfWeek, DocumentDTO } from "@/types/employee/employee.types";
import { EMPLOYMENT_TYPE, SALARY_PAYMENT_MODE, SalaryPaymentMode } from "@/constants/employee/employee.const";
import { CURRENCY } from "@/constants/tour/tour.const";
import { CARD_BRAND, CardBrand } from "@/constants/payment/payment.const";
import {
    fileToDocumentDTO,
    fileToAvatarBase64,
    IMAGE_EXTENSIONS,
    DOCUMENT_EXTENSIONS,
    ALLOWED_EXTENSIONS,
    removeDocumentAt
} from "@/utils/helpers/file-conversion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { showToast } from "@/components/global/showToast";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { useEmployeeStore } from "@/store/employee.store";
import { cn } from "@/lib/utils";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import EmployeeVerificationDialog from "./EmployeeVerificationDialog";
import { EMAIL_VERIFICATION_PURPOSE } from "@/constants/common/email-verification-purpose.const";
import { EmailVerificationService } from "@/utils/api/email-verification.api";

// Constants
const DAYS_OF_WEEK: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_DOCUMENTS = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Avatar & Document options
const AVATAR_OPTIONS = { maxWidth: 800, quality: 0.7, maxFileBytes: MAX_FILE_SIZE_BYTES };
const DOCUMENT_OPTIONS = { compressImages: true, maxWidth: 1200, quality: 0.8, maxFileBytes: MAX_FILE_SIZE_BYTES, allowedExtensions: ALLOWED_EXTENSIONS };

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Employees", href: "/users/employees" },
    { label: "Add Employee", href: "/users/employees/add-employee" },
];

// Initial form values
const getInitialValues = (): CreateEmployeeFormValues => ({
    name: "",
    password: generateStrongPassword(10),
    employmentType: EMPLOYMENT_TYPE.FULL_TIME,
    avatar: null,
    salary: null,
    currency: CURRENCY.BDT,
    paymentMode: SALARY_PAYMENT_MODE.AUTO,
    paymentCard: {
        brand: CARD_BRAND.UNKNOWN,
        last4: "",
        expMonth: new Date().getMonth() + 1,
        expYear: new Date().getFullYear(),
        cardholderName: "",
    },
    dateOfJoining: new Date(),
    contactInfo: { phone: "", email: "", emergencyContact: { name: "", phone: "", relation: "" } },
    shifts: [],
    documents: [],
    notes: "",
});

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Formik-compatible FormItem components
const FormItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="space-y-2">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E2938' }}>
        {icon && <span style={{ color: '#006666' }}>{icon}</span>}
        {children}
    </label>
);
const FormMessage: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xs flex items-center gap-1 mt-1"
        style={{ color: '#FF2157' }}
    >
        <AlertCircle className="h-3 w-3" />{children}
    </motion.p>
);

// Type guards for shift errors
const isShiftErrorObject = (error: unknown): error is FormikErrors<ShiftDTO> => !!error && typeof error === "object" && !Array.isArray(error);
const getShiftError = (shiftError: unknown, field: keyof ShiftDTO): string | undefined => isShiftErrorObject(shiftError) ? shiftError[field] as string | undefined : undefined;
type SetFieldValue = <K extends keyof CreateEmployeeFormValues>(field: K, value: CreateEmployeeFormValues[K]) => void;

export default function AddEmployeePage() {
    const { createEmployee, fetchEnums } = useEmployeeStore()
    const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
    const [, setCurrencies] = useState<string[]>([]);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingDocuments, setUploadingDocuments] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [documentErrors, setDocumentErrors] = useState<{ [key: number]: string }>({});

    // NEW state for email verification
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [pendingSubmission, setPendingSubmission] = useState<{ values: CreateEmployeeFormValues; resetForm: () => void } | null>(null);

    const [verifying, setVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadEnums() }, []);

    const loadEnums = async () => {
        try { await fetchEnums(); } catch { }
        setEmploymentTypes(Object.values(EMPLOYMENT_TYPE));
        setCurrencies(Object.values(CURRENCY));
    };

    const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

    // Avatar upload
    const handleAvatarUpload = async (file: File, setFieldValue: SetFieldValue) => {
        setAvatarError(null); setUploadingAvatar(true);
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!IMAGE_EXTENSIONS.includes(ext as any)) throw new Error(`Invalid file type: ${ext}`);
            if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File too large (> ${MAX_FILE_SIZE_MB}MB)`);
            const base64 = await fileToAvatarBase64(file, AVATAR_OPTIONS);
            setFieldValue("avatar", base64);
        } catch (err) {
            setAvatarError(err instanceof Error ? err.message : "Upload failed");
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        } finally { setUploadingAvatar(false); }
    };

    // Document upload
    const handleDocumentUpload = async (files: FileList | File[], currentDocs: DocumentDTO[], setFieldValue: SetFieldValue) => {
        setUploadingDocuments(true); const newErrors: { [key: number]: string } = {};
        try {
            const arr = Array.from(files);
            if (currentDocs.length + arr.length > MAX_DOCUMENTS) throw new Error(`Max ${MAX_DOCUMENTS} documents allowed`);
            for (let i = 0; i < arr.length; i++) {
                const file = arr[i], index = currentDocs.length + i;
                try {
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (!IMAGE_EXTENSIONS.includes(ext as any) && !DOCUMENT_EXTENSIONS.includes(ext as any))
                        throw new Error(`Unsupported file type: ${ext}`);
                    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File too large (> ${MAX_FILE_SIZE_MB}MB)`);
                    const dto = await fileToDocumentDTO(file, DOCUMENT_OPTIONS);
                    setFieldValue("documents", [...currentDocs, dto]);
                } catch (err) { newErrors[index] = err instanceof Error ? err.message : "Upload failed"; }
            }
            setDocumentErrors(newErrors);
            if (Object.keys(newErrors).length < arr.length && documentInputRef.current) documentInputRef.current.value = "";
        } catch (err) { alert(err instanceof Error ? err.message : "Upload failed"); }
        finally { setUploadingDocuments(false); }
    };

    const handleRemoveDocument = (index: number, currentDocs: DocumentDTO[], setFieldValue: SetFieldValue) => {
        setFieldValue("documents", removeDocumentAt(currentDocs, index));
        const newErrors = { ...documentErrors }; delete newErrors[index]; setDocumentErrors(newErrors);
    };

    const handleClearAvatar = (setFieldValue: SetFieldValue) => {
        setFieldValue("avatar", null); setAvatarError(null);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
    };

    // NEW: Handle form submission with email verification
    const handleSubmit = async (
        values: CreateEmployeeFormValues,
        { resetForm, setSubmitting }: FormikHelpers<CreateEmployeeFormValues>
    ) => {
        try {
            setSubmitting(true);
            // Step 1: Send verification email
            const service = new EmailVerificationService(values.contactInfo.email);
            const sendResult = await service.sendVerificationEmail(EMAIL_VERIFICATION_PURPOSE.EMPLOYEE_VERIFICATION);
            if (!sendResult.success) {
                showToast.error(sendResult.message);
                setSubmitting(false);
                return;
            }

            // Step 2: Store submission and open dialog
            setPendingSubmission({ values, resetForm });
            setShowVerificationDialog(true);
            setSubmitting(false); // Allow user to interact with dialog
        } catch {
            showToast.error('Failed to send verification email');
            setSubmitting(false);
        }
    };

    const handleVerifyToken = async (token: string) => {
        if (!pendingSubmission) return;
        setVerifying(true);
        setVerificationError(null);
        try {
            const service = new EmailVerificationService(pendingSubmission.values.contactInfo.email);
            const verifyResult = await service.verifyToken(token, EMAIL_VERIFICATION_PURPOSE.EMPLOYEE_VERIFICATION);
            if (!verifyResult.success) {
                setVerificationError(verifyResult.message);
                setVerifying(false);
                return;
            }

            // Token verified – create employee
            const payload: CreateEmployeePayload = {
                name: pendingSubmission.values.name,
                password: pendingSubmission.values.password,
                employmentType: pendingSubmission.values.employmentType,
                avatar: pendingSubmission.values.avatar ?? "",
                salary: pendingSubmission.values.salary,
                currency: pendingSubmission.values.currency,
                paymentMode: pendingSubmission.values.paymentMode,
                paymentCard: pendingSubmission.values.paymentCard ?? undefined,
                dateOfJoining: pendingSubmission.values.dateOfJoining.toISOString(),
                contactInfo: pendingSubmission.values.contactInfo,
                shifts: pendingSubmission.values.shifts,
                documents: pendingSubmission.values.documents,
                notes: pendingSubmission.values.notes || undefined,
            };
            await createEmployee(payload);

            // Reset form and close dialog
            pendingSubmission.resetForm();
            showToast.success("Successfully added new employee.");
            setShowVerificationDialog(false);
            setPendingSubmission(null);
        } catch {
            setVerificationError('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleCancelVerification = () => {
        setShowVerificationDialog(false);
        setPendingSubmission(null);
        setVerificationError(null);
        setVerifying(false);
        showToast.info('Employee creation cancelled.');
    };

    return (
        <div
            className="overflow-y-auto flex-1 px-8 py-6 min-h-screen"
            style={{ backgroundColor: '#E7E5E4' }}
        >
            <Breadcrumbs items={breadcrumbItems} />

            <Formik
                initialValues={getInitialValues()}
                validationSchema={createEmployeeValidationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                    <Form>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6 pt-5"
                        >
                            {/* Security Section */}
                            <motion.div variants={itemVariants}>
                                <div
                                    className="rounded-2xl p-6"
                                    style={{
                                        backgroundColor: '#E7E5E4',
                                        boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                    }}
                                >
                                    <div className="relative">
                                        <h3
                                            className="text-xl font-bold mb-5 flex items-center gap-3"
                                            style={{ color: '#1E2938', fontFamily: '"Space Mono", monospace' }}
                                        >
                                            <div
                                                className="p-2 rounded-xl"
                                                style={{
                                                    backgroundColor: '#E7E5E4',
                                                    boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                }}
                                            >
                                                <Shield className="h-5 w-5" style={{ color: '#006666' }} />
                                            </div>
                                            Security Credentials
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name */}
                                            <FormItem>
                                                <FormLabel icon={<User className="h-4 w-4" />}>Name *</FormLabel>
                                                <Field name="name">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Input
                                                            {...field}
                                                            disabled={showVerificationDialog}
                                                            placeholder="Enter your name"
                                                            className="w-full rounded-xl"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                border: 'none',
                                                                color: '#1E2938'
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.name && errors.name}</FormMessage>
                                            </FormItem>

                                            {/* Password */}
                                            <FormItem>
                                                <FormLabel icon={<Shield className="h-4 w-4" />}>Password *</FormLabel>
                                                <div className="flex gap-3">
                                                    <Field name="password">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input
                                                                {...field}
                                                                type="password"
                                                                disabled={showVerificationDialog}
                                                                placeholder="Enter secure password"
                                                                className="flex-1 rounded-xl"
                                                                style={{
                                                                    backgroundColor: '#E7E5E4',
                                                                    boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                    border: 'none',
                                                                    color: '#1E2938'
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={showVerificationDialog}
                                                        className="rounded-xl font-medium"
                                                        style={{
                                                            backgroundColor: '#E7E5E4',
                                                            boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff',
                                                            border: 'none',
                                                            color: '#1E2938'
                                                        }}
                                                        onClick={() => setFieldValue("password", generateStrongPassword())}
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" /> Generate
                                                    </Button>
                                                </div>
                                                <FormMessage>{touched.password && errors.password}</FormMessage>
                                            </FormItem>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Profile Section */}
                            <motion.div variants={itemVariants}>
                                <div
                                    className="rounded-2xl p-6"
                                    style={{
                                        backgroundColor: '#E7E5E4',
                                        boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                    }}
                                >
                                    <div className="relative">
                                        <h3
                                            className="text-xl font-bold mb-5 flex items-center gap-3"
                                            style={{ color: '#1E2938', fontFamily: '"Space Mono", monospace' }}
                                        >
                                            <div
                                                className="p-2 rounded-xl"
                                                style={{
                                                    backgroundColor: '#E7E5E4',
                                                    boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                }}
                                            >
                                                <User className="h-5 w-5" style={{ color: '#006666' }} />
                                            </div>
                                            Profile Information
                                        </h3>

                                        {/* Avatar Upload */}
                                        <FormItem>
                                            <FormLabel icon={<ImageIcon className="h-4 w-4" />}>Profile Picture</FormLabel>
                                            <div className="flex items-start gap-6">
                                                <AnimatePresence mode="wait">
                                                    {values.avatar ? (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -90 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            exit={{ scale: 0, rotate: 90 }}
                                                            className="relative group"
                                                        >
                                                            <div
                                                                className="relative w-36 h-36 rounded-3xl overflow-hidden"
                                                                style={{
                                                                    boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                                                }}
                                                            >
                                                                <Image src={values.avatar} alt="Avatar" fill className="object-cover" />
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                type="button"
                                                                disabled={showVerificationDialog}
                                                                className="absolute -top-2 -right-2 p-2 rounded-full"
                                                                style={{
                                                                    backgroundColor: '#FF2157',
                                                                    boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff',
                                                                    border: 'none'
                                                                }}
                                                                onClick={() => handleClearAvatar(setFieldValue)}
                                                            >
                                                                <X className="h-4 w-4 text-white" />
                                                            </motion.button>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-36 h-36 rounded-3xl flex items-center justify-center"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 6px 6px 12px #d1cfce, inset -6px -6px 12px #ffffff'
                                                            }}
                                                        >
                                                            <User className="h-16 w-16" style={{ color: '#1E2938' }} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Input
                                                            ref={avatarInputRef}
                                                            type="file"
                                                            accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                                                            onChange={e => e.target.files && handleAvatarUpload(e.target.files[0], setFieldValue)}
                                                            className="cursor-pointer rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-medium"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                border: 'none',
                                                                color: '#1E2938'
                                                            }}
                                                            disabled={uploadingAvatar || showVerificationDialog}
                                                        />
                                                        {uploadingAvatar && <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#006666' }} />}
                                                    </div>
                                                    <p className="text-xs flex items-center gap-1" style={{ color: '#1E2938' }}>
                                                        <Sparkles className="h-3 w-3" />
                                                        Recommended: Square image, max {MAX_FILE_SIZE_MB}MB
                                                    </p>
                                                    {avatarError && (
                                                        <Alert
                                                            variant="destructive"
                                                            className="py-2 rounded-xl"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                border: 'none'
                                                            }}
                                                        >
                                                            <AlertCircle className="h-4 w-4" style={{ color: '#FF2157' }} />
                                                            <AlertDescription className="text-xs" style={{ color: '#FF2157' }}>{avatarError}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </div>
                                            <FormMessage>{touched.avatar && errors.avatar}</FormMessage>
                                        </FormItem>

                                        {/* Employment Type */}
                                        <FormItem>
                                            <FormLabel icon={<Briefcase className="h-4 w-4" />}>Employment Type</FormLabel>
                                            <Field name="employmentType">
                                                {({ field }: FieldProps<string>) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={v => setFieldValue("employmentType", v)}
                                                        disabled={showVerificationDialog}
                                                    >
                                                        <SelectTrigger
                                                            className="rounded-xl"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                border: 'none',
                                                                color: '#1E2938'
                                                            }}
                                                        >
                                                            <SelectValue placeholder="Select employment type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {employmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </Field>
                                            <FormMessage>{touched.employmentType && errors.employmentType}</FormMessage>
                                        </FormItem>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Compensation Section */}
                            <motion.div variants={itemVariants}>
                                <div
                                    className="rounded-2xl p-6"
                                    style={{
                                        backgroundColor: '#E7E5E4',
                                        boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                    }}
                                >
                                    <div className="relative">
                                        <h3
                                            className="text-xl font-bold mb-5 flex items-center gap-3"
                                            style={{ color: '#1E2938', fontFamily: '"Space Mono", monospace' }}
                                        >
                                            <div
                                                className="p-2 rounded-xl"
                                                style={{
                                                    backgroundColor: '#E7E5E4',
                                                    boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                }}
                                            >
                                                <FaBangladeshiTakaSign className="h-5 w-5" style={{ color: '#006666' }} />
                                            </div>
                                            Compensation Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <FormItem>
                                                <FormLabel icon={<FaBangladeshiTakaSign className="h-4 w-4" />}>Salary *</FormLabel>
                                                <div className="flex gap-2">
                                                    <Field name="salary">
                                                        {({ field }: FieldProps<number>) => (
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                inputMode="decimal"
                                                                pattern="[0-9]*"
                                                                value={field.value ?? ""}
                                                                disabled={showVerificationDialog}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === "") {
                                                                        setFieldValue("salary", value);
                                                                        return;
                                                                    }
                                                                    if (/^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(value)) {
                                                                        setFieldValue("salary", value);
                                                                    }
                                                                }}
                                                                className="flex-1 rounded-xl"
                                                                style={{
                                                                    backgroundColor: '#E7E5E4',
                                                                    boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                    border: 'none',
                                                                    color: '#1E2938'
                                                                }}
                                                                placeholder="Enter amount"
                                                            />
                                                        )}
                                                    </Field>
                                                    <Field name="currency">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={(v) => setFieldValue("currency", v)}
                                                                disabled={showVerificationDialog}
                                                            >
                                                                <SelectTrigger
                                                                    className="w-[130px] rounded-xl"
                                                                    style={{
                                                                        backgroundColor: '#E7E5E4',
                                                                        boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                        border: 'none',
                                                                        color: '#1E2938'
                                                                    }}
                                                                >
                                                                    <SelectValue placeholder="Currency" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem key={CURRENCY.BDT} value={CURRENCY.BDT}>BDT</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </Field>
                                                </div>
                                                <FormMessage>{touched.salary && errors.salary}</FormMessage>
                                            </FormItem>

                                            <FormItem>
                                                <FormLabel icon={<Calendar className="h-4 w-4" />}>Date of Joining</FormLabel>
                                                <Field name="dateOfJoining">
                                                    {({ field }: FieldProps<Date>) => (
                                                        <Input
                                                            type="date"
                                                            value={field.value ? formatDateForInput(field.value) : ""}
                                                            min={formatDateForInput(new Date())}
                                                            disabled={showVerificationDialog}
                                                            onChange={(e) =>
                                                                setFieldValue("dateOfJoining", new Date(e.target.value))
                                                            }
                                                            className="rounded-xl"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                border: 'none',
                                                                color: '#1E2938'
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.dateOfJoining && errors.dateOfJoining && String(errors.dateOfJoining)}</FormMessage>
                                            </FormItem>

                                            <div className="md:col-span-2">
                                                <FormItem>
                                                    <FormLabel icon={<CreditCard className="h-4 w-4" />}>Payment Mode *</FormLabel>
                                                    <Field name="paymentMode">
                                                        {({ field }: FieldProps<SalaryPaymentMode>) => (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {Object.values(SALARY_PAYMENT_MODE).map((mode) => (
                                                                    <div
                                                                        key={mode}
                                                                        className={cn(
                                                                            "relative flex items-center justify-center p-4 rounded-xl transition-all duration-200 cursor-pointer",
                                                                            showVerificationDialog && "pointer-events-none opacity-60"
                                                                        )}
                                                                        style={{
                                                                            backgroundColor: '#E7E5E4',
                                                                            boxShadow: field.value === mode
                                                                                ? 'inset 4px 4px 8px #d1cfce, inset -4px -4px 8px #ffffff'
                                                                                : '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff',
                                                                            border: 'none'
                                                                        }}
                                                                        onClick={() => !showVerificationDialog && setFieldValue("paymentMode", mode)}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className="h-5 w-5 rounded-full flex items-center justify-center"
                                                                                style={{
                                                                                    backgroundColor: '#E7E5E4',
                                                                                    boxShadow: field.value === mode
                                                                                        ? 'inset 2px 2px 4px #d1cfce, inset -2px -2px 4px #ffffff'
                                                                                        : '2px 2px 4px #d1cfce, -2px -2px 4px #ffffff'
                                                                                }}
                                                                            >
                                                                                {field.value === mode && (
                                                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#006666' }} />
                                                                                )}
                                                                            </div>
                                                                            <span style={{ color: '#1E2938', fontWeight: 500 }}>
                                                                                {mode === SALARY_PAYMENT_MODE.AUTO ? "Automatic" : "Manual"}
                                                                            </span>
                                                                        </div>

                                                                        {mode === SALARY_PAYMENT_MODE.AUTO && (
                                                                            <div className="absolute -top-1 -right-1">
                                                                                <div
                                                                                    className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                                                                                    style={{
                                                                                        backgroundColor: '#FE9900',
                                                                                        color: '#ffffff'
                                                                                    }}
                                                                                >
                                                                                    Recommended
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </Field>
                                                    <div className="mt-3 flex items-start gap-2 text-sm" style={{ color: '#1E2938' }}>
                                                        <Info className="h-4 w-4 flex-shrink-0" style={{ color: '#1E2938' }} />
                                                        <span>
                                                            <strong>Automatic:</strong> Salary is paid automatically on the set date.{" "}
                                                            <strong>Manual:</strong> Requires manual approval and processing for each payment.
                                                        </span>
                                                    </div>
                                                    <FormMessage>{touched.paymentMode && errors.paymentMode}</FormMessage>
                                                </FormItem>
                                            </div>

                                            {/* Payment Card Details — shown when paymentMode is AUTO */}
                                            {values.paymentMode === SALARY_PAYMENT_MODE.AUTO && (
                                                <div className="md:col-span-2">
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="rounded-xl p-5 space-y-4"
                                                        style={{
                                                            backgroundColor: '#E7E5E4',
                                                            boxShadow: 'inset 4px 4px 8px #d1cfce, inset -4px -4px 8px #ffffff'
                                                        }}
                                                    >
                                                        <h4 className="font-semibold flex items-center gap-2" style={{ color: '#1E2938' }}>
                                                            <div
                                                                className="p-1.5 rounded-lg"
                                                                style={{
                                                                    backgroundColor: '#E7E5E4',
                                                                    boxShadow: '2px 2px 4px #d1cfce, -2px -2px 4px #ffffff'
                                                                }}
                                                            >
                                                                <CreditCard className="h-4 w-4" style={{ color: '#006666' }} />
                                                            </div>
                                                            Payment Card Details *
                                                        </h4>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Card Brand */}
                                                            <FormItem>
                                                                <FormLabel>Card Brand *</FormLabel>
                                                                <Select
                                                                    value={values.paymentCard?.brand ?? CARD_BRAND.UNKNOWN}
                                                                    onValueChange={(v) => {
                                                                        if (showVerificationDialog) return;
                                                                        setFieldValue("paymentCard", {
                                                                            ...(values.paymentCard ?? { last4: "", expMonth: 1, expYear: new Date().getFullYear(), brand: CARD_BRAND.UNKNOWN }),
                                                                            brand: v as CardBrand,
                                                                        });
                                                                    }}
                                                                    disabled={showVerificationDialog}
                                                                >
                                                                    <SelectTrigger
                                                                        className="rounded-xl"
                                                                        style={{
                                                                            backgroundColor: '#E7E5E4',
                                                                            boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                            border: 'none',
                                                                            color: '#1E2938'
                                                                        }}
                                                                    >
                                                                        <SelectValue placeholder="Select card brand" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.values(CARD_BRAND).map((brand) => (
                                                                            <SelectItem key={brand} value={brand}>
                                                                                {brand.charAt(0).toUpperCase() + brand.slice(1)}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>

                                                            {/* Last 4 Digits */}
                                                            <FormItem>
                                                                <FormLabel>Last 4 Digits *</FormLabel>
                                                                <Input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    maxLength={4}
                                                                    placeholder="1234"
                                                                    disabled={showVerificationDialog}
                                                                    value={values.paymentCard?.last4 ?? ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                                                        setFieldValue("paymentCard", {
                                                                            ...(values.paymentCard ?? { brand: CARD_BRAND.UNKNOWN, expMonth: 1, expYear: new Date().getFullYear() }),
                                                                            last4: val,
                                                                        });
                                                                    }}
                                                                    className="rounded-xl font-mono tracking-widest"
                                                                    style={{
                                                                        backgroundColor: '#E7E5E4',
                                                                        boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                        border: 'none',
                                                                        color: '#1E2938'
                                                                    }}
                                                                />
                                                            </FormItem>

                                                            {/* Expiration Month */}
                                                            <FormItem>
                                                                <FormLabel>Exp. Month *</FormLabel>
                                                                <Select
                                                                    value={String(values.paymentCard?.expMonth ?? 1)}
                                                                    onValueChange={(v) => {
                                                                        if (showVerificationDialog) return;
                                                                        setFieldValue("paymentCard", {
                                                                            ...(values.paymentCard ?? { brand: CARD_BRAND.UNKNOWN, last4: "", expYear: new Date().getFullYear() }),
                                                                            expMonth: parseInt(v, 10),
                                                                        });
                                                                    }}
                                                                    disabled={showVerificationDialog}
                                                                >
                                                                    <SelectTrigger
                                                                        className="rounded-xl"
                                                                        style={{
                                                                            backgroundColor: '#E7E5E4',
                                                                            boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                            border: 'none',
                                                                            color: '#1E2938'
                                                                        }}
                                                                    >
                                                                        <SelectValue placeholder="Month" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                                            <SelectItem key={m} value={String(m)}>
                                                                                {String(m).padStart(2, "0")}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>

                                                            {/* Expiration Year */}
                                                            <FormItem>
                                                                <FormLabel>Exp. Year *</FormLabel>
                                                                <Select
                                                                    value={String(values.paymentCard?.expYear ?? new Date().getFullYear())}
                                                                    onValueChange={(v) => {
                                                                        if (showVerificationDialog) return;
                                                                        setFieldValue("paymentCard", {
                                                                            ...(values.paymentCard ?? { brand: CARD_BRAND.UNKNOWN, last4: "", expMonth: 1 }),
                                                                            expYear: parseInt(v, 10),
                                                                        });
                                                                    }}
                                                                    disabled={showVerificationDialog}
                                                                >
                                                                    <SelectTrigger
                                                                        className="rounded-xl"
                                                                        style={{
                                                                            backgroundColor: '#E7E5E4',
                                                                            boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                            border: 'none',
                                                                            color: '#1E2938'
                                                                        }}
                                                                    >
                                                                        <SelectValue placeholder="Year" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                                                                            <SelectItem key={y} value={String(y)}>
                                                                                {y}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>

                                                            {/* Cardholder Name */}
                                                            <div className="md:col-span-2">
                                                                <FormItem>
                                                                    <FormLabel>Cardholder Name</FormLabel>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Name as shown on card"
                                                                        disabled={showVerificationDialog}
                                                                        value={values.paymentCard?.cardholderName ?? ""}
                                                                        onChange={(e) => {
                                                                            setFieldValue("paymentCard", {
                                                                                ...(values.paymentCard ?? { brand: CARD_BRAND.UNKNOWN, last4: "", expMonth: 1, expYear: new Date().getFullYear() }),
                                                                                cardholderName: e.target.value,
                                                                            });
                                                                        }}
                                                                        className="rounded-xl"
                                                                        style={{
                                                                            backgroundColor: '#E7E5E4',
                                                                            boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                            border: 'none',
                                                                            color: '#1E2938'
                                                                        }}
                                                                    />
                                                                </FormItem>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-2 text-sm" style={{ color: '#1E2938' }}>
                                                            <Info className="h-4 w-4 flex-shrink-0" />
                                                            <span>Card details are stored securely and used only for automatic salary disbursement.</span>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Contact Information */}
                            <motion.div variants={itemVariants}>
                                <div
                                    className="rounded-2xl p-6"
                                    style={{
                                        backgroundColor: '#E7E5E4',
                                        boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                    }}
                                >
                                    <div className="relative">
                                        <h3
                                            className="text-xl font-bold mb-5 flex items-center gap-3"
                                            style={{ color: '#1E2938', fontFamily: '"Space Mono", monospace' }}
                                        >
                                            <div
                                                className="p-2 rounded-xl"
                                                style={{
                                                    backgroundColor: '#E7E5E4',
                                                    boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                }}
                                            >
                                                <Mail className="h-5 w-5" style={{ color: '#006666' }} />
                                            </div>
                                            Contact Information
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                            <FormItem>
                                                <FormLabel icon={<Phone className="h-4 w-4" />}>Phone *</FormLabel>
                                                <Field name="contactInfo.phone">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Input
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            type="tel"
                                                            disabled={showVerificationDialog}
                                                            placeholder="01XXXXXXXXX"
                                                            className="rounded-xl"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                border: 'none',
                                                                color: '#1E2938'
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.contactInfo?.phone && errors.contactInfo?.phone}</FormMessage>
                                            </FormItem>

                                            <FormItem>
                                                <FormLabel icon={<Mail className="h-4 w-4" />}>Email *</FormLabel>
                                                <Field name="contactInfo.email">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            disabled={showVerificationDialog}
                                                            placeholder="email@example.com"
                                                            className="rounded-xl"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                border: 'none',
                                                                color: '#1E2938'
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                <FormMessage>{touched.contactInfo?.email && errors.contactInfo?.email}</FormMessage>
                                            </FormItem>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div
                                            className="rounded-xl p-5 space-y-4"
                                            style={{
                                                backgroundColor: '#E7E5E4',
                                                boxShadow: 'inset 4px 4px 8px #d1cfce, inset -4px -4px 8px #ffffff'
                                            }}
                                        >
                                            <h4 className="font-semibold flex items-center gap-2" style={{ color: '#1E2938' }}>
                                                <div
                                                    className="p-1.5 rounded-lg"
                                                    style={{
                                                        backgroundColor: '#E7E5E4',
                                                        boxShadow: '2px 2px 4px #d1cfce, -2px -2px 4px #ffffff'
                                                    }}
                                                >
                                                    <Heart className="h-4 w-4" style={{ color: '#FF2157' }} />
                                                </div>
                                                Emergency Contact *
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormItem>
                                                    <FormLabel>Name *</FormLabel>
                                                    <Field name="contactInfo.emergencyContact.name">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input {...field} disabled={showVerificationDialog} placeholder="Full name"
                                                                className="rounded-xl"
                                                                style={{
                                                                    backgroundColor: '#E7E5E4',
                                                                    boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                    border: 'none',
                                                                    color: '#1E2938'
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <FormMessage>{touched.contactInfo?.emergencyContact?.name && errors.contactInfo?.emergencyContact?.name}</FormMessage>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel>Phone *</FormLabel>
                                                    <Field name="contactInfo.emergencyContact.phone">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input {...field} type="tel" disabled={showVerificationDialog} placeholder="01XXXXXXXXX"
                                                                className="rounded-xl"
                                                                style={{
                                                                    backgroundColor: '#E7E5E4',
                                                                    boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                    border: 'none',
                                                                    color: '#1E2938'
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <FormMessage>{touched.contactInfo?.emergencyContact?.phone && errors.contactInfo?.emergencyContact?.phone}</FormMessage>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel>Relation *</FormLabel>
                                                    <Field name="contactInfo.emergencyContact.relation">
                                                        {({ field }: FieldProps<string>) => (
                                                            <Input {...field} disabled={showVerificationDialog} placeholder="e.g., Father"
                                                                className="rounded-xl"
                                                                style={{
                                                                    backgroundColor: '#E7E5E4',
                                                                    boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                    border: 'none',
                                                                    color: '#1E2938'
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <FormMessage>{touched.contactInfo?.emergencyContact?.relation && errors.contactInfo?.emergencyContact?.relation}</FormMessage>
                                                </FormItem>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Shifts Section */}
                            <motion.div variants={itemVariants}>
                                <div
                                    className="rounded-2xl p-6"
                                    style={{
                                        backgroundColor: '#E7E5E4',
                                        boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                    }}
                                >
                                    <div className="relative">
                                        <div className="flex justify-between items-center mb-5">
                                            <h3
                                                className="text-xl font-bold flex items-center gap-3"
                                                style={{ color: '#1E2938', fontFamily: '"Space Mono", monospace' }}
                                            >
                                                <div
                                                    className="p-2 rounded-xl"
                                                    style={{
                                                        backgroundColor: '#E7E5E4',
                                                        boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                    }}
                                                >
                                                    <Clock className="h-5 w-5" style={{ color: '#006666' }} />
                                                </div>
                                                Work Shifts
                                            </h3>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={showVerificationDialog}
                                                    className="rounded-xl font-medium"
                                                    style={{
                                                        backgroundColor: '#E7E5E4',
                                                        boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff',
                                                        border: 'none',
                                                        color: '#1E2938'
                                                    }}
                                                    onClick={() => setFieldValue("shifts", [...values.shifts, { startTime: "09:00", endTime: "17:00", days: [] }])}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" /> Add Shift
                                                </Button>
                                            </motion.div>
                                        </div>

                                        <FieldArray name="shifts">
                                            {({ remove }) => (
                                                <div className="space-y-4">
                                                    <AnimatePresence mode="popLayout">
                                                        {values.shifts.length === 0 ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.9 }}
                                                                className="text-center py-12 rounded-xl"
                                                                style={{
                                                                    backgroundColor: '#E7E5E4',
                                                                    boxShadow: 'inset 4px 4px 8px #d1cfce, inset -4px -4px 8px #ffffff'
                                                                }}
                                                            >
                                                                <Clock className="h-16 w-16 mx-auto mb-3" style={{ color: '#1E2938' }} />
                                                                <p className="font-medium" style={{ color: '#1E2938' }}>No shifts added yet</p>
                                                                <p className="text-sm" style={{ color: '#1E2938' }}>Click &quot;Add Shift&quot; to get started</p>
                                                            </motion.div>
                                                        ) : (
                                                            values.shifts.map((shift, index) => {
                                                                const shiftError = errors.shifts?.[index];
                                                                const touchedShift = touched.shifts?.[index];
                                                                const startTimeError = getShiftError(shiftError, "startTime");
                                                                const endTimeError = getShiftError(shiftError, "endTime");
                                                                return (
                                                                    <motion.div
                                                                        key={index}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: 20 }}
                                                                        layout
                                                                        className="rounded-xl p-5 space-y-4"
                                                                        style={{
                                                                            backgroundColor: '#E7E5E4',
                                                                            boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                                        }}
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <h4 className="font-semibold flex items-center gap-3" style={{ color: '#1E2938' }}>
                                                                                <div
                                                                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                                                                                    style={{
                                                                                        backgroundColor: '#E7E5E4',
                                                                                        boxShadow: '3px 3px 6px #d1cfce, -3px -3px 6px #ffffff',
                                                                                        color: '#006666'
                                                                                    }}
                                                                                >
                                                                                    {index + 1}
                                                                                </div>
                                                                                Shift {index + 1}
                                                                            </h4>
                                                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    disabled={showVerificationDialog}
                                                                                    className="rounded-lg"
                                                                                    style={{
                                                                                        backgroundColor: 'transparent',
                                                                                        color: '#FF2157'
                                                                                    }}
                                                                                    onClick={() => remove(index)}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </motion.div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <Field name={`shifts.${index}.startTime`}>
                                                                                {({ field }: FieldProps<string>) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>Start Time *</FormLabel>
                                                                                        <Input {...field} type="time" value={field.value ?? ""} disabled={showVerificationDialog}
                                                                                            className="rounded-xl"
                                                                                            style={{
                                                                                                backgroundColor: '#E7E5E4',
                                                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                                                border: 'none',
                                                                                                color: '#1E2938'
                                                                                            }}
                                                                                        />
                                                                                        <FormMessage>{touchedShift?.startTime && startTimeError}</FormMessage>
                                                                                    </FormItem>
                                                                                )}
                                                                            </Field>
                                                                            <Field name={`shifts.${index}.endTime`}>
                                                                                {({ field }: FieldProps<string>) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>End Time *</FormLabel>
                                                                                        <Input {...field} type="time" value={field.value ?? ""} disabled={showVerificationDialog}
                                                                                            className="rounded-xl"
                                                                                            style={{
                                                                                                backgroundColor: '#E7E5E4',
                                                                                                boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                                                                border: 'none',
                                                                                                color: '#1E2938'
                                                                                            }}
                                                                                        />
                                                                                        <FormMessage>{touchedShift?.endTime && endTimeError}</FormMessage>
                                                                                    </FormItem>
                                                                                )}
                                                                            </Field>
                                                                        </div>

                                                                        <Field name={`shifts.${index}.days`}>
                                                                            {({ field }: FieldProps<DayOfWeek[]>) => {
                                                                                const selectedDays: DayOfWeek[] = Array.isArray(field.value) ? field.value : [];
                                                                                return (
                                                                                    <FormItem>
                                                                                        <FormLabel>Working Days</FormLabel>
                                                                                        <div className="flex gap-2 flex-wrap">
                                                                                            {DAYS_OF_WEEK.map(day => {
                                                                                                const isSelected = selectedDays.includes(day);
                                                                                                return (
                                                                                                    <motion.div
                                                                                                        key={day}
                                                                                                        whileHover={{ scale: 1.1 }}
                                                                                                        whileTap={{ scale: 0.95 }}
                                                                                                    >
                                                                                                        <Badge
                                                                                                            className={`cursor-pointer px-4 py-2 transition-all font-medium rounded-lg ${showVerificationDialog ? "pointer-events-none opacity-60" : ""}`}
                                                                                                            style={{
                                                                                                                backgroundColor: '#E7E5E4',
                                                                                                                boxShadow: isSelected
                                                                                                                    ? 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff'
                                                                                                                    : '3px 3px 6px #d1cfce, -3px -3px 6px #ffffff',
                                                                                                                border: 'none',
                                                                                                                color: isSelected ? '#006666' : '#1E2938',
                                                                                                                fontWeight: isSelected ? 700 : 500
                                                                                                            }}
                                                                                                            onClick={() => {
                                                                                                                if (showVerificationDialog) return;
                                                                                                                const newDays = selectedDays.includes(day)
                                                                                                                    ? selectedDays.filter(d => d !== day)
                                                                                                                    : [...selectedDays, day];
                                                                                                                setFieldValue(`shifts.${index}.days`, newDays);
                                                                                                            }}
                                                                                                        >
                                                                                                            {day}
                                                                                                        </Badge>
                                                                                                    </motion.div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    </FormItem>
                                                                                );
                                                                            }}
                                                                        </Field>
                                                                    </motion.div>
                                                                );
                                                            })
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </FieldArray>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Documents Section */}
                            <motion.div variants={itemVariants}>
                                <div
                                    className="rounded-2xl p-6"
                                    style={{
                                        backgroundColor: '#E7E5E4',
                                        boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                    }}
                                >
                                    <div className="relative">
                                        <h3
                                            className="text-xl font-bold mb-5 flex items-center gap-3"
                                            style={{ color: '#1E2938', fontFamily: '"Space Mono", monospace' }}
                                        >
                                            <div
                                                className="p-2 rounded-xl"
                                                style={{
                                                    backgroundColor: '#E7E5E4',
                                                    boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                }}
                                            >
                                                <FileText className="h-5 w-5" style={{ color: '#006666' }} />
                                            </div>
                                            Documents & Files
                                        </h3>

                                        <FormItem>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        ref={documentInputRef}
                                                        type="file"
                                                        multiple
                                                        accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                                                        onChange={e => e.target.files && handleDocumentUpload(e.target.files, values.documents, setFieldValue)}
                                                        className="cursor-pointer rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-medium"
                                                        style={{
                                                            backgroundColor: '#E7E5E4',
                                                            boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                            border: 'none',
                                                            color: '#1E2938'
                                                        }}
                                                        disabled={uploadingDocuments || showVerificationDialog}
                                                    />
                                                    {uploadingDocuments && <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#006666' }} />}
                                                </div>
                                                <p className="text-xs flex items-center gap-1" style={{ color: '#1E2938' }}>
                                                    <Upload className="h-3 w-3" />
                                                    Upload up to {MAX_DOCUMENTS} documents (max {MAX_FILE_SIZE_MB}MB each)
                                                </p>

                                                <AnimatePresence mode="popLayout">
                                                    {values.documents.length > 0 ? (
                                                        <motion.div layout className="space-y-3 mt-4">
                                                            {values.documents.map((doc, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, x: -20 }}
                                                                    layout
                                                                    className="flex justify-between items-center rounded-xl p-4 group"
                                                                    style={{
                                                                        backgroundColor: '#E7E5E4',
                                                                        boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                                            style={{
                                                                                backgroundColor: '#E7E5E4',
                                                                                boxShadow: '3px 3px 6px #d1cfce, -3px -3px 6px #ffffff'
                                                                            }}
                                                                        >
                                                                            {doc.type.startsWith("image/") ? (
                                                                                <ImageIcon className="h-6 w-6" style={{ color: '#006666' }} />
                                                                            ) : (
                                                                                <File className="h-6 w-6" style={{ color: '#006666' }} />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium" style={{ color: '#1E2938' }}>{doc.type}</p>
                                                                            {documentErrors[i] && <FormMessage>{documentErrors[i]}</FormMessage>}
                                                                        </div>
                                                                    </div>
                                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            disabled={showVerificationDialog}
                                                                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                                            style={{ color: '#FF2157' }}
                                                                            onClick={() => handleRemoveDocument(i, values.documents, setFieldValue)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </motion.div>
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-center py-12 rounded-xl"
                                                            style={{
                                                                backgroundColor: '#E7E5E4',
                                                                boxShadow: 'inset 4px 4px 8px #d1cfce, inset -4px -4px 8px #ffffff'
                                                            }}
                                                        >
                                                            <Upload className="h-12 w-12 mx-auto mb-3" style={{ color: '#1E2938' }} />
                                                            <p className="text-sm font-medium" style={{ color: '#1E2938' }}>No documents uploaded</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </FormItem>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Notes Section */}
                            <motion.div variants={itemVariants}>
                                <div
                                    className="rounded-2xl p-6"
                                    style={{
                                        backgroundColor: '#E7E5E4',
                                        boxShadow: '8px 8px 16px #d1cfce, -8px -8px 16px #ffffff'
                                    }}
                                >
                                    <div className="relative">
                                        <h3
                                            className="text-xl font-bold mb-5 flex items-center gap-3"
                                            style={{ color: '#1E2938', fontFamily: '"Space Mono", monospace' }}
                                        >
                                            <div
                                                className="p-2 rounded-xl"
                                                style={{
                                                    backgroundColor: '#E7E5E4',
                                                    boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff'
                                                }}
                                            >
                                                <FileText className="h-5 w-5" style={{ color: '#006666' }} />
                                            </div>
                                            Additional Notes
                                        </h3>
                                        <FormItem>
                                            <Field name="notes">
                                                {({ field }: FieldProps<string>) => (
                                                    <Textarea
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        disabled={showVerificationDialog}
                                                        placeholder="Add any additional notes, comments, or special requirements..."
                                                        className="min-h-[120px] rounded-xl resize-none"
                                                        style={{
                                                            backgroundColor: '#E7E5E4',
                                                            boxShadow: 'inset 3px 3px 6px #d1cfce, inset -3px -3px 6px #ffffff',
                                                            border: 'none',
                                                            color: '#1E2938'
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Sticky Footer */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="sticky bottom-0 -mx-8 -mb-6 mt-8 pt-6 pb-6 px-8"
                            style={{
                                backgroundColor: '#E7E5E4',
                                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div className="flex gap-3">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={showVerificationDialog}
                                        onClick={() => router.push(`/users/employees`)}
                                        className="w-full rounded-xl font-semibold"
                                        style={{
                                            backgroundColor: '#E7E5E4',
                                            boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff',
                                            border: 'none',
                                            color: '#1E2938'
                                        }}
                                    >
                                        Return
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || uploadingAvatar || uploadingDocuments || showVerificationDialog}
                                        className="w-full rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            backgroundColor: '#006666',
                                            boxShadow: '4px 4px 8px #d1cfce, -4px -4px 8px #ffffff',
                                            border: 'none',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Creating Employee...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Create Employee
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </Form>
                )}
            </Formik>

            <EmployeeVerificationDialog
                open={showVerificationDialog}
                onOpenChange={setShowVerificationDialog}
                email={pendingSubmission?.values.contactInfo.email || ""}
                onVerify={handleVerifyToken}
                onCancel={handleCancelVerification}
                verifying={verifying}
                error={verificationError}
            />
        </div>
    );
}