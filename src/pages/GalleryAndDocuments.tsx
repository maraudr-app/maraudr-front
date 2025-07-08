import React, { useState, useEffect, useRef } from 'react';
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
  const [uploading, setUploading] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const success = await mediaService.deleteFile(fileId, selectedAssociation!.id);
      if (success) {
        fetchData();
      }
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedAssociation?.id) return;

    const file = files[0];
    
    // Vérifier le type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 10MB)');
      return;
    }

    try {
      setUploading(true);
      // Déterminer le type de fichier
      const isImage = file.type.startsWith('image/');
      const type = isImage ? 'photo' : 'document';
      
      const uploadedFile = await mediaService.uploadFile(selectedAssociation.id, file, type);
      if (uploadedFile) {
        fetchData(); // Recharger la liste
        alert('Fichier uploadé avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  if (!selectedAssociation) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <MediaNavbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Bouton flottant pour upload rapide */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-maraudr-blue to-maraudr-orange text-white rounded-full shadow-lg hover:from-maraudr-orange hover:to-maraudr-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
        title={uploading ? 'Upload en cours...' : 'Ajouter un fichier'}
      >
        {uploading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <FaFileAlt className="w-6 h-6" />
        )}
      </button>

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Documents de l'association
                  </h3>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-maraudr-blue to-maraudr-orange text-white text-sm font-medium rounded-lg hover:from-maraudr-orange hover:to-maraudr-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaFileAlt className="w-4 h-4 mr-2" />
                    {uploading ? 'Upload en cours...' : 'Ajouter un fichier'}
                  </Button>
                </div>
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

        {/* Input file caché pour l'upload */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
          disabled={uploading}
        />
      </main>
    </div>
  );
};

export default Media; 