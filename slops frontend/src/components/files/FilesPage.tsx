import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KnowledgeFile } from '../../types';

export const FilesPage: React.FC = () => {
  const {
    files,
    selectedFile,
    setSelectedFile,
    uploadFiles,
    deleteFile,
    startChatWithFile,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: KnowledgeFile['type']) => {
    switch (type) {
      case 'PDF':
        return 'picture_as_pdf';
      case 'LOG':
        return 'terminal';
      case 'CSV':
        return 'table_chart';
      default:
        return 'description';
    }
  };

  const getStatusBadge = (status: KnowledgeFile['status']) => {
    switch (status) {
      case 'Indexed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 font-medium text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Indexed
          </span>
        );
      case 'Indexing...':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 font-medium text-xs px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Indexing...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-600 font-medium text-xs px-2.5 py-0.5 rounded-full border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-spin"></span>
            Uploading...
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-surface">
      {/* Page Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-surface/90 backdrop-blur-md border-b border-outline-variant/40 z-10 sticky top-0 shrink-0">
        <div>
          <h1 className="font-bold text-2xl text-on-surface tracking-tight">Files</h1>
          <p className="font-body-md text-xs text-on-surface-variant">
            Manage knowledge base documents and telemetry logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant/60">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="bg-surface-container-low text-on-surface text-xs pl-9 pr-3 py-1.5 rounded-xl border border-outline-variant/60 focus:border-primary outline-none transition-all w-44 focus:w-60 font-medium"
            />
          </div>

          <label className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-xl font-medium text-xs transition-colors shadow-xs cursor-pointer active:scale-95 shrink-0">
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            Upload Files
            <input type="file" multiple onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Content Area: Grid + Inspection Drawer */}
      <div className="flex-1 flex overflow-hidden">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex-1 p-6 overflow-y-auto transition-colors ${
            isDragOver ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
          }`}
        >
          {/* File Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.id === file.id;
              const isConfirming = confirmDeleteId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`bg-surface-container rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer border relative group ${
                    isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[22px]">{getFileIcon(file.type)}</span>
                      </div>
                      <div className="min-w-0 pr-2">
                        <h3 className="font-bold text-sm text-on-surface truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                          {file.size} • {file.type}
                        </p>
                      </div>
                    </div>

                    {/* Delete Action Button */}
                    {isConfirming ? (
                      <div className="flex items-center gap-1 shrink-0 bg-error-container/40 p-1 rounded-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                            setConfirmDeleteId(null);
                          }}
                          title="Confirm Delete"
                          className="p-1 bg-error text-white rounded hover:bg-error/90 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px] block">check</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          title="Cancel"
                          className="p-1 bg-surface-variant text-on-surface-variant rounded hover:bg-surface-dim transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px] block">close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(file.id);
                        }}
                        title="Delete File"
                        className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-surface-variant transition-all shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-1">
                    <div>{getStatusBadge(file.status)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startChatWithFile(file);
                      }}
                      className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed File Inspection Drawer */}
        {selectedFile && (
          <aside className="w-80 bg-surface-container border-l border-outline-variant/40 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-on-surface">File Details</h2>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="bg-surface rounded-xl p-4 flex flex-col items-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined text-[28px]">{getFileIcon(selectedFile.type)}</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface break-all">{selectedFile.name}</h3>
                <p className="text-xs text-on-surface-variant mt-1">{selectedFile.size}</p>
                <div className="mt-2">{getStatusBadge(selectedFile.status)}</div>
              </div>

              <div className="space-y-3 bg-surface rounded-xl p-4 shadow-xs text-xs">
                <div className="flex justify-between py-1 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">File Format</span>
                  <span className="font-mono text-on-surface font-semibold">{selectedFile.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">Upload Date</span>
                  <span className="text-on-surface font-medium">{selectedFile.uploadDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">Chat Sessions</span>
                  <span className="font-mono text-primary font-bold">{selectedFile.usageCount} sessions</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/40 space-y-2">
              <button
                onClick={() => startChatWithFile(selectedFile)}
                className="w-full py-2.5 rounded-xl font-medium text-xs bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Chat With This File
              </button>

              <button
                onClick={() => deleteFile(selectedFile.id)}
                className="w-full py-2 rounded-xl font-medium text-xs text-error hover:bg-error-container/30 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete File
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
