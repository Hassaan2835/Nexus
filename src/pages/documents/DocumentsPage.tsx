import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, PenTool, CheckCircle2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import * as documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
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

    setIsUploading(true);
    try {
      const response = await documentService.uploadDocument(formData);
      if (response.success) {
        toast.success('Document uploaded successfully');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Upload failed');
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

  const handleSign = async () => {
    if (!sigPad.current || !selectedDocId) return;
    
    const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    
    try {
      const response = await documentService.signDocument(selectedDocId, signatureData);
      if (response.success) {
        toast.success('Document signed successfully');
        fetchDocuments();
        setShowSignatureModal(false);
        setSelectedDocId(null);
      }
    } catch (error) {
      toast.error('Signing failed');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
                <button className="w-full text-left px-3 py-2 text-sm text-primary-700 bg-primary-50 rounded-md">
                  All Files
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Shared with Me
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Awaiting Signature
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
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
              <h2 className="text-lg font-medium text-gray-900">All Documents ({documents.length})</h2>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="py-12 text-center text-gray-500">Loading vault...</div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map(doc => (
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
                        <a 
                          href={apiHost + doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="p-2">
                            <Download size={18} />
                          </Button>
                        </a>
                        
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

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h2 className="text-xl font-bold text-gray-900">E-Signature Pad</h2>
                 <button onClick={() => setShowSignatureModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6">
                 <p className="text-sm text-gray-600 mb-4">Please draw your signature below to authorize this document.</p>
                 <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <SignatureCanvas 
                       ref={sigPad}
                       penColor='black'
                       canvasProps={{width: 460, height: 200, className: 'sigCanvas'}} 
                    />
                 </div>
                 <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => sigPad.current?.clear()}>Clear Pad</Button>
                    <div className="flex gap-2">
                       <Button variant="ghost" onClick={() => setShowSignatureModal(false)}>Cancel</Button>
                       <Button onClick={handleSign}>Sign Document</Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);