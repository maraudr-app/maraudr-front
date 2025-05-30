import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/common/input/input';
import Button from '../../components/common/button/button';
import { assoService } from '../../services/assoService';
import { validateSiret } from '../../utils/siretValidation';
import associationImage from '../../assets/pictures/createAssoImage.png';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const AssoSiret = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [siret, setSiret] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [touched, setTouched] = useState(false);

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // N'accepter que les chiffres
    if (value === '' || /^\d+$/.test(value)) {
      setSiret(value);
      setTouched(true);
      if (value.length === 14) {
        const isValidSiret = validateSiret(value);
        setIsValid(isValidSiret);
        setError(isValidSiret ? null : t('siret.invalid', 'Le numéro SIRET n\'est pas valide'));
      } else {
        setIsValid(null);
        setError(null);
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (siret.length === 14) {
      const isValidSiret = validateSiret(siret);
      setIsValid(isValidSiret);
      setError(isValidSiret ? null : t('siret.invalid', 'Le numéro SIRET n\'est pas valide'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await assoService.createAssociation(siret);
      navigate('/maraudApp');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('siret.error', 'Une erreur est survenue lors de la validation du SIRET'));
    } finally {
      setIsLoading(false);
    }
  };

  const getInputValidationProps = () => {
    if (!touched) return {};
    
    if (isValid === null) {
      return {
        borderColor: 'border-gray-300',
        focusBorderColor: 'focus:border-blue-500'
      };
    }
    
    return isValid ? {
      borderColor: 'border-green-500',
      focusBorderColor: 'focus:border-green-500',
      rightIcon: <CheckCircleIcon className="w-5 h-5 text-green-500" />
    } : {
      borderColor: 'border-red-500',
      focusBorderColor: 'focus:border-red-500',
      rightIcon: <XCircleIcon className="w-5 h-5 text-red-500" />
    };
  };

  return (
    <div className=" flex flex-col items-center justify-center bg-white px-4 py-8">
      <div className="w-full  flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          {t('siret.title', 'Entrez le numéro SIRET de votre association')}
        </h1>

        <img 
          src={associationImage} 
          alt="Association" 
          className="w-120 h-80 object-contain mb-8"
        />

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              name="siret"
              value={siret}
              onChange={handleSiretChange}
              onBlur={handleBlur}
              placeholder={t('siret.placeholder', 'Entrez le numéro SIRET (14 chiffres)')}
              maxLength={14}
              className="w-full text-lg"
              {...getInputValidationProps()}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className={`w-full text-lg font-semibold transition-colors duration-300 ${
              isValid 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!isValid || isLoading}
            isLoading={isLoading}
          >
            {t('siret.validate', 'Valider')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AssoSiret; 