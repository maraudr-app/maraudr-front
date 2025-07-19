import React from 'react';

interface PasswordStrengthToastProps {
  strength: number; // 0 à 100
  label: string;
  message: string;
}

const getBarColor = (strength: number) => {
  if (strength > 80) return 'bg-green-500';
  if (strength > 50) return 'bg-yellow-400';
  if (strength > 30) return 'bg-orange-400';
  return 'bg-red-400';
};

const PasswordStrengthToast: React.FC<PasswordStrengthToastProps> = ({ strength, label, message }) => {
  return (
    <div className="w-72 bg-white border border-gray-200 rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="font-bold text-gray-800 text-sm mb-1">{label}</div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getBarColor(strength)}`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="text-xs text-gray-600">{message}</div>
    </div>
  );
};

export default PasswordStrengthToast; 