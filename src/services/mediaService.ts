import axios from 'axios';
import { getModuleApiUrl } from '../config/api';
import { tokenManager } from './tokenManager';

export interface MediaFile {
    id: string;
    name: string;
    type: 'photo' | 'document';
    url: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
    description?: string;
    tags?: string[];
    category?: string;
}

export interface MediaFilter {
    type?: 'photo' | 'document';
    name?: string;
    category?: string;
    uploadedBy?: string;
    dateFrom?: string;
    dateTo?: string;
}

class MediaService {
    private baseUrl = getModuleApiUrl('document');

    // Méthode utilitaire pour obtenir les headers avec token
    private async getAuthHeaders() {
        const token = await tokenManager.ensureValidToken();
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    async getMediaFiles(associationId: string, filter?: MediaFilter): Promise<MediaFile[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseUrl}/download/${associationId}`, { headers });
            
            // Mapper le format de réponse du backend au format attendu par le frontend
            const mappedFiles: MediaFile[] = response.data.map((file: any) => ({
                id: file.id,
                name: file.fileName,
                type: file.contentType.startsWith('image/') ? 'photo' : 'document',
                url: file.url,
                size: file.size || 0, // Le backend ne semble pas retourner la taille
                uploadedAt: file.uploadedAt,
                uploadedBy: file.uploadedBy || 'Utilisateur', // Valeur par défaut si non fournie
                description: file.description,
                category: file.category,
                tags: file.tags || []
            }));
            
            return mappedFiles;
        } catch (error) {
            console.error('Erreur lors de la récupération des fichiers média:', error);
            return [];
        }
    }

    async getPhotos(associationId: string, filter?: Omit<MediaFilter, 'type'>): Promise<MediaFile[]> {
        const allFiles = await this.getMediaFiles(associationId, filter);
        return allFiles.filter(file => file.type === 'photo');
    }

    async getDocuments(associationId: string, filter?: Omit<MediaFilter, 'type'>): Promise<MediaFile[]> {
        const allFiles = await this.getMediaFiles(associationId, filter);
        return allFiles.filter(file => file.type === 'document');
    }

    async uploadFile(associationId: string, file: File, type: 'photo' | 'document', description?: string): Promise<MediaFile> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Récupérer le token
            const token = await tokenManager.ensureValidToken();

            const response = await axios.post(`${this.baseUrl}/upload/${associationId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'upload du fichier:', error);
            throw error;
        }
    }

    async deleteFile(fileId: string, associationId: string): Promise<boolean> {
        try {
            const headers = await this.getAuthHeaders();
            await axios.delete(`${this.baseUrl}/delete/${associationId}/document/${fileId}`, { headers });
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du fichier:', error);
            return false;
        }
    }

    async updateFile(fileId: string, updates: Partial<MediaFile>): Promise<MediaFile> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.put(`${this.baseUrl}/${fileId}`, updates, { headers });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du fichier:', error);
            throw error;
        }
    }

    async getCategories(): Promise<string[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseUrl}/categories`, { headers });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            return [];
        }
    }

    async getUploaders(associationId: string): Promise<string[]> {
        try {
            const headers = await this.getAuthHeaders();
            // Endpoint temporaire - à ajuster selon l'API du backend
            const response = await axios.get(`${this.baseUrl}/users/${associationId}`, { headers });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des uploaders:', error);
            // Retourner une liste vide en cas d'erreur
            return [];
        }
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(fileName: string): string {
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
            case 'ppt':
            case 'pptx':
                return '📈';
            case 'txt':
                return '📄';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return '🖼️';
            default:
                return '📎';
        }
    }
}

export const mediaService = new MediaService(); 