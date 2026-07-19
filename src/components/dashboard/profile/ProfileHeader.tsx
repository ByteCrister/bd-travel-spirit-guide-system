// Enhanced Profile Header – Neumorphism design system
import { IBaseUser, CurrentUser, IEmployeeInfo } from "@/types/current-user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail, Crown, Headphones, User } from "lucide-react";
import { format } from "date-fns";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { motion } from "framer-motion";
import { Guide } from "@/types/guide.types";

interface ProfileHeaderProps {
  baseUser: IBaseUser;
  fullUser: CurrentUser | null;
}

const isGuideUser = (user: CurrentUser | null): user is Guide =>
  !!user && "owner" in user;

const isEmployeeUser = (user: CurrentUser | null): user is IEmployeeInfo =>
  !!user && "fullName" in user;

export default function ProfileHeader({ baseUser, fullUser }: ProfileHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDisplayName = () => {
    if (baseUser.role === USER_ROLE.GUIDE && isGuideUser(fullUser)) return fullUser.owner.name;
    if (isEmployeeUser(fullUser) && fullUser.fullName) return fullUser.fullName;
    return "User";
  };

  const getAvatar = () => {
    if (baseUser.role === USER_ROLE.GUIDE && isGuideUser(fullUser)) return fullUser.owner.avatar;
    if (isEmployeeUser(fullUser)) return fullUser.avatar;
    return undefined;
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case USER_ROLE.GUIDE:
        return {
          badgeBg: "bg-[#1E2938] text-white",
          icon: Crown,
          accent: "#006666",
          label: "Guide",
        };
      case USER_ROLE.ASSISTANT:
        return {
          badgeBg: "bg-[#006666] text-white",
          icon: Headphones,
          accent: "#006666",
          label: "Assistant",
        };
      default:
        return {
          badgeBg: "bg-[#F1F2F5] text-[#1E2938]",
          icon: User,
          accent: "#1E2938",
          label: role,
        };
    }
  };

  const roleConfig = getRoleConfig(baseUser.role);
  const RoleIcon = roleConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer neumorphic card */}
      <div className="rounded-2xl p-6 bg-[#E7E5E4]
        ">

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
            className="relative shrink-0"
          >
            {/* Outer ring — raised */}
            <div className="p-1.5 rounded-full bg-[#E7E5E4]
              ">
              {/* Inner ring — pressed */}
              <div className="p-1 rounded-full bg-[#E7E5E4]
                ">
                <Avatar className="h-24 w-24 border-0">
                  <AvatarImage src={getAvatar()} />
                  <AvatarFallback
                    className="text-2xl font-bold text-white font-[var(--font-space-mono)]"
                    style={{ background: `linear-gradient(135deg, ${roleConfig.accent}, #1E2938)` }}
                  >
                    {getInitials(getDisplayName())}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Online dot */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 280 }}
              className="absolute bottom-2 right-2"
            >
              <div className="h-5 w-5 rounded-full bg-[#E7E5E4]
                
                flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-[#00A63D]" />
              </div>
            </motion.div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 space-y-4 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <h2 className="text-2xl sm:text-3xl text-[#1E2938] font-[var(--font-space-mono)] tracking-tight">
                {getDisplayName()}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${roleConfig.badgeBg}
                `}>
                <RoleIcon className="h-3.5 w-3.5" />
                {roleConfig.label}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {/* Email pill */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E7E5E4]
                ">
                <Mail className="h-4 w-4 text-[#006666] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-[#1E2938]/40
                    font-[var(--font-space-mono)]">Email</p>
                  <p className="text-sm text-[#1E2938] truncate font-[var(--font-jetbrains-mono)]">
                    {baseUser.email}
                  </p>
                </div>
              </div>

              {/* Member since pill */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E7E5E4]
                ">
                <Calendar className="h-4 w-4 text-[#006666] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1E2938]/40">Member Since</p>
                  <p className="text-sm font-semibold text-[#1E2938]">
                    {format(new Date(baseUser.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}