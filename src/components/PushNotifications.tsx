import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      // Get VAPID public key from edge function
      const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-public-key');
      
      if (vapidError || !vapidData?.publicKey) {
        toast.error('Error al obtener la configuración de notificaciones');
        setLoading(false);
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Se necesita permiso para las notificaciones');
        setLoading(false);
        return;
      }

      const vapidPublicKey = vapidData.publicKey;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          }
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('¡Notificaciones activadas! Te avisaremos de tus reservas.');
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Error al activar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      toast.success('Notificaciones desactivadas');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Error al desactivar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card className="bg-gradient-card border-border shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary" />
          <span>Recordatorios de Reservas</span>
        </CardTitle>
        <CardDescription>
          Recibe notificaciones antes de tus reservas programadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-medium">Notificaciones activadas</span>
            </div>
            <Button
              variant="outline"
              onClick={unsubscribeFromPush}
              disabled={loading}
              className="w-full"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Desactivar notificaciones
            </Button>
          </div>
        ) : (
          <Button
            onClick={subscribeToPush}
            disabled={loading}
            className="w-full"
          >
            <Bell className="w-4 h-4 mr-2" />
            Activar notificaciones
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotifications;
