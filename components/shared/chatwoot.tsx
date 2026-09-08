"use client";

import Script from "next/script";

const BASE_URL = "https://app.chatwoot.com";

export function Chatwoot() {
  return (
    <Script id="chatwoot-init" strategy="afterInteractive">
      {`
        (function(d,t) {
          var BASE_URL="${BASE_URL}";
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src=BASE_URL+"/packs/js/sdk.js";
          g.async = true;
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            window.chatwootSDK.run({
              websiteToken: 'BXnM8PdkxYKWosTYBTQJrUFY',
              baseUrl: BASE_URL
            })
          }
        })(document,"script");
      `}
    </Script>
  );
}
