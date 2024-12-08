'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Upload, Trash2, RefreshCw, Info, Loader2 } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { FileUploadDialog } from '@/components/FileUploadDialog';
import { getDocuments, uploadDocument, uploadDocumentsBulk, updateDocument, deleteDocument, getDocumentStatus } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusSummary {
  total: number;
  by_status: Record<string, number>;
}

interface Document {
  id: string;
  content_hash: string;
  storage_path: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  status: string;
  error?: string;
  error_message?: string;
  processing_status: string;
  embedding_model?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
  chunk_overlap?: number;
  chunk_size?: number;
}

export default function DocumentsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statusSummary, setStatusSummary] = useState<StatusSummary>({
    total: 0,
    by_status: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadStatusSummary = async () => {
    try {
      const response = await getDocumentStatus();
      if (response.success && response.data) {
        setStatusSummary(response.data);
      } else {
        console.error('🔴 DocumentsPage - Error loading status summary:', response.error);
      }
    } catch (error) {
      console.error('🔴 DocumentsPage - Error loading status summary:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      console.log('🟦 DocumentsPage - Loading documents...');
      
      const [docsResponse, statusResponse] = await Promise.all([
        getDocuments(),
        getDocumentStatus()
      ]);

      console.log('🟦 DocumentsPage - Documents response:', docsResponse);
      console.log('🟦 DocumentsPage - Status response:', statusResponse);

      if (docsResponse.success && Array.isArray(docsResponse.documents)) {
        console.log('🟦 DocumentsPage - Setting documents:', docsResponse.documents);
        setDocuments(docsResponse.documents);
      } else {
        console.error('🔴 DocumentsPage - Failed to load documents:', docsResponse.error);
        toast({
          title: "Error loading documents",
          description: docsResponse.error || "Failed to load documents. Please try again.",
          variant: "destructive"
        });
        setDocuments([]);
      }

      if (statusResponse.success && statusResponse.data) {
        console.log('🟦 DocumentsPage - Setting status summary:', statusResponse.data);
        setStatusSummary(statusResponse.data);
      } else {
        console.error('🔴 DocumentsPage - Failed to load status summary:', statusResponse.error);
        toast({
          title: "Error loading status summary",
          description: statusResponse.error || "Failed to load status summary. Please try again.",
          variant: "destructive"
        });
        setStatusSummary({ total: 0, by_status: {} });
      }
    } catch (error) {
      console.error('🔴 DocumentsPage - Failed to load documents:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to server",
        variant: "destructive",
      });
      setDocuments([]);
      setStatusSummary({ total: 0, by_status: {} });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // Set up periodic refresh every 30 seconds, but only if not in an error state
    const refreshInterval = setInterval(() => {
      if (documents.length > 0) {
        loadDocuments();
      }
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, [documents.length]);

  const refreshDocuments = async () => {
    try {
      setIsLoading(true);
      const [docsResponse, statusResponse] = await Promise.all([
        getDocuments(),
        getDocumentStatus()
      ]);
      
      if (docsResponse.success && statusResponse.success && statusResponse.data) {
        setDocuments(docsResponse.documents);
        setStatusSummary(statusResponse.data);
      }
    } catch (error) {
      console.error('Failed to refresh documents:', error);
      toast({
        title: "Error",
        description: "Failed to refresh documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsLoading(true);
      console.log('Creating FormData for file:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending upload request...');
      const response = await uploadDocument(formData);
      console.log('Upload response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to upload document');
      }
      
      await loadDocuments();
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async (files: File[]) => {
    try {
      setIsLoading(true);
      console.log('Creating FormData for bulk upload:', files.length, 'files');
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      console.log('Sending bulk upload request...');
      const response = await uploadDocumentsBulk(formData);
      console.log('Bulk upload response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to upload documents');
      }
      
      await loadDocuments();
      
      toast({
        title: "Success",
        description: `${files.length} documents uploaded successfully`,
      });
      
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload documents",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('🟨 DocumentsPage - Deleting document:', id);
      await deleteDocument(id);
      
      setDocuments(prev => {
        console.log('🟨 DocumentsPage - Removing document from state');
        return prev.filter(doc => doc.id !== id);
      });
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('🔴 DocumentsPage - Delete error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, file: File) => {
    try {
      console.log('🟨 DocumentsPage - Updating document:', id, 'with file:', file.name);
      
      // First upload the new file
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await uploadDocument(formData);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Failed to upload document');
      }
      
      // Then update the document with the new file information
      const updateData = {
        title: file.name,
        content_type: file.type,
        status: 'pending', // Reset status for reprocessing
        processing_status: 'pending',
        updated_at: new Date().toISOString(),
      };
      
      const updateResponse = await updateDocument(id, updateData);
      
      if (updateResponse.success && updateResponse.data) {
        setDocuments(prev => {
          console.log('🟨 DocumentsPage - Updating document in state');
          return prev.map(doc => doc.id === id ? updateResponse.data! : doc);
        });
        
        toast({
          title: "Success",
          description: "Document updated successfully",
        });
      } else {
        throw new Error(updateResponse.error || 'Failed to update document');
      }
      
      // Close the upload dialog
      setIsUploadDialogOpen(false);
      setSelectedDocumentId(null);
    } catch (error) {
      console.error('🔴 DocumentsPage - Update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update document",
        variant: "destructive",
      });
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      console.log('🟨 DocumentsPage - Reprocessing document:', id);
      
      // Update document status to trigger reprocessing
      const updateData = {
        status: 'pending',
        processing_status: 'pending',
        updated_at: new Date().toISOString(),
      };
      
      const updateResponse = await updateDocument(id, updateData);
      
      if (updateResponse.success && updateResponse.data) {
        setDocuments(prev => {
          console.log('🟨 DocumentsPage - Updating document in state');
          return prev.map(doc => doc.id === id ? updateResponse.data! : doc);
        });
        
        toast({
          title: "Success",
          description: "Document reprocessing started",
        });
      } else {
        throw new Error(updateResponse.error || 'Failed to reprocess document');
      }
    } catch (error) {
      console.error('🔴 DocumentsPage - Reprocess error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reprocess document",
        variant: "destructive",
      });
    }
  };

  const getFileType = (contentType: string): string => {
    // Remove 'application/' prefix
    const type = contentType.replace('application/', '');
    
    // Handle special cases
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOCX';
      case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'XLSX';
      case 'msword':
        return 'DOC';
      default:
        // For other types, just return the extension in uppercase
        return type.split('/').pop()?.toUpperCase() || type;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "green" => {
    switch (status.toUpperCase()) {
      case 'PROCESSING':
        return 'default';
      case 'PROCESSED':
        return 'green';
      case 'FAILED':
      case 'ERROR':
        return 'destructive';
      case 'PENDING':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          {statusSummary && statusSummary.by_status && Object.keys(statusSummary.by_status).length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              {Object.entries(statusSummary.by_status).map(([status, count], index, arr) => (
                <span key={status} className="mr-4">
                  {status} ({count}){index < arr.length - 1 ? " • " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead className="w-[80px]">File Type</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[150px]">Created</TableHead>
              <TableHead className="w-[150px]">Updated</TableHead>
              <TableHead className="w-[100px]">Size</TableHead>
              <TableHead className="w-[70px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    "No documents found"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate">{doc.original_name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{doc.original_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{getFileType(doc.content_type)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(doc.processing_status)}>
                      {doc.processing_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>{formatDate(doc.updated_at)}</TableCell>
                  <TableCell>{formatFileSize(doc.size_bytes)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDocumentId(doc.id);
                            setIsUploadDialogOpen(true);
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleReprocess(doc.id)}
                          disabled={doc.processing_status === "PROCESSING"}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reprocess
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(doc.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FileUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleUpload}
        onBulkUpload={handleBulkUpload}
      />
    </div>
  );
}