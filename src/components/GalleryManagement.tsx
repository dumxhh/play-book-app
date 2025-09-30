import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Plus,
  Eye,
  Camera,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourtPhoto {
  id: string;
  sport: string;
  image_url: string;
  title?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

interface GalleryManagementProps {
  photos: CourtPhoto[];
  onPhotosUpdate: () => void;
}

const GalleryManagement = ({ photos, onPhotosUpdate }: GalleryManagementProps) => {
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    sport: '',
    title: '',
    description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sports = [
    { value: 'futbol', label: 'Fútbol', emoji: '⚽' },
    { value: 'paddle', label: 'Paddle', emoji: '🏓' },
    { value: 'tenis', label: 'Tenis', emoji: '🎾' },
    { value: 'golf', label: 'Golf', emoji: '⛳' }
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!newPhoto.sport) {
      toast({
        title: "Error",
        description: "Selecciona un deporte antes de subir la imagen",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${newPhoto.sport}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('court_photos')
        .insert([{
          sport: newPhoto.sport,
          image_url: publicUrl,
          title: newPhoto.title || null,
          description: newPhoto.description || null,
          display_order: photos.filter(p => p.sport === newPhoto.sport).length + 1
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Éxito",
        description: "Imagen subida correctamente"
      });

      // Reset form
      setNewPhoto({ sport: '', title: '', description: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onPhotosUpdate();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: CourtPhoto) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) return;

    try {
      // Extract filename from URL
      const url = new URL(photo.image_url);
      const pathSegments = url.pathname.split('/');
      const fileName = pathSegments.slice(-2).join('/'); // sport/filename.ext

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([fileName]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('court_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      toast({
        title: "Éxito",
        description: "Imagen eliminada correctamente"
      });

      onPhotosUpdate();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive"
      });
    }
  };

  const togglePhotoStatus = async (photo: CourtPhoto) => {
    try {
      const { error } = await supabase
        .from('court_photos')
        .update({ is_active: !photo.is_active })
        .eq('id', photo.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Imagen ${photo.is_active ? 'ocultada' : 'activada'} correctamente`
      });

      onPhotosUpdate();
    } catch (error) {
      console.error('Error toggling photo status:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la imagen",
        variant: "destructive"
      });
    }
  };

  const getSportEmoji = (sport: string) => {
    const sportObj = sports.find(s => s.value === sport);
    return sportObj?.emoji || '🏃';
  };

  return (
    <div className="space-y-6">
      {/* Upload New Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Subir Nueva Imagen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Deporte *</Label>
              <Select value={newPhoto.sport} onValueChange={(value) => setNewPhoto({...newPhoto, sport: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar deporte" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
                    <SelectItem key={sport.value} value={sport.value}>
                      {sport.emoji} {sport.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input
                value={newPhoto.title}
                onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                placeholder="Ej: Cancha Principal"
              />
            </div>
            <div className="space-y-2">
              <Label>Archivo de Imagen *</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading || !newPhoto.sport}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={newPhoto.description}
              onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
              placeholder="Descripción de la imagen..."
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Formatos aceptados: JPG, PNG, WEBP. Tamaño máximo: 5MB</span>
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Subiendo imagen...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Galería de Imágenes ({photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay imágenes en la galería</p>
              <p className="text-sm text-muted-foreground">Sube la primera imagen usando el formulario de arriba</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={photo.image_url}
                      alt={photo.title || `${photo.sport} court`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getSportEmoji(photo.sport)}
                        {photo.sport}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={photo.is_active ? "default" : "destructive"}
                      >
                        {photo.is_active ? "Activa" : "Oculta"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {photo.title && (
                        <h4 className="font-semibold">{photo.title}</h4>
                      )}
                      {photo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePhotoStatus(photo)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {photo.is_active ? 'Ocultar' : 'Mostrar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManagement;