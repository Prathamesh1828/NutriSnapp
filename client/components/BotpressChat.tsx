'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const BotpressChat = () => {
    useEffect(() => {
        // Optional: Any additional initialization logic for the client side.
    }, []);

    return (
        <>
            {/* Custom Theme Override CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* NutriSnap Premium Bot Override */
                body .bpw-layout {
                  font-family: 'Inter', sans-serif !important;
                  background: #0A0A0F !important;
                  border: 1px solid rgba(184, 255, 60, 0.15) !important;
                  border-radius: 20px !important;
                }
                body .bpw-header-container {
                  background: rgba(19, 19, 26, 0.95) !important;
                  backdrop-filter: blur(10px);
                }
                body .bpw-header-title { color: #ffffff !important; font-weight: 800 !important; }
                body .bpw-header-subtitle { color: #B8FF3C !important; }
                body .bpw-from-user .bpw-chat-bubble {
                  background: #B8FF3C !important;
                  color: #0A0A0F !important;
                  font-weight: 600 !important;
                }
                body .bpw-from-bot .bpw-chat-bubble {
                  background: #13131A !important;
                  color: #ffffff !important;
                  border: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                body .bpw-button {
                    background: #B8FF3C !important;
                    color: #0A0A0F !important;
                }
                body .bpw-header-icon {
                  border: 2px solid #B8FF3C !important;
                }
              `}} 
            />
            {/* The main Botpress inject script */}
            <Script
                src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"
                strategy="afterInteractive"
            />
            {/* The individual chatbot implementation script provided by Botpress */}
            <Script
                src="https://files.bpcontent.cloud/2026/03/24/11/20260324115454-V37I0XFE.js"
                strategy="afterInteractive"
                defer
            />
        </>
    );
};

export default BotpressChat;
