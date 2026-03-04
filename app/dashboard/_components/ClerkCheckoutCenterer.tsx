"use client";

import { useEffect } from "react";

/**
 * ClerkCheckoutCenterer
 *
 * Clerk renders its checkout as a side drawer using:
 *   .cl-drawerRoot    — full-viewport fixed backdrop
 *   .cl-drawerContent — the panel pinned at right:12px, top:12px
 *
 * This observer detects them the moment they appear and forces
 * the panel to the center of the screen with a premium look.
 */
export function ClerkCheckoutCenterer() {
    useEffect(() => {
        function fixDrawer() {
            // Fix the backdrop — frosted glass centering container
            const root = document.querySelector<HTMLElement>(".cl-drawerRoot");
            if (root) {
                root.style.setProperty("display", "flex", "important");
                root.style.setProperty("align-items", "center", "important");
                root.style.setProperty("justify-content", "center", "important");
                root.style.setProperty("padding-top", "4rem", "important");
                root.style.setProperty("background", "rgba(9,9,18,0.65)", "important");
                root.style.setProperty("backdrop-filter", "blur(12px) saturate(150%)", "important");
            }

            // Fix the panel — centered, no scrollbar, premium shadow
            const content = document.querySelector<HTMLElement>(".cl-drawerContent");
            if (content) {
                content.style.setProperty("position", "relative", "important");
                content.style.setProperty("top", "unset", "important");
                content.style.setProperty("right", "unset", "important");
                content.style.setProperty("bottom", "unset", "important");
                content.style.setProperty("left", "unset", "important");
                content.style.setProperty("transform", "none", "important");
                content.style.setProperty("width", "460px", "important");
                content.style.setProperty("max-width", "calc(100vw - 2rem)", "important");
                content.style.setProperty("max-height", "80vh", "important");
                content.style.setProperty("overflow-y", "auto", "important");
                content.style.setProperty("scrollbar-width", "none", "important");
                content.style.setProperty("border-radius", "1.5rem", "important");
                content.style.setProperty("border", "1px solid rgba(255,255,255,0.08)", "important");
                content.style.setProperty(
                    "box-shadow",
                    "0 0 0 1px rgba(124,58,237,0.15), 0 8px 32px rgba(0,0,0,0.4), 0 32px 72px rgba(0,0,0,0.35), 0 0 80px rgba(124,58,237,0.08)",
                    "important"
                );
            }
        }

        const observer = new MutationObserver(fixDrawer);

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"],
        });

        return () => observer.disconnect();
    }, []);

    return null;
}
