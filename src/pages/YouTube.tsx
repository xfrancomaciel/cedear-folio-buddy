import React from 'react';

const YouTube = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Canal de YouTube</h1>
        <p className="text-muted-foreground mt-2">
          Accede a todos nuestros videos educativos y análisis de mercado
        </p>
      </div>
      
      <div className="relative w-full">
        <div className="aspect-video w-full max-w-full">
          <iframe
            className="w-full h-full rounded-lg border"
            src="https://www.youtube.com/embed/D1gLsZMgK9k"
            title="BDI Consultora - Video Reciente"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="https://www.youtube.com/@bdi.consultora" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Ver Canal Completo
          </a>
        </div>
      </div>
    </div>
  );
};

export default YouTube;