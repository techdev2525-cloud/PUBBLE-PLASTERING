// Modal Component
import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer,
  className = "",
}) {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  // Handle ESC key press
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape" && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose],
  );

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Add/remove event listeners and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={`
          bg-white rounded-2xl shadow-2xl w-full ${sizes[size]}
          transform transition-all duration-300
          animate-slide-up
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-concrete-200">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-heading font-semibold text-concrete-800"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-concrete-400 hover:text-concrete-600 hover:bg-concrete-100 transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-concrete-200 bg-concrete-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render modal at document root
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}

// Confirmation Modal
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  const variantStyles = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    primary: "bg-primary-500 hover:bg-primary-600",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-concrete-600 hover:bg-concrete-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${variantStyles[variant]} disabled:opacity-50`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      }
    >
      <p className="text-concrete-600">{message}</p>
    </Modal>
  );
}

// Alert Modal
export function AlertModal({ isOpen, onClose, title, message, type = "info" }) {
  const icons = {
    info: "💡",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  const colors = {
    info: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    error: "bg-red-100 text-red-600",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-concrete-800 text-white rounded-lg hover:bg-concrete-700 transition-colors"
          >
            OK
          </button>
        </div>
      }
    >
      <div className="text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4 ${colors[type]}`}
        >
          {icons[type]}
        </div>
        <h3 className="text-lg font-semibold text-concrete-800 mb-2">
          {title}
        </h3>
        <p className="text-concrete-600">{message}</p>
      </div>
    </Modal>
  );
}

// Image Preview Modal
export function ImageModal({ isOpen, onClose, src, alt = "" }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      showCloseButton={true}
      className="bg-transparent"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </Modal>
  );
}
