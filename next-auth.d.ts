// next-auth.d.ts
import { USER_ROLE } from "@/constants/user.const";
import { DefaultUser, DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            email: string;
            role: `${USER_ROLE.GUIDE}` | `${USER_ROLE.ASSISTANT}`;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        email: string;
        role: `${USER_ROLE.GUIDE}` | `${USER_ROLE.ASSISTANT}`;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        role: `${USER_ROLE.GUIDE}` | `${USER_ROLE.ASSISTANT}`;
        exp?: number;
    }
}