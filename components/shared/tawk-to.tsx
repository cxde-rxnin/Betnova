"use client";

import Script from "next/script";

export function TawkTo() {
  return (
    <>
      <Script id="tawk-init" strategy="afterInteractive">
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        `}
      </Script>
      <Script 
        id="tawk-script"
        strategy="afterInteractive"
        src="https://embed.tawk.to/6a56a0ea34f51a1d4ab7b7db/1jth695cj" 
        crossOrigin="anonymous"
      />
    </>
  );
}
