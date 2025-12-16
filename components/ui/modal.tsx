'use client';

import { useEffect, useRef } from 'react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-2xl p-6 w-full mx-4 ${sizeClass} animate-scaleIn`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        {(title || description) && (
          <div className="mb-4">
            {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" closeOnBackdrop={false}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface AlertModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function AlertModal({
  isOpen,
  type,
  title,
  message,
  onClose,
  actionLabel,
  onAction,
}: AlertModalProps) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  const colors = {
    success: 'bg-green-100 text-green-900',
    error: 'bg-red-100 text-red-900',
    info: 'bg-blue-100 text-blue-900',
    warning: 'bg-yellow-100 text-yellow-900',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className={`w-12 h-12 rounded-full ${colors[type]} flex items-center justify-center ${iconColors[type]} text-xl font-bold`}>
          {icons[type]}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {message && <p className="text-gray-600 mt-2">{message}</p>}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          {onAction && actionLabel ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Dismiss
              </Button>
              <Button variant="primary" onClick={onAction}>
                {actionLabel}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={onClose} className="w-full">
              Okay
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
