import { useEffect, useRef, useState } from 'react';
import Peer, { Instance, SignalData } from 'simple-peer';
import { socketService } from '../services/socketService';

export const useWebRTC = (roomId: string, userId: string) => {
  const [peers, setPeers] = useState<{ peerID: string; peer: Instance }[]>([]);
  const socketRef = useRef<any>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ peerID: string; peer: Instance }[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    socketRef.current = socketService.getSocket();
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      streamRef.current = stream;
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }

      socketRef.current.emit('join-room', roomId, userId);

      socketRef.current.on('user-connected', (id: string) => {
        const peer = createPeer(id, socketRef.current.id, stream);
        peersRef.current.push({
          peerID: id,
          peer,
        });
        setPeers(prevPeers => [...prevPeers, { peerID: id, peer }]);
      });

      socketRef.current.on('user-joined', (payload: any) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
        setPeers(prevPeers => [...prevPeers, { peerID: payload.callerID, peer }]);
      });

      socketRef.current.on('receiving-returned-signal', (payload: any) => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        if (item) {
          item.peer.signal(payload.signal);
        }
      });
    });

    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        socketService.disconnect();
    };
  }, [roomId, userId]);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('sending-signal', { userToSignal, callerID, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal: SignalData, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('returning-signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return { peers, userVideo };
};
