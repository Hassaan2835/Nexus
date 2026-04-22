import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Settings, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebRTC } from '../../hooks/useWebRTC';
import { Button } from '../../components/ui/Button';

const PeerVideo: React.FC<{ peer: any }> = ({ peer }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on('stream', (stream: MediaStream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover rounded-xl bg-gray-900 shadow-lg" />;
};

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  
  const { peers, userVideo } = useWebRTC(roomId || 'default', user?.id || 'anonymous');

  const handleEndCall = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between text-white bg-gray-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <VideoIcon size={20} />
          </div>
          <div>
            <h1 className="font-semibold">Meeting Room: {roomId}</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Users size={12} />
              {peers.length + 1} participants
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
             <Settings size={20} />
           </Button>
           <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
             <MessageSquare size={20} />
           </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className={`grid gap-4 w-full h-full max-w-6xl max-h-[80vh] ${
          peers.length === 0 ? 'grid-cols-1' : 
          peers.length === 1 ? 'grid-cols-2' : 
          'grid-cols-2 md:grid-cols-3'
        }`}>
          {/* User Video */}
          <div className="relative group">
            <video
              ref={userVideo}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover rounded-xl shadow-lg bg-gray-900 transform transition-transform ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-400">
                  {user?.name.charAt(0)}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              You (Organizer)
            </div>
          </div>

          {/* Peer Videos */}
          {peers.map((peerData, index) => (
            <div key={index} className="relative group">
              <PeerVideo peer={peerData.peer} />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Participant {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 flex items-center justify-center gap-6">
        <button 
          onClick={() => setIsMicOn(!isMicOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMicOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        
        <button 
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isVideoOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isVideoOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
        </button>

        <button 
          onClick={handleEndCall}
          className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 hover:scale-105 transition-all shadow-lg shadow-red-600/20"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};
