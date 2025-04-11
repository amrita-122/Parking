import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
  MapControl,
  ControlPosition,
} from "@vis.gl/react-google-maps";

const API_KEY = import.meta.env.VITE_MAPS_API;

const openGoogleMapsNavigation = ({ lat, lng }) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  window.open(url, "_blank");
};

export const Maps = () => {
  const [selectedSpot, setSelectedSpot] = useState(null);

  const [nearbySpots, setNearbySpots] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const mapsLib = useMapsLibrary("routes");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!selectedPlace) return;

    const fetchNearbySpots = async () => {
      const lat = selectedPlace.geometry.location.lat();
      const lng = selectedPlace.geometry.location.lng();

      try {
        const res = await fetch(
          `http://localhost:3000/api/parking/nearby?lat=${lat}&lng=${lng}&radius=0.6`
        );
        const data = await res.json();
        setNearbySpots(data);
      } catch (err) {
        console.error("❌ Failed to fetch nearby parking spots", err);
      }
    };

    // Initial fetch
    fetchNearbySpots();

    // Set up interval
    const interval = setInterval(fetchNearbySpots, 10000); // every 10s

    return () => clearInterval(interval);
  }, [selectedPlace]);

  // Calculate distance & time to selected place
  useEffect(() => {
    if (!currentLocation || !selectedPlace || !mapsLib?.DistanceMatrixService)
      return;

    const service = new mapsLib.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [currentLocation],
        destinations: [selectedPlace.geometry.location],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          const result = response.rows[0].elements[0];
          setDistanceInfo({
            distance: result.distance.text,
            duration: result.duration.text,
          });
        } else {
          console.error("Distance matrix error:", status);
        }
      }
    );
  }, [currentLocation, selectedPlace, mapsLib]);

  useEffect(() => {
    if (marker && selectedPlace?.geometry?.location) {
      marker.position = selectedPlace.geometry.location;
    }
  }, [selectedPlace, marker]);

  return (
    <div className="relative h-screen w-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          mapId={"bf51a910020fa25a"}
          defaultZoom={17}
          defaultTilt={45}
          defaultCenter={currentLocation || { lat: 49.0239, lng: -122.2847 }}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId="roadmap"
          className="h-full w-full"
        >
          {/* User marker */}
          {currentLocation && (
            <AdvancedMarker
              position={currentLocation}
              title="Your Location"
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {/* Selected Place Marker */}
          {selectedPlace && (
            <AdvancedMarker
              ref={markerRef}
              position={selectedPlace.geometry?.location}
              title={selectedPlace.name}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}

          {/* Search bar + Navigate */}
          <MapControl position={ControlPosition.TOP_LEFT}>
            <div className="m-4 bg-white shadow-md rounded-lg px-4 py-2 flex items-center gap-2 w-[360px]">
              <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
              {selectedPlace && (
                <button
                  onClick={() =>
                    openGoogleMapsNavigation({
                      lat: selectedPlace.geometry.location.lat(),
                      lng: selectedPlace.geometry.location.lng(),
                    })
                  }
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  Navigate
                </button>
              )}
            </div>
          </MapControl>

          {/* Distance & floating navigate */}
          {selectedPlace && (
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
              <div className="flex flex-col items-end gap-2 m-4">
                {distanceInfo && (
                  <div className="bg-white p-2 rounded shadow text-sm text-gray-800">
                    <p>🚗 Distance: {distanceInfo.distance}</p>
                    <p>⏱ Time: {distanceInfo.duration}</p>
                  </div>
                )}
              </div>
            </MapControl>
          )}

          <MapHandler
            place={selectedPlace}
            marker={marker}
            nearbySpots={nearbySpots}
            onSpotClick={setSelectedSpot}
          />
        </Map>
      </APIProvider>
      {selectedSpot && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white p-4 shadow-md rounded-lg z-50 w-[320px]">
          <h3 className="font-bold text-lg mb-2 text-gray-800">Reserve Spot</h3>
          <p>Lot: {selectedSpot.lotNumber}</p>
          <p>Spot: {selectedSpot.spotNumber}</p>
        </div>
      )}
    </div>
  );
};

const MapHandler = ({ place, marker, nearbySpots, onSpotClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !marker) return;
    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry.viewport);
    }
    marker.position = place.geometry?.location;
  }, [map, place, marker]);

  useEffect(() => {
    if (!map || !window.google) return;

    const markers = [];

    nearbySpots.forEach((spot) => {
      const marker = new window.google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map,
        title: `Spot ${spot.spotNumber}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: spot.isAvailable ? "green" : "red",
          fillOpacity: 1,
          strokeWeight: 0,
        },
      });

      marker.addListener("click", () => {
        if (spot.isAvailable) {
          onSpotClick(spot);
        } else {
          alert("Spot is currently booked.");
        }
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.setMap(null));
    };
  }, [map, nearbySpots, onSpotClick]);

  return null;
};

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const options = { fields: ["geometry", "name", "formatted_address"] };
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    placeAutocomplete.addListener("place_changed", () => {
      const place = placeAutocomplete.getPlace();
      onPlaceSelect(place);
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <input
      ref={inputRef}
      className="flex-1 border border-gray-300 rounded p-2 focus:outline-none"
      placeholder="Search location..."
    />
  );
};

export default Maps;
