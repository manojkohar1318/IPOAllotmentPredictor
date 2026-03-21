import React, { useEffect } from 'react';

export const AdsterraNativeBanner = () => {
  useEffect(() => {
    const containerId = 'container-0c454b22c8a42a2829f5748563e48000';
    const container = document.getElementById(containerId);
    
    if (container) {
      // Clear existing content to avoid duplicates on remount
      container.innerHTML = '';
      
      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = "https://pl28954195.profitablecpmratenetwork.com/0c454b22c8a42a2829f5748563e48000/invoke.js";
      
      // Adsterra scripts often expect to be placed inside or right after the container
      container.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-8 w-full overflow-hidden min-h-[250px]">
      <div id="container-0c454b22c8a42a2829f5748563e48000"></div>
    </div>
  );
};
