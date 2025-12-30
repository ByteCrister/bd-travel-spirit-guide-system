import HomePage from "@/components/landing/HomePage"
import fetchLandingData from "@/lib/mock/fetchLandingData";

const page = async () => {
    const pageData = await fetchLandingData(); // Same fetch as metadata

    return (
        <HomePage pageData={pageData} />
    )
}

export default page