import React from "react";
import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { Button } from "../common/button/button";

type User = {
  id: string;
  firstname: string;
  lastname: string;
  avatar?: string;
  userType?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  createdAt?: string;
  languages?: string[];
  email?: string;
  phoneNumber?: string;
};

interface UserCardProps {
  user: User;
  handleViewDisponibilities: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, handleViewDisponibilities }) => (
  <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
    <img
      src={
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.firstname + " " + user.lastname
        )}&background=random`
      }
      alt={`${user.firstname} ${user.lastname}`}
      className="w-16 h-16 rounded-full mb-3 object-cover"
    />
    <h3 className="font-bold text-lg">{user.firstname} {user.lastname}</h3>
    <div className="text-gray-500 text-sm mb-1">{user.userType || "Membre"}</div>
    {(user.city || user.country) && (
      <div className="flex items-center justify-center text-gray-400 text-xs mb-2">
        <MapPinIcon className="h-4 w-4 mr-1" />
        {[user.city, user.country].filter(Boolean).join(", ")}
      </div>
    )}
    <div className="flex items-center justify-center mb-2">
      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {user.isActive ? "Actif" : "Inactif"}
      </span>
    </div>
    {user.createdAt && (
      <div className="text-xs text-gray-400 mb-2">
        Membre depuis {new Date(user.createdAt).getFullYear()}
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
      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
    >
      <ClockIcon className="h-4 w-4 mr-2" />
      Voir disponibilités
    </Button>
  </div>
);

export default UserCard; 