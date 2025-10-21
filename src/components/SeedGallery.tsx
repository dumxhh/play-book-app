import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

// Import generated images
import futbolCourt from '@/assets/generated-futbol-court.jpg';
import paddleCourt from '@/assets/generated-paddle-court.jpg';
import tenisCourt from '@/assets/generated-tenis-court.jpg';
import golfCourt from '@/assets/generated-golf-court.jpg';

interface PhotoToSeed {
  sport: string;
  title: string;
  description: string;
  imagePath: string;
}

const photos: PhotoToSeed[] = [
  {
    sport: 'futbol',
    title: 'Cancha de Fútbol',
    description: 'Cancha de fútbol profesional con césped sintético de alta calidad',
    imagePath: futbolCourt
  },
  {
    sport: 'paddle',
    title: 'Cancha de Paddle',
    description: 'Cancha de paddle cubierta con iluminación LED',
    imagePath: paddleCourt
  },
  {
    sport: 'tenis',
    title: 'Cancha de Tenis',
    description: 'Cancha de tenis de arcilla con cerco perimetral',
    imagePath: tenisCourt
  },
  {
    sport: 'golf',
    title: 'Cancha de Golf',
    description: 'Campo de golf con greens perfectamente mantenidos',
    imagePath: golfCourt
  }
];

export const SeedGallery = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  };

  const seedGallery = async () => {
    setIsSeeding(true);
    
    try {
      // Check if photos already exist
      const { data: existingPhotos } = await supabase
        .from('court_photos')
        .select('sport')
        .like('title', 'Cancha de%');

      if (existingPhotos && existingPhotos.length > 0) {
        toast.error('Las fotos ya fueron generadas previamente');
        setIsSeeding(false);
        return;
      }

      let successCount = 0;

      for (const photo of photos) {
        try {
          // Convert image path to File
          const file = await urlToFile(photo.imagePath, `${photo.sport}.jpg`);
          
          // Upload to Supabase Storage
          const fileName = `${photo.sport}-${Date.now()}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('court-photos')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error(`Error uploading ${photo.sport}:`, uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('court-photos')
            .getPublicUrl(fileName);

          // Insert into database
          const { error: insertError } = await supabase
            .from('court_photos')
            .insert({
              sport: photo.sport,
              image_url: urlData.publicUrl,
              title: photo.title,
              description: photo.description,
              is_active: true,
              display_order: 0
            });

          if (insertError) {
            console.error(`Error inserting ${photo.sport}:`, insertError);
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing ${photo.sport}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} fotos subidas correctamente a la galería`);
        // Reload page to show new photos
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error('No se pudieron subir las fotos');
      }
    } catch (error) {
      console.error('Error seeding gallery:', error);
      toast.error('Error al subir las fotos');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      onClick={seedGallery}
      disabled={isSeeding}
      className="gap-2"
    >
      <Upload className="w-4 h-4" />
      {isSeeding ? 'Subiendo fotos...' : 'Subir fotos generadas a la galería'}
    </Button>
  );
};
