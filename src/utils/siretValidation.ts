export const validateSiret = (siret: string): boolean => {
  // Vérifier que le SIRET contient exactement 14 chiffres
  if (!/^\d{14}$/.test(siret)) {
    return false;
  }

  // Algorithme de Luhn
  let sum = 0;
  let isEven = false;

  // Parcourir les chiffres de droite à gauche
  for (let i = siret.length - 1; i >= 0; i--) {
    let digit = parseInt(siret[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  // Le SIRET est valide si la somme est divisible par 10
  return sum % 10 === 0;
}; 