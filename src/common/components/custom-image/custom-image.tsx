import { CSSProperties } from "react";

interface CustomImageProps {
  alt: string;
  src: string;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
}

export function CustomImage({
  alt,
  className = "",
  src,
  width,
  height,
  style = {},
}: CustomImageProps) {
  return (
    <div
      className={className}
      style={{ ...style, maxWidth: "100%", height: "auto" }}
    >
      <img
        alt={alt}
        src={src}
        style={{
          objectFit: "cover",
          width: "100%",
          height: "100%",
          maxWidth: width,
          maxHeight: height,
        }}
        width={width}
        height={height}
      />
    </div>
  );
}
