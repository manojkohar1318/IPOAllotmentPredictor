"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function BlogImage({ src, alt, ...props }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc('https://placehold.co/800x300?text=IPO+Nepal');
      }}
    />
  );
}
