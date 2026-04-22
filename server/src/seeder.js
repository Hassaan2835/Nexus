const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Meeting = require('./models/Meeting');
const Document = require('./models/Document');
const Transaction = require('./models/Transaction');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

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
    isOnline: true,
    walletBalance: 2500
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
    isOnline: false,
    walletBalance: 1200
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
    isOnline: true,
    walletBalance: 50000
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
    isOnline: false,
    walletBalance: 75000
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    await Meeting.deleteMany();
    await Document.deleteMany();
    await Transaction.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    const password = await bcrypt.hash('password123', 10);
    
    const userList = [...entrepreneurs, ...investors].map(user => ({
      ...user,
      password
    }));

    const createdUsers = await User.insertMany(userList);
    const sarah = createdUsers.find(u => u.email === 'sarah@techwave.io');
    const michael = createdUsers.find(u => u.email === 'michael@vcinnovate.com');
    const david = createdUsers.find(u => u.email === 'david@greenlife.co');

    // Seed Meetings
    await Meeting.create([
      {
        title: 'TechWave AI Pitch Session',
        organizer: sarah._id,
        participants: [michael._id],
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), 
        startTime: '10:00',
        endTime: '11:00',
        status: 'accepted',
        description: 'Detailed walkthrough of the financial analytics platform.'
      },
      {
        title: 'Initial Consultation',
        organizer: david._id,
        participants: [michael._id],
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        startTime: '14:30',
        endTime: '15:00',
        status: 'pending',
        description: 'Discussing GreenLife market opportunity.'
      }
    ]);

    // Seed Documents
    await Document.create([
      {
        name: 'TechWave_PitchDeck_v2.pdf',
        owner: sarah._id,
        fileUrl: '/uploads/demo-deck.pdf',
        fileType: 'application/pdf',
        fileSize: 4500000,
        sharedWith: [michael._id]
      },
      {
        name: 'Partnership_Agreement.docx',
        owner: michael._id,
        fileUrl: '/uploads/agreement.docx',
        fileType: 'application/msword',
        fileSize: 120000,
        sharedWith: [sarah._id]
      }
    ]);

    // Seed Transactions
    await Transaction.create([
      {
        user: sarah._id,
        type: 'deposit',
        amount: 2500,
        description: 'Initial wallet funding',
        status: 'completed'
      },
      {
        user: michael._id,
        type: 'deposit',
        amount: 50000,
        description: 'Primary investment wallet',
        status: 'completed'
      }
    ]);

    // Seed Chat
    const conversation = await Conversation.create({
      participants: [sarah._id, michael._id]
    });

    const msg1 = await Message.create({
      conversation: conversation._id,
      sender: sarah._id,
      receiver: michael._id,
      content: 'Hi Michael! Looking forward to our meeting tomorrow.'
    });

    const msg2 = await Message.create({
      conversation: conversation._id,
      sender: michael._id,
      receiver: sarah._id,
      content: 'Likewise Sarah. I reviewed your pitch deck and have some questions about the AI model.'
    });

    conversation.lastMessage = msg2._id;
    await conversation.save();

    console.log('Comprehensive Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Meeting.deleteMany();
    await Document.deleteMany();
    await Transaction.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();
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
