import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../../components/common/input/input";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import PasswordStrengthToast from "../../components/common/toast/PasswordStrengthToast";
import { getPasswordStrength } from "../../utils/passwordStrength";
import Button from "../../components/common/button/button";
import { useTranslation } from "react-i18next";

const CreateAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);

  const isValid = {
    firstname: form.firstname.length > 2,
    lastname: form.lastname.length > 2,
    email: form.email.includes("@"),
    phoneNumber: form.phoneNumber.length >= 10,
    street: form.street.length > 0,
    city: form.city.length > 0,
    state: form.state.length > 0,
    postalCode: form.postalCode.length > 0,
    country: form.country.length > 0,
    password: passwordStrength.strength >= 3,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      const { strength } = getPasswordStrength(value);
      if (strength < 2) {
        setPasswordError("Password must be at least 8 characters, including uppercase, lowercase, and numbers");
      } else {
        setPasswordError(undefined);
      }
    }

    if (name === "confirmPassword") {
      if (value !== form.password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError(undefined);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      if (form.password !== form.confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }

      if (passwordError || confirmPasswordError) {
        setFormError("Please correct the errors before submitting");
        return;
      }

      // 👇 Exemple d'appel à l'API
      // await userService.createUser({
      //   ...form,
      //   languages: [], // À gérer selon les besoins
      //   isManager: false, // À gérer selon les besoins
      // });
      // navigate("/maraudApp");

      alert("Account created!");
      navigate("/login");
    } catch (err) {
      setFormError("An error occurred while creating the account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full p-6">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6 relative">
          <h1 className="text-3xl font-bold text-center mb-8">{t('register.title')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={t('register.firstName')}
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              required
              rightIcon={isValid.firstname && <FaCheckCircle className="text-green-500 text-lg" />}
            />

            <Input
              placeholder={t('register.lastName')}
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              required
              rightIcon={isValid.lastname && <FaCheckCircle className="text-green-500 text-lg" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={t('register.email')}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              rightIcon={isValid.email && <FaCheckCircle className="text-green-500 text-lg" />}
            />

            <Input
              placeholder={t('register.phone')}
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              rightIcon={isValid.phoneNumber && <FaCheckCircle className="text-green-500 text-lg" />}
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                placeholder={t('register.password')}
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                isFocused={isPasswordFocused}
                setIsFocused={setIsPasswordFocused}
                error={passwordError}
                className={`${
                  form.password === form.confirmPassword && !passwordError && !confirmPasswordError
                    ? "border-green-500"
                    : ""
                }`}
                rightIcon={
                  <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                }
              />
              {isPasswordFocused && form.password && (
                <div className="absolute right-0 top-14 z-10">
                  <PasswordStrengthToast
                    strength={passwordStrength.strength}
                    label={passwordStrength.label}
                    message={passwordStrength.message}
                  />
                </div>
              )}
            </div>

            <Input
              placeholder={t('register.confirmPassword')}
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              isFocused={isConfirmPasswordFocused}
              setIsFocused={setIsConfirmPasswordFocused}
              error={confirmPasswordError}
              className={`${
                form.password === form.confirmPassword && !passwordError && !confirmPasswordError
                  ? "border-green-500"
                  : ""
              }`}
              rightIcon={
                <div onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              }
            />
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder={t('register.street')}
              name="street"
              value={form.street}
              onChange={handleChange}
              required
              rightIcon={isValid.street && <FaCheckCircle className="text-green-500 text-lg" />}
            />

            <Input
              placeholder={t('register.city')}
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              rightIcon={isValid.city && <FaCheckCircle className="text-green-500 text-lg" />}
            />

            <Input
              placeholder={t('register.state')}
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              rightIcon={isValid.state && <FaCheckCircle className="text-green-500 text-lg" />}
            />

            <Input
              placeholder={t('register.postalCode')}
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              required
              rightIcon={isValid.postalCode && <FaCheckCircle className="text-green-500 text-lg" />}
            />
          </div>

          <Input
            placeholder={t('register.country')}
            name="country"
            value={form.country}
            onChange={handleChange}
            required
            rightIcon={isValid.country && <FaCheckCircle className="text-green-500 text-lg" />}
          />

          {/* Erreur globale */}
          {formError && <div className="text-red-500 text-sm text-center">{t('register.formError')}</div>}

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              {t('register.terms')}{" "}
              <a href="#" className="underline">{t('register.termsLink')}</a>{" "}
              {t('register.and')}{" "}
              <a href="#" className="underline">{t('register.privacyLink')}</a>
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-between gap-4">
            <Button 
              type="button" 
              className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800" 
              onClick={() => navigate('/login')}
            >
              {t('register.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isLoading} 
              isLoading={isLoading}
            >
              {t('register.submit')}
            </Button>
          </div>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('register.alreadyHaveAccount')}{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                {t('register.signIn')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
