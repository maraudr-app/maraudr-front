import React, { useState, useEffect, useRef } from 'react';
import { mediaService, MediaFile } from '../../services/mediaService';
import { useAssoStore } from '../../store/assoStore';
import { Input } from '../common/input/input';
import { useTranslation } from 'react-i18next';
import { 
    CloudArrowUpIcon, 
    DocumentArrowDownIcon, 
    TrashIcon,
    DocumentIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

const DocumentManager: React.FC = () => {
    const { t } = useTranslation();
    
    // Fonction pour les traductions des médias
    const t_media = (key: string): string => {
        return t(`media.${key}` as any);
    };

    const [documents, setDocuments] = useState<MediaFile[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
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

    // Effet pour filtrer les documents selon la recherche
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredDocuments(documents);
        } else {
            const filtered = documents.filter(doc =>
                doc.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDocuments(filtered);
        }
    }, [documents, searchTerm]);

    // Charger les documents de l'association
    const loadDocuments = async () => {
        if (!selectedAssociation?.id) return;

        try {
            setLoading(true);
            setError(null);
            const docs = await mediaService.getDocuments(selectedAssociation.id, {});
            setDocuments(docs);
        } catch (error: any) {
            console.error('Erreur lors du chargement des documents:', error);
            setError(t_media('errorLoadingDocuments'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [selectedAssociation?.id]);

    // Gérer l'upload de fichiers
    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !selectedAssociation?.id) return;

        const file = files[0];
        
        // Vérifier le type de fichier
        const allowedTypes = [
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            setError(t_media('fileTypeNotAllowed'));
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
            await mediaService.uploadFile(selectedAssociation.id, file, 'document');
            setSuccess(t_media('uploadSuccess'));
            loadDocuments(); // Recharger la liste
        } catch (error: any) {
            console.error('Erreur lors de l\'upload:', error);
            setError(error.message || t_media('errorUpload'));
        } finally {
            setUploading(false);
        }
    };

    // Gérer le drag & drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    };

    // Télécharger un fichier
    const handleDownload = async (doc: MediaFile) => {
        try {
            setError(null);
            const link = document.createElement('a');
            link.href = doc.url;
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSuccess(t_media('downloadStarted'));
        } catch (error: any) {
            console.error('Erreur lors du téléchargement:', error);
            setError(t_media('errorDownload'));
        }
    };

    // Supprimer un fichier
    const handleDelete = async (doc: MediaFile) => {
        if (!selectedAssociation?.id) return;

        if (!window.confirm(`${t_media('confirmDelete')} "${doc.name}" ?`)) {
            return;
        }

        try {
            setDeleting(doc.id);
            setError(null);
            setSuccess(null);
            await mediaService.deleteFile(doc.id, selectedAssociation.id);
            setSuccess(t_media('deleteSuccess'));
            loadDocuments(); // Recharger la liste
        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);
            setError(t_media('errorDelete'));
        } finally {
            setDeleting(null);
        }
    };

    // Formater la date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Formater la taille du fichier (masquer si 0)
    const formatFileSize = (size: number) => {
        if (size === 0) return '';
        return mediaService.formatFileSize(size);
    };

    if (!selectedAssociation) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {t_media('noAssociationDocuments')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t_media('noAssociationDocuments')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Notifications flottantes en haut à droite */}
            {error && (
                <div className="fixed top-20 right-4 z-50 p-3 sm:p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg shadow-lg max-w-xs sm:max-w-sm animate-in slide-in-from-right duration-300">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                        </div>
                        <div className="ml-2 sm:ml-3">
                            <p className="text-xs sm:text-sm font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="fixed top-20 right-4 z-50 p-3 sm:p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg shadow-lg max-w-xs sm:max-w-sm animate-in slide-in-from-right duration-300">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                        </div>
                        <div className="ml-2 sm:ml-3">
                            <p className="text-xs sm:text-sm font-medium">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Zone d'upload */}
            <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                    dragOver 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CloudArrowUpIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                <div className="mt-3 sm:mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {uploading ? t_media('uploadInProgress') : t_media('dragDropOrClick')}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                            {t_media('fileTypesDocuments')}
                        </span>
                    </label>
                    <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploading}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    />
                </div>
                {uploading && (
                    <div className="mt-3 sm:mt-4">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                )}
            </div>

            {/* Liste des documents */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                            {t_media('associationDocuments')}
                        </h3>
                        <div className="w-full sm:w-80 lg:w-96">
                            <Input
                                type="text"
                                placeholder={t_media('searchDocument')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-6 sm:py-8">
                            <DocumentIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {searchTerm ? t_media('noDocumentsFound') : t_media('noDocuments')}
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? t_media('noDocumentsSearchMessage') : t_media('noDocumentsMessage')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                        <span className="text-xl sm:text-2xl flex-shrink-0">
                                            {mediaService.getFileIcon(doc.name)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatFileSize(doc.size) && `${formatFileSize(doc.size)} • `}
                                                {t_media('uploadedOn')} {formatDate(doc.uploadedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-1.5 sm:p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                            title={t_media('download')}
                                        >
                                            <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            disabled={deleting === doc.id}
                                            className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                            title={t_media('delete')}
                                        >
                                            {deleting === doc.id ? (
                                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentManager; 