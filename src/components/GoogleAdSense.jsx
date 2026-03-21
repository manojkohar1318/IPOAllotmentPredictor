import React, { useEffect } from 'react';

export const GoogleAdSense = ({ adSlot, adFormat = 'auto', fullWidthResponsive = true }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="flex justify-center my-8 w-full overflow-hidden min-h-[100px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1970883617989838"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      ></ins>
    </div>
  );
};
