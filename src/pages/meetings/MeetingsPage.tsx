import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, Check, X, Video } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import * as meetingService from '../../services/meetingService';
import * as userService from '../../services/userService';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
    participants: [] as string[]
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await meetingService.getMeetings();
      if (response.success) {
        setMeetings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const roleToFetch = user?.role === 'entrepreneur' ? 'investor' : 'entrepreneur';
      const response = roleToFetch === 'investor' ? await userService.getInvestors() : await userService.getEntrepreneurs();
      if (response.success) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchUsers();
    }
  }, [isModalOpen]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-md">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 font-medium text-gray-900 min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-md">
              <ChevronRight size={20} />
            </button>
          </div>
          <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Schedule Meeting
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const hasMeetings = meetings.some(m => isSameDay(parseISO(m.date), cloneDay));
        
        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] border border-gray-100 p-2 transition-all cursor-pointer hover:bg-primary-50/30 ${
              !isSameMonth(day, monthStart) ? 'text-gray-300 bg-gray-50/30' : 
              isSameDay(day, selectedDate) ? 'bg-primary-50 ring-2 ring-inset ring-primary-500' : ''
            }`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className={`text-sm font-medium mb-1 ${isSameDay(day, new Date()) ? 'inline-flex w-7 h-7 items-center justify-center bg-primary-600 text-white rounded-full' : ''}`}>
              {formattedDate}
            </div>
            {hasMeetings && (
              <div className="space-y-1">
                {meetings
                  .filter(m => isSameDay(parseISO(m.date), cloneDay))
                  .slice(0, 2)
                  .map(m => (
                    <div key={m._id} className="text-[10px] px-1.5 py-0.5 bg-secondary-100 text-secondary-700 rounded truncate border border-secondary-200">
                      {m.startTime} - {m.title}
                    </div>
                  ))}
                {meetings.filter(m => isSameDay(parseISO(m.date), cloneDay)).length > 2 && (
                  <div className="text-[10px] text-gray-500 font-medium pl-1">
                    + {meetings.filter(m => isSameDay(parseISO(m.date), cloneDay)).length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">{rows}</div>;
  };

  const renderSelectedDayMeetings = () => {
    const selectedMonthMeetings = meetings.filter(m => isSameDay(parseISO(m.date), selectedDate));

    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 border-b-0">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <Badge variant="primary">{selectedMonthMeetings.length} Meetings</Badge>
        </CardHeader>
        <CardBody>
          {selectedMonthMeetings.length > 0 ? (
            <div className="space-y-4">
              {selectedMonthMeetings.map(m => (
                <div key={m._id} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{m.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <Clock size={12} className="text-primary-500" />
                          {m.startTime} - {m.endTime}
                        </span>
                        <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-2 py-1 rounded-md">
                          <Video size={12} />
                          Video Call
                        </span>
                      </div>
                    </div>
                    <Badge variant={m.status === 'accepted' ? 'success' : m.status === 'pending' ? 'secondary' : 'error'} className="shadow-sm">
                      {m.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Participants</span>
                      <div className="flex -space-x-2">
                         <Avatar src={m.organizer.avatarUrl} alt={m.organizer.name} size="xs" className="ring-2 ring-white" />
                         {m.participants.map((p: any) => (
                           <Avatar key={p._id} src={p.avatarUrl} alt={p.name} size="xs" className="ring-2 ring-white" />
                         ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                       {m.status === 'pending' && m.organizer._id !== user?.id && (
                         <div className="flex gap-1">
                           <Button size="sm" variant="outline" className="text-error-600 border-error-100 hover:bg-error-50 p-2 h-9 w-9 rounded-xl flex items-center justify-center" onClick={() => handleStatusUpdate(m._id, 'rejected')}>
                             <X size={16} />
                           </Button>
                           <Button size="sm" variant="outline" className="text-success-600 border-success-100 hover:bg-success-50 p-2 h-9 w-9 rounded-xl flex items-center justify-center" onClick={() => handleStatusUpdate(m._id, 'accepted')}>
                             <Check size={16} />
                           </Button>
                         </div>
                       )}
                       <Button 
                         size="sm" 
                         variant="primary" 
                         className="h-9 px-4 rounded-xl shadow-lg shadow-primary-600/10"
                         onClick={() => handleJoinMeeting(m)}
                       >
                         Join Call
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="text-gray-400" size={24} />
              </div>
              <h3 className="text-sm font-medium text-gray-900">No meetings scheduled</h3>
              <p className="text-gray-500 text-xs mt-1">Select another day or schedule a new session.</p>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || newMeeting.participants.length === 0) {
      return toast.error('Please fill in all fields');
    }

    try {
      const response = await meetingService.createMeeting(newMeeting);
      if (response.success) {
        toast.success('Meeting scheduled successfully');
        setIsModalOpen(false);
        setNewMeeting({
          title: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '10:00',
          endTime: '11:00',
          participants: []
        });
        fetchMeetings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to schedule meeting');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await meetingService.updateMeetingStatus(id, status);
      if (response.success) {
        toast.success(`Meeting ${status}`);
        fetchMeetings();
      }
    } catch (error) {
       toast.error('Action failed');
    }
  };

  const handleJoinMeeting = (meeting: any) => {
    if (meeting.status !== 'accepted' && meeting.organizer._id !== user?.id) {
      return toast.error('Meeting must be accepted before joining');
    }
    
    // Generate a consistent roomId from meeting ID
    const roomId = meeting._id || meeting.id;
    navigate(`/video-call/${roomId}`);
  };

  return (
    <div className="animate-fade-in pb-8">
      {renderHeader()}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {renderDays()}
          {renderCells()}
        </div>
        
        <div className="lg:col-span-1">
          {renderSelectedDayMeetings()}
        </div>
        
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Schedule New Meeting"
      >
        <form onSubmit={handleScheduleMeeting} className="space-y-4">
          <Input
            label="Meeting Title"
            placeholder="Investment Discussion"
            value={newMeeting.title}
            onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={newMeeting.date}
              onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
              required
            />
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
              <select 
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !newMeeting.participants.includes(val)) {
                    setNewMeeting({...newMeeting, participants: [val]}); // Simple single participant for now
                  }
                }}
                required
              >
                <option value="">Select a {user?.role === 'entrepreneur' ? 'Investor' : 'Entrepreneur'}</option>
                {allUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={newMeeting.startTime}
              onChange={(e) => setNewMeeting({...newMeeting, startTime: e.target.value})}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={newMeeting.endTime}
              onChange={(e) => setNewMeeting({...newMeeting, endTime: e.target.value})}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </Modal>
    </div>
    </div>
  );
};
