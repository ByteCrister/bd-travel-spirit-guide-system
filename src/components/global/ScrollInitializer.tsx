// components/ScrollInitializer.tsx (Client Component)
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useScrollStore } from '@/hooks/scroll-store';

/**
 * This component initializes the scroll function with router access.
 * It should be placed in a client component layout.
 */
export default function ScrollInitializer() {
    const router = useRouter();
    const pathname = usePathname();
    const { setScrollToSection } = useScrollStore();

    useEffect(() => {
        // Create the scroll function with current router context
        const scrollToSection = (sectionId: string) => {
            // Update URL with hash
            const newUrl = `${pathname}#${sectionId}`;
            router.push(newUrl, { scroll: false });

            // Then scroll to the element
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    // If element doesn't exist yet, try again
                    setTimeout(() => {
                        const element = document.getElementById(sectionId);
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        } else {
                            console.warn(`Element with id "${sectionId}" not found`);
                        }
                    }, 100);
                }
            }, 50);
        };

        // Set the scroll function in the store
        setScrollToSection(scrollToSection);
    }, [router, pathname, setScrollToSection]);

    // This component doesn't render anything
    return null;
}