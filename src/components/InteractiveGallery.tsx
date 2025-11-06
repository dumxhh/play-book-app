import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CourtPhoto {
  id: string;
  sport: string;
  image_url: string;
  title?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

const InteractiveGallery = () => {
  const [photos, setPhotos] = useState<CourtPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<CourtPhoto | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Todas', emoji: '🏟️' },
    { id: 'futbol', name: 'Fútbol', emoji: '⚽' },
    { id: 'paddle', name: 'Paddle', emoji: '🏓' },
    { id: 'tenis', name: 'Tenis', emoji: '🎾' },
    { id: 'golf', name: 'Golf', emoji: '⛳' }
  ];

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedPhoto) {
      interval = setInterval(() => {
        nextPhoto();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedPhoto, currentIndex]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('court_photos')
        .select('*')
        .eq('is_active', true)
        .order('sport')
        .order('display_order');

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.sport === selectedCategory);

  const openLightbox = (photo: CourtPhoto) => {
    setSelectedPhoto(photo);
    const photoIndex = filteredPhotos.findIndex(p => p.id === photo.id);
    setCurrentIndex(photoIndex);
  };

  const nextPhoto = () => {
    if (filteredPhotos.length > 0) {
      const nextIndex = (currentIndex + 1) % filteredPhotos.length;
      setCurrentIndex(nextIndex);
      setSelectedPhoto(filteredPhotos[nextIndex]);
    }
  };

  const prevPhoto = () => {
    if (filteredPhotos.length > 0) {
      const prevIndex = currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedPhoto(filteredPhotos[prevIndex]);
    }
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-background to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Galería Interactiva</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Galería Interactiva</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora nuestras instalaciones deportivas de primer nivel
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span>{category.emoji}</span>
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.id === 'all' ? photos.length : photos.filter(p => p.sport === category.id).length}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo, index) => (
            <Card 
              key={photo.id} 
              className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => openLightbox(photo)}
            >
              <CardContent className="p-0 relative">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.image_url.replace('/src/assets/', '/assets/')}
                    alt={photo.title || `${photo.sport} court`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                    <p className="font-semibold text-lg">{photo.title || 'Ver imagen'}</p>
                    <p className="text-sm mt-1 capitalize">{photo.sport}</p>
                  </div>
                </div>
                {photo.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white font-semibold">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-white/90 text-sm mt-1">{photo.description}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No hay fotos disponibles para esta categoría
            </p>
          </div>
        )}

        {/* Lightbox Modal */}
        <Dialog open={!!selectedPhoto} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
            <DialogHeader className="absolute top-4 left-4 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={closeLightbox}
                className="rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            
            {selectedPhoto && (
              <div className="relative w-full h-full">
                <img
                  src={selectedPhoto.image_url.replace('/src/assets/', '/assets/')}
                  alt={selectedPhoto.title || `${selectedPhoto.sport} court`}
                  className="w-full h-full object-contain bg-black"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Navigation Controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevPhoto}
                    className="rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40"
                    disabled={filteredPhotos.length <= 1}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextPhoto}
                    className="rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40"
                    disabled={filteredPhotos.length <= 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                {/* Slideshow Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40"
                    disabled={filteredPhotos.length <= 1}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Photo Info */}
                {(selectedPhoto.title || selectedPhoto.description) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="text-white">
                      {selectedPhoto.title && (
                        <h3 className="text-xl font-semibold mb-2">{selectedPhoto.title}</h3>
                      )}
                      {selectedPhoto.description && (
                        <p className="text-white/90">{selectedPhoto.description}</p>
                      )}
                      <p className="text-white/70 text-sm mt-2 capitalize">
                        {selectedPhoto.sport} • {currentIndex + 1} de {filteredPhotos.length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default InteractiveGallery;