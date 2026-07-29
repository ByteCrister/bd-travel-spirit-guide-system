"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  EmployeeDetailDTO,
  UpdateEmployeePayload,
  ContactInfoDTO,
  ShiftDTO,
  DocumentDTO,
  PaymentCardDTO,
} from "@/types/employee/employee.types";
import {
  EMPLOYEE_STATUS,
  EMPLOYMENT_TYPE,
  EMPLOYEE_ROLE,
  EmployeeStatus,
  EmploymentType,
  SALARY_PAYMENT_MODE,
  SalaryPaymentMode,
} from "@/constants/employee/employee.const";

import { Breadcrumbs } from "../../../global/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Flame,
  RotateCcw,
  User,
  Briefcase,
  Phone,
  History,
  TrendingUp,
  FileText,
  StickyNote,
  Shield,
  Save,
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Trash2,
  Lock,
  X,
  Sparkles,
  Check,
  Copy,
  Loader2,
  CreditCard,
} from "lucide-react";
import { showToast } from "@/components/global/showToast";
import InfoCard from "./InfoCard";
import InfoField from "./InfoField";
import FormRow from "./FormRow";
import ModernSelect from "./ModernSelect";
import ShiftEditor from "./ShiftEditor";
import {
  fileToAvatarBase64,
  filesToDocumentDTOs,
  getFileExtension,
} from "@/utils/helpers/file-conversion";
import { CURRENCY } from "@/constants/tour/tour.const";
import { CARD_BRAND, CardBrand } from "@/constants/payment/payment.const";
import Image from "next/image";
import ConfirmationDialog from "./ConfirmationDialog";
import EmployeeDetailSkeleton from "./EmployeeDetailSkeleton";
import { DocumentViewerDialog } from "@/components/shared/DocumentViewerDialog";
import { useEmployeeStore } from "@/store/employee.store";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import { validateUpdateEmployeePayload } from "@/utils/validators/employee/employee.update-validator";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { updateEmployeePassword } from "@/utils/api/update-employee-pass.api";
import { formatDate, latestEffectiveFrom } from "@/utils/helpers/employees.details";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

/* ------------------------------------------------------------------ */
/*  Neumorphic design tokens & utility classes                        */
/* ------------------------------------------------------------------ */

const neumorphCard =
  "bg-[#E7E5E4] rounded-2xl [box-shadow:6px_6px_14px_#cac8c7,-6px_-6px_14px_#ffffff]";
const neumorphRaised =
  "bg-[#E7E5E4] rounded-lg [box-shadow:4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff]";
const neumorphButton =
  "bg-[#E7E5E4] rounded-lg  hover: active: transition-shadow focus-visible:outline-none focus-visible:";
const neumorphInput =
  "bg-[#E7E5E4]  rounded-lg px-3 py-2 outline-none focus-visible: transition-shadow";

/* ------------------------------------------------------------------ */
/*  Form type                                                         */
/* ------------------------------------------------------------------ */

type UpdateEmployeeForm = Partial<
  Pick<
    UpdateEmployeePayload,
    | "id"
    | "name"
    | "status"
    | "employmentType"
    | "contactInfo"
    | "shifts"
    | "notes"
    | "avatar"
    | "dateOfJoining"
    | "dateOfLeaving"
    | "documents"
    | "salary"
    | "currency"
    | "paymentMode"
  >
>;

/* ------------------------------------------------------------------ */
/*  Enum bundle                                                       */
/* ------------------------------------------------------------------ */

type EnumBundle = {
  statuses: EmployeeStatus[];
  employmentTypes: EmploymentType[];
  roles: (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE][];
};

const DEFAULT_ENUMS: EnumBundle = {
  statuses: Object.values(EMPLOYEE_STATUS),
  employmentTypes: Object.values(EMPLOYMENT_TYPE),
  roles: Object.values(EMPLOYEE_ROLE),
};

const enums = DEFAULT_ENUMS;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function EmployeeDetailPage({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const params = useParams();
  const encodedEmployeeId = (params?.employeeId as string) || encodeURIComponent(encodeId(employeeId));
  const { fetchEmployeeDetail, updateEmployee, softDeleteEmployee, restoreEmployee } =
    useEmployeeStore();

  const [detail, setDetail] = useState<EmployeeDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<string>("overview");
  const [form, setForm] = useState<UpdateEmployeeForm | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"delete" | "restore">("delete");

  const [sendMail, setSendMail] = useState<boolean>(true);
  const [isPassUpdating, setIsPassUpdating] = useState<boolean>(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [viewerDoc, setViewerDoc] = useState<DocumentDTO | null>(null);

  // NEW: Separate state for payment card updates
  const [cardForm, setCardForm] = useState<PaymentCardDTO | null>(null);
  const [updatingCard, setUpdatingCard] = useState(false);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Employees", href: "/users/employees" },
      {
        label: detail?.user.name ?? "Employee detail",
        href: `/users/employees/${encodedEmployeeId}`,
      },
    ],
    [encodedEmployeeId, detail?.user.name],
  );

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      setLoading(true);
      try {
        const d = await fetchEmployeeDetail(employeeId);
        if (!mounted) return;
        setDetail(d);
        setForm({
          id: d.id, name: d.user.name, status: d.status, employmentType: d.employmentType,
          avatar: d.avatar, salary: d.salary, paymentMode: d.paymentMode,
          // Removed paymentCard
          dateOfJoining: d.dateOfJoining,
          dateOfLeaving: d.dateOfLeaving, contactInfo: d.contactInfo,
          shifts: d.shifts, documents: d.documents, notes: d.notes,
        });
        // Initialize cardForm from existing paymentCard
        if (d.paymentCard) {
          setCardForm({ ...d.paymentCard });
        } else {
          // Empty card form with defaults for adding new card
          setCardForm({
            brand: CARD_BRAND.UNKNOWN,
            last4: "",
            expMonth: 1,
            expYear: new Date().getFullYear(),
            cardholderName: "",
          });
        }
        setAvatarPreview(typeof d.avatar === "string" ? d.avatar : null);
      } catch (e) {
        showToast.error(`Failed to load employee details: ${String(e)}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    hydrate();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const setField = <K extends keyof UpdateEmployeeForm>(
    key: K,
    value: UpdateEmployeeForm[K],
  ) => {
    setForm((prev) => {
      if (prev) return { ...prev, [key]: value };
      if (!detail) return prev;
      return { id: detail.id, [key]: value } as UpdateEmployeeForm;
    });
  };

  const setContact = (patch: Partial<ContactInfoDTO>) => {
    const phoneFallback =
      patch.phone ?? form?.contactInfo?.phone ?? detail?.contactInfo?.phone ?? "";
    const next: ContactInfoDTO = {
      ...(form?.contactInfo ?? (detail?.contactInfo ?? ({} as ContactInfoDTO))),
      ...patch,
      phone: phoneFallback,
    };
    setField("contactInfo", next);
  };

  const setShifts = (value: ShiftDTO[] | undefined) => setField("shifts", value);

  /* ------------------------- File helpers ------------------------- */

  const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
  const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif"];

  async function handleAvatarFile(file?: File) {
    if (!file) return;
    try {
      const ext = getFileExtension(file.name);
      if (!IMAGE_EXTS.includes(ext)) {
        showToast.error("Avatar must be an image (jpg, jpeg, png, gif)");
        return;
      }
      if (file.size > MAX_AVATAR_BYTES) {
        showToast.error("Avatar file too large. Max 5 MB allowed.");
        return;
      }
      const base64 = await fileToAvatarBase64(file, { maxFileBytes: MAX_AVATAR_BYTES });
      setAvatarPreview(base64);
      setField("avatar", base64 as unknown as UpdateEmployeeForm["avatar"]);
    } catch (err: unknown) {
      console.error(err);
      showToast.error(String(extractErrorMessage(err) ?? "Failed to process avatar"));
    }
  }

  async function handleDocumentsFiles(files?: FileList | File[]) {
    if (!files || (files as FileList).length === 0) return;
    try {
      const docs = await filesToDocumentDTOs(files as FileList);
      if (!docs || docs.length === 0) {
        showToast.warning("No valid documents were processed");
        return;
      }
      const existing = (form?.documents ?? []) as DocumentDTO[];
      const merged = [...existing, ...docs];
      setField("documents", merged as unknown as UpdateEmployeeForm["documents"]);
      showToast.success(`${docs.length} document(s) added`);
    } catch (err: unknown) {
      console.error(err);
      showToast.error(String(extractErrorMessage(err) ?? "Failed to process documents"));
    }
  }

  const removeDocumentAt = (index: number) => {
    setForm((s) => {
      if (!s) return s;
      const docs = [...(s.documents ?? [])];
      if (index < 0 || index >= docs.length) return s;
      docs.splice(index, 1);
      return { ...s, documents: docs };
    });
  };

  /* ------------------------- Save --------------------------------- */

  const handleSave = async () => {
    if (!detail || !form?.id) return;
    if (
      form.dateOfLeaving &&
      (form.status === EMPLOYEE_STATUS.ACTIVE || detail.status === EMPLOYEE_STATUS.ACTIVE)
    ) {
      showToast.warning(
        "Employee has a leaving date; status cannot be active. Adjusting status to terminated.",
      );
      setField("status", EMPLOYEE_STATUS.TERMINATED);
    }
    setSaving(true);
    try {
      const partialPayload: Partial<UpdateEmployeePayload> = {
        id: form.id!,
        name: form.name,
        salary: (form.salary ?? detail.salary) as UpdateEmployeePayload["salary"],
        currency: (form.currency ?? detail.currency) as UpdateEmployeePayload["currency"],
        status: (form.status ?? detail.status) as UpdateEmployeePayload["status"],
        employmentType: (form.employmentType ??
          detail.employmentType) as UpdateEmployeePayload["employmentType"],
        paymentMode: form.paymentMode,
        contactInfo: form.contactInfo ?? detail.contactInfo,
        shifts: form.shifts ?? detail.shifts,
        notes: form.notes ?? detail.notes ?? "",
        avatar: form.avatar as unknown as UpdateEmployeePayload["avatar"],
        dateOfJoining: form.dateOfJoining ?? detail.dateOfJoining,
        dateOfLeaving: form.dateOfLeaving ?? detail.dateOfLeaving,
        documents: form.documents ?? detail.documents,
      };
      const payload = partialPayload as UpdateEmployeePayload;
      const isValid = await validateUpdateEmployeePayload(payload);
      if (!isValid) return;
      const updated = await updateEmployee(payload);
      setDetail(updated);
      setForm({
        id: updated.id,
        name: updated.user.name,
        status: updated.status,
        employmentType: updated.employmentType,
        salary: updated.salary,
        currency: updated.currency,
        paymentMode: updated.paymentMode,
        contactInfo: updated.contactInfo,
        shifts: updated.shifts,
        notes: updated.notes,
        avatar: updated.avatar,
        dateOfJoining: updated.dateOfJoining,
        dateOfLeaving: updated.dateOfLeaving,
        documents: updated.documents,
      });
      showToast.success("Employee updated");
    } catch (e: unknown) {
      console.error(e);
      showToast.error(String(extractErrorMessage(e) ?? "Failed to update employee"));
    } finally {
      setSaving(false);
    }
  };

  // NEW: Separate handler for updating payment card
  const handleUpdateCard = async () => {
    if (!detail?.id || !cardForm) return;

    // Validation
    if (!cardForm.last4 || cardForm.last4.length !== 4) {
      showToast.warning("Last 4 digits must be exactly 4 digits");
      return;
    }
    if (cardForm.expMonth < 1 || cardForm.expMonth > 12) {
      showToast.warning("Expiration month must be between 1 and 12");
      return;
    }
    const currentYear = new Date().getFullYear();
    if (cardForm.expYear < currentYear || cardForm.expYear > currentYear + 20) {
      showToast.warning(`Expiration year must be between ${currentYear} and ${currentYear + 20}`);
      return;
    }

    setUpdatingCard(true);
    try {
      const response = await fetch(`/api/users/employees/v1/${detail.id}/payment-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update payment card (${response.status})`);
      }

      const updatedEmployee = await response.json();
      setDetail(updatedEmployee);
      // Update cardForm with the saved card data
      if (updatedEmployee.paymentCard) {
        setCardForm({ ...updatedEmployee.paymentCard });
      }
      showToast.success("Payment card updated successfully");
    } catch (err) {
      showToast.error(String(extractErrorMessage(err) ?? "Failed to update payment card"));
    } finally {
      setUpdatingCard(false);
    }
  };

  // Helper to update specific card field
  const setCardField = <K extends keyof PaymentCardDTO>(key: K, value: PaymentCardDTO[K]) => {
    if (!cardForm) return;
    setCardForm({ ...cardForm, [key]: value });
  };

  /* ------------------------- Password ----------------------------- */

  const handleGeneratePassword = () => {
    try {
      const pw = generateStrongPassword(10);
      setGeneratedPassword(pw);
      setNewPassword(pw);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to generate password");
    }
  };

  const handleUpdatePassword = async () => {
    if (!detail) return;
    if (!newPassword || newPassword.length < 8) {
      showToast.warning("Password is too short (min 8 characters)");
      return;
    }
    setIsPassUpdating(true);
    await updateEmployeePassword(employeeId, newPassword, sendMail);
    setGeneratedPassword("");
    setNewPassword("");
    setIsPassUpdating(false);
  };

  const handleDelete = async (reason: string) => {
    if (!detail?.id) return;
    await softDeleteEmployee(detail.id, reason);
    setDetail((prev) => (prev ? { ...prev, isDeleted: !prev.isDeleted } : prev));
  };

  const handleRestore = async () => {
    if (!detail?.id) return;
    await restoreEmployee({ id: detail.id });
    setDetail((prev) => (prev ? { ...prev, isDeleted: !prev.isDeleted } : prev));
  };

  /* ------------------------- Render ------------------------------- */

  if (loading) return <EmployeeDetailSkeleton />;

  if (!detail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E7E5E4]">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 mx-auto text-[#1E2938]" />
          <p
            className="text-xl font-medium text-[#1E2938]"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            Employee not found
          </p>
        </div>
      </div>
    );
  }

  /* small helpers for neumorphic buttons with accent colours */
  const btnPrimary = `${neumorphButton} px-4 py-2 text-[#006666] font-medium flex items-center`;
  const btnDefault = `${neumorphButton} px-4 py-2 text-[#1E2938] font-medium flex items-center`;
  const btnDanger = `${neumorphButton} px-4 py-2 text-[#FF2157] font-medium flex items-center`;
  const btnSuccess = `${neumorphButton} px-4 py-2 text-[#00A63D] font-medium flex items-center`;

  return (
    <>
      <div className="min-h-screen bg-[#E7E5E4]">
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          <Breadcrumbs items={breadcrumbItems} />

          {/* ────────── Header Card ────────── */}
          <div className={neumorphCard}>
            <div className="px-8 py-6 flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#C6C4C3] ${neumorphRaised}`}>
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="avatar"
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E7E5E4]">
                      <User className="h-10 w-10 text-[#1E2938]" />
                    </div>
                  )}
                </div>

                <div>
                  <h1
                    className="text-3xl font-bold text-[#1E2938]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    {detail.user.name}
                  </h1>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${neumorphRaised} ${detail.status === EMPLOYEE_STATUS.ACTIVE
                          ? "text-[#00A63D]"
                          : detail.status === EMPLOYEE_STATUS.ON_LEAVE
                            ? "text-[#FE9900]"
                            : "text-[#FF2157]"
                        }`}
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {detail.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !form?.id}
                  className={btnPrimary + (saving ? " opacity-50 cursor-not-allowed" : "")}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving…" : "Save changes"}
                </button>

                <button
                  onClick={() => router.push("/users/employees")}
                  className={btnDefault}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* ────────── Tabs ────────── */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className={neumorphCard + " p-2"}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-10 gap-2 bg-transparent">
                {(
                  [
                    ["overview", User, "Overview"],
                    ["role", Briefcase, "Role"],
                    ["contact", Phone, "Contact"],
                    ["compensation", FaBangladeshiTakaSign, "Compensation"],
                    ["positionHistory", History, "History"],
                    ["documents", FileText, "Documents"],
                    ["notes", StickyNote, "Notes"],
                    ["admin", Shield, "Admin"],
                  ] as const
                ).map(([value, Icon, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={`flex items-center gap-2 ${neumorphButton} data-[state=active]: data-[state=active]:text-[#006666]`}
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ──────── Overview tab ──────── */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InfoCard icon={User} title="Personal Information" className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField icon={User} label="Full Name" value={detail.user.name} />
                    <InfoField icon={Mail} label="Email" value={detail.user.email} />
                    <InfoField
                      icon={Phone}
                      label="Phone"
                      value={detail.user.phone ?? "—"}
                    />
                  </div>

                  <div className="mt-6 p-4 rounded-lg border border-[#C6C4C3]">
                    <label
                      className="block text-sm font-semibold text-[#1E2938] mb-3 items-center gap-2"
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      <User className="inline h-4 w-4 mr-1" />
                      Profile Avatar
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleAvatarFile(e.target.files?.[0] ?? undefined)
                        }
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#E7E5E4] file:text-[#1E2938] file: hover:file: file:cursor-pointer cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          setAvatarPreview(null);
                          setField("avatar", undefined);
                        }}
                        className={btnDanger + " text-sm"}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-[#1E2938] mt-2 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-[#006666]" />
                      Only images allowed. Max 5 MB.
                    </p>
                  </div>
                </InfoCard>

                <InfoCard icon={Briefcase} title="Employment">
                  <div className="space-y-4">
                    <FormRow label="Employment Type" icon={Briefcase}>
                      <ModernSelect<EmploymentType>
                        value={
                          (form?.employmentType ?? detail.employmentType) ?? ""
                        }
                        onChange={(v) => setField("employmentType", v)}
                        options={enums.employmentTypes}
                      />
                    </FormRow>

                    <FormRow label="Date of Joining" icon={Calendar}>
                      <input
                        type="date"
                        value={
                          form?.dateOfJoining
                            ? form.dateOfJoining.split("T")[0]
                            : detail.dateOfJoining?.split("T")[0] ?? ""
                        }
                        onChange={(e) =>
                          setField(
                            "dateOfJoining",
                            e.target.value
                              ? new Date(e.target.value).toISOString()
                              : undefined,
                          )
                        }
                        className={`${neumorphInput} w-full`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      />
                    </FormRow>

                    <FormRow label="Date of Leaving" icon={Calendar}>
                      <input
                        type="date"
                        value={
                          form?.dateOfLeaving
                            ? form.dateOfLeaving.split("T")[0]
                            : detail.dateOfLeaving?.split("T")[0] ?? ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined;
                          setField("dateOfLeaving", val);
                          if (val) {
                            if (
                              (form?.status ?? detail.status) ===
                              EMPLOYEE_STATUS.ACTIVE
                            ) {
                              showToast.warning(
                                "Date of leaving set — status cannot remain active. Setting status to terminated.",
                              );
                              setField("status", EMPLOYEE_STATUS.TERMINATED);
                            }
                          }
                        }}
                        className={`${neumorphInput} w-full`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      />
                    </FormRow>

                    <FormRow label="Status" icon={TrendingUp}>
                      <ModernSelect<EmployeeStatus>
                        value={form?.status ?? detail.status}
                        onChange={(v) => {
                          if (form?.dateOfLeaving || detail.dateOfLeaving) {
                            if (v === EMPLOYEE_STATUS.ACTIVE) {
                              showToast.warning(
                                "Cannot set status to active when a leaving date exists",
                              );
                              return;
                            }
                          }
                          setField("status", v);
                        }}
                        options={enums.statuses}
                      />
                    </FormRow>
                  </div>
                </InfoCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compensation card */}
                <InfoCard icon={FaBangladeshiTakaSign} title="Compensation">
                  <div className="space-y-4">
                    <div className={`${neumorphRaised} p-6 text-center`}>
                      <p className="text-sm text-[#1E2938] mb-2">Current Salary</p>
                      <div
                        className="text-5xl font-bold text-[#1E2938]"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        {detail.salary}
                      </div>
                      <span
                        className="text-xl font-semibold text-[#1E2938] mt-2 inline-block"
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        {detail.currency}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-[#C6C4C3]">
                      <InfoField
                        icon={Calendar}
                        label="Effective From"
                        value={latestEffectiveFrom(detail.salaryHistory) ?? "—"}
                      />
                    </div>
                  </div>
                </InfoCard>

                {/* Important Dates card */}
                <InfoCard icon={Calendar} title="Important Dates">
                  <div className="space-y-5">
                    {[
                      {
                        icon: Calendar,
                        color: "text-[#006666]",
                        label: "Date Joined",
                        value: detail.dateOfJoining
                          ? formatDate(detail.dateOfJoining)
                          : "—",
                      },
                      {
                        icon: Calendar,
                        color: "text-[#FE9900]",
                        label: "Date Left",
                        value: detail.dateOfLeaving
                          ? formatDate(detail.dateOfLeaving)
                          : "—",
                      },
                      {
                        icon: Clock,
                        color: "text-[#006666]",
                        label: "Last Updated",
                        value: formatDate(detail.updatedAt),
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 ${neumorphRaised}`}
                      >
                        <div className="mt-1 p-2 rounded-full bg-[#E7E5E4] ">
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-xs font-medium text-[#1E2938] uppercase tracking-wide"
                            style={{ fontFamily: "var(--font-space-mono)" }}
                          >
                            {item.label}
                          </p>
                          <p
                            className="text-sm font-semibold text-[#1E2938] mt-1"
                            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                          >
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </div>
            </TabsContent>

            {/* ──────── Role tab ──────── */}
            <TabsContent value="role" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={`${neumorphCard} p-6`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${neumorphRaised}`}
                    >
                      <Briefcase className="h-6 w-6 text-[#006666]" />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-semibold text-[#1E2938]"
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        Role & Status Configuration
                      </h3>
                      <p className="text-sm text-[#1E2938]">
                        Manage employment details and status
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormRow label="Employment Status" icon={TrendingUp}>
                      <ModernSelect<EmployeeStatus>
                        value={form?.status as EmployeeStatus}
                        onChange={(v) => {
                          if (
                            (form?.dateOfLeaving ?? detail.dateOfLeaving) &&
                            v === EMPLOYEE_STATUS.ACTIVE
                          ) {
                            showToast.warning(
                              "Cannot set status to active when a leaving date exists",
                            );
                            return;
                          }
                          setField("status", v);
                        }}
                        options={enums.statuses}
                      />
                    </FormRow>

                    <FormRow label="Employment Type" icon={Briefcase}>
                      <ModernSelect<EmploymentType>
                        value={
                          (form?.employmentType ?? detail.employmentType) ?? ""
                        }
                        onChange={(v) => setField("employmentType", v)}
                        options={enums.employmentTypes}
                      />
                    </FormRow>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className={`${neumorphCard} p-6`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${neumorphRaised}`}
                    >
                      <Clock className="h-6 w-6 text-[#006666]" />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-semibold text-[#1E2938]"
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        Shift Schedule
                      </h3>
                      <p className="text-sm text-[#1E2938]">
                        Configure working hours and shift patterns
                      </p>
                    </div>
                  </div>
                  <ShiftEditor
                    shifts={form?.shifts ?? detail.shifts ?? []}
                    onChange={setShifts}
                  />
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* ──────── Contact tab ──────── */}
            <TabsContent value="contact" className="mt-6">
              <div className="space-y-6">
                <InfoCard icon={Phone} title="Contact Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormRow label="Phone Number" icon={Phone}>
                      <input
                        type="text"
                        value={
                          form?.contactInfo?.phone ??
                          detail.contactInfo?.phone ??
                          ""
                        }
                        onChange={(e) => setContact({ phone: e.target.value })}
                        className={`${neumorphInput} w-full`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      />
                    </FormRow>
                    <FormRow label="Email Address" icon={Mail}>
                      <input
                        type="email"
                        value={
                          form?.contactInfo?.email ??
                          detail.contactInfo?.email ??
                          ""
                        }
                        readOnly
                        className={`${neumorphInput} w-full opacity-80`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      />
                    </FormRow>
                  </div>
                </InfoCard>

                <InfoCard icon={Phone} title="Emergency Contact">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormRow label="Contact Name" icon={User}>
                      <input
                        type="text"
                        value={
                          form?.contactInfo?.emergencyContact?.name ??
                          detail?.contactInfo?.emergencyContact?.name ??
                          ""
                        }
                        onChange={(e) =>
                          setContact({
                            emergencyContact: {
                              ...(form?.contactInfo?.emergencyContact ??
                                detail?.contactInfo?.emergencyContact ??
                              { name: "", phone: "", relation: "" }),
                              name: e.target.value,
                            },
                          })
                        }
                        className={`${neumorphInput} w-full`}
                      />
                    </FormRow>
                    <FormRow label="Contact Phone" icon={Phone}>
                      <input
                        type="text"
                        value={
                          form?.contactInfo?.emergencyContact?.phone ??
                          detail?.contactInfo?.emergencyContact?.phone ??
                          ""
                        }
                        onChange={(e) =>
                          setContact({
                            emergencyContact: {
                              ...(form?.contactInfo?.emergencyContact ??
                                detail?.contactInfo?.emergencyContact ??
                              { name: "", phone: "", relation: "" }),
                              phone: e.target.value,
                            },
                          })
                        }
                        className={`${neumorphInput} w-full`}
                      />
                    </FormRow>
                    <FormRow label="Relationship" icon={User}>
                      <input
                        type="text"
                        value={
                          form?.contactInfo?.emergencyContact?.relation ??
                          detail?.contactInfo?.emergencyContact?.relation ??
                          ""
                        }
                        onChange={(e) =>
                          setContact({
                            emergencyContact: {
                              ...(form?.contactInfo?.emergencyContact ??
                                detail?.contactInfo?.emergencyContact ??
                              { name: "", phone: "", relation: "" }),
                              relation: e.target.value,
                            },
                          })
                        }
                        className={`${neumorphInput} w-full`}
                      />
                    </FormRow>
                  </div>
                </InfoCard>
              </div>
            </TabsContent>

            {/* ──────── Compensation tab ──────── */}
            <TabsContent value="compensation" className="space-y-6 mt-6">
              <InfoCard icon={FaBangladeshiTakaSign} title="Current Compensation">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormRow label="Current Salary" icon={FaBangladeshiTakaSign}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form?.salary != null ? form.salary : ""}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "") {
                          setField("salary", undefined);
                          return;
                        }
                        value = value.replace(/[^0-9.]/g, "");
                        const parts = value.split(".");
                        if (parts.length > 2)
                          value = parts[0] + "." + parts.slice(1).join("");
                        if (value.includes(".")) {
                          const [int, dec] = value.split(".");
                          value = String(Number(int || "0")) + "." + dec;
                        } else {
                          value = String(Number(value));
                        }
                        const numericValue = Number(value);
                        if (!Number.isNaN(numericValue))
                          setField("salary", numericValue);
                      }}
                      className={`${neumorphInput} w-full`}
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    />
                  </FormRow>

                  <FormRow label="Currency" icon={FaBangladeshiTakaSign}>
                    <select
                      value={(form?.currency ?? detail.currency) ?? CURRENCY.BDT}
                      onChange={(e) =>
                        setField("currency", e.target.value as CURRENCY)
                      }
                      className={`${neumorphInput} w-full appearance-none`}
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {Object.values(CURRENCY).map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </FormRow>

                  <FormRow label="Payment Mode" icon={CreditCard}>
                    <select
                      value={form?.paymentMode ?? SALARY_PAYMENT_MODE.MANUAL}
                      onChange={(e) =>
                        setField("paymentMode", e.target.value as SalaryPaymentMode)
                      }
                      className={`${neumorphInput} w-full appearance-none`}
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {Object.values(SALARY_PAYMENT_MODE).map((mode) => (
                        <option key={mode} value={mode}>
                          {mode === SALARY_PAYMENT_MODE.AUTO ? "Auto" : "Manual"}
                        </option>
                      ))}
                    </select>
                  </FormRow>

                  <FormRow label="Effective From">
                    <input
                      value={latestEffectiveFrom(detail.salaryHistory) ?? "—"}
                      disabled
                      className={`${neumorphInput} w-full opacity-70 cursor-not-allowed`}
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    />
                  </FormRow>
                </div>
              </InfoCard>

              {/* UPDATED: Separate Payment Card section with its own update button */}
              <InfoCard icon={CreditCard} title="Payment Card">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {/* Card Brand */}
                    <FormRow label="Card Brand" icon={CreditCard}>
                      <select
                        value={cardForm?.brand ?? CARD_BRAND.UNKNOWN}
                        onChange={(e) => setCardField("brand", e.target.value as CardBrand)}
                        className={`${neumorphInput} w-full appearance-none`}
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        {Object.values(CARD_BRAND).map((brand) => (
                          <option key={brand} value={brand}>
                            {brand.charAt(0).toUpperCase() + brand.slice(1)}
                          </option>
                        ))}
                      </select>
                    </FormRow>

                    {/* Last 4 Digits */}
                    <FormRow label="Last 4 Digits" icon={Lock}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="1234"
                        value={cardForm?.last4 ?? ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCardField("last4", val);
                        }}
                        className={`${neumorphInput} w-full font-mono tracking-widest`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      />
                    </FormRow>

                    {/* Expiration Month */}
                    <FormRow label="Expiration Month">
                      <input
                        type="number"
                        min={1}
                        max={12}
                        placeholder="MM"
                        value={cardForm?.expMonth ?? 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= 12) {
                            setCardField("expMonth", val);
                          }
                        }}
                        className={`${neumorphInput} w-full`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      />
                    </FormRow>

                    {/* Expiration Year */}
                    <FormRow label="Expiration Year">
                      <input
                        type="number"
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 20}
                        placeholder="YYYY"
                        value={cardForm?.expYear ?? new Date().getFullYear()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) setCardField("expYear", val);
                        }}
                        className={`${neumorphInput} w-full`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      />
                    </FormRow>
                  </div>

                  {/* Update Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleUpdateCard}
                      disabled={updatingCard || !cardForm}
                      className={`${btnPrimary} ${!cardForm ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {updatingCard ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                      )}
                      {updatingCard ? "Updating..." : "Update Card"}
                    </button>
                  </div>
                </div>
              </InfoCard>
            </TabsContent>

            {/* ──────── History tab ──────── */}
            <TabsContent value="positionHistory" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoCard icon={TrendingUp} title="Salary History">
                  {(detail?.salaryHistory ?? []).length === 0 ? (
                    <div className="text-center py-8 text-[#1E2938]">
                      No salary history available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(detail?.salaryHistory ?? []).map((s, idx) => (
                        <div key={idx} className={`${neumorphRaised} p-3`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div
                                className="text-sm font-medium text-[#1E2938]"
                                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                              >
                                {s.amount} {s.currency}
                              </div>
                              <div className="text-xs text-[#1E2938]">
                                {s.reason ?? "—"}
                              </div>
                            </div>
                            <div
                              className="text-right text-xs text-[#1E2938]"
                              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                            >
                              <div>From: {formatDate(s.effectiveFrom)}</div>
                              <div>
                                To: {s.effectiveTo ? formatDate(s.effectiveTo) : "Present"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </InfoCard>

                <InfoCard icon={History} title="Audit Log (latest)">
                  {(detail?.audit ?? []).length === 0 ? (
                    <div className="text-center py-8 text-[#1E2938]">
                      No audit entries
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(detail?.audit ?? []).map((a) => (
                        <div key={a._id} className={`${neumorphRaised} p-3`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium text-[#1E2938]">
                                {a.action}
                              </div>
                              <div className="text-xs text-[#1E2938]">
                                {a.note ?? ""}
                              </div>
                              <div className="text-xs text-[#1E2938] mt-1">
                                Actor: {a.actor ?? "system"}{" "}
                                {a.actorModel ? `(${a.actorModel})` : ""}
                              </div>
                            </div>
                            <div
                              className="text-right text-xs text-[#1E2938]"
                              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                            >
                              <div>{formatDate(a.createdAt)}</div>
                            </div>
                          </div>
                          {a.changes && (
                            <details className="mt-2 text-xs text-[#1E2938]">
                              <summary className="cursor-pointer">
                                View changes
                              </summary>
                              <pre className="whitespace-pre-wrap mt-2 text-xs">
                                {JSON.stringify(a.changes, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </InfoCard>
              </div>
            </TabsContent>

            {/* ──────── Documents tab ──────── */}
            <TabsContent value="documents" className="mt-6">
              <InfoCard icon={FileText} title="Employee Documents">
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      handleDocumentsFiles(e.target.files ?? undefined)
                    }
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#E7E5E4] file:text-[#1E2938] file: hover:file: file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-xs text-[#1E2938] mt-2">
                    Images, PDFs and other allowed files. Max 5 MB per file.
                  </p>
                </div>

                {(form?.documents ?? detail.documents ?? []).length === 0 ? (
                  <div className="text-center py-16 text-[#1E2938]">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p
                      className="text-lg"
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      No documents uploaded yet
                    </p>
                    <p className="text-sm mt-2">Employee documents will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(form?.documents ?? []).map((doc, i) => (
                      <div
                        key={i}
                        className={`${neumorphCard} p-5 flex flex-col`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <FileText className="h-8 w-8 text-[#006666]" />
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${neumorphRaised} text-[#006666]`}
                          >
                            {doc.type}
                          </span>
                        </div>
                        <div className="space-y-2 flex-1">
                          <p
                            className="text-sm font-medium line-clamp-1 text-[#1E2938]"
                            style={{ fontFamily: "var(--font-space-mono)" }}
                          >
                            {doc.name || doc.type}
                          </p>
                          <p
                            className="text-xs text-[#1E2938] flex items-center gap-1"
                            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                          >
                            <Calendar className="h-3 w-3" />
                            {formatDate(doc.uploadedAt)}
                          </p>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-sm text-[#006666] hover:text-[#004d4d] font-medium mt-2"
                            onClick={() => setViewerDoc(doc)}
                          >
                            View Document →
                          </button>
                        </div>
                        <button
                          onClick={() => removeDocumentAt(i)}
                          className="mt-3 text-[#FF2157] text-sm flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {viewerDoc && (
                  <DocumentViewerDialog
                    open={!!viewerDoc}
                    onClose={() => setViewerDoc(null)}
                    url={viewerDoc.url}
                    filename={viewerDoc.name || viewerDoc.type}
                    type={viewerDoc.type}
                    uploadedAt={viewerDoc.uploadedAt}
                  />
                )}
              </InfoCard>
            </TabsContent>

            {/* ──────── Notes tab ──────── */}
            <TabsContent value="notes" className="mt-6">
              <InfoCard icon={StickyNote} title="Internal Notes">
                <p className="text-sm text-[#1E2938] mb-4">
                  Add private notes about this employee. Only visible to administrators.
                </p>
                <textarea
                  value={form?.notes ?? ""}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Enter internal notes here..."
                  className={`${neumorphInput} w-full min-h-[200px]`}
                  style={{ fontFamily: "var(--font-space-mono)" }}
                />
              </InfoCard>
            </TabsContent>

            {/* ──────── Admin tab ──────── */}
            <TabsContent value="admin" className="space-y-6 mt-6">
              <div className={`${neumorphCard} p-6 border-2 border-[#FF2157]/20`}>
                <div className="flex items-start gap-4 p-4 rounded-lg border border-[#FF2157]/30">
                  <Flame className="h-5 w-5 text-[#FF2157] mt-0.5" />
                  <div className="flex-1">
                    <h4
                      className="font-semibold text-[#1E2938]"
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {!detail.isDeleted
                        ? "Delete Employee Record"
                        : "Restore Employee Record"}
                    </h4>
                    <p className="text-sm text-[#1E2938] mt-1">
                      {!detail.isDeleted
                        ? "This action will soft delete the employee record. It can be restored later."
                        : "This action will restore the employee record and make it active again."}
                    </p>
                  </div>
                  {!detail.isDeleted ? (
                    <button
                      onClick={async () => {
                        setDialogMode("delete");
                        setDialogOpen(true);
                      }}
                      className={btnDanger}
                    >
                      <Flame className="mr-2 h-4 w-4" /> Delete Record
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setDialogMode("restore");
                        setDialogOpen(true);
                      }}
                      className={btnSuccess}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Restore Record
                    </button>
                  )}
                </div>

                {/* Password management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className={`${neumorphCard} p-5`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={`p-2 rounded-lg ${neumorphRaised}`}
                      >
                        <Lock className="h-4 w-4 text-[#006666]" />
                      </div>
                      <h4
                        className="font-semibold text-[#1E2938]"
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        Password Management
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className={`${neumorphInput} w-full pr-10`}
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        />
                        {newPassword && (
                          <button
                            type="button"
                            onClick={() => setNewPassword("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2938] hover:text-[#006666]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="send-mail"
                          checked={sendMail}
                          onChange={(e) => setSendMail(e.target.checked)}
                          className="h-4 w-4 rounded border-[#C6C4C3] text-[#006666] focus:ring-[#006666]"
                        />
                        <label
                          htmlFor="send-mail"
                          className="text-sm font-medium text-[#1E2938] flex items-center gap-2"
                          style={{ fontFamily: "var(--font-space-mono)" }}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Send mail with new password
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleGeneratePassword}
                          className={`${btnDefault} flex-1 justify-center`}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </button>
                        <button
                          onClick={handleUpdatePassword}
                          disabled={!newPassword}
                          className={`${btnPrimary} flex-1 justify-center ${!newPassword ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          {isPassUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          {isPassUpdating ? "Updating..." : "Update"}
                        </button>
                      </div>

                      {generatedPassword && (
                        <div className="mt-3 p-3 rounded-lg border border-[#C6C4C3]">
                          <p className="text-xs font-medium text-[#006666] mb-2 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Generated Password:
                          </p>
                          <div className="flex items-center gap-2">
                            <code
                              className="flex-1 bg-[#E7E5E4] px-3 py-2 rounded font-mono text-sm text-[#1E2938] border border-[#C6C4C3]"
                              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                            >
                              {generatedPassword}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedPassword);
                                showToast.success("Password copied to clipboard");
                              }}
                              className="p-2 hover:bg-[#E7E5E4] rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4 text-[#1E2938]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {detail.isDeleted && (
                  <div className="flex items-center gap-2 p-3 mt-4 rounded-lg border border-[#FE9900]/30">
                    <div className="h-2 w-2 rounded-full bg-[#FE9900] animate-pulse" />
                    <p className="text-sm text-[#1E2938] font-medium">
                      This employee record is currently deleted
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={(s: boolean) => setDialogOpen(s)}
        onConfirm={(reason: string) =>
          dialogMode === "delete" ? handleDelete(reason) : handleRestore()
        }
        mode={dialogMode}
        employeeName={detail.user.name}
      />
    </>
  );
}