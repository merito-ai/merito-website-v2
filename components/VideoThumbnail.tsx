import Image from "next/image";

interface VideoThumbnailProps {
  videoSrc: string;
  thumbnailSrc: string;
  alt: string;
  className?: string;
}

export default function VideoThumbnail({
  videoSrc,
  thumbnailSrc,
  alt,
  className = "",
}: VideoThumbnailProps) {
  return (
    <video
      preload="metadata"
      controls
      poster={thumbnailSrc}
      className={`w-full h-full object-cover ${className}`}
    >
      <source src={videoSrc} type="video/mp4" />
      <Image
        src={thumbnailSrc}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
      />
      Your browser does not support the video tag.
    </video>
  );
}
