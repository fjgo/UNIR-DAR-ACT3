export const origenUbicacion = {
  origenPorOmision: 1,
  origenIP: 2,
  origenGPS: 3,
  origenBusqueda: 4,
};

export const textoDeOrigenesDeUbicacion = {
  [origenUbicacion.origenPorOmision]: "Por omisión",
  [origenUbicacion.origenIP]: "Por IP",
  [origenUbicacion.origenGPS]: "Por GPS",
  [origenUbicacion.origenBusqueda]: "Por búsqueda",
};

export const obtenerInformacionUbicacion = async (
  lat,
  lng,
  setInfoUbicacion,
  setShowToast
) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error("Error al obtener la información de ubicación");
    const data = await response.json();
    setInfoUbicacion(data);
  } catch (error) {
    console.error("Error:", error);
    setShowToast(error.message);
    setInfoUbicacion(null);
  }
};

export const usarGPS = (actualizarUbicacion, setShowToast) => {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      actualizarUbicacion(
        coords.latitude,
        coords.longitude,
        origenUbicacion.origenGPS
      );
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        setShowToast("Permiso de GPS denegado.");
      } else {
        setShowToast("No se pudo activar el GPS.");
      }
    }
  );
};

export const usarIP = (actualizarUbicacion, setShowToast) => {
  const fetchIpInfo = async () => {
    try {
      const url = "https://ipapi.co/json";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error recuperando información de la IP, status: ${response.status}`);
      }
      const ipInfo = await response.json();
      if (
        ipInfo &&
        typeof ipInfo.latitude === "number" &&
        typeof ipInfo.longitude === "number"
      ) {
        actualizarUbicacion(
          ipInfo.latitude,
          ipInfo.longitude,
          origenUbicacion.origenIP
        );
      } else {
        throw new Error("No se encontraron las coordenadas en la respuesta");
      }
    } catch (error) {
      console.error(error);
      setShowToast(error.message);
    }
  };
  fetchIpInfo();
};
