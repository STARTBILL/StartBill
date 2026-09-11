import React, { useState } from 'react';
import { ScreenId } from '../types';
import { REGIONS } from '../data/regions';

interface ChooseRegionPageProps {
  currentRegionId?: 'canada' | 'afrique' | 'haiti';
  onSelectRegion: (regionId: 'canada' | 'afrique' | 'haiti') => void;
  onContinue: () => void;
  setScreen?: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
}

export default function ChooseRegionPage({
  currentRegionId = 'canada',
  onSelectRegion,
  onContinue,
  setScreen,
  triggerToast
}: ChooseRegionPageProps) {
  const [selected, setSelected] = useState<'canada' | 'afrique' | 'haiti'>(currentRegionId);

  const handleSelect = (id: 'canada' | 'afrique' | 'haiti') => {
    setSelected(id);
    onSelectRegion(id);
  };

  const handleNext = () => {
    onSelectRegion(selected);
    if (triggerToast) {
      triggerToast(`Région sélectionnée : ${REGIONS[selected].name}`);
    }
    onContinue();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header Bar */}
      <header className="w-full bg-[#5167F6] text-white px-5 py-4 sm:py-4.5 shadow-sm">
        <div className="max-w-md sm:max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Région
          </h1>
          {setScreen && (
            <button
              type="button"
              onClick={() => setScreen('landing')}
              className="text-xs text-white/80 hover:text-white font-medium transition cursor-pointer"
            >
              Retour
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto px-6 pt-7 pb-10 flex flex-col justify-start">
        
        {/* Region Buttons List */}
        <div className="w-full space-y-3.5">
          
          {/* Canada Button */}
          <button
            type="button"
            id="region-btn-canada"
            onClick={() => handleSelect('canada')}
            className={`w-full py-3.5 sm:py-4 px-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-150 cursor-pointer text-center ${
              selected === 'canada'
                ? 'bg-[#E2E8F0] ring-2 ring-[#5167F6] text-[#1E293B] shadow-xs'
                : 'bg-[#E2E8F0] hover:bg-[#D8DFE9] text-[#1E293B]'
            }`}
          >
            Canada
          </button>

          {/* Afrique Button */}
          <button
            type="button"
            id="region-btn-afrique"
            onClick={() => handleSelect('afrique')}
            className={`w-full py-3.5 sm:py-4 px-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-150 cursor-pointer text-center ${
              selected === 'afrique'
                ? 'bg-[#E2E8F0] ring-2 ring-[#5167F6] text-[#1E293B] shadow-xs'
                : 'bg-[#E2E8F0] hover:bg-[#D8DFE9] text-[#1E293B]'
            }`}
          >
            Afrique
          </button>

          {/* Haïti Button */}
          <button
            type="button"
            id="region-btn-haiti"
            onClick={() => handleSelect('haiti')}
            className={`w-full py-3.5 sm:py-4 px-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-150 cursor-pointer text-center ${
              selected === 'haiti'
                ? 'bg-[#E2E8F0] ring-2 ring-[#5167F6] text-[#1E293B] shadow-xs'
                : 'bg-[#E2E8F0] hover:bg-[#D8DFE9] text-[#1E293B]'
            }`}
          >
            Haïti
          </button>

          {/* Continuer Action Button */}
          <div className="pt-2">
            <button
              type="button"
              id="region-btn-continue"
              onClick={handleNext}
              className="w-full bg-[#5167F6] hover:bg-[#4359EB] active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl shadow-md transition-all duration-150 cursor-pointer text-sm sm:text-base text-center"
            >
              Continuer
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}
