/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { UserProfile, UserRole } from '../types';
import { calculateDistance } from '../lib/utils';
import { Star, MapPin, Phone, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '24px'
};

interface NearbyProvidersProps {
  userLocation: { lat: number, lng: number } | null;
  providers: UserProfile[];
  onSelectProvider: (provider: UserProfile) => void;
}

const NearbyProviders: React.FC<NearbyProvidersProps> = ({ userLocation, providers, onSelectProvider }) => {
  const [selectedProvider, setSelectedProvider] = useState<UserProfile | null>(null);
  const [radius, setRadius] = useState(10); // km

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" // User will need to provide this, but we'll show markers if we can
  });

  const nearbyProviders = providers.filter(p => {
    if (!userLocation || !p.latitude || !p.longitude) return false;
    const distance = calculateDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
    return distance <= radius;
  });

  if (!isLoaded) return <div className="h-[500px] bg-gray-100 rounded-3xl flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation || { lat: 0, lng: 0 }}
            zoom={12}
            options={{
              styles: [
                {
                  "featureType": "all",
                  "elementType": "labels.text.fill",
                  "stylers": [{"color": "#7c93a3"}]
                },
                // ... more custom styles for a clean look
              ]
            }}
          >
            {userLocation && (
              <Marker 
                position={userLocation} 
                icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
              />
            )}
            
            {nearbyProviders.map(p => (
              <Marker
                key={p.uid}
                position={{ lat: p.latitude!, lng: p.longitude! }}
                onClick={() => setSelectedProvider(p)}
                icon="https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
              />
            ))}

            {selectedProvider && (
              <InfoWindow
                position={{ lat: selectedProvider.latitude!, lng: selectedProvider.longitude! }}
                onCloseClick={() => setSelectedProvider(null)}
              >
                <div className="p-2 max-w-[200px]">
                  <h4 className="font-bold text-gray-900">{selectedProvider.name}</h4>
                  <p className="text-xs text-gray-500 mb-2 truncate">{selectedProvider.address}</p>
                  <div className="flex items-center gap-1 text-orange-500 mb-3">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-bold">{selectedProvider.rating?.toFixed(1) || '0.0'} ({selectedProvider.reviewCount})</span>
                  </div>
                  <button 
                    onClick={() => onSelectProvider(selectedProvider)}
                    className="w-full py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg"
                  >
                    View Kitchen
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        <div className="w-full md:w-1/3 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Distance Radius: {radius}km</label>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <AnimatePresence>
            {nearbyProviders.length > 0 ? (
              nearbyProviders.map(p => {
                const dist = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, p.latitude!, p.longitude!) : 0;
                return (
                  <motion.div
                    key={p.uid}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onSelectProvider(p)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{p.name}</h4>
                      <div className="flex items-center gap-1 text-orange-500 text-xs font-bold">
                        <Star size={12} fill="currentColor" />
                        <span>{p.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                      <MapPin size={10} />
                      <span className="truncate">{p.address}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        {dist.toFixed(1)} km away
                      </span>
                      <a 
                        href={`tel:${p.phone}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-gray-50 text-gray-400 hover:bg-orange-500 hover:text-white rounded-lg transition-all"
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-10 opacity-50">
                <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No providers nearby</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NearbyProviders;
