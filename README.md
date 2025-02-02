# Búsqueda de gasolineras

## Introducción

Esta aplicación permite la búsqueda de gasolineras cercanas al usuario.

El origen de datos, nombres, ubicaciones y precios, se obtiene de los datos ofrecidos por el portal del Ministerio para la Transformación Digital y Función Pública (2013). Precio de carburantes en las gasolineras españolas. Gobierno de España.
En la url https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres está disponibible un API REST de la que podemos obtener la información necesaria en formato JSON.

## Ubicación

Para la ubicación de referencia de la búsqueda disponemos de varios métodos:
* **Ubicación por omisión**. Una ubicación inicial, que se ha establecido en las instalaciones de UNIR.
* **Ubicación por GPS**. Los datos que facilita el API de geolocalización del navegador.
* **Ubicación por IP**. Los datos que nos ofrece el API de https://ipapi.co/json, nos permiten obtener los datos de geolocacización a partir de la IP con la que se realia la consulta.
* **Ubicación por Búsqueda**. Finalmente, el usuario puede, tanto escribir las coordenadas (latitud, longitud) en la caja de texto que hay para ello, como hacer click en cualquier lugar del mapa para actualizar la ubicación.

Esta ubicación de referencia aparece con un marcar rojo en el mapa.

## Búsqueda

Una vez tenemos una ubicación fijada, violvemos a utilizar otro API, en este caso se encuentra en la url https://nominatim.openstreetmap.org/reverse, a la que dándole como parámetros la latitud y longitud nos devuelve, entre otros datos, información de la localidad.

A partir de que ya tenemos por una parte la información de las gasolineras y por otra una ubicación de referencia podemos localizar gasolineras cercanas.
Para ello se puede informar de un radio máximo de búsqueda, filtrar por una parte del nombre y filtrar por aquellas que dispongan de un tipo concreto de combustible.

Al aplicar el filtro (ninguno de los datos es obligatorio), se pueden dar dos circunstancias, que encontremos al menos una gasolinera que cumpla con los criterios o que no encontremos ninguna, si no encontramos ninguna, pero existe alguna sin la restricción de distancia (el caso más habitual es dejar en blanco la distancia máxima, que equivale a 0 Km) se amplía la búsqueda a las más cercana sin restricción de distancia y se devuelve como resultado válido, a la vez que se informa al usuario de que está más lejos de lo solicitado.

## Visualización de resultados

Con todos los resultados obtenidos, por una parte creamos una lista, que se muestra en el lateral derecho de la aplicación con los nombres, direcciones y, si se ha filtrado por combustible, el precio y por otra parte, se añaden al mapa marcadores con las ubicaciones de las distintas gasolineras encontradas, se señala en color verde la más cercana y el resto en color azul.

Al hacer click en cualquier gasolinera de las marcadas en el lateral nos centra su marcador en el mapa.
Si hacemos click en un marcador nos muestra su información: Nombre, dirección y, si hay filtro de combustible, el precio.
Si hacemos doble click nos la centra en el mapa.

Independientemente de que hayamos filtrado por un tipo de combustible, si cambiamos dicho filtro se actualiza (instantáneamente) la información de precios para reflejar la disponibilidad de dicho combustible en las gasolineras de la lista.
