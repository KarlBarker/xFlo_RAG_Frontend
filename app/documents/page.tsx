import React from 'react';
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
import { MoreHorizontal, Plus, Upload, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Sample data - will be replaced with actual API data
const documents = [
  {
    id: "1",
    title: "Test.pdf",
    fileType: "pdf",
    createdAt: "2024-11-12",
    updatedAt: "2024-11-13",
    status: "Completed"
  },
  {
    id: "2",
    title: "Report.docx",
    fileType: "docx",
    createdAt: "2024-11-14",
    updatedAt: "2024-11-14",
    status: "Processing"
  }
];

export default function DocumentsPage() {
  const handleUpload = () => {
    // Will implement file upload functionality
    console.log("Upload new document");
  };

  const handleUpdate = (id: string) => {
    // Will implement document update functionality
    console.log("Update document:", id);
  };

  const handleDelete = (id: string) => {
    // Will implement document deletion functionality
    console.log("Delete document:", id);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Button onClick={handleUpload}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>{doc.fileType}</TableCell>
                <TableCell>{formatDate(doc.createdAt)}</TableCell>
                <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    doc.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    doc.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdate(doc.id)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}