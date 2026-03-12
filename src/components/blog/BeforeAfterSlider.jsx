// Before/After Image Slider Component
import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
  beforeLabel = "Before",
  afterLabel = "After",
  initialPosition = 50,
  className = "",
  height = 400,
  showLabels = true,
  labelStyle = "overlay", // 'overlay' or 'outside'
  orientation = "horizontal", // 'horizontal' or 'vertical'
}) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback(
    (clientX, clientY) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      let newPosition;
      if (orientation === "horizontal") {
        const x = clientX - rect.left;
        newPosition = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      } else {
        const y = clientY - rect.top;
        newPosition = Math.min(Math.max((y / rect.height) * 100, 0), 100);
      }

      setSliderPosition(newPosition);
    },
    [orientation],
  );

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.clientX, e.clientY);
    },
    [isDragging, handleMove],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [isDragging, handleMove],
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const clipPathBefore =
    orientation === "horizontal"
      ? `inset(0 ${100 - sliderPosition}% 0 0)`
      : `inset(0 0 ${100 - sliderPosition}% 0)`;

  return (
    <div className={`relative ${className}`}>
      {/* Labels outside */}
      {showLabels && labelStyle === "outside" && (
        <div className="flex justify-between mb-2 text-sm font-medium text-concrete-600">
          <span>{beforeLabel}</span>
          <span>{afterLabel}</span>
        </div>
      )}

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden cursor-ew-resize select-none"
        style={{ height }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPosition)}
        aria-label="Image comparison slider"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            setSliderPosition((prev) => Math.max(0, prev - 5));
          } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            setSliderPosition((prev) => Math.min(100, prev + 5));
          }
        }}
      >
        {/* After Image (Full, Behind) */}
        <div className="absolute inset-0">
          {afterImage ? (
            <Image
              src={afterImage}
              alt={afterAlt}
              fill
              className="object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-concrete-200 flex items-center justify-center text-concrete-400">
              After Image
            </div>
          )}
        </div>

        {/* Before Image (Clipped, On Top) */}
        <div className="absolute inset-0" style={{ clipPath: clipPathBefore }}>
          {beforeImage ? (
            <Image
              src={beforeImage}
              alt={beforeAlt}
              fill
              className="object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-concrete-300 flex items-center justify-center text-concrete-500">
              Before Image
            </div>
          )}
        </div>

        {/* Slider Line */}
        <div
          className={`absolute bg-white shadow-lg z-10 ${
            orientation === "horizontal"
              ? "w-1 h-full top-0"
              : "h-1 w-full left-0"
          }`}
          style={
            orientation === "horizontal"
              ? { left: `${sliderPosition}%`, transform: "translateX(-50%)" }
              : { top: `${sliderPosition}%`, transform: "translateY(-50%)" }
          }
        >
          {/* Slider Handle */}
          <div
            className={`absolute bg-white rounded-full shadow-lg flex items-center justify-center ${
              orientation === "horizontal"
                ? "w-10 h-10 top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2"
                : "w-10 h-10 left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2"
            }`}
          >
            {orientation === "horizontal" ? (
              <svg
                className="w-5 h-5 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-primary-500 rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Overlay Labels */}
        {showLabels && labelStyle === "overlay" && (
          <>
            <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 text-white text-sm font-medium rounded-full">
              {beforeLabel}
            </span>
            <span className="absolute top-4 right-4 px-3 py-1 bg-black/60 text-white text-sm font-medium rounded-full">
              {afterLabel}
            </span>
          </>
        )}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-concrete-500 mt-3">
        Drag the slider to compare
      </p>
    </div>
  );
}

// Gallery of Before/After images
export function BeforeAfterGallery({
  items = [],
  columns = 2,
  className = "",
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className={className}>
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <BeforeAfterSlider
              beforeImage={item.beforeImage}
              afterImage={item.afterImage}
              beforeAlt={item.beforeAlt || "Before"}
              afterAlt={item.afterAlt || "After"}
              height={item.height || 300}
            />
            {item.title && (
              <h4 className="font-medium text-concrete-800 text-center">
                {item.title}
              </h4>
            )}
            {item.description && (
              <p className="text-sm text-concrete-600 text-center">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple side-by-side comparison (no slider)
export function SideBySideComparison({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
  beforeLabel = "Before",
  afterLabel = "After",
  height = 300,
  className = "",
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-4 ${className}`}>
      {/* Before */}
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden" style={{ height }}>
          {beforeImage ? (
            <Image
              src={beforeImage}
              alt={beforeAlt}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-concrete-200 flex items-center justify-center text-concrete-400">
              Before Image
            </div>
          )}
        </div>
        <p className="text-center font-medium text-concrete-600">
          {beforeLabel}
        </p>
      </div>

      {/* After */}
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden" style={{ height }}>
          {afterImage ? (
            <Image
              src={afterImage}
              alt={afterAlt}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-concrete-200 flex items-center justify-center text-concrete-400">
              After Image
            </div>
          )}
        </div>
        <p className="text-center font-medium text-concrete-600">
          {afterLabel}
        </p>
      </div>
    </div>
  );
}

// Hover reveal comparison
export function HoverRevealComparison({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
  height = 400,
  className = "",
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`relative rounded-xl overflow-hidden cursor-pointer ${className}`}
      style={{ height }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Before Image */}
      <div className="absolute inset-0">
        {beforeImage ? (
          <Image
            src={beforeImage}
            alt={beforeAlt}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-concrete-300" />
        )}
      </div>

      {/* After Image (Fade in on hover) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        {afterImage ? (
          <Image
            src={afterImage}
            alt={afterAlt}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-concrete-200" />
        )}
      </div>

      {/* Labels */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`px-4 py-2 bg-black/60 text-white font-semibold rounded-lg transition-opacity duration-300 ${
            isHovering ? "opacity-0" : "opacity-100"
          }`}
        >
          Before
        </span>
        <span
          className={`px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          After
        </span>
      </div>

      {/* Instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white bg-black/40 px-3 py-1 rounded-full">
        Hover to reveal
      </div>
    </div>
  );
}
