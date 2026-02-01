import EmployeeDetailPage from "@/components/users/employees/details/EmployeeDetailPage";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";

interface PageProps {
    params: Promise<{ employeeId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { employeeId } = await params;

    return <EmployeeDetailPage employeeId={decodeId(decodeURIComponent(employeeId)) ?? '-'} />;
}
