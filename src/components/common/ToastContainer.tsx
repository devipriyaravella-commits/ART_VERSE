import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-0 backdrop-blur-xl border ${
              isSuccess
                ? 'bg-white border-[#E8D3D8] text-gray-900 shadow-[#8B3A4A]/10'
                : isError
                ? 'bg-white border-rose-300 text-gray-900 shadow-rose-500/10'
                : 'bg-white border-[#E7E7E4] text-gray-900 shadow-gray-500/10'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#8B3A4A] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-[#8B3A4A] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-800 transition-colors p-1 -mr-1 -mt-1 rounded-md cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
