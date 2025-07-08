import React, { useState, useEffect, useRef } from 'react';
import { documentService, Document } from '../../services/documentService';
import { useAssoStore } from '../../store/assoStore';
import { 
    CloudArrowUpIcon, 
    DocumentArrowDownIcon, 
    TrashIcon,
    DocumentIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const DocumentManager: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const selectedAssociation = useAssoStore(state => state.selectedAssociation);

    // Charger les documents de l'association
    const loadDocuments = async () => {
        if (!selectedAssociation?.id) return;

        try {
            setLoading(true);
            const docs = await documentService.getAssociationDocuments(selectedAssociation.id);
            setDocuments(docs);
        } catch (error: any) {
            console.error('Erreur lors du chargement des documents:', error);
            toast.error('Erreur lors du chargement des documents');
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
        if (!documentService.isAllowedFileType(file)) {
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
            await documentService.uploadFile(selectedAssociation.id, file);
            toast.success('Fichier uploadé avec succès !');
            loadDocuments(); // Recharger la liste
        } catch (error: any) {
            console.error('Erreur lors de l\'upload:', error);
            toast.error(error.message || 'Erreur lors de l\'upload');
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
    const handleDownload = async (doc: Document) => {
        try {
            const blob = await documentService.downloadFile(doc.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Téléchargement démarré');
        } catch (error: any) {
            console.error('Erreur lors du téléchargement:', error);
            toast.error('Erreur lors du téléchargement');
        }
    };

    // Supprimer un fichier
    const handleDelete = async (doc: Document) => {
        if (!selectedAssociation?.id) return;

        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${doc.name}" ?`)) {
            return;
        }

        try {
            setDeleting(doc.id);
            await documentService.deleteFile(selectedAssociation.id, doc.id);
            toast.success('Fichier supprimé avec succès');
            loadDocuments(); // Recharger la liste
        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur lors de la suppression');
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

    if (!selectedAssociation) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        Aucune association sélectionnée
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Veuillez sélectionner une association pour gérer ses documents.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Zone d'upload */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            {uploading ? 'Upload en cours...' : 'Glissez-déposez un fichier ici ou cliquez pour sélectionner'}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                            PDF, DOC, XLS, images, TXT (max 10MB)
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
                    />
                </div>
                {uploading && (
                    <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                )}
            </div>

            {/* Liste des documents */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Documents de l'association
                    </h3>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8">
                            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                Aucun document
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Commencez par uploader un fichier.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">
                                            {documentService.getFileIcon(doc.name)}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {documentService.formatFileSize(doc.size)} • 
                                                Uploadé le {formatDate(doc.uploadDate)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Télécharger"
                                        >
                                            <DocumentArrowDownIcon className="h-5 w-5" />
                                        </button>
                                        
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            disabled={deleting === doc.id}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                            title="Supprimer"
                                        >
                                            {deleting === doc.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                                            ) : (
                                                <TrashIcon className="h-5 w-5" />
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