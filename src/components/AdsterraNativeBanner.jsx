import React, { useEffect } from 'react';

export const AdsterraNativeBanner = () => {
  useEffect(() => {
    const containerId = 'container-0c454b22c8a42a2829f5748563e48000';
    const container = document.getElementById(containerId);
    
    if (container && !container.hasChildNodes()) {
      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = "https://pl28954195.profitablecpmratenetwork.com/0c454b22c8a42a2829f5748563e48000/invoke.js";
      container.parentNode.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-8 w-full overflow-hidden min-h-[100px]">
      <div id="container-0c454b22c8a42a2829f5748563e48000"></div>
    </div>
  );
};
