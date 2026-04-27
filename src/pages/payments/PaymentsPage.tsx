import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, History, Plus, DollarSign, TrendingUp, HandCoins } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import * as paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import * as userService from '../../services/userService';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [walletInfo, setWalletInfo] = useState<any>({ balance: 0, transactions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({ amount: '', recipientId: '', description: '' });
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const response = await paymentService.getWalletInfo();
      if (response.success) {
        setWalletInfo({
          balance: response.balance,
          transactions: response.transactions
        });
      }
    } catch (error) {
       toast.error('Failed to load wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = user?.role === 'entrepreneur' ? await userService.getInvestors() : await userService.getEntrepreneurs();
      if (response.success) {
        setPartners(response.data);
      }
    } catch (error) {
       console.error('Failed to fetch partners');
    }
  };

  useEffect(() => {
    if (showTransferModal) {
      fetchPartners();
    }
  }, [showTransferModal]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      return toast.error('Please enter a valid amount');
    }

    setIsDepositing(true);
    try {
      const response = await paymentService.depositFunds({ amount });
      if (response.success) {
        toast.success(`Succesfully deposited $${amount}`);
        setDepositAmount('');
        setShowDepositModal(false);
        fetchWalletInfo();
      }
    } catch (error) {
        toast.error('Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferData.amount);
    if (isNaN(amount) || amount <= 0 || !transferData.recipientId) {
      return toast.error('Please fill in all fields correctly');
    }
    if (amount > walletInfo.balance) {
      return toast.error('Insufficient balance');
    }

    setIsTransferring(true);
    try {
      const response = await paymentService.transferFunds({
        amount,
        recipientId: transferData.recipientId,
        description: transferData.description || (user?.role === 'investor' ? 'Investment' : 'Fund Transfer'),
        type: user?.role === 'investor' ? 'investment' : 'transfer'
      });
      if (response.success) {
        toast.success(`Succesfully transferred $${amount}`);
        setTransferData({ amount: '', recipientId: '', description: '' });
        setShowTransferModal(false);
        fetchWalletInfo();
      }
    } catch (error: any) {
        toast.error(error.response?.data?.error || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const totalInvested = walletInfo.transactions
    .filter((tx: any) => tx.type === 'investment' && tx.sender === user?.id)
    .reduce((acc: number, tx: any) => acc + tx.amount, 0);

  const totalReceived = walletInfo.transactions
    .filter((tx: any) => (tx.type === 'investment' || tx.type === 'transfer') && tx.receiver === user?.id)
    .reduce((acc: number, tx: any) => acc + tx.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
          <p className="text-gray-600">Manage your funds and investment history</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={() => setShowTransferModal(true)}>{user?.role === 'investor' ? 'Invest Funds' : 'Transfer Funds'}</Button>
           <Button leftIcon={<Plus size={18} />} onClick={() => setShowDepositModal(true)}>Add Funds</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-xl shadow-primary-900/20">
          <CardBody className="p-6">
            <div className="flex justify-between items-start mb-10">
               <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                  <Wallet size={24} />
               </div>
               <div className="text-right">
                  <p className="text-white/70 text-sm font-medium">Available Balance</p>
                  <h2 className="text-3xl font-bold mt-1">${walletInfo.balance.toLocaleString()}</h2>
               </div>
            </div>
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="font-semibold text-sm uppercase">{user?.name}</p>
               </div>
               <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <CreditCard size={14} />
                   </div>
               </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card className="md:col-span-2">
           <CardBody className="p-6 grid grid-cols-2 gap-6 items-center">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-success-50 text-success-600 rounded-lg">
                       <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Total Investments</span>
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">${totalInvested.toLocaleString()}</h3>
                 <p className="text-xs text-gray-500 mt-1">Total outflow from wallet</p>
              </div>
              <div className="border-l border-gray-100 pl-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-secondary-50 text-secondary-600 rounded-lg">
                       <HandCoins size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Total Received</span>
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">${totalReceived.toLocaleString()}</h3>
                 <p className="text-xs text-gray-500 mt-1">Total inflow to wallet</p>
              </div>
           </CardBody>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
          <select className="text-sm border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500">
             <option>All Types</option>
             <option>Deposits</option>
             <option>Investments</option>
          </select>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="py-20 text-center text-gray-500">Fetching transactions...</div>
          ) : walletInfo.transactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {walletInfo.transactions.map((tx: any) => (
                <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === user?.id) || (tx.type === 'investment' && tx.receiver === user?.id) ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tx.type === 'deposit' || tx.receiver === user?.id ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 leading-tight">{tx.description}</h4>
                      <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleDateString()} • {tx.status.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-lg ${
                       tx.type === 'deposit' || tx.receiver === user?.id ? 'text-success-600' : 'text-gray-900'
                    }`}>
                      {tx.type === 'deposit' || tx.receiver === user?.id ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">ID: #{tx._id.substring(tx._id.length - 8).toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <History size={32} className="text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium">No transactions yet</h3>
              <p className="text-gray-500 text-sm">Add funds or make an investment to see history.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Transfer Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title={user?.role === 'investor' ? 'Make an Investment' : 'Transfer Funds'}
      >
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
            <select 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={transferData.recipientId}
              onChange={(e) => setTransferData({...transferData, recipientId: e.target.value})}
            >
              <option value="">Select a {user?.role === 'entrepreneur' ? 'Investor' : 'Startup'}</option>
              {partners.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
          <Input 
            label="Amount ($)"
            type="number"
            value={transferData.amount}
            onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
            placeholder="0.00"
          />
          <Input 
            label="Description"
            value={transferData.description}
            onChange={(e) => setTransferData({...transferData, description: e.target.value})}
            placeholder="Investment for seed round"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>Cancel</Button>
            <Button onClick={handleTransfer} isLoading={isTransferring}>Confirm Transfer</Button>
          </div>
        </div>
      </Modal>

      {/* Deposit Modal */}
      <Modal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Add Funds to Wallet"
      >
        <div className="space-y-6">
          <div className="p-4 bg-primary-50 rounded-xl flex items-center gap-4 border border-primary-100 text-primary-700">
             <DollarSign size={24} />
             <p className="text-sm font-medium">This is a simulation. No real money will be charged.</p>
          </div>
          <Input 
            label="Amount to Deposit"
            placeholder="Enter amount (e.g. 500)"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            autoFocus
          />
          <div className="space-y-3">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Suggestions</p>
             <div className="flex gap-2">
                {['100', '500', '1000', '5000'].map(val => (
                   <button 
                     key={val}
                     onClick={() => setDepositAmount(val)}
                     className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all"
                   >
                      ${val}
                   </button>
                ))}
             </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
             <Button variant="ghost" onClick={() => setShowDepositModal(false)}>Cancel</Button>
             <Button onClick={handleDeposit} isLoading={isDepositing}>Simulate Deposit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
