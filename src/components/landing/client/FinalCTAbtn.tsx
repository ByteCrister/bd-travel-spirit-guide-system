import { MotionDiv } from '@/components/global/motion-elements';
import { Button } from '@/components/ui/button';
import { useScrollStore } from '@/hooks/scroll-store';
import { ArrowRight } from 'lucide-react';

const FinalCTAbtn = () => {
    const {
        scrollToSection,
    } = useScrollStore();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MotionDiv whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                    onClick={() => scrollToSection("join-section")}
                    size="lg"
                    className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 text-slate-900 font-semibold px-8 py-4 rounded-2xl shadow-2xl transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/30"
                    aria-label="Join now"
                >
                    <span className="text-lg">Join Now</span>
                    <ArrowRight className="ml-1 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Button>
            </MotionDiv>

            <MotionDiv whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                    variant="outline"
                    size="lg"
                    className="group inline-flex items-center justify-center gap-3 text-white font-medium px-8 py-4 rounded-2xl bg-transparent border border-white/14 hover:bg-white/6 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-white/12"
                    aria-label="Learn more"
                >
                    <span className="text-lg">Learn More</span>
                    <ArrowRight className="ml-1 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Button>
            </MotionDiv>
        </div>
    )
}

export default FinalCTAbtn