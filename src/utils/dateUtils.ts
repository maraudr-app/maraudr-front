/**
 * Utilitaires pour la gestion des dates et fuseaux horaires
 */

/**
 * Convertit une date ISO en date locale sans décalage de fuseau horaire
 * @param isoString - Date au format ISO string
 * @returns Date locale
 */
export const parseLocalDate = (isoString: string): Date => {
  // Extraire la date et l'heure de la string ISO
  const [datePart, timePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  
  let hours = 0, minutes = 0, seconds = 0;
  if (timePart) {
    const timeWithoutZone = timePart.split('.')[0]; // Enlever les millisecondes
    const [time, zone] = timeWithoutZone.split('+');
    const [h, m, s] = time.split(':').map(Number);
    hours = h || 0;
    minutes = m || 0;
    seconds = s || 0;
  }
  
  // Créer une date locale (sans conversion de fuseau horaire)
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

/**
 * Formate une date pour l'affichage
 * @param date - Date à formater
 * @returns Date formatée en français
 */
export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formate une heure pour l'affichage
 * @param date - Date contenant l'heure
 * @returns Heure formatée
 */
export const formatDisplayTime = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date et heure complète pour l'affichage
 * @param date - Date à formater
 * @returns Date et heure formatées
 */
export const formatDisplayDateTime = (date: Date): string => {
  return `${formatDisplayDate(date)} à ${formatDisplayTime(date)}`;
};

/**
 * Formate une plage horaire pour l'affichage
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Plage horaire formatée
 */
export const formatDisplayTimeRange = (startDate: Date, endDate: Date): string => {
  const startDateStr = formatDisplayDate(startDate);
  const startTimeStr = formatDisplayTime(startDate);
  const endTimeStr = formatDisplayTime(endDate);
  
  if (startDateStr === formatDisplayDate(endDate)) {
    // Même jour
    return `${startDateStr} de ${startTimeStr} à ${endTimeStr}`;
  } else {
    // Jours différents
    const endDateStr = formatDisplayDate(endDate);
    return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
  }
};

/**
 * Crée une date locale à partir de composants
 * @param year - Année
 * @param month - Mois (1-12)
 * @param day - Jour (1-31)
 * @param hours - Heures (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Date locale
 */
export const createLocalDate = (
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): Date => {
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

/**
 * Vérifie si deux dates sont le même jour
 * @param date1 - Première date
 * @param date2 - Deuxième date
 * @returns true si même jour
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Obtient le début du jour (00:00:00)
 * @param date - Date de référence
 * @returns Début du jour
 */
export const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Obtient la fin du jour (23:59:59)
 * @param date - Date de référence
 * @returns Fin du jour
 */
export const getEndOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
};

/**
 * Vérifie si une date est aujourd'hui
 * @param date - Date à vérifier
 * @returns true si aujourd'hui
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

/**
 * Vérifie si une date est dans le passé
 * @param date - Date à vérifier
 * @returns true si dans le passé
 */
export const isPast = (date: Date): boolean => {
  const now = new Date();
  return date < now;
}; 