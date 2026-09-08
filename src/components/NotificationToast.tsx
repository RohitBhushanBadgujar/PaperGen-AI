import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePaperGen } from '../context/PaperGenContext';

export const NotificationToast: React.FC = () => {
  const { notification, showNotification } = usePaperGen();

  if (!notification) return null;

  const bgStyles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
  }[notification.type];

  const Icon = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  }[notification.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-md">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgStyles}`}>
        {Icon}
        <div className="flex-1 text-sm font-medium leading-snug">{notification.message}</div>
      </div>
    </div>
  );
};
