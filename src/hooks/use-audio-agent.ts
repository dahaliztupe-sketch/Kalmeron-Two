'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * A hook for the upcoming Gemini Multimodal Live API Integration (Week 3 Roadmap).
 * This establishes a WebSocket connection allowing realtime bi-directional audio streaming.
 */
export function useAudioAgent() {
  const [isRecording, setIsRecording] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = useCallback(async () => {
    try {
      // 1. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextCtor({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      // 2. Establish connection to Backend that orchestrates with GenAI Live API
      // Wait for WebSocket ready...
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `wss://${window.location.host}/api/live-audio`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsRecording(true);
        console.log('[Live API] Connected. Ready to stream PCM16 audio.');
        // Setup audio processing node (ScriptProcessor or AudioWorklet)
        // to send base64 PCM16 chunks via ws.send()
      };

      ws.onmessage = async (event) => {
        // Handle incoming messages from Gemini Live API
        const data = JSON.parse(event.data);
        if (data.type === 'audio') {
          setAgentSpeaking(true);
          // 3. Play back base64 PCM16 using AudioBuffer
          // const pcmData = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
          // playAudioChunk(pcmData);
        }
        if (data.type === 'turnComplete') {
          setAgentSpeaking(false);
        }
      };

      ws.onclose = () => {
        stopSession();
      };

    } catch (err) {
      console.error('Failed to start Audio Agent Session:', err);
      stopSession();
    }
  }, []);

  const stopSession = useCallback(() => {
    setIsRecording(false);
    setAgentSpeaking(false);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) stopSession();
    else startSession();
  };

  return {
    isRecording,
    agentSpeaking,
    toggleRecording,
    startSession,
    stopSession
  };
}
