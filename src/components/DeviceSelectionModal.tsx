import React, { useState } from 'react';
import { Smartphone, Laptop, Tablet, CheckCircle, ArrowRight, X } from 'lucide-react';
import { DeviceType } from '../types';

interface DeviceSelectionModalProps {
  isOpen: boolean;
  currentDevice: DeviceType;
  onSelectDevice: (device: DeviceType) => void;
  onClose?: () => void;
  isInitialPrompt?: boolean;
}

export const DeviceSelectionModal: React.FC<DeviceSelectionModalProps> = ({
  isOpen,
  currentDevice,
  onSelectDevice,
  onClose,
  isInitialPrompt = false
}) => {
  const [selected, setSelected] = useState<DeviceType>(currentDevice || 'laptop');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectDevice(selected);
    if (onClose) onClose();
  };

  const deviceOptions = [
    {
      id: 'phone' as DeviceType,
      title: 'Phone / Smartphone',
      icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
      badge: 'Slider View',
      summary: 'Optimized for mobile screens',
      description: 'Combines all controls, buttons, and navigation into an intuitive swipeable slider so your screen stays clean, uncluttered, and easy to use with one hand.'
    },
    {
      id: 'laptop' as DeviceType,
      title: 'Laptop / Desktop',
      icon: <Laptop className="w-8 h-8 text-blue-600" />,
      badge: 'Standard Widescreen',
      summary: 'Full desktop experience',
      description: 'Keeps the standard multi-column layout with all action buttons, topic bars, and side-by-side study panels displayed in full view.'
    },
    {
      id: 'tablet' as DeviceType,
      title: 'Tablet / iPad',
      icon: <Tablet className="w-8 h-8 text-purple-600" />,
      badge: 'Spacious Touch View',
      summary: 'Full layout with touch spacing',
      description: 'Retains the complete standard screen interface without button collapsing, calibrated for larger touchscreens.'
    }
  ];

  return (
    <div
      id="device-selection-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {onClose && !isInitialPrompt && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center max-w-md mx-auto mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600 shadow-2xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Which device are you using today?
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Please choose your device so we can customize your interface. You can switch this setting anytime from the top bar.
          </p>
        </div>

        {/* Device Cards */}
        <div className="space-y-3 mb-6">
          {deviceOptions.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 select-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-400/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {opt.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-normal font-medium">
                    {opt.summary}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                <div className="shrink-0 mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer active:scale-98"
        >
          <span>Continue with {selected === 'phone' ? 'Phone Slider View' : selected === 'tablet' ? 'Tablet View' : 'Laptop Desktop View'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
