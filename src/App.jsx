/** @format */

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import loadingIco from "/src/assets/LoadingIcon.gif";
import { Toast, ToastContainer } from "react-bootstrap";
import { marcaUbicacion, marcaGasolinerasDestacada, marcaGasolineras, ActualizaPosicion, posicionUNIR } from "./mapas";
import { obtenerInformacionUbicacion, origenUbicacion, textoDeOrigenesDeUbicacion, usarGPS, usarIP } from "./ubicacion";
import { buscarGasolineras, cargarGasolineras, ListaGasolineras, procesaGasolineras } from "./gasolineras";

const tiposDeCombustibles = [
  "Biodiesel",
  "Bioetanol",
  "Gas Natural Comprimido",
  "Gas Natural Licuado",
  "Gases licuados del petróleo",
  "Gasoleo A",
  "Gasoleo B",
  "Gasoleo Premium",
  "Gasolina 95 E10",
  "Gasolina 95 E5",
  "Gasolina 95 E5 Premium",
  "Gasolina 98 E10",
  "Gasolina 98 E5",
  "Hidrogeno",
];

const formatPosition = (e) => {
  return `${e.lat}, ${e.lng}`;
};

const InfoToast = ({ showToast, setShowToast }) => (
  <ToastContainer position="middle-center" className="p-3">
    <Toast show={showToast != ""} onClose={() => setShowToast("")} autohide>
      <Toast.Header>
        <strong className="me-auto">Error</strong>
      </Toast.Header>
      <Toast.Body className="bg-danger text-white">{showToast}</Toast.Body>
    </Toast>
  </ToastContainer>
);

function App() {
  const [ubicacionActual, setUbicacionActual] = useState({
    ...posicionUNIR,
    origen: origenUbicacion.origenPorOmision,
  });
  const [ubicacionCentrada, setUbicacionCentrada] = useState(posicionUNIR);
  const [posicionManual, setPosicionManual] = useState(
    formatPosition(posicionUNIR)
  );
  const [infoUbicacion, setInfoUbicacion] = useState(null);
  const [cargandoGasolineras, setCargandoGasolineras] = useState(false);
  const [gasolineras, setGasolineras] = useState([]);

  const [distanciaMaxima, setDistanciaMaxima] = useState("1");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [combustibleSeleccionado, setCombustibleSeleccionado] = useState("");
  const tipoCombustible =
    combustibleSeleccionado.replace(/\s+/g, "").charAt(0).toLowerCase() +
    combustibleSeleccionado.replace(/\s+/g, "").slice(1);
  const [gasolinerasEncontradas, setGasolinerasEncontradas] = useState(null);

  const [showToast, setShowToast] = useState("");

  useEffect(() => {
    const fetchGasolineras = async () => {
      setCargandoGasolineras(true);
      try {
        setGasolineras(await cargarGasolineras());
      } catch (error) {
        const mensajeError = `Error cargando gasolineras: ${error.message}`;
        console.log(mensajeError);
        setShowToast(error.mensajeError);
      } finally {
        setCargandoGasolineras(false);
      }
    };

    fetchGasolineras();
  }, []);

  const actualizarUbicacion = (lat, lng, origen) => {
    setUbicacionActual({ lat, lng, origen });
    setUbicacionCentrada({ lat, lng });
    setPosicionManual(formatPosition({ lat, lng }));
    obtenerInformacionUbicacion(lat, lng, setInfoUbicacion, setShowToast);
  };

  const handlePosicionInputChange = (e) => {
    setPosicionManual(e.target.value);
  };

  const handlePosicionInputBlur = () => {
    const [lat, lng] = posicionManual
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      (lat !== ubicacionActual.lat || lng !== ubicacionActual.lng)
    ) {
      actualizarUbicacion(lat, lng, origenUbicacion.origenBusqueda);
    }
  };

  const handleDistanciaMaxChange = (e) => {
    setDistanciaMaxima(e.target.value);
  };

  const handleMarcaChange = (e) => {
    setMarcaSeleccionada(e.target.value);
  };

  const handleTipoCombustibleChange = (e) => {
    setCombustibleSeleccionado(e.target.value);
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        actualizarUbicacion(
          e.latlng.lat,
          e.latlng.lng,
          origenUbicacion.origenBusqueda
        );
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    return (
      <>
        <Marker
          position={[ubicacionActual.lat, ubicacionActual.lng]}
          icon={marcaUbicacion}
          eventHandlers={{
            click: () => {
              map.flyTo(
                [ubicacionActual.lat, ubicacionActual.lng],
                map.getZoom()
              );
            },
          }}
        >
          <Popup>
            Ubicación seleccionada:
            <br />
            {ubicacionActual.lat}, {ubicacionActual.lng}
          </Popup>
          draggable={true}
        </Marker>
        {gasolinerasEncontradas?.map((item, index) => (
          <Marker
            key={index}
            position={[item.latitud, item.longitud]}
            // La primera gasolinera encontrada es la más cercana y se muestra en verde, las demás en azul
            icon={index === 0 ? marcaGasolinerasDestacada : marcaGasolineras}
            eventHandlers={{
              dblclick: () => {
                setUbicacionCentrada({ lat: item.latitud, lng: item.longitud });
              },
            }}
          >
            <Popup>
              {item.rotulo} <br />
              {item.direccion} <br />
              {tipoCombustible
                ? `Precio ${combustibleSeleccionado}: ${item.precios[tipoCombustible]} €/l`
                : ""}
              <br />
            </Popup>
          </Marker>
        ))}
      </>
    );
  };

  return (
    <div className="container-fluid p-0">
      <h1 className="my-4 text-center">Gestión de gasolineras</h1>
      {cargandoGasolineras && (
        <div className="loading-overlay">
          <img src={loadingIco} alt="Cargando..." className="loading-image" />
          <p>Cargando estaciones de servicio...</p>
        </div>
      )}
      <div className="row">
        <div className="col-md-8 card">
          <div className="input-section mb-3">
            <div className="form-group">
              <input
                type="number"
                className="form-control mt-2"
                value={distanciaMaxima}
                onChange={handleDistanciaMaxChange}
                placeholder="Distancia máxima (km)"
              />
            </div>
            <input
              className="form-control mt-2"
              value={marcaSeleccionada}
              onChange={handleMarcaChange}
              placeholder="Marca de la gasolinera"
            ></input>
            <select
              className="form-control mt-2"
              value={combustibleSeleccionado}
              onChange={handleTipoCombustibleChange}
            >
              <option value="">Selecciona un tipo de combustible</option>
              {tiposDeCombustibles.map((fuelType, index) => (
                <option key={index} value={fuelType}>
                  {fuelType}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary mt-2"
              onClick={() => {
                const busqueda = buscarGasolineras(
                  gasolineras,
                  ubicacionActual,
                  distanciaMaxima,
                  marcaSeleccionada,
                  tipoCombustible
                );
                setGasolinerasEncontradas(busqueda.gasolinerasCercanas);
                if (busqueda.gasolinerasCercanas.length !== 0) {
                  setUbicacionCentrada({
                    lat: busqueda.gasolinerasCercanas[0].latitud,
                    lng: busqueda.gasolinerasCercanas[0].longitud,
                  });
                }
                if (busqueda.error) {
                  setShowToast(busqueda.error);
                }
              }}
              disabled={
                !distanciaMaxima || distanciaMaxima <= 0 || cargandoGasolineras
              }
            >
              Buscar
            </button>
          </div>
          <div className="position-section mb-3">
            <h2>Tu posición</h2>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={posicionManual}
                onChange={handlePosicionInputChange}
                onBlur={handlePosicionInputBlur}
                placeholder="Latitud, Longitud"
              />
              <button
                id="btnGPS"
                className={`btn btn-outline-secondary ${ubicacionActual.origen === origenUbicacion.origenGPS
                  ? "active"
                  : ""
                  }`}
                onClick={() => usarGPS(actualizarUbicacion, setShowToast)}
              >
                Usar GPS
              </button>
              <button
                id="btnIP"
                className={`btn btn-outline-secondary ${ubicacionActual.origen === origenUbicacion.origenIP
                  ? "active"
                  : ""
                  }`}
                onClick={() => usarIP(actualizarUbicacion, setShowToast)}
              >
                Usar IP
              </button>
            </div>
            <MapContainer
              center={[ubicacionCentrada.lat || 0, ubicacionCentrada.lng || 0]}
              zoom={17}
              style={{ height: "400px", width: "100%" }}
              className="mt-3"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
              <ActualizaPosicion
                coords={[ubicacionCentrada.lat, ubicacionCentrada.lng]}
              />
            </MapContainer>
          </div>
        </div>
        <div className="col-md-4 card">
          <div>
            <p>
              Ubicación de referencia: {ubicacionActual.lat},{" "}
              {ubicacionActual.lng}
            </p>
            <p>
              Origen de la ubicación:{" "}
              {textoDeOrigenesDeUbicacion[ubicacionActual.origen]}
            </p>
            {infoUbicacion && (
              <p>
                Localidad:{" "}
                {infoUbicacion.address?.city ||
                  infoUbicacion.address?.town ||
                  infoUbicacion.address?.village ||
                  infoUbicacion.address?.municipality ||
                  "No disponible"}
              </p>
            )}
            <hr />
          </div>
          <div>
            <p>Gasolineras cargadas: {gasolineras.length}</p>
            {gasolinerasEncontradas && (
              <div>
                <p>
                  Se ha{gasolinerasEncontradas.length === 1 ? "" : "n"}{" "}
                  encontrado {gasolinerasEncontradas.length} gasolinera
                  {gasolinerasEncontradas.length === 1 ? "" : "s"}.<br />
                  {gasolinerasEncontradas.length > 1
                    ? "Se muestran ordenadas por distancia."
                    : ""}
                </p>
                <ListaGasolineras
                  gasolineras={gasolinerasEncontradas}
                  ubicacion={ubicacionCentrada}
                  setUbicacion={setUbicacionCentrada}
                  combustible={tipoCombustible}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <InfoToast showToast={showToast} setShowToast={setShowToast} />
    </div>
  );
}

export default App;
