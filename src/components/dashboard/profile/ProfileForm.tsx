// Professional Profile Form Component for Owner Guide
import { useState, useEffect, useCallback } from "react";
import {
  CurrentUser,
  IOwnerGuideInfo,
  RequestMeta,
  OwnerProfileUpdateData
} from "@/types/current-user.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fileToBase64, isAllowedExtension } from "@/utils/helpers/file-conversion";
import { IMAGE_EXTENSIONS } from "@/utils/helpers/file-conversion";
import { GUIDE_SOCIAL_PLATFORM, GuideSocialPlatform } from "@/constants/guide.const";
import { GuideSocialLink } from "@/types/guide.types";
import { showToast } from "@/components/global/showToast";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import Image from "next/image";

interface ProfileFormProps {
  fullUser: IOwnerGuideInfo | null;
  isLoading: boolean;
  updateUserName: (data: { name: string }) => Promise<CurrentUser | null>;
  updateCompanyName: (data: { companyName: string }) => Promise<CurrentUser | null>;
  updateCompanyLogo: (data: { logoUrl: string }) => Promise<CurrentUser | null>;
  updateOwnerProfile: (data: OwnerProfileUpdateData) => Promise<CurrentUser | null>;
  updateNameMeta?: RequestMeta;
  updateCompanyNameMeta?: RequestMeta;
  updateCompanyLogoMeta?: RequestMeta;
  updateOwnerProfileMeta?: RequestMeta;
}

interface SocialLinkForm {
  platform: GuideSocialLink;
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
  updateNameMeta,
  updateCompanyNameMeta,
  updateCompanyLogoMeta,
  updateOwnerProfileMeta,
}: ProfileFormProps) {
  // Personal Info State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Company Info State
  const [companyName, setCompanyName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bio, setBio] = useState("");

  // Address State
  const [address, setAddress] = useState<AddressForm>({
    country: "",
    division: "",
    city: "",
    zip: "",
    street: ""
  });

  // Social Links State
  const [socialLinks, setSocialLinks] = useState<IOwnerGuideInfo['social']>([]);
  const [newSocialLink, setNewSocialLink] = useState<NonNullable<IOwnerGuideInfo['social']>[number]>({
    platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK,
    url: ""
  });

  // UI State
  const [activeSection, setActiveSection] = useState<'personal' | 'company' | 'profile'>('personal');
  const [showSuccess, setShowSuccess] = useState<{ type: string, message: string } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoProcessing, setLogoProcessing] = useState(false);

  // Initialize form data from fullUser
  useEffect(() => {
    if (fullUser) {
      // Personal Info
      setName(fullUser.owner?.name || "");
      setEmail(fullUser.owner?.email || "");

      // Company Info
      setCompanyName(fullUser.companyName || "");
      setBio(fullUser.bio || "");

      // Logo Preview
      if (fullUser.logoUrl) {
        setLogoPreview(fullUser.logoUrl);
      }

      // Address
      if (fullUser.address) {
        setAddress({
          country: fullUser.address.country || "",
          division: fullUser.address.division || "",
          city: fullUser.address.city || "",
          zip: fullUser.address.zip || "",
          street: fullUser.address.street || ""
        });
      }

      // Social Links
      if (fullUser.social && Array.isArray(fullUser.social)) {
        setSocialLinks(fullUser.social.map(link => ({
          platform: link.platform,
          url: link.url
        })));
      }
    }
  }, [fullUser]);

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let completed = 0;
    let total = 0;

    // Personal Info (2 fields)
    if (name.trim().length >= 2) completed += 1;
    total += 1;
    if (email.includes('@')) completed += 1;
    total += 1;

    // Company Info (3 fields)
    if (companyName.trim().length >= 2) completed += 1;
    total += 1;
    if (bio.trim().length >= 10) completed += 1;
    total += 1;
    if (logoPreview) completed += 1;
    total += 1;

    // Address (5 fields, count as 1 point if at least 3 filled)
    const addressFields = Object.values(address).filter(val => val.trim().length > 0);
    if (addressFields.length >= 3) completed += 1;
    total += 1;

    // Social Links (count as 1 point if at least 1 valid link)
    const validSocialLinks = (socialLinks ?? []).filter(link =>
      link.url.trim().length > 0 &&
      (link.url.startsWith('http://') || link.url.startsWith('https://'))
    );
    if (validSocialLinks.length > 0) completed += 1;
    total += 1;

    return Math.round((completed / total) * 100);
  }, [name, email, companyName, bio, logoPreview, address, socialLinks]);

  const completionPercentage = calculateCompletion();

  // Logo file handler
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);

    // Check file type
    if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
      setLogoError(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(', ')}`);
      showToast.warning(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(', ')}`);
      return;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("File too large. Maximum size is 5MB.");
      showToast.warning("File too large. Maximum size is 5MB.");
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Logo upload handler
  const handleLogoUpload = async () => {
    if (!logoFile || !logoPreview) {
      setLogoError("Please select a logo image first.");
      showToast.warning("Please select a logo image first.");
      return;
    }

    setLogoProcessing(true);
    setLogoError(null);

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(logoFile, {
        compressImages: true,
        maxWidth: 1200,
        quality: 0.8,
        maxFileBytes: 5 * 1024 * 1024,
        allowedExtensions: IMAGE_EXTENSIONS,
      });

      // Update logo
      const result = await updateCompanyLogo({ logoUrl: base64Data });
      if (result) {
        setShowSuccess({
          type: 'logo',
          message: 'Logo updated successfully!'
        });
        setTimeout(() => setShowSuccess(null), 3000);
      }
    } catch (err: unknown) {
      showToast.error("Failed to process logo image.", extractErrorMessage(err));
      setLogoError(extractErrorMessage(err) ?? "Failed to process logo image.");
    } finally {
      setLogoProcessing(false);
    }
  };

  // Add social link
  const addSocialLink = () => {
    if (!newSocialLink.url.trim()) {
      return;
    }

    // Validate URL format
    if (!newSocialLink.url.startsWith('http://') && !newSocialLink.url.startsWith('https://')) {
      setNewSocialLink({ ...newSocialLink, url: `https://${newSocialLink.url}` });
    }

    setSocialLinks([...(socialLinks ?? []), newSocialLink]);
    setNewSocialLink({ platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK, url: "" });
  };

  // Remove social link
  const removeSocialLink = (index: number) => {
    setSocialLinks((socialLinks ?? []).filter((_, i) => i !== index));
  };

  // Update social link
  const updateSocialLink = (index: number, field: keyof SocialLinkForm, value: string) => {
    const updated = [...(socialLinks ?? [])];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  // Save handlers for each section
  const handleSavePersonalInfo = async () => {
    if (!name.trim() || name.trim().length < 2) {
      return;
    }

    const result = await updateUserName({ name: name.trim() });
    if (result) {
      setShowSuccess({
        type: 'personal',
        message: 'Personal information updated successfully!'
      });
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!companyName.trim() || companyName.trim().length < 2) {
      return;
    }

    const result = await updateCompanyName({ companyName: companyName.trim() });
    if (result) {
      setShowSuccess({
        type: 'company',
        message: 'Company information updated successfully!'
      });
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  const handleSaveProfileDetails = async () => {
    // Prepare update data
    const updateData: OwnerProfileUpdateData = {};

    if (bio.trim()) {
      updateData.bio = bio.trim();
    }

    // Only include address if at least one field is filled
    const hasAddress = Object.values(address).some(val => val.trim().length > 0);
    if (hasAddress) {
      updateData.address = address;
    }

    // Only include social if there are links
    if (socialLinks && socialLinks.length > 0) {
      updateData.social = socialLinks.map(link => ({
        platform: link.platform,
        url: link.url
      }));
    }

    if (Object.keys(updateData).length === 0) {
      return;
    }

    const result = await updateOwnerProfile(updateData);
    if (result) {
      setShowSuccess({
        type: 'profile',
        message: 'Profile details updated successfully!'
      });
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  // Check if there are changes in each section
  const hasPersonalChanges = fullUser?.owner?.name !== name.trim();
  const hasCompanyChanges = fullUser?.companyName !== companyName.trim() || fullUser?.bio !== bio.trim();
  const hasAddressChanges = JSON.stringify(fullUser?.address || {}) !== JSON.stringify(address);
  const hasSocialChanges = JSON.stringify(fullUser?.social || []) !== JSON.stringify((socialLinks ?? []).map(l => ({ platform: l.platform, url: l.url })));
  const hasProfileChanges = hasAddressChanges || hasSocialChanges;

  // Social platform icons
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

  // Navigation tabs
  const navigationTabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'profile', label: 'Profile Details', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Profile Settings
                </CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Manage your personal and company information
                </CardDescription>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600">Profile Completion</div>
                  <div className="text-2xl font-bold text-slate-900">{completionPercentage}%</div>
                </div>
                <div className="relative h-16 w-16">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="text-slate-100 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <circle
                      className="text-slate-900 stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={`${completionPercentage * 2.51} 251`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 pt-4">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => setActiveSection(tab.id as "personal" | "company" | "profile")}
                    className={`flex items-center gap-2 ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Success Messages */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Alert className="border border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-700 font-medium">
                {showSuccess.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Information Section */}
      <AnimatePresence mode="wait">
        {activeSection === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-6 border-b border-slate-200 bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                    <User className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-sm mt-1.5 text-slate-600">
                      Update your name and contact information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Full Name Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-600" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isLoading || updateNameMeta?.loading}
                      className="h-11 text-sm border-slate-300 focus:border-slate-900"
                    />
                    {hasPersonalChanges && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
                      </div>
                    )}
                  </div>
                  {name.trim() && name.trim().length < 2 && (
                    <p className="text-xs text-red-600">Name must be at least 2 characters</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-600" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      value={email}
                      disabled
                      className="h-11 bg-slate-50 cursor-not-allowed border-slate-200"
                    />
                    <Badge className="absolute right-3 top-1/2 -translate-y-1/2" variant="secondary">
                      Read Only
                    </Badge>
                  </div>
                  <Alert className="border-slate-200 bg-slate-50">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Email address cannot be changed. Contact support for assistance.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleSavePersonalInfo}
                    disabled={!hasPersonalChanges || name.trim().length < 2 || updateNameMeta?.loading}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {updateNameMeta?.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Personal Information
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Company Information Section */}
        {activeSection === 'company' && (
          <motion.div
            key="company"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-6 border-b border-slate-200 bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                    <Building2 className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Company Information
                    </CardTitle>
                    <CardDescription className="text-sm mt-1.5 text-slate-600">
                      Update your company details and branding
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Company Name */}
                <div className="space-y-2.5">
                  <Label htmlFor="companyName" className="text-sm font-medium text-slate-900">
                    Company Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      disabled={isLoading || updateCompanyNameMeta?.loading}
                      className="h-11 text-sm"
                    />
                    {hasCompanyChanges && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Logo */}
                <div className="space-y-2.5">
                  <Label htmlFor="logo" className="text-sm font-medium text-slate-900">
                    Company Logo
                  </Label>
                  <div className="flex items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">Upload your logo</p>
                            <p className="text-xs text-slate-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('logo')?.click()}
                            disabled={logoProcessing}
                          >
                            Choose File
                          </Button>
                          {logoFile && (
                            <p className="text-xs text-slate-600">
                              Selected: {logoFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {logoError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {logoError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {logoPreview && (
                        <Button
                          onClick={handleLogoUpload}
                          disabled={logoProcessing || updateCompanyLogoMeta?.loading}
                          className="w-full"
                        >
                          {logoProcessing || updateCompanyLogoMeta?.loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading Logo...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Upload Logo
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Logo Preview */}
                    <div className="w-32">
                      <div className="border border-slate-200 rounded-lg p-4">
                        <p className="text-xs font-medium text-slate-700 mb-2">Preview</p>
                        <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          {logoPreview ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={logoPreview}
                                alt="Logo preview"
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Bio */}
                <div className="space-y-2.5">
                  <Label htmlFor="bio" className="text-sm font-medium text-slate-900">
                    Company Bio / Description
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your company..."
                    rows={4}
                    className="resize-none text-sm"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Brief description of your company</span>
                    <span>{bio.length}/1000</span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleSaveCompanyInfo}
                    disabled={!hasCompanyChanges || companyName.trim().length < 2 || updateCompanyNameMeta?.loading}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {updateCompanyNameMeta?.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Company Information
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Details Section */}
        {activeSection === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-6 border-b border-slate-200 bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                    <FileText className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Profile Details
                    </CardTitle>
                    <CardDescription className="text-sm mt-1.5 text-slate-600">
                      Update your address and social media links
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                {/* Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-700" />
                    <h3 className="text-lg font-semibold text-slate-900">Address</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        placeholder="Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="division">State/Province</Label>
                      <Input
                        id="division"
                        value={address.division}
                        onChange={(e) => setAddress({ ...address, division: e.target.value })}
                        placeholder="State or Province"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input
                        id="zip"
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="Street address"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Links Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-slate-700" />
                    <h3 className="text-lg font-semibold text-slate-900">Social Media Links</h3>
                  </div>

                  {/* Existing Social Links */}
                  <div className="space-y-3">
                    {(socialLinks ?? []).map((link, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getSocialIcon(link.platform)}
                          <Select
                            value={link.platform}
                            onValueChange={(value) => updateSocialLink(index, 'platform', value as keyof typeof GUIDE_SOCIAL_PLATFORM)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                Object.entries(GUIDE_SOCIAL_PLATFORM).map(([key, _]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      {getSocialIcon(key as GuideSocialPlatform)}
                                      <span>{key}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                          placeholder="https://..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSocialLink(index)}
                          className="text-slate-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Social Link */}
                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Select
                        value={newSocialLink.platform}
                        onValueChange={(value) => setNewSocialLink({ ...newSocialLink, platform: value as GuideSocialPlatform })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            Object.entries(GUIDE_SOCIAL_PLATFORM).map(([key, _]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  {getSocialIcon(key as GuideSocialPlatform)}
                                  <span>{key}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={newSocialLink.url}
                        onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                        placeholder="Enter URL..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addSocialLink}
                        disabled={!newSocialLink.url.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleSaveProfileDetails}
                    disabled={!hasProfileChanges || updateOwnerProfileMeta?.loading}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {updateOwnerProfileMeta?.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile Details
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}