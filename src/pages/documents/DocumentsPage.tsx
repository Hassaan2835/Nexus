import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, PenTool, CheckCircle2, X } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import * as documentService from '../../services/documentService';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [isSigning, setIsSigning] = useState(false);
  const sigPad = useRef<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getDocuments();
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', file.name);

    const uploadToast = toast.loading('Uploading document...');
    setIsUploading(true);
    try {
      const response = await documentService.uploadDocument(formData);
      if (response.success) {
        toast.success('Document uploaded successfully', { id: uploadToast });
        fetchDocuments();
        if (e.target) e.target.value = ''; // Clear input
      }
    } catch (error) {
      toast.error('Upload failed', { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const response = await documentService.deleteDocument(id);
      if (response.success) {
        toast.success('Document deleted');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSign = React.useCallback(async () => {
    try {
      if (!sigPad.current || !selectedDocId) return;
      
      if (sigPad.current.isEmpty()) {
        return toast.error('Please provide a signature');
      }
      
      const signatureData = sigPad.current.toDataURL('image/png');
      
      setIsSigning(true);
      const response = await documentService.signDocument(selectedDocId, signatureData);
      
      if (response.success) {
        toast.success('Document signed successfully');
        setDocuments(prev => prev.map(d => (d._id === selectedDocId || d.id === selectedDocId) ? { ...d, isSigned: true } : d));
        setShowSignatureModal(false);
        setSelectedDocId(null);
        fetchDocuments();
      }
    } catch (error: any) {
      console.error('Signing error:', error);
      toast.error(error.response?.data?.error || 'Signing failed');
    } finally {
      setIsSigning(false);
    }
  }, [selectedDocId, sigPad, documentService, fetchDocuments]);

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'signed') return doc.isSigned;
    if (filter === 'pending') return !doc.isSigned;
    if (filter === 'shared') return doc.owner?._id !== user?.id;
    return true;
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const apiHost = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Legal room and document management</p>
        </div>
        
        <Button 
          leftIcon={<Upload size={18} />}
          onClick={() => fileInputRef.current?.click()}
          isLoading={isUploading}
        >
          Upload Document
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Vault Health</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
               <div className="flex items-center gap-3 mb-2 text-primary-700">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">Security Level: High</span>
               </div>
               <p className="text-xs text-primary-600">All documents are encrypted and stored in your private vault.</p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Filters</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${filter === 'all' ? 'text-primary-700 bg-primary-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  All Files
                </button>
                <button 
                  onClick={() => setFilter('shared')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${filter === 'shared' ? 'text-primary-700 bg-primary-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Shared with Me
                </button>
                <button 
                  onClick={() => setFilter('pending')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${filter === 'pending' ? 'text-primary-700 bg-primary-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Awaiting Signature
                </button>
                <button 
                  onClick={() => setFilter('signed')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${filter === 'signed' ? 'text-primary-700 bg-primary-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Signed
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents ({filteredDocuments.length})</h2>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="py-12 text-center text-gray-500">Loading vault...</div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {filteredDocuments.map(doc => (
                    <div
                      key={doc._id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </h3>
                          {doc.isSigned ? (
                            <Badge variant="success" size="sm">Signed</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Pending Sign</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="uppercase text-[10px] bg-gray-100 px-1 rounded">{doc.fileType?.split('/')[1] || 'DOC'}</span>
                          <span>{formatSize(doc.fileSize)}</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2"
                          onClick={() => setPreviewUrl(apiHost + doc.fileUrl)}
                        >
                          <Download size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-primary-600"
                          onClick={() => {
                            setSelectedDocId(doc._id);
                            setShowSignatureModal(true);
                          }}
                        >
                          <PenTool size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-error-600 hover:text-error-700"
                          onClick={() => handleDelete(doc._id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium">No documents yet</h3>
                    <p className="text-gray-500 text-sm">Upload your first business document to start.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        title="E-Signature Pad"
      >
        <p className="text-sm text-gray-600 mb-4">Please draw your signature below to authorize this document.</p>
        <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden mb-6">
          <SignatureCanvas 
            ref={sigPad}
            penColor='black'
            canvasProps={{
              width: 450, 
              height: 200, 
              className: 'sigCanvas mx-auto border border-gray-100 rounded-md bg-white'
            }} 
          />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => sigPad.current?.clear()}>Clear Pad</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowSignatureModal(false)}>Cancel</Button>
            <Button onClick={handleSign} isLoading={isSigning}>Sign Document</Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h2 className="text-lg font-bold">Document Preview</h2>
                 <div className="flex gap-2">
                    <a href={previewUrl} download className="p-2 hover:bg-gray-200 rounded-md text-gray-700">
                       <Download size={20} />
                    </a>
                    <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-md text-gray-500">
                       <X size={20} />
                    </button>
                 </div>
              </div>
              <div className="flex-1 bg-gray-100">
                 <iframe 
                   src={previewUrl} 
                   className="w-full h-full border-none" 
                   title="Document Preview"
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};