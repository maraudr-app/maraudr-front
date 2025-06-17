import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../services/userService";
import { Input } from "../../components/common/input/input";
import { MultiSelectDropdown } from "../../components/common/multiSelectDropdown/multiSelectDropdown";
import { Button } from "../../components/common/button/button";

// Enum mapping
const LANG_ENUM = [
  { value: 1, label: "Français" },
  { value: 2, label: "Anglais" },
  { value: 3, label: "Espagnol" },
  { value: 4, label: "Allemand" },
];

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.contactInfo?.email || "",
    phoneNumber: user?.contactInfo?.phoneNumber || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "",
    languages: user?.languages?.map(Number) || [],
    biography: user?.biography || "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pour le MultiSelectDropdown, il faut passer des strings
  const selectedLangs = form.languages.map(val => val.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLanguagesChange = (langs: string[]) => {
    setForm({ ...form, languages: langs.map(Number) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Validation mot de passe
    if ((form.password || form.confirmPassword) && form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        firstname: form.firstname,
        lastname: form.lastname,
        biography: form.biography,
        contactInfo: {
          email: form.email,
          phoneNumber: form.phoneNumber,
        },
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
        languages: form.languages,
      };
      if (form.password) {
        updateData.password = form.password;
      }
      await userService.updateUser(user.id, updateData);
      setSuccess("Profil mis à jour !");
      setForm({ ...form, password: "", confirmPassword: "" }); // reset password fields
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-10 mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Mon Profil</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Input label="Prénom" name="firstname" value={form.firstname} onChange={handleChange} required className="flex-1" />
          <Input label="Nom" name="lastname" value={form.lastname} onChange={handleChange} required className="flex-1" />
        </div>
        <Input label="Email" name="email" value={form.email} onChange={handleChange} required />
        <Input label="Téléphone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        <Input label="Rue" name="street" value={form.street} onChange={handleChange} />
        <div className="flex flex-col md:flex-row gap-6">
          <Input label="Ville" name="city" value={form.city} onChange={handleChange} className="flex-1" />
          <Input label="Code Postal" name="postalCode" value={form.postalCode} onChange={handleChange} className="flex-1" />
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <Input label="État" name="state" value={form.state} onChange={handleChange} className="flex-1" />
          <Input label="Pays" name="country" value={form.country} onChange={handleChange} className="flex-1" />
        </div>
        <MultiSelectDropdown
          label="Langues parlées"
          options={LANG_ENUM.map(l => ({ value: l.value.toString(), label: l.label }))}
          selectedValues={selectedLangs}
          onChange={handleLanguagesChange}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
          <textarea
            name="biography"
            value={form.biography}
            onChange={handleChange}
            rows={5}
            className="w-full border rounded px-3 py-2"
            placeholder="Décrivez-vous, vos expériences, vos centres d'intérêt, etc."
          />
          <p className="text-xs text-gray-500 mt-1">
            Cette biographie sera visible par les autres membres de l'association.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Laissez vide pour ne pas changer"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation du mot de passe</label>
          <Input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Répétez le nouveau mot de passe"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pour changer votre mot de passe, saisissez-le deux fois. Les champs doivent être identiques.
          </p>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
        {success && <div className="text-green-600 text-center">{success}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
};

export default Profile;
