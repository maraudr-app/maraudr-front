import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Button } from '../button/button';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (result: string) => void;
    title?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ 
    isOpen, 
    onClose, 
    onScan, 
    title = "Scanner un code QR" 
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasCamera, setHasCamera] = useState(true);

    useEffect(() => {
        if (isOpen && videoRef.current) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const startScanner = async () => {
        if (!videoRef.current) return;

        setIsLoading(true);
        setError(null);

        try {
            // Vérifier si la caméra est disponible
            const hasCamera = await QrScanner.hasCamera();
            setHasCamera(hasCamera);

            if (!hasCamera) {
                setError('Aucune caméra détectée sur cet appareil');
                setIsLoading(false);
                return;
            }

            const scanner = new QrScanner(
                videoRef.current,
                (result) => {
                    console.log('QR Code scanné:', result.data);
                    onScan(result.data);
                    stopScanner();
                    onClose();
                },
                {
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: 'environment', // Caméra arrière par défaut
                }
            );

            await scanner.start();
            setQrScanner(scanner);
            setIsLoading(false);
        } catch (err) {
            console.error('Erreur lors du démarrage du scanner:', err);
            setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
            setIsLoading(false);
        }
    };

    const stopScanner = () => {
        if (qrScanner) {
            qrScanner.stop();
            qrScanner.destroy();
            setQrScanner(null);
        }
    };

    const switchCamera = async () => {
        if (qrScanner) {
            try {
                const cameras = await QrScanner.listCameras(true);
                if (cameras.length > 1) {
                    // Alterner simplement entre les caméras disponibles
                    // On prend la première caméra différente de celle actuellement utilisée
                    await qrScanner.setCamera(cameras[1].id);
                }
            } catch (err) {
                console.error('Erreur lors du changement de caméra:', err);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Scanner Area */}
                    <div className="p-6">
                        {isLoading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Initialisation de la caméra...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-8">
                                <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-red-600 dark:text-red-400 mb-4">
                                    {error}
                                </p>
                                <Button
                                    onClick={startScanner}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Réessayer
                                </Button>
                            </div>
                        )}

                        {!isLoading && !error && hasCamera && (
                            <>
                                <div className="relative rounded-lg overflow-hidden mb-4">
                                    <video
                                        ref={videoRef}
                                        className="w-full h-64 object-cover bg-gray-900"
                                        playsInline
                                        muted
                                    />
                                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Positionnez le code QR dans le cadre pour le scanner
                                    </p>
                                    <Button
                                        onClick={switchCamera}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Changer de caméra
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 