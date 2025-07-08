# Service de Gestion des Documents

## Vue d'ensemble

Le service de gestion des documents permet aux associations d'uploader, télécharger et gérer leurs fichiers. Il utilise le port 8087 et offre une interface moderne avec drag & drop.

## Fonctionnalités

### 📁 Upload de fichiers
- **Drag & Drop** : Glissez-déposez vos fichiers directement
- **Sélection manuelle** : Cliquez pour choisir un fichier
- **Validation** : Types de fichiers autorisés et taille maximale (10MB)
- **Feedback visuel** : Indicateurs de progression et états

### 📋 Types de fichiers supportés
- **Images** : JPEG, PNG, GIF, WebP
- **Documents** : PDF, DOC, DOCX
- **Tableurs** : XLS, XLSX
- **Texte** : TXT, CSV

### 🗂️ Gestion des documents
- **Liste organisée** : Affichage avec icônes par type
- **Informations détaillées** : Taille, date d'upload, nom
- **Actions rapides** : Téléchargement et suppression
- **Confirmation** : Dialogue de confirmation pour la suppression

## Architecture

### Frontend
- **Service** : `src/services/documentService.ts`
- **Composant** : `src/components/documents/DocumentManager.tsx`
- **Page** : `src/pages/Documents/Documents.tsx`
- **Route** : `/maraudApp/documents`

### Backend (port 8087)
- **Upload** : `POST /upload/{associationId}`
- **Liste** : `GET /documents/{associationId}`
- **Téléchargement** : `GET /download/{documentId}`
- **Suppression** : `DELETE /delete/{associationId}/document/{documentId}`

## Utilisation

### Interface utilisateur
1. Accéder à "Documents" dans la sidebar
2. Glisser-déposer un fichier ou cliquer pour sélectionner
3. Voir la liste des documents uploadés
4. Télécharger ou supprimer selon les besoins

### Exemples d'utilisation
```
📄 Rapport_2024.pdf (2.3 MB) - Uploadé le 15/01/2024 14:30
📊 Budget_association.xlsx (1.1 MB) - Uploadé le 14/01/2024 09:15
🖼️ Photo_equipe.jpg (850 KB) - Uploadé le 13/01/2024 16:45
```

## Format des données

### Upload (FormData)
```
POST /upload/{associationId}
Content-Type: multipart/form-data
Authorization: Bearer {token}

body: form-data
key: file
value: [fichier binaire]
```

### Réponse upload
```json
{
  "message": "Fichier uploadé avec succès",
  "documentId": "af7d54ec-945f-45a3-a5d4-396ec504b773",
  "fileName": "document.pdf"
}
```

### Liste des documents
```json
[
  {
    "id": "af7d54ec-945f-45a3-a5d4-396ec504b773",
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 2457600,
    "uploadDate": "2024-01-15T14:30:00Z",
    "associationId": "123e4567-e89b-12d3-a456-426614174000",
    "uploadedBy": "user123"
  }
]
```

## Sécurité

- **Authentification** : Token Bearer requis pour toutes les opérations
- **Validation** : Types de fichiers et taille maximale
- **Association** : Chaque document est lié à une association spécifique
- **Permissions** : Seuls les membres de l'association peuvent accéder aux documents

## Fonctionnalités avancées

### Utilitaires inclus
- **Formatage de taille** : Conversion automatique (Bytes → KB → MB → GB)
- **Icônes par type** : Emojis selon l'extension du fichier
- **Formatage de date** : Affichage localisé en français
- **Validation côté client** : Vérification avant upload

### Gestion d'erreurs
- **Types non autorisés** : Message d'erreur explicite
- **Fichier trop volumineux** : Limite de 10MB
- **Erreurs réseau** : Retry automatique et messages utilisateur
- **Permissions** : Vérification des droits d'accès

## Développement futur

- [ ] Prévisualisation des images
- [ ] Recherche et filtrage des documents
- [ ] Organisation en dossiers
- [ ] Partage de documents entre associations
- [ ] Versioning des documents
- [ ] Commentaires sur les documents
- [ ] Notifications de nouveaux uploads 