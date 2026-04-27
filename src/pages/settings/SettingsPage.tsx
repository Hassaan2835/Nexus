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

          {activeTab !== 'profile' && activeTab !== 'security' && (
            <Card className="animate-fade-in">
              <CardBody className="flex flex-col items-center justify-center py-12">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                   {navItems.find(i => i.id === activeTab)?.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab} Settings</h2>
                <p className="text-gray-500 mt-2 text-center max-w-sm">
                  The {activeTab} settings module is currently under development. 
                  Check back soon for more features!
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setActiveTab('profile')}>
                  Back to Profile
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};