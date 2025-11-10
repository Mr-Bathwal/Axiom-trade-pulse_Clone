'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Pusher from 'pusher-js';
import { addNewToken } from '@/store/tokensSlice';
import { Token } from '@/store/tokensSlice';

// Enable Pusher logging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  Pusher.logToConsole = true;
}

// Singleton Pusher instance - shared across all mounts
let pusherInstance: Pusher | null = null;
let channelInstance: ReturnType<Pusher['subscribe']> | null = null;
let subscriberCount = 0;
let connectionHandlersBound = false;

export function usePusherTokenUpdates() {
  const dispatch = useDispatch();
  const handlerRef = useRef<((newToken: Token) => void) | null>(null);

  useEffect(() => {
    let isActive = true;

    // Get Pusher credentials with fallback
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '2f57459f215265543a03';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    console.log('🔑 Pusher credentials:', { key: pusherKey, cluster: pusherCluster });

    // Initialize Pusher singleton once
    if (!pusherInstance) {
      pusherInstance = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming'],
        // Add these important options for better connection stability
        activityTimeout: 120000, // 2 minutes
        pongTimeout: 30000, // 30 seconds
        unavailableTimeout: 10000, // 10 seconds
      });

      // Bind connection handlers only once
      if (!connectionHandlersBound) {
        pusherInstance.connection.bind('connected', () => {
          console.log('✅ Connected to Pusher - listening for new tokens...');
        });

        pusherInstance.connection.bind('connecting', () => {
          console.log('🔄 Connecting to Pusher...');
        });

        pusherInstance.connection.bind('disconnected', () => {
          console.log('⚠️ Disconnected from Pusher');
        });

        pusherInstance.connection.bind('unavailable', () => {
          console.log('⚠️ Pusher connection unavailable');
        });

        pusherInstance.connection.bind('failed', () => {
          console.error('❌ Pusher connection failed');
        });

        pusherInstance.connection.bind('error', (err: Error) => {
          console.error('❌ Pusher error:', err);
        });

        pusherInstance.connection.bind('state_change', (states: { previous: string; current: string }) => {
          console.log(`🔄 Pusher state: ${states.previous} → ${states.current}`);
        });

        connectionHandlersBound = true;
      }
    }

    subscriberCount++;
    console.log(`📊 Subscriber count: ${subscriberCount}`);

    // Subscribe to channel once (reuse existing subscription)
    if (!channelInstance) {
      console.log('📡 Subscribing to "pulse" channel...');
      channelInstance = pusherInstance.subscribe('pulse');
      
      // Add channel-specific event handlers
      channelInstance.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Successfully subscribed to "pulse" channel');
      });

      channelInstance.bind('pusher:subscription_error', (err: Error) => {
        console.error('❌ Failed to subscribe to "pulse" channel:', err);
      });
    }

    // Create token handler for this component
    const handleNewToken = (newToken: Token) => {
      if (!isActive) return; // Don't process if unmounted
      
      console.log('🆕 New token received via Pusher:', newToken.symbol, newToken.name);
      dispatch(addNewToken(newToken));
      
      // Optional: show a toast notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('🚀 New Token Listed!', {
            body: `${newToken.symbol} - ${newToken.name}`,
            icon: newToken.logo || '/favicon.ico',
          });
        }
      }
    };

    handlerRef.current = handleNewToken;
    channelInstance.bind('token.created', handleNewToken);

    // Cleanup on unmount
    return () => {
      isActive = false;
      subscriberCount--;
      console.log(`📊 Subscriber count after unmount: ${subscriberCount}`);

      // Unbind this component's handler
      if (handlerRef.current && channelInstance) {
        channelInstance.unbind('token.created', handlerRef.current);
        handlerRef.current = null;
      }

      // Only cleanup when last subscriber unmounts
      if (subscriberCount === 0) {
        // Wait a bit to see if another component will mount (handles React strict mode & hot reload)
        setTimeout(() => {
          if (subscriberCount === 0) {
            console.log('🧹 Cleaning up Pusher (no subscribers left)...');
            
            // Unsubscribe from channel
            if (channelInstance && pusherInstance) {
              try {
                channelInstance.unbind_all();
                channelInstance.unsubscribe();
                console.log('✅ Unsubscribed from "pulse" channel');
              } catch (err) {
                console.error('Error unsubscribing:', err);
              }
              channelInstance = null;
            }

            // Disconnect from Pusher
            if (pusherInstance) {
              try {
                pusherInstance.disconnect();
                console.log('🔌 Disconnected from Pusher');
              } catch (err) {
                console.error('Error disconnecting:', err);
              }
              pusherInstance = null;
              connectionHandlersBound = false;
            }
          }
        }, 100); // 100ms grace period
      }
    };
  }, [dispatch]);
}
