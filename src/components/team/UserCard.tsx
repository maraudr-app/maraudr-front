import React from "react";
import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { Button } from "../common/button/button";
import { User } from "../../types/user/user";
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  user: User;
  handleViewDisponibilities: (user: User) => Promise<void>;
}

const UserCard: React.FC<UserCardProps> = ({ user, handleViewDisponibilities }) => {
  const { t } = useTranslation();
  
  // Fonction pour les traductions de l'équipe (même pattern que les autres composants)
  const t_team = (key: string): string => {
    return t(`team.${key}` as any);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.firstname + " " + user.lastname
        )}&background=random`}
        alt={`${user.firstname} ${user.lastname}`}
        className="w-16 h-16 rounded-full mb-3 object-cover"
      />
      <h3 className="font-bold text-lg">{user.firstname} {user.lastname}</h3>
      <div className="text-gray-500 text-sm mb-1">{user.isManager ? t_team('member.role.manager') : t_team('member.role.member')}</div>
      {(user.city || user.country) && (
        <div className="flex items-center justify-center text-gray-400 text-xs mb-2">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {[user.city, user.country].filter(Boolean).join(", ")}
        </div>
      )}
      <div className="flex items-center justify-center mb-2">
        <span className="flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          {t_team('member.status.active')}
        </span>
      </div>
      {user.createdAt && (
        <div className="text-xs text-gray-400 mb-2">
          {t_team('member.joinedSince')} {new Date(user.createdAt).getFullYear()}
        </div>
      )}
      {user.languages && user.languages.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {user.languages.map((lang, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{lang}</span>
          ))}
        </div>
      )}
      <Button
        onClick={() => handleViewDisponibilities(user)}
        className="w-full bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
      >
        <ClockIcon className="h-4 w-4 mr-2" />
        {t_team('actions.viewDisponibilities')}
      </Button>
    </div>
  );
};

export default UserCard; 