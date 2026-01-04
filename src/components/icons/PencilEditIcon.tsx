import React from "react";

export const PencilEditIcon = ({
  size = undefined,
  color = "#000000",
  strokeWidth = 2,
  background = "transparent",
  opacity = 1,
  shadow = 0,
  padding = 0,
}) => {
  const viewBoxSize = 24 + padding * 2;
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        opacity,
        filter:
          shadow > 0
            ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))`
            : undefined,
        backgroundColor: background !== "transparent" ? background : undefined,
      }}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="m16.425 4.605l.99-.99a2.1 2.1 0 0 1 2.97 2.97l-.99.99m-2.97-2.97l-6.66 6.66a3.96 3.96 0 0 0-1.041 1.84L8 16l2.896-.724a3.96 3.96 0 0 0 1.84-1.042l6.659-6.659m-2.97-2.97l2.97 2.97" />
        <path
          strokeLinecap="round"
          d="M19 13.5c0 3.288 0 4.931-.908 6.038a4 4 0 0 1-.554.554C16.43 21 14.788 21 11.5 21H11c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-.5c0-3.287 0-4.931.908-6.038q.25-.304.554-.554C5.57 5 7.212 5 10.5 5"
        />
      </g>
    </svg>
  );
};
