import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/authService';

interface UserProfile {
  role: number;
  team: any[];
  id: string;
  firstname: string;
  lastname: string;
  createdAt: string;
  lastLoggedIn: string;
  isActive: boolean;
  avatar?: string;
  contactInfo: {
    email: string;
    phoneNumber: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  biography: string | null;
  languages: number[];
}

const Profile = () => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    contactInfo: {
      email: '',
      phoneNumber: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.sub) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getUserById(user!.sub);
      setProfile(userData);
      setFormData({
        firstname: userData.firstname,
        lastname: userData.lastname,
        contactInfo: userData.contactInfo,
        address: userData.address
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'contactInfo') {
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            [child]: value
          }
        }));
      } else if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await authService.updateProfile({
        firstname: formData.firstname,
        lastname: formData.lastname,
        contactInfo: formData.contactInfo,
        address: formData.address
      });
      setProfile(updatedUser);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Première ligne : Mon statut et Profil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte Mon Statut */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 relative">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Mon statut</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className={`h-3 w-3 rounded-full ${profile?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="dark:text-gray-200">{profile?.isActive ? 'Actif' : 'Inactif'}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profile?.role === 1 ? 'Manager' : 'Utilisateur'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Dernière connexion: {new Date(profile?.lastLoggedIn || '').toLocaleDateString()}
          </p>
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
                    <img 
                      src={profile.avatar} 
                      alt={`${profile.firstname} ${profile.lastname}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg dark:text-white">{profile?.firstname} {profile?.lastname}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile?.role === 1 ? 'Manager' : 'Utilisateur'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200 space-y-2">
                <p><strong>Email:</strong> {profile?.contactInfo.email}</p>
                <p><strong>Téléphone:</strong> {profile?.contactInfo.phoneNumber}</p>
                <p><strong>Adresse:</strong> {profile?.address.street}, {profile?.address.city}</p>
                <p><strong>Pays:</strong> {profile?.address.country}</p>
                {profile?.biography && (
                  <p><strong>Biographie:</strong> {profile.biography}</p>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  placeholder="Prénom"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="Nom"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="tel"
                  name="contactInfo.phoneNumber"
                  value={formData.contactInfo.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Téléphone"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Rue"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="Ville"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="État/Région"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                  placeholder="Code postal"
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                placeholder="Pays"
                className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="border dark:border-gray-600 p-2 rounded dark:text-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Seconde ligne : Job recherché - Visible uniquement pour les non-managers */}
      {profile?.role !== 1 && (
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
      )}
    </div>
  );
};

export default Profile;
