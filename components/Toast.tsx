'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#111827',
          border: '1px solid #1f2937',
          color: '#E5E7EB',
        },
      }}
      theme="dark"
    />
  );
}
