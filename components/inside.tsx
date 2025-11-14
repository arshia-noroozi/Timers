// Inside.js
import React, { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

interface InsideProps {
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  children?: ReactNode;
}

export default function Inside({
  height = 560,
  stroke = "#6b4f1d",
  strokeWidth = 4,
  children,
}: InsideProps) {
  // viewBox sized to the coordinate extents used in the paths.
  // I picked viewBox="0 0 450 440" to match the drawing coordinates.
  const viewBox = "0 25 450 780";

  return (
    <View style={{ position: "relative" }}>
      {children}
      <Svg
        width="380px"
        height={height}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Debugging background: uncomment to see the full viewBox area */}
        {/* <Rect x="0" y="0" width="450" height="440" fill="#f7f7f7" /> */}

        {/* TOP horizontal */}
        <Path
          d="M10 10 H440"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* RIGHT side down to angle, angled segment, then down to bottom-right */}
        <Path
          d="M440 10 V560 L350 630 H300 V780"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* bottom-right segment (from bottom-right to gap start) */}
        <Path
          d="M300 780 H240"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* bottom-left segment (left of door gap) */}
        <Path
          d="M180 780 H10"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* left vertical (bottom up to top) */}
        <Path
          d="M10 780 V10"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* bottom centered door swing (gap between x=180 and x=240) */}
        <Path
          d="M180 780 A30 30 0 0 1 240 780"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth - 1}
          strokeLinecap="round"
        />

        {/* small top door swing near top-left (inside the top wall) */}
        <Path
          d="M90 10 A12 12 0 0 1 114 10"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth - 1}
          strokeLinecap="round"
        />

        {/* ---- Interior blocks from your sketch ---- */}
        {/* small top-left rectangle (near the wall) */}
        <Rect
          x="10"
          y="50"
          width="45"
          height="80"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          rx="2"
        />

        {/* Bar (vertical rectangle) */}
        <Rect
          x="10"
          y="150"
          width="60"
          height="470"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          rx="2"
        />

        {/* small bottom-left fixtures (two small stacked boxes) */}
        <Rect
          x="10"
          y="640"
          width="45"
          height="80"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          rx="2"
        />

        {/* social (horizontal rectangle on the top right) */}
        <Rect
          x="160"
          y="40"
          width="240"
          height="50"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          rx="2"
        />

        {/* central table (vertical rectangle in the middle) */}
        <Rect
          x="230"
          y="170"
          width="35"
          height="260"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          rx="2"
        />
        <Rect
          x="265"
          y="170"
          width="35"
          height="260"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          rx="2"
        />
      </Svg>
    </View>
  );
}
