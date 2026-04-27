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
      <div className="flex-1 overflow-hidden p-4 md:p-6 flex items-center justify-center">
        <div className={`grid gap-4 w-full h-full max-w-6xl mx-auto ${
          peers.length === 0 ? 'grid-cols-1 max-w-4xl' : 
          peers.length === 1 ? 'grid-cols-1 md:grid-cols-2' : 
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {/* User Video */}
          <div className="relative group h-full min-h-[300px]">
            <video
              ref={userVideo}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover rounded-2xl shadow-2xl bg-gray-900 border-2 border-gray-800 ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-gray-700">
                <div className="w-24 h-24 rounded-full bg-primary-600/20 flex items-center justify-center text-4xl font-bold text-primary-400 border border-primary-500/30">
                  {user?.name.charAt(0)}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-lg border border-white/10">
              You (Organizer)
            </div>
          </div>

          {/* Peer Videos */}
          {peers.map((peerData, index) => (
            <div key={index} className="relative group h-full min-h-[300px]">
              <PeerVideo peer={peerData.peer} />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-lg border border-white/10">
                Participant {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls - Fixed at bottom */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-t border-white/5 p-6 flex items-center justify-center gap-4 md:gap-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isMicOn ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
            }`}
          >
            {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          
          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isVideoOn ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
            }`}
          >
            {isVideoOn ? <VideoIcon size={22} /> : <VideoOff size={22} />}
          </button>
        </div>
        
        <button 
          onClick={handleEndCall}
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-red-600/30"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>

        <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-xl">
             <MessageSquare size={20} />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-xl">
             <Settings size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
