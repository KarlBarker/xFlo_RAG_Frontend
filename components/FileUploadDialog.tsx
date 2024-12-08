'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv']
};

interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<void>;
  onBulkUpload?: (files: File[]) => Promise<void>;
}

export function FileUploadDialog({ open, onOpenChange, onUpload, onBulkUpload }: FileUploadDialogProps) {
  const [uploadQueue, setUploadQueue] = useState<FileUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const processUploadQueue = async () => {
    if (uploadQueue.length === 0 || isUploading) return;

    setIsUploading(true);
    const currentQueue = [...uploadQueue];

    try {
      if (currentQueue.length === 1) {
        // Single file upload
        const item = currentQueue[0];
        setUploadQueue(prev => prev.map((q, idx) => 
          idx === 0 ? { ...q, status: 'uploading' } : q
        ));

        const progressInterval = setInterval(() => {
          setUploadQueue(prev => prev.map((q, idx) => 
            idx === 0 && q.status === 'uploading' ? 
              { ...q, progress: Math.min(q.progress + 10, 90) } : q
          ));
        }, 200);

        await onUpload(item.file);
        clearInterval(progressInterval);
        
        setUploadQueue(prev => prev.map((q, idx) => 
          idx === 0 ? { ...q, status: 'completed', progress: 100 } : q
        ));

        toast({
          title: "Success",
          description: `${item.file.name} uploaded successfully`,
        });
      } else if (onBulkUpload) {
        // Bulk upload
        const files = currentQueue.map(item => item.file);
        
        // Set all files to uploading state
        setUploadQueue(prev => prev.map(q => ({ ...q, status: 'uploading' })));

        const progressInterval = setInterval(() => {
          setUploadQueue(prev => prev.map(q => 
            q.status === 'uploading' ? 
              { ...q, progress: Math.min(q.progress + 10, 90) } : q
          ));
        }, 200);

        await onBulkUpload(files);
        clearInterval(progressInterval);

        // Mark all as completed
        setUploadQueue(prev => prev.map(q => ({ 
          ...q, 
          status: 'completed', 
          progress: 100 
        })));

        toast({
          title: "Success",
          description: `${files.length} files uploaded successfully`,
        });
      } else {
        // Fallback to sequential single uploads if bulk upload not available
        for (let i = 0; i < currentQueue.length; i++) {
          const item = currentQueue[i];
          if (item.status === 'pending') {
            try {
              setUploadQueue(prev => prev.map((q, idx) => 
                idx === i ? { ...q, status: 'uploading' } : q
              ));

              const progressInterval = setInterval(() => {
                setUploadQueue(prev => prev.map((q, idx) => 
                  idx === i && q.status === 'uploading' ? 
                    { ...q, progress: Math.min(q.progress + 10, 90) } : q
                ));
              }, 200);

              await onUpload(item.file);
              clearInterval(progressInterval);
              
              setUploadQueue(prev => prev.map((q, idx) => 
                idx === i ? { ...q, status: 'completed', progress: 100 } : q
              ));

              toast({
                title: "Success",
                description: `${item.file.name} uploaded successfully`,
              });
            } catch (error) {
              setUploadQueue(prev => prev.map((q, idx) => 
                idx === i ? { 
                  ...q, 
                  status: 'error',
                  error: error instanceof Error ? error.message : "Upload failed"
                } : q
              ));

              toast({
                title: "Error",
                description: `Failed to upload ${item.file.name}`,
                variant: "destructive",
              });
            }
          }
        }
      }
    } catch (error) {
      // Handle bulk upload errors
      setUploadQueue(prev => prev.map(q => ({ 
        ...q, 
        status: 'error',
        error: error instanceof Error ? error.message : "Upload failed"
      })));

      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      
      // Check if all files are completed or errored
      const allDone = uploadQueue.every(item => 
        item.status === 'completed' || item.status === 'error'
      );
      
      if (allDone) {
        setTimeout(() => {
          onOpenChange(false);
          setUploadQueue([]);
        }, 1000);
      }
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select valid files",
        variant: "destructive",
      });
      return;
    }

    // Filter out files that are too large
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to upload queue
    setUploadQueue(prev => [
      ...prev,
      ...validFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const
      }))
    ]);
  }, [toast]);

  useEffect(() => {
    if (uploadQueue.length > 0 && !isUploading) {
      processUploadQueue();
    }
  }, [uploadQueue, isUploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    disabled: isUploading,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDropRejected: (rejections) => {
      console.log('🔴 Drop rejected:', rejections);
      toast({
        title: "Invalid files",
        description: "Please check file types and size requirements",
        variant: "destructive",
      });
    },
    onError: (error) => {
      console.error('🔴 Dropzone error:', error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isUploading) {
        onOpenChange(newOpen);
        if (!newOpen) {
          setUploadQueue([]);
        }
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            {!isUploading && (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">
                    {isDragActive ? 'Drop the files here' : 'Drag & drop files here'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or
                  </p>
                  <div className="flex justify-center gap-4 mt-2">
                    <Button variant="outline" size="sm">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {uploadQueue.length > 0 && (
          <div className="mt-4 space-y-3">
            {uploadQueue.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{item.file.name}</span>
                  <span>{item.status === 'completed' ? '100%' : `${item.progress}%`}</span>
                </div>
                <Progress value={item.progress} className="h-1" />
                {item.error && (
                  <p className="text-xs text-destructive">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4 mt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              if (!isUploading) {
                onOpenChange(false);
                setUploadQueue([]);
              }
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
