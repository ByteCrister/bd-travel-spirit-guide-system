import { MotionDiv } from '@/components/global/motion-elements';
import { Button } from '@/components/ui/button';
import { useScrollStore } from '@/hooks/scroll-store';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const HeroCTAbtn = () => {
    const {
        scrollToSection,
    } = useScrollStore();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={() => scrollToSection("join-section")}
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-emerald transition-all duration-300 touch-manipulation"
                >
                    Join as Admin
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </MotionDiv>

            <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                    href="#features-section"
                    className="group flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                    onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById("features-section");
                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                >
                    Explore features
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </MotionDiv>
        </div>
    )
}

export default HeroCTAbtn