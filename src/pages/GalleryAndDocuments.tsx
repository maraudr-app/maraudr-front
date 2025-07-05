import React, { useState, useEffect } from 'react';
import { MediaNavbar } from '../components/media/MediaNavbar';
import { FaImages, FaFileAlt, FaSearch, FaFilter, FaDownload, FaTrash, FaEye } from 'react-icons/fa';
import { mediaService, MediaFile, MediaFilter } from '../services/mediaService';
import { useAssoStore } from '../store/assoStore';
import { Input } from '../components/common/input/input';
import { Select } from '../components/common/select/select';
import { Button } from '../components/common/button/button';

const Media: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'documents'>('photos');
  const [documents, setDocuments] = useState<MediaFile[]>([]);
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MediaFilter>({
    name: '',
    category: '',
    uploadedBy: '',
    dateFrom: '',
    dateTo: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [uploaders, setUploaders] = useState<string[]>([]);
  const { selectedAssociation } = useAssoStore();

  useEffect(() => {
    if (selectedAssociation?.id) {
      fetchData();
    }
  }, [selectedAssociation, activeTab, filter]);

  const fetchData = async () => {
    if (!selectedAssociation?.id) return;

    setIsLoading(true);
    try {
      if (activeTab === 'documents') {
        const docs = await mediaService.getDocuments(selectedAssociation.id, filter);
        setDocuments(docs);
      } else {
        const pics = await mediaService.getPhotos(selectedAssociation.id, filter);
        setPhotos(pics);
      }

      // Récupérer les catégories et uploaders pour les filtres
      const cats = await mediaService.getCategories();
      const ups = await mediaService.getUploaders(selectedAssociation.id);
      setCategories(cats);
      setUploaders(ups);
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilter({
      name: '',
      category: '',
      uploadedBy: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleDownload = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const success = await mediaService.deleteFile(fileId);
      if (success) {
        fetchData();
      }
    }
  };

  if (!selectedAssociation) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <MediaNavbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="pt-16">
        {/* Section Photos */}
        {activeTab === 'photos' && (
          <div className="mb-8">
            <div className="rounded-xl p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maraudr-blue mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Chargement des photos...</p>
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map(photo => (
                    <div key={photo.id} className="rounded-lg p-4">
                      <img src={photo.url} alt={photo.name} className="w-full h-32 object-cover rounded mb-2" />
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{photo.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(photo.uploadedAt).toLocaleDateString()} • {mediaService.formatFileSize(photo.size)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaImages className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aucune photo trouvée
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucune photo n'a encore été partagée dans cette association.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Documents */}
        {activeTab === 'documents' && (
          <div className="mb-8">
            <div className="rounded-xl p-6">
              {/* Filtres fixes en haut */}
              <div className="sticky top-0 z-10 mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    type="text"
                    name="name"
                    value={filter.name}
                    onChange={handleFilterChange}
                    placeholder="Rechercher un document"
                  />
                  <Select
                    name="category"
                    value={filter.category}
                    onChange={handleFilterChange}
                    placeholder="Toutes les catégories"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                  <Select
                    name="uploadedBy"
                    value={filter.uploadedBy}
                    onChange={handleFilterChange}
                    placeholder="Tous les uploaders"
                  >
                    <option value="">Tous les uploaders</option>
                    {uploaders.map(uploader => (
                      <option key={uploader} value={uploader}>{uploader}</option>
                    ))}
                  </Select>
                  <Button
                    onClick={handleResetFilters}
                    className="text-xs bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>

              {/* Tableau des documents avec hauteur fixe et scroll */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maraudr-blue mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Chargement des documents...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Catégorie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Taille
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Uploadé par
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {documents.map((doc, index) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-3">{mediaService.getFileIcon(doc.name)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {doc.name}
                                </div>
                                {doc.description && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {doc.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.category || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {mediaService.formatFileSize(doc.size)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.uploadedBy}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => window.open(doc.url, '_blank')}
                                className="text-blue-500 hover:text-blue-600 p-1"
                              >
                                <FaEye className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDownload(doc)}
                                className="text-green-500 hover:text-green-600 p-1"
                              >
                                <FaDownload className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(doc.id)}
                                className="text-red-500 hover:text-red-600 p-1"
                              >
                                <FaTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aucun document trouvé
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun document n'a encore été partagé dans cette association.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Media; 