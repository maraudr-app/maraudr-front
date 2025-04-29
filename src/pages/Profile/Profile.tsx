import { useState, useEffect } from 'react';

import { useAuthStore } from '../../store/authStore';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  email: string;
  name: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt: string;
}

const Profile = () => {

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchUserProfile().then(r => console.log(r));
  }, []);

  const fetchUserProfile = async () => {
    const mockProfile: UserProfile = {
      email: user?.email || 'user@example.com',
      name: user?.name || 'User',
      avatar: user?.avatar || 'https://via.placeholder.com/150',
      firstName: user?.name?.split(' ')[0] || 'John',
      lastName: 'Doe',
      role: 'Developpeur Full Stack',
      createdAt: new Date().toISOString(),
    };
    setProfile(mockProfile);
    setFormData({
      firstName: mockProfile.firstName || '',
      lastName: mockProfile.lastName || '',
      email: mockProfile.email,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      setProfile({
        ...profile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Première ligne : Mon statut et Profil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Carte Mon Statut */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 relative">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Mon statut</h2>
          <button className="absolute top-6 right-6 text-sm border dark:border-gray-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">Modifier</button>

          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <p className="dark:text-gray-200">En recherche active</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Air France</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Votre entreprise actuelle n'a pas accès à votre statut.</p>
        </div>

        {/* Carte Profil */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 relative">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Profil</h2>
          {!isEditingProfile ? (
            <>
              <button onClick={() => setIsEditingProfile(true)} className="absolute top-6 right-6 text-sm border dark:border-gray-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">Modifier</button>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden border dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg dark:text-white">{profile?.firstName} {profile?.lastName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.role}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200">
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Sexe:</strong> Homme</p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Prénom" className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Nom" className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="border dark:border-gray-600 p-2 rounded dark:text-gray-200">Annuler</button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Enregistrer</button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Seconde ligne : Job recherché */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Job recherché</h2>
        <button className="absolute top-6 right-6 text-sm border dark:border-gray-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">Modifier</button>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Intitulé de poste</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">Software Developer</span>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">Software & Web Development</span>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">Développeur front-end</span>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">Ingénieur logiciel</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Localisation</p>
              <p className="dark:text-gray-200">Plaisir, France / Paris, France</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type de contrat</p>
              <p className="dark:text-gray-200">CDI</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Télétravail</p>
              <p className="dark:text-gray-200">Télétravail occasionnel</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Niveau d'expérience</p>
              <p className="dark:text-gray-200">1-3 ans</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Salaire minimum</p>
              <p className="dark:text-gray-200">48 000 € brut/an</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Exprimez librement ce que vous cherchez</p>
            <p className="text-gray-400 dark:text-gray-500">Non renseigné</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
