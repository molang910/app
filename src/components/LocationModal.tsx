import React, { useState } from 'react';
import { X, Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import { WeatherLocation } from '../types/weather';
import { DEFAULT_PRESET_LOCATIONS, searchLocations } from '../services/weatherService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: WeatherLocation;
  onSelectLocation: (loc: WeatherLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setErrorMsg('');
    try {
      const data = await searchLocations(query);
      setResults(data);
      if (data.length === 0) {
        setErrorMsg('검색 결과가 없습니다. 시, 구 또는 동 이름으로 검색해보세요.');
      }
    } catch {
      setErrorMsg('검색 중 문제가 발생했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    setGpsLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        onSelectLocation({
          city: '내 현재 위치 (GPS)',
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        });
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        setErrorMsg('현재 위치를 가져오지 못했습니다. 위치 권한을 확인해주세요.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">학교 및 동네 위치 변경</h3>
              <p className="text-xs text-slate-500">학생이 재학 중인 학교나 거주 지역을 선택하세요.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="학교 소재지 또는 지역명 (예: 대치동, 목동, 수원, 분당)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
            </button>
          </form>

          {/* GPS Button */}
          <button
            type="button"
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-sky-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {gpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>현재 내 위치 (GPS)로 자동 설정</span>
          </button>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">검색 결과</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {results.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{loc.city}</div>
                      {loc.admin1 && (
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {loc.admin1} {loc.country && `· ${loc.country}`}
                        </div>
                      )}
                    </div>
                    <span className="text-sky-600 font-semibold text-[11px]">선택</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preset Major School Districts */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2.5">
              주요 학군 및 지역 프리셋
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_PRESET_LOCATIONS.map((preset, i) => {
                const isSelected = currentLocation.city === preset.city;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectLocation(preset);
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium'
                    }`}
                  >
                    <div className="truncate text-xs">{preset.city}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {preset.admin1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
