// Photo Carousel Component - Showcases plastering work
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";

// Default plastering work photos - actual project images
const defaultPhotos = [
  {
    id: 1,
    src: "/images/projects/pb2.jpeg",
    alt: "Professional plastering work",
    title: "Quality Plastering",
    description: "Expert plastering with a smooth, flawless finish",
  },
  {
    id: 2,
    src: "/images/projects/pb3.jpeg",
    alt: "Wall plastering project",
    title: "Wall Restoration",
    description: "Complete wall re-plastering and restoration",
  },
  {
    id: 3,
    src: "/images/projects/pb4.jpeg",
    alt: "Plastering finish",
    title: "Smooth Finish",
    description: "Professional smooth plaster application",
  },
  {
    id: 4,
    src: "/images/projects/pb5.jpeg",
    alt: "Interior plastering",
    title: "Interior Plastering",
    description: "High-quality interior plastering work",
  },
  {
    id: 5,
    src: "/images/projects/pb6.jpeg",
    alt: "Plastering project",
    title: "Residential Project",
    description: "Residential plastering and finishing",
  },
  {
    id: 6,
    src: "/images/projects/pb7.jpeg",
    alt: "Ceiling and wall work",
    title: "Ceiling & Wall Work",
    description: "Complete ceiling and wall plastering",
  },
  {
    id: 7,
    src: "/images/projects/pb8.jpeg",
    alt: "Expert craftsmanship",
    title: "Expert Craftsmanship",
    description: "Precision plastering with attention to detail",
  },
];

export default function PhotoCarousel({
  photos = defaultPhotos,
  autoPlay = true,
  autoPlayInterval = 4000,
  showThumbnails = true,
  showControls = true,
  showInfo = true,
  aspectRatio = "16/9",
  className = "",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoaded, setIsLoaded] = useState({});

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, autoPlayInterval, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  const currentPhoto = photos[currentIndex];

  return (
    <div className={`relative ${className}`}>
      {/* Main Carousel */}
      <div className="relative overflow-hidden rounded-2xl bg-concrete-100">
        {/* Main Image */}
        <div className="relative" style={{ aspectRatio }}>
          {photos.map((photo, index) => (
            <div
              key={photo.id || index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt || `Plastering work ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority={index === 0}
                  onLoad={() =>
                    setIsLoaded((prev) => ({ ...prev, [index]: true }))
                  }
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${photo.gradient || "from-primary-400 to-primary-600"} flex items-center justify-center`}
                >
                  <div className="text-center text-white">
                    <span className="text-8xl md:text-9xl block mb-4 opacity-30">
                      🏠
                    </span>
                    <p className="text-lg md:text-xl font-medium opacity-60">
                      Add your project photos
                    </p>
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ))}

          {/* Photo Info Overlay */}
          {showInfo && currentPhoto && (
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10">
              <h3 className="font-heading font-bold text-xl md:text-2xl mb-2 drop-shadow-lg">
                {currentPhoto.title || `Project ${currentIndex + 1}`}
              </h3>
              {currentPhoto.description && (
                <p className="text-white/80 text-sm md:text-base max-w-xl drop-shadow">
                  {currentPhoto.description}
                </p>
              )}
            </div>
          )}

          {/* Navigation Arrows */}
          {showControls && photos.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-20"
                aria-label="Previous photo"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-20"
                aria-label="Next photo"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Play/Pause Button */}
          {showControls && photos.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-20"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <FiPause className="w-5 h-5" />
              ) : (
                <FiPlay className="w-5 h-5 ml-0.5" />
              )}
            </button>
          )}

          {/* Slide Counter */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium z-20">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && photos.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {photos.map((photo, index) => (
            <button
              key={photo.id || index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? "ring-2 ring-primary-500 ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`Go to photo ${index + 1}`}
            >
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-xl">🏠</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Dot Indicators (alternative to thumbnails on mobile) */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary-500 w-6"
                  : "bg-concrete-300 hover:bg-concrete-400"
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
