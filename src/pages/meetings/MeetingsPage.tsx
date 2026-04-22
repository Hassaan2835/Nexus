import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, Check, X, Video } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import * as meetingService from '../../services/meetingService';
import toast from 'react-hot-toast';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <Button leftIcon={<Plus size={18} />}>
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
                <div key={m._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{m.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {m.startTime} - {m.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video size={14} />
                          Video Call
                        </span>
                      </div>
                    </div>
                    <Badge variant={m.status === 'accepted' ? 'success' : m.status === 'pending' ? 'secondary' : 'error'}>
                      {m.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                       <Avatar src={m.organizer.avatarUrl} alt={m.organizer.name} size="xs" className="ring-2 ring-white" />
                       {m.participants.map((p: any) => (
                         <Avatar key={p._id} src={p.avatarUrl} alt={p.name} size="xs" className="ring-2 ring-white" />
                       ))}
                    </div>
                    
                    <div className="flex gap-2">
                       {m.status === 'pending' && m.organizer._id !== user?.id && (
                         <>
                           <Button size="sm" variant="outline" className="text-error-600 border-error-100 hover:bg-error-50 p-2 h-auto" onClick={() => handleStatusUpdate(m._id, 'rejected')}>
                             <X size={16} />
                           </Button>
                           <Button size="sm" variant="outline" className="text-success-600 border-success-100 hover:bg-success-50 p-2 h-auto" onClick={() => handleStatusUpdate(m._id, 'accepted')}>
                             <Check size={16} />
                           </Button>
                         </>
                       )}
                       <Button size="sm" variant="secondary" className="h-auto py-1 px-3">Join</Button>
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
      </div>
    </div>
  );
};
