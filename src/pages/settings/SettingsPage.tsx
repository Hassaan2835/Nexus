import React from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, changePassword, toggle2fa, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('profile');
  const [passwords, setPasswords] = React.useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = React.useState('#2563eb');

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);
  
  const [profileData, setProfileData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    // Entrepreneur fields
    startupName: (user as any)?.startupName || '',
    industry: (user as any)?.industry || '',
    foundedYear: (user as any)?.foundedYear || 0,
    fundingNeeded: (user as any)?.fundingNeeded || '',
    // Investor fields
    minimumInvestment: (user as any)?.minimumInvestment || '',
    maximumInvestment: (user as any)?.maximumInvestment || '',
    totalInvestments: (user as any)?.totalInvestments || 0
  });

  // Update profile data when user is loaded or changes
  React.useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        startupName: (user as any).startupName || '',
        industry: (user as any).industry || '',
        foundedYear: (user as any).foundedYear || 0,
        fundingNeeded: (user as any).fundingNeeded || '',
        minimumInvestment: (user as any).minimumInvestment || '',
        maximumInvestment: (user as any).maximumInvestment || '',
        totalInvestments: (user as any).totalInvestments || 0
      }));
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      return alert('New passwords do not match');
    }
    if (!passwords.current || !passwords.new) {
      return alert('Please fill in all password fields');
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwords.current, passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      // toast is handled in context
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await updateProfile(user.id, {
        ...profileData
      });
    } catch (error) {
      // toast handled in context
    } finally {
      setIsSavingProfile(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: <User size={18} className="mr-3" /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} className="mr-3" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} className="mr-3" /> },
    { id: 'language', label: 'Language', icon: <Globe size={18} className="mr-3" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} className="mr-3" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} className="mr-3" /> },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>
        
        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar
                    src={user?.avatarUrl}
                    alt={user?.name}
                    size="xl"
                  />
                  
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                  
                  <Input
                    label="Role"
                    value={user?.role}
                    disabled
                  />
                  
                  <Input
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />

                  {user?.role === 'entrepreneur' ? (
                    <>
                      <Input
                        label="Startup Name"
                        value={profileData.startupName}
                        onChange={(e) => setProfileData({ ...profileData, startupName: e.target.value })}
                      />
                      <Input
                        label="Industry"
                        value={profileData.industry}
                        onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
                      />
                      <Input
                        label="Founded Year"
                        type="number"
                        value={profileData.foundedYear}
                        onChange={(e) => setProfileData({ ...profileData, foundedYear: parseInt(e.target.value) })}
                      />
                      <Input
                        label="Funding Needed"
                        value={profileData.fundingNeeded}
                        onChange={(e) => setProfileData({ ...profileData, fundingNeeded: e.target.value })}
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="Minimum Investment"
                        value={profileData.minimumInvestment}
                        onChange={(e) => setProfileData({ ...profileData, minimumInvestment: e.target.value })}
                      />
                      <Input
                        label="Maximum Investment"
                        value={profileData.maximumInvestment}
                        onChange={(e) => setProfileData({ ...profileData, maximumInvestment: e.target.value })}
                      />
                      <Input
                        label="Total Investments"
                        type="number"
                        value={profileData.totalInvestments}
                        onChange={(e) => setProfileData({ ...profileData, totalInvestments: parseInt(e.target.value) })}
                      />
                    </>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setProfileData({
                    name: user?.name || '',
                    email: user?.email || '',
                    bio: user?.bio || '',
                    location: 'San Francisco, CA'
                  })}>Cancel</Button>
                  <Button onClick={handleProfileSave} isLoading={isSavingProfile}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                      <Badge variant={user?.isTwoFactorEnabled ? "success" : "error"} className="mt-1">
                        {user?.isTwoFactorEnabled ? 'Enabled' : 'Not Enabled'}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => toggle2fa()}
                    >
                      {user?.isTwoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handlePasswordChange}
                        isLoading={isChangingPassword}
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {[
                  { id: 'email_messages', label: 'Email for new messages', desc: 'Receive an email whenever someone sends you a message' },
                  { id: 'email_meetings', label: 'Email for meetings', desc: 'Get notified via email when a meeting is scheduled' },
                  { id: 'email_deals', label: 'Email for deal updates', desc: 'Stay updated on your investment deals via email' },
                  { id: 'push_all', label: 'Browser Push Notifications', desc: 'Enable real-time desktop notifications' }
                ].map(pref => (
                  <div key={pref.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{pref.label}</p>
                      <p className="text-xs text-gray-500">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
                <div className="flex justify-end mt-6">
                   <Button onClick={() => alert('Notification settings saved!')}>Save Preferences</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Language & Region</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Language</label>
                  <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="en">English (United States)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="utc">UTC (Coordinated Universal Time)</option>
                    <option value="est">EST (Eastern Standard Time)</option>
                    <option value="pst">PST (Pacific Standard Time)</option>
                    <option value="pk">PKT (Pakistan Standard Time)</option>
                  </select>
                </div>
                <div className="flex justify-end">
                   <Button onClick={() => alert('Language settings updated!')}>Update Settings</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Theme & Appearance</h2>
              </CardHeader>
              <CardBody className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-4 border-2 rounded-xl text-left group transition-all ${theme === 'light' ? 'border-primary-600 bg-white ring-4 ring-primary-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="w-full h-24 bg-gray-50 rounded-lg mb-3 border border-gray-100 relative overflow-hidden">
                       <div className="absolute top-2 left-2 w-1/2 h-2 bg-gray-200 rounded"></div>
                       <div className="absolute top-6 left-2 w-3/4 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">Light Mode</p>
                    <p className="text-xs text-gray-500">Classic clean look</p>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-4 border-2 rounded-xl text-left group transition-all ${theme === 'dark' ? 'border-primary-500 bg-gray-900 ring-4 ring-primary-50 shadow-md' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}
                  >
                    <div className="w-full h-24 bg-gray-800 rounded-lg mb-3 border border-gray-700 relative overflow-hidden">
                       <div className="absolute top-2 left-2 w-1/2 h-2 bg-gray-700 rounded"></div>
                       <div className="absolute top-6 left-2 w-3/4 h-2 bg-gray-700 rounded"></div>
                    </div>
                    <p className="text-sm font-bold text-white">Dark Mode</p>
                    <p className="text-xs text-gray-400">Easier on the eyes</p>
                  </button>
                </div>
                
                <div className="space-y-4">
                   <p className="text-sm font-medium text-gray-900">Primary Color</p>
                   <div className="flex gap-3">
                      {['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'].map(color => (
                        <button 
                          key={color} 
                          onClick={() => setPrimaryColor(color)}
                          className={`w-8 h-8 rounded-full border-2 border-white ring-2 transition-all ${primaryColor === color ? 'ring-primary-600 scale-110 shadow-md' : 'ring-transparent hover:ring-gray-300'}`} 
                          style={{backgroundColor: color}}
                        ></button>
                      ))}
                   </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Billing & Subscription</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-primary-200">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-primary-100 text-xs uppercase font-black tracking-widest mb-1">Current Plan</p>
                      <h3 className="text-2xl font-black">Nexus Pro {user.role === 'investor' ? 'Investor' : 'Startup'}</h3>
                    </div>
                    <Badge variant="success" className="bg-white/20 text-white border-none backdrop-blur-md">Active</Badge>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-primary-100 text-xs font-bold mb-1">Next Billing Date</p>
                      <p className="font-medium">May 27, 2026</p>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black">$49.00<span className="text-sm font-normal text-primary-100">/mo</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Card className="border border-gray-100 bg-gray-50/50 shadow-none">
                      <CardBody className="p-4">
                         <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-tighter">Payment Method</p>
                         <div className="flex items-center gap-3">
                            <CreditCard className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-900">•••• •••• •••• 4242</span>
                         </div>
                      </CardBody>
                   </Card>
                   <Card className="border border-gray-100 bg-gray-50/50 shadow-none">
                      <CardBody className="p-4">
                         <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-tighter">Wallet Balance</p>
                         <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-primary-600">${user.walletBalance || '1,250.00'}</span>
                            <Button variant="link" size="sm" className="h-auto p-0">Top up</Button>
                         </div>
                      </CardBody>
                   </Card>
                </div>
                
                <div className="flex justify-between pt-4">
                   <Button variant="outline" size="sm">Download Invoices</Button>
                   <Button variant="outline" size="sm" className="text-error-600 hover:text-error-700 hover:bg-error-50 border-gray-200">Cancel Subscription</Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};