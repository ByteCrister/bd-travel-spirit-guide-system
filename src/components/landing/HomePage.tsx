"use client";

import Hero from "./Hero";
import JoinForgotSection from "./JoinForgotSection";
import Navbar from "./Navbar";
import FinalCTA from "./FinalCTA";
import Advantages from "./Advantages";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import { HomePageDataTypes } from "@/types/landing-page.types";


export default function HomePage({ pageData }: { pageData: HomePageDataTypes }) {

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900">
            <Navbar />

            <main id="main-content">
                <Hero heroStats={pageData.heroStats} />

                <Advantages />

                <JoinForgotSection />

                <HowItWorks />

                <Testimonials />

                <FinalCTA />
            </main>

            <Footer socialLinks={pageData.socialLinks} locations={pageData.locations} />
        </div>
    );
}