import React, { useEffect, useRef } from 'react';

export const AdsterraNativeBanner = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Check if script is already loaded to avoid duplicates
    const scriptId = 'adsterra-native-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = "https://pl28954195.profitablecpmratenetwork.com/0c454b22c8a42a2829f5748563e48000/invoke.js";
      document.body.appendChild(script);
    }

    // Sometimes these scripts need to be re-initialized if the container is new
    // but usually they look for the ID on load.
  }, []);

  return (
    <div className="flex justify-center my-8 w-full overflow-hidden">
      <div id="container-0c454b22c8a42a2829f5748563e48000"></div>
    </div>
  );
};
