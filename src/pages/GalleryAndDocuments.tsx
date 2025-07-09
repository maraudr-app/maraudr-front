import React, { useState, useEffect, useRef } from 'react';
import { MediaNavbar } from '../components/media/MediaNavbar';
import { FaImages, FaFileAlt, FaSearch, FaFilter, FaDownload, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import { mediaService, MediaFile, MediaFilter } from '../services/mediaService';
import { useAssoStore } from '../store/assoStore';
import { Input } from '../components/common/input/input';
import { Select } from '../components/common/select/select';
import { Button } from '../components/common/button/button';
import { useToast } from '../hooks/useToast';
import Toast from '../components/common/toast/Toast';

const Media: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'documents'>('photos');
  const [documents, setDocuments] = useState<MediaFile[]>([]);
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaFile | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
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
  const { toasts, removeToast, toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFileToDelete, setSelectedFileToDelete] = useState<MediaFile | null>(null);

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
    // Ouvre la modale de confirmation
    const file = photos.find(p => p.id === fileId) || documents.find(d => d.id === fileId) || null;
    setSelectedFileToDelete(file);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedFileToDelete) return;
    // Fermer la modale immédiatement
    setShowDeleteModal(false);
    setSelectedFileToDelete(null);
    try {
      const success = await mediaService.deleteFile(selectedFileToDelete.id, selectedAssociation!.id);
      if (success) {
        toast.success('Fichier supprimé avec succès');
        await fetchData();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du fichier');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedFileToDelete(null);
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
      toast.error('Type de fichier non autorisé');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10MB)');
      return;
    }

    try {
      setUploading(true);
      // Déterminer le type de fichier
      const isImage = file.type.startsWith('image/');
      const type = isImage ? 'photo' : 'document';
      
      const uploadedFile = await mediaService.uploadFile(selectedAssociation.id, file, type);
      if (uploadedFile) {
        // Notification de succès
        const fileType = isImage ? 'photo' : 'document';
        const message = `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploadé avec succès !`;
        toast.success(message);
        
        // Recharger la liste pour afficher le nouveau fichier
        await fetchData();
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoClick = (photo: MediaFile) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
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
              {/* Filtres fixes en haut */}
              <div className="sticky top-0 z-10 mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Photos de l'association
                  </h3>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-maraudr-blue to-maraudr-orange text-white text-sm font-medium rounded-lg hover:from-maraudr-orange hover:to-maraudr-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaImages className="w-4 h-4 mr-2" />
                    {uploading ? 'Upload en cours...' : 'Ajouter une photo'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    type="text"
                    name="name"
                    value={filter.name}
                    onChange={handleFilterChange}
                    placeholder="Rechercher une photo"
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

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maraudr-blue mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Chargement des photos...</p>
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {photos.map(photo => (
                    <div 
                      key={photo.id} 
                      className="group relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-300 dark:border-gray-600"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="aspect-square relative p-2">
                        <img 
                          src={photo.url} 
                          alt={photo.name} 
                          className="w-full h-full object-cover rounded group-hover:brightness-110 transition-all duration-200" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center m-2">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <FaEye className="text-white text-xl drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 px-2 pb-2">
                        <p className="text-gray-900 dark:text-white text-xs truncate font-medium">{photo.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(photo.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
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

        {/* Modal d'aperçu photo */}
        {showPhotoModal && selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col items-center overflow-hidden">
              {/* Header avec croix de fermeture */}
              <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div />
                <button
                  onClick={closePhotoModal}
                  className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors text-2xl"
                  aria-label="Fermer"
                >
                  <FaTimes />
                </button>
              </div>
              {/* Image agrandie */}
              <div className="w-full flex justify-center items-center p-6">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-[50vh] object-contain rounded-xl shadow"
                />
              </div>
              {/* Informations de la photo */}
              <div className="w-full px-8 py-4 flex flex-col items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold mb-1 text-center truncate w-full">{selectedPhoto.name}</h3>
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs w-full mb-4 gap-2">
                  <span>Uploadé par {selectedPhoto.uploadedBy}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-center space-x-6 mt-2 w-full">
                  <Button
                    onClick={() => handleDownload(selectedPhoto)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                  >
                    <FaDownload className="w-4 h-4" />
                    Télécharger
                  </Button>
                  <Button
                    onClick={() => handleDelete(selectedPhoto.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold hover:bg-red-100 dark:hover:bg-red-800 transition"
                  >
                    <FaTrash className="w-4 h-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && selectedFileToDelete && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 max-w-sm w-full relative">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmer la suppression</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Voulez-vous vraiment supprimer <span className="font-bold">{selectedFileToDelete.name}</span> ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition font-semibold"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des toasts */}
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            message={toastItem.message}
            type={toastItem.type}
            duration={toastItem.duration}
            onClose={() => removeToast(toastItem.id)}
          />
        ))}
      </main>
    </div>
  );
};

export default Media; 