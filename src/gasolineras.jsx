import { ListGroup, ListGroupItem } from "react-bootstrap";
import { calcularDistancia } from "./mapas";

export const cargarGasolineras = async () => {
  const url = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return procesaGasolineras(data);
};

export function procesaGasolineras(data) {
  const listaEstaciones = data.ListaEESSPrecio || [];
  const gasolinerasTratadas = listaEstaciones.map((estacion) => {
    const direccion = estacion["Dirección"]
      // .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/(^\w{1})|([^a-zA-Z]+\w{1})/g, (letter) => letter.toUpperCase());
    const estacionInfo = {
      rotulo:estacion["Rótulo"].replace(/\s+/g, " ").trim(),
      latitud: parseFloat(estacion.Latitud.replace(",", ".")),
      longitud: parseFloat(estacion["Longitud (WGS84)"].replace(",", ".")),
      direccion,
      horario: estacion.Horario,
      precios: {
        gasolina95E5: parseFloat(estacion["Precio Gasolina 95 E5"].replace(",", ".")) || 0,
        gasolina98E5: parseFloat(estacion["Precio Gasolina 98 E5"].replace(",", ".")) || 0,
        gasolina95E10: parseFloat(estacion["Precio Gasolina 95 E10"].replace(",", ".")) || 0,
        gasolina98E10: parseFloat(estacion["Precio Gasolina 98 E10"].replace(",", ".")) || 0,
        gasoleoA: parseFloat(estacion["Precio Gasoleo A"].replace(",", ".")) || 0,
        gasoleoB: parseFloat(estacion["Precio Gasoleo B"].replace(",", ".")) || 0,
        gasoleoPremium: parseFloat(estacion["Precio Gasoleo Premium"].replace(",", ".")) || 0,
        biodiesel: parseFloat(estacion["Precio Biodiesel"].replace(",", ".")) || 0,
        bioetanol: parseFloat(estacion["Precio Bioetanol"].replace(",", ".")) || 0,
        gasNaturalComprimido: parseFloat(
          estacion["Precio Gas Natural Comprimido"].replace(",", ".")
        ) || 0,
        gasNaturalLicuado: parseFloat(
          estacion["Precio Gas Natural Licuado"].replace(",", ".")
        ) || 0,
        gasesLicuadosDelPetroleo: parseFloat(
          estacion["Precio Gases licuados del petróleo"].replace(",", ".")
        ) || 0,
        hidrogeno: parseFloat(estacion["Precio Hidrogeno"].replace(",", ".")) || 0,
      },
      distancia: 0,
    };
    return estacionInfo;
  });
  return gasolinerasTratadas;
}

export const buscarGasolineras = (
  gasolineras,
  ubicacion,
  distanciaMaxima,
  marcaSeleccionada,
  tipoCombustible
) => {
  let masCercana = null;
  let error = "";
  const gasolinerasCercanas = gasolineras
    .reduce((cercanas, estacion) => {
      const distancia = calcularDistancia(
        ubicacion.lat,
        ubicacion.lng,
        estacion.latitud,
        estacion.longitud
      );
      const estaCerca = distancia <= parseFloat(distanciaMaxima);
      const cumpleMarca = !marcaSeleccionada ||
        estacion.rotulo.includes(marcaSeleccionada.toUpperCase());
      const precioCombustible = !tipoCombustible || estacion.precios[tipoCombustible];
      if (cumpleMarca && precioCombustible) {
        if (estaCerca) {
          estacion.distancia = distancia;
          cercanas.push(estacion);
        } else {
          if (!masCercana || distancia < masCercana.distancia) {
            masCercana = { ...estacion, distancia };
          }
        }
      }
      return cercanas;
    }, [])
    .sort((a, b) => a.distancia - b.distancia);
  if (gasolinerasCercanas.length === 0) {
    if (masCercana) {
      gasolinerasCercanas.push(masCercana);
      error =
        "No se encontraron gasolineras dentro de la distancia seleccionada.Se ha marcado la gasolinera más cercana.";
    } else {
      error = "No se encontraron gasolineras del tipo seleccionado.";
    }
  }
  return { error, gasolinerasCercanas };
};

export const ListaGasolineras = ({
  gasolineras,
  ubicacion,
  setUbicacion,
  combustible,
}) => {
  return (
    <ListGroup>
      {gasolineras?.map((item, index) => (
        <ListGroupItem
          active={
            item.latitud == ubicacion.lat && item.longitud == ubicacion.lng
          }
          action
          key={index}
          className={`d-flex justify-content-between align-items-start ${index === 0 ? "list-group-item-success" : ""
            }`}
          onClick={() =>
            setUbicacion({ lat: item.latitud, lng: item.longitud })
          }
        >
          <div className="ms-2 me-auto">
            <div>
              <span className="fw-bold">{item.rotulo}</span>{" "}
              {item.distancia.toFixed(2)} km
            </div>
            <div>{item.direccion}</div>
          </div>
          <span className="badge bg-secondary rounded-pill">
            {item.precios[combustible] ? `${item.precios[combustible]} €` : ""}
          </span>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};
