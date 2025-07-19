import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// Extension des types Leaflet pour inclure heatLayer
declare module 'leaflet' {
  namespace L {
    function heatLayer(latlngs: any[], options?: any): any;
  }
}

interface HeatmapLayerProps {
  points: Array<{
    latitude: number;
    longitude: number;
    intensity?: number;
  }>;
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: { [key: string]: string };
  };
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, options = {} }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Conversion des points au format attendu par leaflet.heat
    const heatPoints = points.map(point => [
      point.latitude,
      point.longitude,
      point.intensity || 1
    ] as [number, number, number]);

    // Options par défaut pour la heatmap
    const defaultOptions = {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.2,
      gradient: {
        0.0: '#0066FF',    // Bleu pour faible densité
        0.2: '#00FFFF',    // Cyan
        0.4: '#00FF00',    // Vert
        0.6: '#FFFF00',    // Jaune
        0.8: '#FF8000',    // Orange
        1.0: '#FF0000'     // Rouge pour forte densité
      },
      ...options
    };

    // Création de la couche heatmap
    const heatLayer = L.heatLayer(heatPoints, defaultOptions);

    // Ajout de la couche à la carte
    heatLayer.addTo(map);

    // Nettoyage lors du démontage
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer; 