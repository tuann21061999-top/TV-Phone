import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the top cordinate to 0
    // make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    return (
    <div className="fixed bottom-20 right-5 z-[999] md:bottom-[70px] md:right-[15px]">
        {isVisible && (
            <button
                onClick={scrollToTop}
                title="Lên đầu trang"
                className="
                    bg-blue-600 hover:bg-blue-700
                    text-white border-none rounded-full
                    w-[50px] h-[50px] md:w-[45px] md:h-[45px]
                    flex items-center justify-center
                    cursor-pointer
                    shadow-[0_4px_12px_rgba(37,99,235,0.3)]
                    hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)]
                    hover:-translate-y-[3px]
                    transition-all duration-300 ease-in-out
                    animate-[fadeIn_0.3s_ease-in-out]
                "
            >
                <ArrowUp size={24} />
            </button>
        )}
    </div>
);
};

export default ScrollToTop;
