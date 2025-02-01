import L from "leaflet";
import marcadorAzul from "./assets/markerBlue.svg";
import marcadorVerde from "./assets/markerGreen.svg";
import marcadorRojo from "./assets/markerRed.svg";
import { useMap } from "react-leaflet";

// Ubicación de UNIR
export const posicionUNIR = {
  lat: 42.46246178888369,
  lng: -2.424190193682749,
};

export const marcaUbicacion = new L.Icon({
  iconUrl: marcadorRojo,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

export const marcaGasolinerasDestacada = new L.Icon({
  iconUrl: marcadorVerde,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

export const marcaGasolineras = new L.Icon({
	iconUrl: marcadorAzul,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

export const ActualizaPosicion = ({ coords }) => {
	const map = useMap();
	map.flyTo(coords, map.getZoom());
	return null;
};

// Función para calcular la distancia entre dos puntos
export const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
};
