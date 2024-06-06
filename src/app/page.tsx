// @ts-nocheck

"use client";

import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { haversine } from "../utils/haversine";
import locations from "../data/locations.json";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const initialCenter = {
  lat: 23.810331,
  lng: 90.412521,
};

const apiKey = "AIzaSyBMTO6fyXZK5YKJyd3IyldoeamDFqUMReY";

export default function Home() {
  const [userLocation, setUserLocation] = useState(initialCenter);
  const [nearestLocations, setNearestLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [markerPosition, setMarkerPosition] = useState(initialCenter);
  const [initialMarkerVisible, setInitialMarkerVisible] = useState(true);

  useEffect(() => {
    findNearestLocations(userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredLocations(nearestLocations);
    } else {
      const filtered = nearestLocations.filter((location) =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm, nearestLocations]);

  const findNearestLocations = (location: { lat: any; lng: any }) => {
    const distances = locations.map((loc) => ({
      ...loc,
      distance: haversine(
        location.lat,
        location.lng,
        loc.latitude,
        loc.longitude
      ),
    }));
    distances.sort((a, b) => a.distance - b.distance);
    setNearestLocations(distances.slice(0, 5));
    setFilteredLocations(distances.slice(0, 5));
  };

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setUserLocation({ lat, lng });
    setSelectedLocation(null);
    setMarkerPosition({ lat, lng });
  };

  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setUserLocation({ lat, lng });
    setMarkerPosition({ lat, lng });
    setInitialMarkerVisible(true);
  };

  const onLocationClick = (location) => {
    setSelectedLocation(location);
    setUserLocation({
      lat: location.latitude,
      lng: location.longitude,
    });
    setMarkerPosition({
      lat: location.latitude,
      lng: location.longitude,
    });
    setInitialMarkerVisible(true);
  };

  return (
    <div className="flex">
      <div className="w-1/3 p-4">
        <h2 className="text-2xl font-bold mb-4">Where do you want to eat?</h2>
        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          placeholder="Search location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="p-4 mb-4 border rounded shadow"
              onClick={() => onLocationClick(location)}
              style={{ cursor: "pointer" }}
            >
              <h3 className="text-xl font-semibold">{location.name}</h3>
              <p>Distance: {location.distance.toFixed(2)} km</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation}
            zoom={12}
            onClick={onMapClick}
          >
            {initialMarkerVisible && (
              <Marker
                position={markerPosition}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
              />
            )}
            {!selectedLocation && (
              <Marker
                position={userLocation}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
              />
            )}
            {filteredLocations.map((location) => (
              <Marker
                key={location.id}
                position={{ lat: location.latitude, lng: location.longitude }}
                title={location.name}
                onClick={() => onLocationClick(location)}
                icon={{
                  url: "/assets/saved-location-map-icon.png",
                }}
              >
                {selectedLocation === location && (
                  <InfoWindow>
                    <div>
                      <h3>{location.name}</h3>
                      <p>Distance: {location.distance.toFixed(2)} km</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
