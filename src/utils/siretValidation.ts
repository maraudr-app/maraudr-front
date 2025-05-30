export const validateSiret = (siret: string): boolean => {
  // Vérifier que le SIRET fait 14 chiffres
  if (siret.length !== 14 || !/^\d+$/.test(siret)) {
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

  return sum % 10 === 0;
}; 