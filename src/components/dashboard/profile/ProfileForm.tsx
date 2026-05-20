// Professional Profile Form Component for Owner Guide — Neumorphism Design System
import { useState, useEffect, useCallback } from "react";
import {
  CurrentUser,
  IOwnerGuideInfo,
  RequestMeta,
  OwnerProfileUpdateData,
} from "@/types/current-user.types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  User,
  Mail,
  Building2,
  Image as ImageIcon,
  Globe,
  MapPin,
  FileText,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  ClipboardList,
  Calendar,
  Phone,
  ExternalLink,
  Shield,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { fileToBase64, isAllowedExtension } from "@/utils/helpers/file-conversion";
import { IMAGE_EXTENSIONS } from "@/utils/helpers/file-conversion";
import {
  GUIDE_SOCIAL_PLATFORM,
  GuideSocialPlatform,
  GUIDE_DOCUMENT_CATEGORY,
  type GuideDocumentCategory,
  GUIDE_STATUS,
  type GuideStatus,
} from "@/constants/guide/guide.const";
import { GuideSocialLink } from "@/types/guide.types";
import { showToast } from "@/components/global/showToast";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import Image from "next/image";
import AvatarUpload from "./AvatarUpload";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const N = {
  surface: "#E7E5E4",
  primary: "#006666",
  text: "#1E2938",
  muted: "#6B7280",
  success: "#00A63D",
  warning: "#FE9900",
  danger: "#FF2157",
  shadowOut: "6px 6px 12px #c4c2c1, -6px -6px 12px #ffffff",
  shadowOutSm: "3px 3px 6px #c4c2c1, -3px -3px 6px #ffffff",
  shadowIn: "inset 4px 4px 8px #c4c2c1, inset -4px -4px 8px #ffffff",
  shadowInSm: "inset 2px 2px 5px #c4c2c1, inset -2px -2px 5px #ffffff",
  fontMono: "'Space Mono', monospace",
  fontBody: "'JetBrains Mono', monospace",
};

// ─── Reusable Neumorphic Primitives ──────────────────────────────────────────
function NeuCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: N.surface, boxShadow: N.shadowOut }}
    >
      {children}
    </div>
  );
}

function NeuInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  id?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
      style={{
        background: N.surface,
        boxShadow: disabled ? N.shadowOutSm : N.shadowIn,
        color: disabled ? N.muted : N.text,
        fontFamily: N.fontBody,
        border: "none",
        caretColor: N.primary,
      }}
    />
  );
}

function NeuTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
      style={{
        background: N.surface,
        boxShadow: N.shadowIn,
        color: N.text,
        fontFamily: N.fontBody,
        border: "none",
        caretColor: N.primary,
      }}
    />
  );
}

function NeuButton({
  onClick,
  disabled,
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  fullWidth?: boolean;
  type?: "button" | "submit";
}) {
  const color =
    variant === "primary" ? N.primary : variant === "danger" ? N.danger : N.muted;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl font-bold transition-all active:scale-95 ${
        size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm"
      } ${fullWidth ? "w-full justify-center" : ""}`}
      style={{
        background: N.surface,
        boxShadow: disabled ? "none" : N.shadowOutSm,
        color,
        fontFamily: N.fontMono,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseDown={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = N.shadowInSm;
      }}
      onMouseUp={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = N.shadowOutSm;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = disabled ? "none" : N.shadowOutSm;
      }}
    >
      {children}
    </button>
  );
}

function NeuLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold mb-2 tracking-widest uppercase"
      style={{ color: N.muted, fontFamily: N.fontMono }}
    >
      {children}
    </label>
  );
}

function NeuSectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: N.surface, boxShadow: N.shadowIn }}
      >
        <Icon className="h-4 w-4" style={{ color: N.primary }} />
      </div>
      <h3 className="font-bold tracking-tight" style={{ color: N.text, fontFamily: N.fontMono, fontSize: 15 }}>
        {title}
      </h3>
    </div>
  );
}

function NeuDivider() {
  return (
    <div
      className="h-px my-6 rounded-full"
      style={{ background: "linear-gradient(to right, transparent, #c4c2c1, transparent)" }}
    />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileFormProps {
  fullUser: IOwnerGuideInfo | null;
  isLoading: boolean;
  updateUserName: (data: { name: string }) => Promise<CurrentUser | null>;
  updateCompanyName: (data: { companyName: string }) => Promise<CurrentUser | null>;
  updateCompanyLogo: (data: { logoUrl: string }) => Promise<CurrentUser | null>;
  updateOwnerProfile: (data: OwnerProfileUpdateData) => Promise<CurrentUser | null>;
  updateAvatar: (data: { avatarBase64: string }) => Promise<CurrentUser | null>;
  updateAvatarMeta?: RequestMeta;
  updateNameMeta?: RequestMeta;
  updateCompanyNameMeta?: RequestMeta;
  updateCompanyLogoMeta?: RequestMeta;
  updateOwnerProfileMeta?: RequestMeta;
}

const DOCUMENT_CATEGORY_LABEL: Record<GuideDocumentCategory, string> = {
  [GUIDE_DOCUMENT_CATEGORY.GOVERNMENT_ID]: "Government ID",
  [GUIDE_DOCUMENT_CATEGORY.BUSINESS_LICENSE]: "Business License",
  [GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO]: "Professional Photo",
  [GUIDE_DOCUMENT_CATEGORY.CERTIFICATION]: "Certification",
};

function formatGuideTimestamp(value: Date | string | undefined | null): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatStatusLabel(status: GuideStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusBadgeStyle(status: GuideStatus): React.CSSProperties {
  const map: Record<string, { color: string; bg: string }> = {
    [GUIDE_STATUS.APPROVED]: { color: "#00A63D", bg: "rgba(0,166,61,0.10)" },
    [GUIDE_STATUS.PENDING]: { color: "#FE9900", bg: "rgba(254,153,0,0.10)" },
    [GUIDE_STATUS.REJECTED]: { color: "#FF2157", bg: "rgba(255,33,87,0.10)" },
    [GUIDE_STATUS.SUSPENDED]: { color: "#FE9900", bg: "rgba(254,153,0,0.10)" },
  };
  const s = map[status] ?? { color: N.muted, bg: "rgba(107,114,128,0.10)" };
  return {
    background: s.bg,
    color: s.color,
    border: `1px solid ${s.color}33`,
    fontFamily: N.fontMono,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "3px 10px",
    borderRadius: 8,
  };
}

interface SocialLinkForm {
  platform: GuideSocialLink["platform"];
  url: string;
}

interface AddressForm {
  country: string;
  division: string;
  city: string;
  zip: string;
  street: string;
}

export default function ProfileForm({
  fullUser,
  isLoading,
  updateUserName,
  updateCompanyName,
  updateCompanyLogo,
  updateOwnerProfile,
  updateAvatar,
  updateAvatarMeta,
  updateNameMeta,
  updateCompanyNameMeta,
  updateCompanyLogoMeta,
  updateOwnerProfileMeta,
}: ProfileFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState<AddressForm>({
    country: "", division: "", city: "", zip: "", street: "",
  });
  const [socialLinks, setSocialLinks] = useState<IOwnerGuideInfo["social"]>([]);
  const [newSocialLink, setNewSocialLink] = useState<NonNullable<IOwnerGuideInfo["social"]>[number]>({
    platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK, url: "",
  });
  const [activeSection, setActiveSection] = useState<"overview" | "personal" | "company" | "profile">("overview");
  const [showSuccess, setShowSuccess] = useState<{ type: string; message: string } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoProcessing, setLogoProcessing] = useState(false);

  useEffect(() => {
    if (fullUser) {
      setName(fullUser.owner?.name || "");
      setEmail(fullUser.owner?.email || "");
      setCompanyName(fullUser.companyName || "");
      setBio(fullUser.bio || "");
      if (fullUser.logoUrl) setLogoPreview(fullUser.logoUrl);
      if (fullUser.address) {
        setAddress({
          country: fullUser.address.country || "",
          division: fullUser.address.division || "",
          city: fullUser.address.city || "",
          zip: fullUser.address.zip || "",
          street: fullUser.address.street || "",
        });
      }
      if (fullUser.social && Array.isArray(fullUser.social)) {
        setSocialLinks(
          fullUser.social.map((link) => {
            const raw = String(link.platform);
            const values = Object.values(GUIDE_SOCIAL_PLATFORM) as GuideSocialPlatform[];
            let platform: GuideSocialPlatform;
            if (values.includes(raw as GuideSocialPlatform)) {
              platform = raw as GuideSocialPlatform;
            } else if (raw in GUIDE_SOCIAL_PLATFORM) {
              platform = GUIDE_SOCIAL_PLATFORM[raw as keyof typeof GUIDE_SOCIAL_PLATFORM];
            } else {
              platform = GUIDE_SOCIAL_PLATFORM.FACEBOOK;
            }
            return { platform, url: link.url };
          })
        );
      }
    }
  }, [fullUser]);

  const calculateCompletion = useCallback(() => {
    let completed = 0;
    let total = 0;
    if (name.trim().length >= 2) completed += 1; total += 1;
    if (email.includes("@")) completed += 1; total += 1;
    if (companyName.trim().length >= 2) completed += 1; total += 1;
    if (bio.trim().length >= 10) completed += 1; total += 1;
    if (logoPreview) completed += 1; total += 1;
    const addressFields = Object.values(address).filter((val) => val.trim().length > 0);
    if (addressFields.length >= 3) completed += 1; total += 1;
    const validSocialLinks = (socialLinks ?? []).filter(
      (link) => link.url.trim().length > 0 && (link.url.startsWith("http://") || link.url.startsWith("https://"))
    );
    if (validSocialLinks.length > 0) completed += 1; total += 1;
    return Math.round((completed / total) * 100);
  }, [name, email, companyName, bio, logoPreview, address, socialLinks]);

  const completionPercentage = calculateCompletion();

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
      setLogoError(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(", ")}`);
      showToast.warning(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(", ")}`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("File too large. Maximum size is 5MB.");
      showToast.warning("File too large. Maximum size is 5MB.");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !logoPreview) {
      setLogoError("Please select a logo image first.");
      return;
    }
    setLogoProcessing(true);
    setLogoError(null);
    try {
      const base64Data = await fileToBase64(logoFile, {
        compressImages: true, maxWidth: 1200, quality: 0.8,
        maxFileBytes: 5 * 1024 * 1024, allowedExtensions: IMAGE_EXTENSIONS,
      });
      const result = await updateCompanyLogo({ logoUrl: base64Data });
      if (result) {
        setShowSuccess({ type: "logo", message: "Logo updated successfully!" });
        setTimeout(() => setShowSuccess(null), 3000);
      }
    } catch (err: unknown) {
      showToast.error("Failed to process logo image.", extractErrorMessage(err));
      setLogoError(extractErrorMessage(err) ?? "Failed to process logo image.");
    } finally {
      setLogoProcessing(false);
    }
  };

  const addSocialLink = () => {
    if (!newSocialLink.url.trim()) return;
    let url = newSocialLink.url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
    setSocialLinks([...(socialLinks ?? []), { ...newSocialLink, url }]);
    setNewSocialLink({ platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK, url: "" });
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((socialLinks ?? []).filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLinkForm, value: string) => {
    const updated = [...(socialLinks ?? [])];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const handleSavePersonalInfo = async () => {
    if (!name.trim() || name.trim().length < 2) return;
    const result = await updateUserName({ name: name.trim() });
    if (result) {
      setShowSuccess({ type: "personal", message: "Personal information updated successfully!" });
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!companyName.trim() || companyName.trim().length < 2) return;
    const result = await updateCompanyName({ companyName: companyName.trim() });
    if (result) {
      setShowSuccess({ type: "company", message: "Company information updated successfully!" });
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  const handleSaveProfileDetails = async () => {
    const updateData: OwnerProfileUpdateData = {};
    if (bio.trim()) updateData.bio = bio.trim();
    const hasAddress = Object.values(address).some((val) => val.trim().length > 0);
    if (hasAddress) updateData.address = address;
    if (socialLinks && socialLinks.length > 0) {
      updateData.social = socialLinks.map((link) => ({ platform: link.platform, url: link.url }));
    }
    if (Object.keys(updateData).length === 0) return;
    const result = await updateOwnerProfile(updateData);
    if (result) {
      setShowSuccess({ type: "profile", message: "Profile details updated successfully!" });
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  const hasPersonalChanges = fullUser?.owner?.name !== name.trim();
  const hasCompanyChanges = fullUser?.companyName !== companyName.trim() || fullUser?.bio !== bio.trim();
  const hasAddressChanges = JSON.stringify(fullUser?.address || {}) !== JSON.stringify(address);
  const hasSocialChanges =
    JSON.stringify(fullUser?.social || []) !==
    JSON.stringify((socialLinks ?? []).map((l) => ({ platform: l.platform, url: l.url })));
  const hasProfileChanges = hasAddressChanges || hasSocialChanges;

  const getSocialIcon = (platform: GuideSocialPlatform) => {
    switch (platform) {
      case GUIDE_SOCIAL_PLATFORM.FACEBOOK: return <Facebook className="h-4 w-4" />;
      case GUIDE_SOCIAL_PLATFORM.INSTAGRAM: return <Instagram className="h-4 w-4" />;
      case GUIDE_SOCIAL_PLATFORM.TWITTER: return <Twitter className="h-4 w-4" />;
      case GUIDE_SOCIAL_PLATFORM.WHATSAPP: return <MessageCircle className="h-4 w-4" />;
      case GUIDE_SOCIAL_PLATFORM.IMO: return <MessageCircle className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const navigationTabs = [
    { id: "overview", label: "Overview", icon: ClipboardList },
    { id: "personal", label: "Personal", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "profile", label: "Profile Details", icon: FileText },
  ] as const;

  return (
    <div className="space-y-6" style={{ fontFamily: N.fontMono }}>
      {/* ─── Header with Progress ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <NeuCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: N.text }}>Profile Settings</h2>
              <p className="text-xs mt-1" style={{ color: N.muted, fontFamily: N.fontBody }}>
                Manage your personal and company information
              </p>
            </div>

            {/* Circular Progress */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-bold tracking-widest uppercase" style={{ color: N.muted }}>
                  Completion
                </div>
                <div className="text-2xl font-bold" style={{ color: N.primary }}>{completionPercentage}%</div>
              </div>
              <div
                className="relative h-14 w-14 rounded-full flex items-center justify-center"
                style={{ boxShadow: N.shadowIn, background: N.surface }}
              >
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#c4c2c1" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="38" fill="transparent"
                    stroke={N.primary} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${completionPercentage * 2.39} 239`}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div
            className="flex gap-1 p-1.5 rounded-xl"
            style={{ background: N.surface, boxShadow: N.shadowIn }}
          >
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as typeof activeSection)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center"
                  style={{
                    background: N.surface,
                    boxShadow: isActive ? N.shadowIn : "none",
                    color: isActive ? N.primary : N.muted,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: N.fontMono,
                    letterSpacing: "0.04em",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </NeuCard>
      </motion.div>

      {/* ─── Success Toast ─── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-xl"
              style={{ background: N.surface, boxShadow: N.shadowOutSm, borderLeft: `3px solid ${N.success}` }}
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: N.success }} />
              <span className="text-sm font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>
                {showSuccess.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === "overview" && fullUser && (
          <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <NeuCard>
              {/* Header */}
              <div className="flex items-start gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid #c4c2c1" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                  <ClipboardList className="h-6 w-6" style={{ color: N.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: N.text }}>Full Guide Record</h3>
                  <p className="text-xs mt-1" style={{ color: N.muted, fontFamily: N.fontBody }}>
                    Read-only snapshot of your guide profile as stored on the server.
                  </p>
                </div>
              </div>

              {/* Status & Review */}
              <NeuSectionHeader icon={Shield} title="Status & Review" />
              <dl className="grid gap-3 sm:grid-cols-2 text-sm mb-6">
                <div>
                  <dt className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: N.muted }}>Application Status</dt>
                  <dd><span style={statusBadgeStyle(fullUser.status)}>{formatStatusLabel(fullUser.status)}</span></dd>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-widest uppercase mb-2 flex items-center gap-1" style={{ color: N.muted }}>
                    <Calendar className="h-3 w-3" /> Reviewed At
                  </dt>
                  <dd className="font-bold text-xs" style={{ color: N.text, fontFamily: N.fontBody }}>{formatGuideTimestamp(fullUser.reviewedAt)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: N.muted }}>Review Comment</dt>
                  <dd className="px-4 py-3 rounded-xl text-xs" style={{ background: N.surface, boxShadow: N.shadowIn, color: N.text, fontFamily: N.fontBody, whiteSpace: "pre-wrap" }}>
                    {fullUser.reviewComment?.trim() ? fullUser.reviewComment : "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: N.muted }}>Reviewer</dt>
                  <dd className="font-bold text-xs" style={{ color: N.text, fontFamily: N.fontBody }}>
                    {fullUser.reviewer ? (
                      <span>{fullUser.reviewer.name} {fullUser.reviewer.email && <span style={{ color: N.muted }}>({fullUser.reviewer.email})</span>}</span>
                    ) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>Guide Created</dt>
                  <dd className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>{formatGuideTimestamp(fullUser.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>Last Updated</dt>
                  <dd className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>{formatGuideTimestamp(fullUser.updatedAt)}</dd>
                </div>
              </dl>

              <NeuDivider />

              {/* Owner */}
              <NeuSectionHeader icon={User} title="Owner (On File)" />
              <dl className="grid gap-3 sm:grid-cols-2 text-sm mb-4">
                {[
                  { label: "Name", value: fullUser.owner.name },
                  { label: "Email", value: fullUser.owner.email },
                  { label: "Phone", value: fullUser.owner.phone?.trim() || "—" },
                  { label: "Member Since", value: formatGuideTimestamp(fullUser.owner.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>{label}</dt>
                    <dd className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>Avatar URL</dt>
                  <dd className="text-xs break-all" style={{ color: N.muted, fontFamily: N.fontBody }}>
                    {fullUser.owner.avatar?.trim() || "—"}
                  </dd>
                </div>
              </dl>
              {fullUser.owner.avatar && (
                <div className="h-16 w-16 rounded-xl overflow-hidden mb-4" style={{ boxShadow: N.shadowOutSm }}>
                  <Image src={fullUser.owner.avatar} alt="Owner avatar" width={64} height={64} className="object-cover w-full h-full" unoptimized />
                </div>
              )}

              <NeuDivider />

              {/* Company */}
              <NeuSectionHeader icon={Building2} title="Company (On File)" />
              <dl className="grid gap-3 sm:grid-cols-2 text-sm mb-4">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>Company Name</dt>
                  <dd className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>{fullUser.companyName}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: N.muted }}>Bio</dt>
                  <dd className="px-4 py-3 rounded-xl text-xs" style={{ background: N.surface, boxShadow: N.shadowIn, color: N.text, fontFamily: N.fontBody, whiteSpace: "pre-wrap" }}>
                    {fullUser.bio?.trim() ? fullUser.bio : "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N.muted }}>Logo URL</dt>
                  <dd className="text-xs break-all" style={{ color: N.muted, fontFamily: N.fontBody }}>
                    {fullUser.logoUrl?.trim() ? fullUser.logoUrl : "—"}
                  </dd>
                </div>
              </dl>

              <NeuDivider />

              {/* Address */}
              <NeuSectionHeader icon={MapPin} title="Address (On File)" />
              <dl className="space-y-2 mb-4">
                {(["country", "division", "city", "zip", "street"] as const).map((key) => (
                  <div key={key} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
                    <dt className="text-xs font-bold tracking-widest uppercase" style={{ color: N.muted }}>{key}</dt>
                    <dd className="text-xs font-bold" style={{ color: N.text, fontFamily: N.fontBody }}>
                      {fullUser.address?.[key]?.trim() ? fullUser.address[key] : "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              <NeuDivider />

              {/* Social Links */}
              <NeuSectionHeader icon={Globe} title="Social Links (On File)" />
              {fullUser.social && fullUser.social.length > 0 ? (
                <ul className="space-y-2 mb-4">
                  {fullUser.social.map((s, i) => (
                    <li key={`${s.platform}-${i}`} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
                      <span className="text-xs font-bold uppercase" style={{ color: N.primary }}>{s.platform}</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: N.muted, fontFamily: N.fontBody }}>
                        {s.url} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs mb-4" style={{ color: N.muted, fontFamily: N.fontBody }}>No social links on file.</p>
              )}

              <NeuDivider />

              {/* Documents */}
              <NeuSectionHeader icon={FileText} title="Verification Documents" />
              {fullUser.documents?.length ? (
                <ul className="divide-y rounded-xl overflow-hidden" style={{ boxShadow: N.shadowIn }}>
                  {fullUser.documents.map((doc, i) => (
                    <li key={`${doc.category}-${i}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3" style={{ background: N.surface }}>
                      <div>
                        <p className="text-xs font-bold" style={{ color: N.text }}>{DOCUMENT_CATEGORY_LABEL[doc.category] ?? doc.category}</p>
                        <p className="text-xs mt-0.5" style={{ color: N.muted, fontFamily: N.fontBody }}>
                          Uploaded {formatGuideTimestamp(doc.uploadedAt)}
                        </p>
                      </div>
                      {doc.AssetUrl ? (
                        <a href={doc.AssetUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold"
                          style={{ color: N.primary }}
                        >
                          Open file <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs" style={{ color: N.muted }}>File unavailable</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs" style={{ color: N.muted, fontFamily: N.fontBody }}>No documents on file.</p>
              )}
            </NeuCard>
          </motion.div>
        )}

        {activeSection === "overview" && !fullUser && (
          <motion.div key="overview-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NeuCard>
              <div className="flex items-center gap-3 py-8 justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: N.primary }} />
                    <span className="text-sm" style={{ color: N.muted, fontFamily: N.fontBody }}>Loading guide profile…</span>
                  </>
                ) : (
                  <span className="text-sm" style={{ color: N.muted, fontFamily: N.fontBody }}>Guide profile could not be loaded.</span>
                )}
              </div>
            </NeuCard>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PERSONAL */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === "personal" && (
          <motion.div key="personal" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <NeuCard>
              <div className="flex items-start gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid #c4c2c1" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                  <User className="h-6 w-6" style={{ color: N.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: N.text }}>Personal Information</h3>
                  <p className="text-xs mt-1" style={{ color: N.muted, fontFamily: N.fontBody }}>Update your name and contact information</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <NeuLabel htmlFor="name">
                    <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> Full Name</span>
                  </NeuLabel>
                  <div className="relative">
                    <NeuInput
                      id="name" value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isLoading || updateNameMeta?.loading}
                    />
                    {hasPersonalChanges && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full animate-pulse" style={{ background: N.primary }} />
                    )}
                  </div>
                  {name.trim() && name.trim().length < 2 && (
                    <p className="text-xs mt-1.5" style={{ color: N.danger, fontFamily: N.fontBody }}>Name must be at least 2 characters</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <NeuLabel>
                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email Address</span>
                  </NeuLabel>
                  <div className="relative">
                    <NeuInput value={email} disabled />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{ background: N.surface, boxShadow: N.shadowOutSm, color: N.muted, fontFamily: N.fontMono }}
                    >
                      Read Only
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mt-2 px-3 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm }}>
                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: N.muted }} />
                    <p className="text-xs" style={{ color: N.muted, fontFamily: N.fontBody }}>
                      Email address cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                </div>

                <NeuDivider />

                <AvatarUpload
                  currentAvatarUrl={fullUser?.owner?.avatar}
                  updateAvatar={updateAvatar}
                  meta={updateAvatarMeta}
                />

                {/* Save */}
                <div className="pt-2 flex justify-end">
                  <NeuButton
                    onClick={handleSavePersonalInfo}
                    disabled={!hasPersonalChanges || name.trim().length < 2 || updateNameMeta?.loading}
                  >
                    {updateNameMeta?.loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="h-4 w-4" /> Save Personal Info</>
                    )}
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* COMPANY */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === "company" && (
          <motion.div key="company" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <NeuCard>
              <div className="flex items-start gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid #c4c2c1" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                  <Building2 className="h-6 w-6" style={{ color: N.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: N.text }}>Company Information</h3>
                  <p className="text-xs mt-1" style={{ color: N.muted, fontFamily: N.fontBody }}>Update your company details and branding</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Company Name */}
                <div>
                  <NeuLabel htmlFor="companyName">Company Name</NeuLabel>
                  <div className="relative">
                    <NeuInput
                      id="companyName" value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      disabled={isLoading || updateCompanyNameMeta?.loading}
                    />
                    {hasCompanyChanges && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full animate-pulse" style={{ background: N.primary }} />
                    )}
                  </div>
                </div>

                {/* Company Logo */}
                <div>
                  <NeuLabel htmlFor="logo">Company Logo</NeuLabel>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div
                        className="rounded-xl p-6 text-center"
                        style={{ background: N.surface, boxShadow: N.shadowIn }}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: N.surface, boxShadow: N.shadowOut }}>
                            <ImageIcon className="h-6 w-6" style={{ color: N.muted }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: N.text }}>Upload your logo</p>
                            <p className="text-xs mt-0.5" style={{ color: N.muted, fontFamily: N.fontBody }}>PNG, JPG, GIF up to 5MB</p>
                          </div>
                          <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                          <NeuButton size="sm" onClick={() => document.getElementById("logo")?.click()} disabled={logoProcessing}>
                            <ImageIcon className="h-3.5 w-3.5" /> Choose File
                          </NeuButton>
                          {logoFile && (
                            <p className="text-xs" style={{ color: N.muted, fontFamily: N.fontBody }}>Selected: {logoFile.name}</p>
                          )}
                        </div>
                      </div>

                      {logoError && (
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowInSm, borderLeft: `3px solid ${N.danger}` }}>
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: N.danger }} />
                          <p className="text-xs" style={{ color: N.danger, fontFamily: N.fontBody }}>{logoError}</p>
                        </div>
                      )}

                      {logoPreview && (
                        <NeuButton onClick={handleLogoUpload} disabled={logoProcessing || updateCompanyLogoMeta?.loading} fullWidth>
                          {logoProcessing || updateCompanyLogoMeta?.loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading Logo…</>
                          ) : (
                            <><ImageIcon className="h-4 w-4" /> Upload Logo</>
                          )}
                        </NeuButton>
                      )}
                    </div>

                    {/* Preview */}
                    <div className="w-28 flex-shrink-0">
                      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: N.muted }}>Preview</p>
                      <div className="aspect-square rounded-xl overflow-hidden flex items-center justify-center" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                        {logoPreview ? (
                          <div className="relative w-full h-full">
                            <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                          </div>
                        ) : (
                          <ImageIcon className="h-8 w-8" style={{ color: N.muted }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Bio */}
                <div>
                  <NeuLabel htmlFor="bio">Company Bio / Description</NeuLabel>
                  <NeuTextarea
                    id="bio" value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your company..."
                    rows={4}
                  />
                  <div className="flex justify-between text-xs mt-1.5">
                    <span style={{ color: N.muted, fontFamily: N.fontBody }}>Brief description of your company</span>
                    <span style={{ color: N.muted, fontFamily: N.fontBody }}>{bio.length}/1000</span>
                  </div>
                </div>

                {/* Save */}
                <div className="pt-2 flex justify-end">
                  <NeuButton
                    onClick={handleSaveCompanyInfo}
                    disabled={!hasCompanyChanges || companyName.trim().length < 2 || updateCompanyNameMeta?.loading}
                  >
                    {updateCompanyNameMeta?.loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="h-4 w-4" /> Save Company Info</>
                    )}
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PROFILE DETAILS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <NeuCard>
              <div className="flex items-start gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid #c4c2c1" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                  <FileText className="h-6 w-6" style={{ color: N.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: N.text }}>Profile Details</h3>
                  <p className="text-xs mt-1" style={{ color: N.muted, fontFamily: N.fontBody }}>Update your address and social media links</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <NeuSectionHeader icon={MapPin} title="Address" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["country", "division", "city", "zip"] as const).map((field) => (
                    <div key={field}>
                      <NeuLabel htmlFor={field}>{field === "division" ? "State/Province" : field === "zip" ? "ZIP/Postal Code" : field.charAt(0).toUpperCase() + field.slice(1)}</NeuLabel>
                      <NeuInput
                        id={field}
                        value={address[field]}
                        onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                        placeholder={field === "division" ? "State or Province" : field === "zip" ? "ZIP Code" : field.charAt(0).toUpperCase() + field.slice(1)}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <NeuLabel htmlFor="street">Street Address</NeuLabel>
                    <NeuInput
                      id="street" value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <NeuDivider />

                {/* Social Links */}
                <NeuSectionHeader icon={Globe} title="Social Media Links" />
                <div className="space-y-3">
                  {(socialLinks ?? []).map((link, index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                      <span style={{ color: N.primary }}>{getSocialIcon(link.platform)}</span>
                      <Select value={link.platform} onValueChange={(value) => updateSocialLink(index, "platform", value)}>
                        <SelectTrigger className="w-32 border-0 text-xs font-bold" style={{ background: N.surface, boxShadow: N.shadowOutSm, fontFamily: N.fontMono, color: N.text }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GUIDE_SOCIAL_PLATFORM).map(([key, val]) => (
                            <SelectItem key={key} value={val}>
                              <div className="flex items-center gap-2 text-xs">
                                {getSocialIcon(val as GuideSocialPlatform)}
                                <span>{key}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <NeuInput
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                        placeholder="https://..."
                      />
                      <button
                        onClick={() => removeSocialLink(index)}
                        className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: N.surface, boxShadow: N.shadowOutSm, border: "none", cursor: "pointer" }}
                        onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = N.shadowInSm; }}
                        onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = N.shadowOutSm; }}
                      >
                        <X className="h-3.5 w-3.5" style={{ color: N.danger }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Social Link */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: N.surface, boxShadow: N.shadowIn }}>
                  <Select value={newSocialLink.platform} onValueChange={(value) => setNewSocialLink({ ...newSocialLink, platform: value as GuideSocialPlatform })}>
                    <SelectTrigger className="w-32 border-0 text-xs font-bold" style={{ background: N.surface, boxShadow: N.shadowOutSm, fontFamily: N.fontMono, color: N.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GUIDE_SOCIAL_PLATFORM).map(([key, val]) => (
                        <SelectItem key={key} value={val}>
                          <div className="flex items-center gap-2 text-xs">
                            {getSocialIcon(val as GuideSocialPlatform)}
                            <span>{key}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <NeuInput
                    value={newSocialLink.url}
                    onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                    placeholder="Enter URL…"
                  />
                  <button
                    onClick={addSocialLink}
                    disabled={!newSocialLink.url.trim()}
                    className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: N.surface,
                      boxShadow: newSocialLink.url.trim() ? N.shadowOutSm : "none",
                      border: "none",
                      cursor: newSocialLink.url.trim() ? "pointer" : "not-allowed",
                      opacity: newSocialLink.url.trim() ? 1 : 0.4,
                    }}
                    onMouseDown={(e) => { if (newSocialLink.url.trim()) (e.currentTarget as HTMLButtonElement).style.boxShadow = N.shadowInSm; }}
                    onMouseUp={(e) => { if (newSocialLink.url.trim()) (e.currentTarget as HTMLButtonElement).style.boxShadow = N.shadowOutSm; }}
                  >
                    <Plus className="h-3.5 w-3.5" style={{ color: N.primary }} />
                  </button>
                </div>

                {/* Save */}
                <div className="pt-2 flex justify-end">
                  <NeuButton onClick={handleSaveProfileDetails} disabled={!hasProfileChanges || updateOwnerProfileMeta?.loading}>
                    {updateOwnerProfileMeta?.loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="h-4 w-4" /> Save Profile Details</>
                    )}
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}