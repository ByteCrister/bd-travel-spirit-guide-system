import { toast } from "sonner";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

export const showToast = {
    success: (message: string, description?: string) =>
        toast.success(message, {
            description,
            icon: <FiCheckCircle style={{ color: "#00A63D" }} size={20} />,
        }),

    error: (message: string, description?: string) =>
        toast.error(message, {
            description,
            icon: <FiXCircle style={{ color: "#FF2157" }} size={20} />,
        }),

    info: (message: string, description?: string) =>
        toast(message, {
            description,
            icon: <FiInfo style={{ color: "#006666" }} size={20} />,
        }),

    warning: (message: string, description?: string) =>
        toast(message, {
            description,
            icon: <FiAlertTriangle style={{ color: "#FE9900" }} size={20} />,
        }),
};