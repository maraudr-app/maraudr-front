import axios from 'axios';
import { tokenManager } from './tokenManager';
import { getModuleApiUrl } from '../config/api';

const DOCUMENT_API_URL = getModuleApiUrl('document');

// Instance API spécifique pour les documents
const documentApi = axios.create({
    baseURL: DOCUMENT_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Intercepteur pour ajouter le token d'authentification
documentApi.interceptors.request.use(async (config) => {
    try {
        const token = await tokenManager.ensureValidToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {

    }
    return config;
});

export interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    associationId: string;
    uploadedBy: string;
    url?: string;
}

export interface UploadResponse {
    message: string;
    documentId: string;
    fileName: string;
}

export const documentService = {
    // Uploader un fichier pour une association
    uploadFile: async (associationId: string, file: File): Promise<UploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await documentApi.post(`/upload/${associationId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${await tokenManager.ensureValidToken()}`,
                },
            });

            return response.data;
        } catch (error: any) {

            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de l\'upload du fichier';
            throw new Error(errorMessage);
        }
    },

    // Récupérer tous les fichiers d'une association
    getAssociationDocuments: async (associationId: string): Promise<Document[]> => {
        try {
            const response = await documentApi.get(`/documents/${associationId}`);
            return response.data;
        } catch (error: any) {

            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la récupération des documents';
            throw new Error(errorMessage);
        }
    },

    // Télécharger un fichier
    downloadFile: async (documentId: string): Promise<Blob> => {
        try {
            const response = await documentApi.get(`/download/${documentId}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${await tokenManager.ensureValidToken()}`,
                },
            });

            return response.data;
        } catch (error: any) {

            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors du téléchargement du fichier';
            throw new Error(errorMessage);
        }
    },

    // Supprimer un fichier
    deleteFile: async (associationId: string, documentId: string): Promise<void> => {
        try {
            await documentApi.delete(`/delete/${associationId}/document/${documentId}`);
        } catch (error: any) {

            const errorMessage = error.response?.data?.detail || error.response?.data || 'Erreur lors de la suppression du fichier';
            throw new Error(errorMessage);
        }
    },

    // Obtenir l'URL de téléchargement directe
    getDownloadUrl: (documentId: string): string => {
        return `${DOCUMENT_API_URL}/download/${documentId}`;
    },

    // Formater la taille du fichier
    formatFileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Vérifier le type de fichier autorisé
    isAllowedFileType: (file: File): boolean => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ];
        return allowedTypes.includes(file.type);
    },

    // Obtenir l'icône selon le type de fichier
    getFileIcon: (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return '🖼️';
            case 'txt':
            case 'csv':
                return '📋';
            default:
                return '📎';
        }
    }
}; 