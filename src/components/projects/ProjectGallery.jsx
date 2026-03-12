// ProjectGallery Component - Image Gallery with Lightbox
import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiDownload,
  FiGrid,
} from "react-icons/fi";

export default function ProjectGallery({
  images = [],
  variant = "grid", // grid, masonry, slider, featured
  columns = 3,
  gap = 4,
  enableLightbox = true,
  className = "",
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index) => {
    if (enableLightbox) {
      setActiveIndex(index);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 bg-concrete-50 rounded-xl">
        <FiGrid className="w-12 h-12 text-concrete-300 mx-auto mb-4" />
        <p className="text-concrete-500">No images available</p>
      </div>
    );
  }

  const renderGallery = () => {
    switch (variant) {
      case "masonry":
        return (
          <div
            className={`columns-1 sm:columns-2 lg:columns-${columns}`}
            style={{ columnGap: `${gap * 4}px` }}
          >
            {images.map((image, index) => (
              <div key={index} className="mb-4 break-inside-avoid">
                <GalleryImage
                  image={image}
                  index={index}
                  onClick={() => openLightbox(index)}
                  enableLightbox={enableLightbox}
                />
              </div>
            ))}
          </div>
        );

      case "slider":
        return (
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4" style={{ width: "max-content" }}>
                {images.map((image, index) => (
                  <div key={index} className="w-80 flex-shrink-0">
                    <GalleryImage
                      image={image}
                      index={index}
                      onClick={() => openLightbox(index)}
                      enableLightbox={enableLightbox}
                      aspectRatio="4/3"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "featured":
        const [featuredImage, ...restImages] = images;
        return (
          <div className={`grid gap-${gap}`}>
            {/* Featured Large Image */}
            <div className="w-full">
              <GalleryImage
                image={featuredImage}
                index={0}
                onClick={() => openLightbox(0)}
                enableLightbox={enableLightbox}
                aspectRatio="16/9"
              />
            </div>
            {/* Thumbnails */}
            {restImages.length > 0 && (
              <div className={`grid grid-cols-4 gap-${gap}`}>
                {restImages.slice(0, 4).map((image, index) => (
                  <div key={index + 1} className="relative">
                    <GalleryImage
                      image={image}
                      index={index + 1}
                      onClick={() => openLightbox(index + 1)}
                      enableLightbox={enableLightbox}
                      aspectRatio="1/1"
                    />
                    {/* Show count on last thumbnail if more images */}
                    {index === 3 && restImages.length > 4 && (
                      <div
                        className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={() => openLightbox(4)}
                      >
                        <span className="text-white font-bold text-xl">
                          +{restImages.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default: // grid
        return (
          <div
            className={`grid grid-cols-2 md:grid-cols-${columns}`}
            style={{ gap: `${gap * 4}px` }}
          >
            {images.map((image, index) => (
              <GalleryImage
                key={index}
                image={image}
                index={index}
                onClick={() => openLightbox(index)}
                enableLightbox={enableLightbox}
                aspectRatio="1/1"
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderGallery()}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          activeIndex={activeIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
          setActiveIndex={setActiveIndex}
        />
      )}
    </div>
  );
}

// Individual Gallery Image
function GalleryImage({
  image,
  index,
  onClick,
  enableLightbox,
  aspectRatio = "auto",
}) {
  const src = typeof image === "string" ? image : image.url || image.src;
  const alt =
    typeof image === "string"
      ? `Gallery image ${index + 1}`
      : image.alt || image.caption || `Gallery image ${index + 1}`;
  const caption = typeof image === "object" ? image.caption : null;

  return (
    <div className="group relative overflow-hidden rounded-lg">
      <div
        className={`relative bg-concrete-100 ${aspectRatio !== "auto" ? "" : "aspect-square"}`}
        style={aspectRatio !== "auto" ? { aspectRatio } : {}}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Hover Overlay */}
      {enableLightbox && (
        <div
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
          onClick={onClick}
        >
          <FiMaximize2 className="w-8 h-8 text-white" />
        </div>
      )}

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-sm">{caption}</p>
        </div>
      )}
    </div>
  );
}

// Lightbox Component
function Lightbox({
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
  setActiveIndex,
}) {
  const currentImage = images[activeIndex];
  const src =
    typeof currentImage === "string"
      ? currentImage
      : currentImage.url || currentImage.src;
  const alt =
    typeof currentImage === "string"
      ? `Image ${activeIndex + 1}`
      : currentImage.alt || `Image ${activeIndex + 1}`;
  const caption =
    typeof currentImage === "object" ? currentImage.caption : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50">
        <span className="text-white/70 text-sm">
          {activeIndex + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={src}
            download
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Download"
          >
            <FiDownload className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center px-16">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Previous image"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>

        {/* Image */}
        <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
          <Image src={src} alt={alt} fill className="object-contain" priority />
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Next image"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Caption */}
      {caption && (
        <div className="text-center py-4 px-8">
          <p className="text-white">{caption}</p>
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="bg-black/50 py-4 px-8">
        <div className="flex justify-center gap-2 overflow-x-auto">
          {images.map((image, index) => {
            const thumbSrc =
              typeof image === "string" ? image : image.url || image.src;
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all
                  ${
                    index === activeIndex
                      ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-black"
                      : "opacity-50 hover:opacity-100"
                  }
                `}
              >
                <Image
                  src={thumbSrc}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple Thumbnail Gallery (no lightbox)
export function ThumbnailGallery({
  images = [],
  mainImageIndex = 0,
  onSelectImage,
  className = "",
}) {
  const [selectedIndex, setSelectedIndex] = useState(mainImageIndex);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    if (onSelectImage) onSelectImage(index);
  };

  if (!images || images.length === 0) return null;

  const selectedImage = images[selectedIndex];
  const selectedSrc =
    typeof selectedImage === "string"
      ? selectedImage
      : selectedImage.url || selectedImage.src;
  const selectedAlt =
    typeof selectedImage === "string"
      ? "Main image"
      : selectedImage.alt || "Main image";

  return (
    <div className={className}>
      {/* Main Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
        <Image
          src={selectedSrc}
          alt={selectedAlt}
          fill
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => {
          const thumbSrc =
            typeof image === "string" ? image : image.url || image.src;
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`
                relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all
                ${
                  index === selectedIndex
                    ? "ring-2 ring-primary-500"
                    : "opacity-60 hover:opacity-100"
                }
              `}
            >
              <Image
                src={thumbSrc}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
