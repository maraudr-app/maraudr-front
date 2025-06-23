import React from 'react';

interface AssociationAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AssociationAvatar: React.FC<AssociationAvatarProps> = ({ 
  name, 
  size = 'md', 
  className = '' 
}) => {
  // Fonction pour générer les initiales
  const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.split(' ').filter(Boolean);
    if (words.length === 0) return '';
    
    let initials = '';
    for (let i = 0; i < Math.min(words.length, 3); i++) {
      initials += words[i].charAt(0);
    }
    return initials.toUpperCase();
  };

  // Fonction pour adapter la taille du texte selon le nombre de caractères
  const getTextSizeClass = (text: string, baseSize: string) => {
    const length = text.length;
    
    if (baseSize === 'sm') {
      if (length <= 2) return 'text-[10px]';
      if (length <= 3) return 'text-[8px]';
      if (length <= 4) return 'text-[7px]';
      if (length <= 5) return 'text-[6px]';
      return 'text-[5px]';
    }
    
    if (baseSize === 'lg') {
      if (length <= 2) return 'text-sm';
      if (length <= 3) return 'text-xs';
      if (length <= 4) return 'text-[10px]';
      if (length <= 5) return 'text-[9px]';
      return 'text-[8px]';
    }
    
    // md par défaut
    if (length <= 2) return 'text-xs';
    if (length <= 3) return 'text-[9px]';
    if (length <= 4) return 'text-[8px]';
    if (length <= 5) return 'text-[7px]';
    return 'text-[6px]';
  };

  // Fonction pour la taille du cercle selon la taille de base (FIXE maintenant)
  const getCircleSizeClass = (baseSize: string) => {
    if (baseSize === 'sm') {
      return 'w-8 h-8 min-w-[2rem] min-h-[2rem]'; // 32px fixe
    }
    
    if (baseSize === 'lg') {
      return 'w-14 h-14 min-w-[3.5rem] min-h-[3.5rem]'; // 56px fixe
    }
    
    // md par défaut
    return 'w-10 h-10 min-w-[2.5rem] min-h-[2.5rem]'; // 40px fixe
  };

  const initials = getInitials(name);
  const circleSize = getCircleSizeClass(size);
  const textSize = getTextSizeClass(initials, size);

  return (
    <div 
      className={`${circleSize} rounded-full border-2 border-maraudr-blue bg-maraudr-blue/20 dark:bg-maraudr-orange/20 flex items-center justify-center text-maraudr-blue dark:text-maraudr-orange font-bold ${textSize} ${className} aspect-square overflow-hidden flex-shrink-0`}
      title={name}
      style={{
        // Garantir que c'est toujours un cercle parfait
        aspectRatio: '1 / 1',
      }}
    >
      <span className="truncate px-1 text-center leading-none">
        {initials}
      </span>
    </div>
  );
}; 