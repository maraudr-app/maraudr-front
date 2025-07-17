import React, { useState, useEffect, useRef } from 'react';
import { mediaService, MediaFile } from '../../services/mediaService';
import { useAssoStore } from '../../store/assoStore';
import { useTranslation } from 'react-i18next';
import { FaImages, FaEye, FaDownload, FaTrash, FaTimes } from 'react-icons/fa';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const PhotoManager: React.FC = () => {
    const { t } = useTranslation();
    
    // Fonction pour les traductions des médias
    const t_media = (key: string): string => {
        return t(`media.${key}` as any);
    };

    const [photos, setPhotos] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<MediaFile | null>(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);

    // Effet pour faire disparaître les notifications automatiquement
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 3000); // 3 secondes

            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Charger les photos de l'association
    const loadPhotos = async () => {
        if (!selectedAssociation?.id) return;

        try {
            setLoading(true);
            setError(null);
            const pics = await mediaService.getPhotos(selectedAssociation.id, {});
            setPhotos(pics);
        } catch (error: any) {
            console.error('Erreur lors du chargement des photos:', error);
            setError(t_media('errorLoadingPhotos'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPhotos();
    }, [selectedAssociation?.id]);

    // Gérer l'upload de photos
    const handlePhotoUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !selectedAssociation?.id) return;

        const file = files[0];
        
        // Vérifier le type de fichier (images uniquement)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(file.type)) {
            setError(t_media('fileTypeNotAllowedPhotos'));
            return;
        }

        // Vérifier la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError(t_media('fileTooLarge'));
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);
            await mediaService.uploadFile(selectedAssociation.id, file, 'photo');
            setSuccess(t_media('uploadSuccessPhoto'));
            loadPhotos(); // Recharger la liste
        } catch (error: any) {
            console.error('Erreur lors de l\'upload:', error);
            setError(error.message || t_media('errorUpload'));
        } finally {
            setUploading(false);
        }
    };

    // Télécharger une photo
    const handleDownload = async (photo: MediaFile) => {
        try {
            setError(null);
            const link = document.createElement('a');
            link.href = photo.url;
            link.download = photo.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSuccess(t_media('downloadStarted'));
        } catch (error: any) {
            console.error('Erreur lors du téléchargement:', error);
            setError(t_media('errorDownload'));
        }
    };

    // Supprimer une photo
    const handleDelete = async (photo: MediaFile) => {
        if (!selectedAssociation?.id) return;

        if (!window.confirm(`${t_media('confirmDelete')} "${photo.name}" ?`)) {
            return;
        }

        try {
            setDeleting(photo.id);
            setError(null);
            setSuccess(null);
            await mediaService.deleteFile(photo.id, selectedAssociation.id);
            setSuccess(t_media('deleteSuccessPhoto'));
            loadPhotos(); // Recharger la liste
        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);
            setError(t_media('errorDelete'));
        } finally {
            setDeleting(null);
        }
    };

    // Ouvrir la modale d'aperçu
    const handlePhotoClick = (photo: MediaFile) => {
        setSelectedPhoto(photo);
        setShowPhotoModal(true);
    };

    // Fermer la modale d'aperçu
    const closePhotoModal = () => {
        setShowPhotoModal(false);
        setSelectedPhoto(null);
    };

    if (!selectedAssociation) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <FaImages className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {t_media('noAssociationPhotos')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t_media('noAssociationPhotos')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notifications flottantes en haut à droite */}
            {error && (
                <div className="fixed top-20 right-4 z-50 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XMarkIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="fixed top-20 right-4 z-50 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckIcon className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Bouton d'upload flottant */}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-full shadow-lg hover:from-orange-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                title={uploading ? t_media('uploadInProgress') : t_media('addPhoto')}
            >
                {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                    <FaImages className="w-6 h-6" />
                )}
            </button>

            {/* Grille des photos */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t_media('associationPhotos')}
                </h3>
                
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-500">{t_media('loadingPhotos')}</p>
                    </div>
                ) : photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {photos.map(photo => (
                            <div 
                                key={photo.id} 
                                className="group relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-300 dark:border-gray-600"
                            >
                                <div className="aspect-square relative p-2">
                                    <img 
                                        src={photo.url} 
                                        alt={photo.name} 
                                        className="w-full h-full object-cover rounded group-hover:brightness-110 transition-all duration-200" 
                                        onClick={() => handlePhotoClick(photo)}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center m-2">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePhotoClick(photo);
                                                }}
                                                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                                                title={t_media('preview')}
                                            >
                                                <FaEye className="text-gray-700 text-sm" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(photo);
                                                }}
                                                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                                                title={t_media('download')}
                                            >
                                                <FaDownload className="text-gray-700 text-sm" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(photo);
                                                }}
                                                disabled={deleting === photo.id}
                                                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors disabled:opacity-50"
                                                title={t_media('delete')}
                                            >
                                                {deleting === photo.id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                                ) : (
                                                    <FaTrash className="text-gray-700 text-sm" />
                                                )}
                                            </button>
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
                            {t_media('noPhotos')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t_media('noPhotosMessage')}
                        </p>
                    </div>
                )}
            </div>

            {/* Input file caché pour l'upload */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
                accept=".jpg,.jpeg,.png,.gif,.webp"
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
                                aria-label={t_media('close')}
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
                                <span>{new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-6 mt-2 w-full">
                                <button
                                    onClick={() => handleDownload(selectedPhoto)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                                >
                                    <FaDownload className="w-4 h-4" />
                                    {t_media('download')}
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedPhoto)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold hover:bg-red-100 dark:hover:bg-red-800 transition"
                                >
                                    <FaTrash className="w-4 h-4" />
                                    {t_media('delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoManager; 