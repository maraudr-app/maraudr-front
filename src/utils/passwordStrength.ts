export function getPasswordStrength(password: string): { strength: number; label: string; message: string } {
  let strength = 0;
  let label = '';
  let message = '';

  if (!password) {
    return { strength: 0, label: '', message: '' };
  }

  // Critères simples
  if (password.length >= 8) strength += 30;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  if (password.length >= 12) strength += 10;

  if (strength > 80) {
    label = 'Mot de passe fort';
    message = "Super ! N'oubliez pas votre mot de passe.";
  } else if (strength > 50) {
    label = 'Mot de passe moyen';
    message = 'Ajoutez des caractères spéciaux ou des chiffres pour le renforcer.';
  } else {
    label = 'Mot de passe faible';
    message = 'Utilisez au moins 8 caractères, des majuscules, chiffres et symboles.';
  }

  return { strength, label, message };
} 