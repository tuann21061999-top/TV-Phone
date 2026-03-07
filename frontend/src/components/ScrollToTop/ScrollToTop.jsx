import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import "./ScrollToTop.css";

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
        <div className="scroll-to-top">
            {isVisible && (
                <button onClick={scrollToTop} className="scroll-btn" title="Lên đầu trang">
                    <ArrowUp size={24} />
                </button>
            )}
        </div>
    );
};

export default ScrollToTop;
