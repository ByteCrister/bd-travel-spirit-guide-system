'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
    containerRef?: React.RefObject<HTMLElement | null>;
}

const ScrollToTopButton = ({ containerRef }: ScrollToTopButtonProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = containerRef?.current ?? window;
        const handleScroll = () => {
            const scrollTop = container instanceof Window ? container.scrollY : container.scrollTop;
            setIsVisible(scrollTop > 300);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [containerRef]);

    const scrollToTop = () => {
        const container = containerRef?.current ?? window;
        if (container instanceof Window) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    onClick={scrollToTop}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-8 right-8 z-50 group"
                >
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 flex items-center justify-center overflow-hidden group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-300">
                        <ArrowUp className="w-6 h-6 text-primary-foreground relative z-10" />
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTopButton;
