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
  const titleId = title ? 'modal-title' : undefined;
  const descriptionId = description ? 'modal-description' : undefined;

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

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const modalNode = modalRef.current;

    // Move focus into modal
    const focusable = modalNode?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
      if (event.key === 'Tab' && modalNode) {
        const focusables = Array.from(
          modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

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
      <div className="absolute inset-0 overlay-premium backdrop-blur-sm animate-fadeIn" />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative bg-white/10 border border-white/20 text-slate-100 rounded-2xl shadow-[0_25px_80px_-28px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-6 w-full mx-4 ${sizeClass} animate-scaleIn`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors p-2 hover:bg-white/10 rounded-lg"
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
            {title && (
              <h2 id={titleId} className="text-xl font-semibold text-slate-50">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-slate-200/80 mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-slate-200/85">{children}</div>
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
          <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
          <p className="text-slate-200/85 mt-2">{message}</p>
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
