import { USER_ROLE } from "@/constants/user.const";
import { CurrentUser, IBaseUser, IEmployeeInfo } from "@/types/current-user.types";
import { Guide } from "@/types/guide.types";

const userProfilePreview = {
    baseUser: null as IBaseUser | null,
    fullUser: null as CurrentUser | null,

    setUsers(base: IBaseUser | null, full: CurrentUser | null) {
        this.baseUser = base;
        this.fullUser = full;
    },

    isGuideUser(user: CurrentUser | null): user is Guide {
        return !!user && "owner" in user;
    },

    isEmployeeUser(user: CurrentUser | null): user is IEmployeeInfo {
        return !!user && "fullName" in user;
    },

    getDisplayName(): string {
        if (this.baseUser?.role === USER_ROLE.GUIDE && this.isGuideUser(this.fullUser)) {
            return this.fullUser.owner.name;
        }

        if (this.isEmployeeUser(this.fullUser) && this.fullUser.fullName) {
            return this.fullUser.fullName;
        }

        return "User";
    },

    getAvatar(): string | undefined {
        if (this.baseUser?.role === USER_ROLE.GUIDE && this.isGuideUser(this.fullUser)) {
            return this.fullUser.owner.avatar;
        }

        if (this.isEmployeeUser(this.fullUser)) {
            return this.fullUser.avatar;
        }

        return undefined;
    },
};

export default userProfilePreview;