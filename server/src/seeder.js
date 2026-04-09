const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const entrepreneurs = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@techwave.io',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    bio: 'Serial entrepreneur with 10+ years of experience in SaaS and fintech.',
    startupName: 'TechWave AI',
    pitchSummary: 'AI-powered financial analytics platform helping SMBs make data-driven decisions.',
    fundingNeeded: '$1.5M',
    industry: 'FinTech',
    location: 'San Francisco, CA',
    foundedYear: 2021,
    teamSize: '1-10',
    isOnline: true
  },
  {
    name: 'David Chen',
    email: 'david@greenlife.co',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    bio: 'Environmental scientist turned entrepreneur. Passionate about sustainable solutions.',
    startupName: 'GreenLife Solutions',
    pitchSummary: 'Biodegradable packaging alternatives for consumer goods and food industry.',
    fundingNeeded: '$2M',
    industry: 'CleanTech',
    location: 'Portland, OR',
    foundedYear: 2020,
    teamSize: '1-10',
    isOnline: false
  },
  {
    name: 'Maya Patel',
    email: 'maya@healthpulse.com',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    bio: 'Former healthcare professional with an MBA. Building tech to improve patient care.',
    startupName: 'HealthPulse',
    pitchSummary: 'Mobile platform connecting patients with mental health professionals in real-time.',
    fundingNeeded: '$800K',
    industry: 'HealthTech',
    location: 'Boston, MA',
    foundedYear: 2022,
    teamSize: '1-10',
    isOnline: true
  },
  {
    name: 'James Wilson',
    email: 'james@urbanfarm.io',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    bio: 'Agricultural engineer focused on urban farming solutions and food security.',
    startupName: 'UrbanFarm',
    pitchSummary: 'IoT-enabled vertical farming systems for urban environments and food deserts.',
    fundingNeeded: '$3M',
    industry: 'AgTech',
    location: 'Chicago, IL',
    foundedYear: 2019,
    teamSize: '11-50',
    isOnline: false
  }
];

const investors = [
  {
    name: 'Michael Rodriguez',
    email: 'michael@vcinnovate.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    bio: 'Early-stage investor with focus on B2B SaaS and fintech. Previously founded and exited two startups.',
    investmentInterests: ['FinTech', 'SaaS', 'AI/ML'],
    investmentStage: ['Seed', 'Series A'],
    portfolioCompanies: [
       { name: 'PayStream', industry: 'FinTech' },
       { name: 'DataSense', industry: 'AI/ML' }
    ],
    totalInvestments: 12,
    minimumInvestment: '$250K',
    maximumInvestment: '$1.5M',
    isOnline: true
  },
  {
    name: 'Jennifer Lee',
    email: 'jennifer@impactvc.org',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Impact investor focused on climate tech, sustainable agriculture, and clean energy.',
    investmentInterests: ['CleanTech', 'AgTech', 'Sustainability'],
    investmentStage: ['Seed', 'Series A', 'Series B'],
    portfolioCompanies: [
        { name: 'SolarFlow', industry: 'Energy' }
    ],
    totalInvestments: 18,
    minimumInvestment: '$500K',
    maximumInvestment: '$3M',
    isOnline: false
  },
  {
    name: 'Robert Torres',
    email: 'robert@healthventures.com',
    role: 'investor',
    avatarUrl: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg',
    bio: 'Healthcare-focused investor with medical background. Looking for innovations in patient care and biotech.',
    investmentInterests: ['HealthTech', 'BioTech', 'Medical Devices'],
    investmentStage: ['Series A', 'Series B'],
    portfolioCompanies: [
        { name: 'MediTrack', industry: 'HealthTech' }
    ],
    totalInvestments: 9,
    minimumInvestment: '$1M',
    maximumInvestment: '$5M',
    isOnline: true
  }
];

const importData = async () => {
  try {
    await User.deleteMany();

    const password = await bcrypt.hash('password123', 10);
    
    const users = [...entrepreneurs, ...investors].map(user => ({
      ...user,
      password
    }));

    await User.insertMany(users);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
