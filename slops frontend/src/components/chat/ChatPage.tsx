import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownContent } from './MarkdownContent';

export const ChatPage: React.FC = () => {
  const {
    activeConversation,
    sendMessage,
    executeApproval,
    editUserMessage,
    switchMessageVersion,
    regenerateAssistantResponse,
    isAiThinking,
    attachedFile,
    setAttachedFile,
    setActiveTab,
  } = useApp();

  const [input, setInput] = useState('');
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [detailModalContent, setDetailModalContent] = useState<string | null>(null);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!editingMsgId) {
      scrollToBottom();
    }
  }, [activeConversation?.messages?.length, isAiThinking]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedFile) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartEdit = (msgId: string, currentText: string) => {
    setEditingMsgId(msgId);
    setEditingText(currentText);
  };

  const handleSaveEdit = (msgId: string) => {
    if (editingText.trim()) {
      editUserMessage(msgId, editingText);
      setEditingMsgId(null);
      setEditingText('');
    }
  };

  const handleCopyUserMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleActionExecute = (actionId: string) => {
    setExecutedActions((prev) => ({ ...prev, [actionId]: true }));
  };

  const messages = activeConversation?.messages || [];

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-surface">
      {/* Scrollable Chat History Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-surface">
        <div className="max-w-3xl mx-auto space-y-6 pb-16">
          {/* Top Heading Banner */}
          <div className="text-center space-y-1 py-3">
            <h1 className="font-bold text-2xl md:text-3xl text-on-surface tracking-tight">SLOps Assistant</h1>
            <p className="font-body-md text-sm text-on-surface-variant max-w-xl mx-auto">
              Analyze, troubleshoot, and automate your infrastructure operations.
            </p>
          </div>

          {/* Messages Listing */}
          <div className="flex flex-col gap-5">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                const isEditingThis = editingMsgId === msg.id;
                const pairs = msg.versionPairs || [];
                const totalVersions = pairs.length > 0 ? pairs.length : 1;
                const currentVerIdx = msg.currentVersionIndex ?? (totalVersions - 1);

                if (isEditingThis) {
                  return (
                    <div key={msg.id} className="flex justify-end w-full">
                      <div className="bg-surface-container-high rounded-2xl p-3 w-full max-w-[80%] shadow-md border border-primary/40 space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full bg-transparent resize-none outline-none font-body-md text-sm text-on-surface p-1"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingMsgId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-label-md text-on-surface bg-surface-variant hover:bg-surface-dim transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-3 py-1 rounded-lg text-xs font-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors shadow-sm"
                          >
                            Save & Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex flex-col items-end w-full group">
                    <div className="bg-surface-container-high rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] shadow-xs">
                      {msg.attachedFile && (
                        <div className="mb-1 inline-flex items-center gap-1 px-2 py-[2px] bg-surface-container rounded text-xs font-label-sm text-primary">
                          <span className="material-symbols-outlined text-[14px]">attach_file</span>
                          <span>{msg.attachedFile}</span>
                        </div>
                      )}
                      <p className="font-body-md text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Hover-only User Toolbar (Copy, Edit, < 1/2 > Instant Version Switcher) */}
                    <div className="flex items-center gap-1 text-on-surface-variant/70 text-xs font-label-md mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-1">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopyUserMessage(msg.id, msg.text)}
                        title="Copy message"
                        className="p-1 hover:text-on-surface rounded transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {copiedMsgId === msg.id ? 'check' : 'content_copy'}
                        </span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(msg.id, msg.text)}
                        title="Edit prompt"
                        className="p-1 hover:text-on-surface rounded transition-colors flex items-center"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      {/* Version Switcher < 1/2 > */}
                      {totalVersions > 1 && (
                        <div className="flex items-center gap-[2px] bg-surface-container-high/80 px-2 py-[2px] rounded-full ml-1 text-on-surface-variant border border-outline-variant/40">
                          <button
                            disabled={currentVerIdx <= 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              switchMessageVersion(msg.id, currentVerIdx - 1);
                            }}
                            className="disabled:opacity-30 hover:text-primary p-[2px] flex items-center transition-colors cursor-pointer"
                            title="Previous version"
                          >
                            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                          </button>
                          <span className="text-[11px] px-1 font-mono select-none font-semibold">
                            {currentVerIdx + 1}/{totalVersions}
                          </span>
                          <button
                            disabled={currentVerIdx >= totalVersions - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              switchMessageVersion(msg.id, currentVerIdx + 1);
                            }}
                            className="disabled:opacity-30 hover:text-primary p-[2px] flex items-center transition-colors cursor-pointer"
                            title="Next version"
                          >
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              const isExecuted = executedActions[msg.id];

              return (
                <div key={msg.id} className="flex justify-start w-full gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-on-primary text-[18px]">smart_toy</span>
                  </div>
                  <div className="flex flex-col gap-3 max-w-[85%]">
                    <div className="bg-surface-container rounded-2xl rounded-tl-sm p-4 shadow-xs space-y-3">
                      <MarkdownContent content={msg.text} />
                      
                      {msg.analysisSummary && msg.analysisSummary.length > 0 && (
                        <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-outline-variant/30">
                          <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
                            Analysis Summary
                          </h3>
                          <ul className="space-y-1.5">
                            {msg.analysisSummary.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                {item.status === 'success' ? (
                                  <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                                ) : (
                                  <span className="material-symbols-outlined text-error text-[18px]">cancel</span>
                                )}
                                <span
                                  className={`font-body-sm text-xs ${
                                    item.status === 'error'
                                      ? 'text-on-surface font-semibold'
                                      : 'text-on-surface-variant'
                                  }`}
                                >
                                  {item.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Recommended Action Card */}
                    {msg.recommendedAction && (
                      <div className="bg-surface-container-low rounded-2xl p-4 shadow-sm border-l-4 border-primary">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-headline-sm text-base font-bold text-on-surface">
                              {msg.recommendedAction.title}
                            </h4>
                            <p className="font-body-md text-xs text-on-surface-variant">
                              {msg.recommendedAction.description}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-primary text-3xl opacity-20">
                            settings
                          </span>
                        </div>
                        <div className="mt-3.5 flex flex-wrap gap-2.5 items-center">
                          <button
                            onClick={() =>
                              setDetailModalContent(
                                `Action: ${msg.recommendedAction?.toolName || msg.recommendedAction?.title}\nTarget Node: ${msg.recommendedAction?.target || 'target container'}\nParameters:\n${JSON.stringify(msg.recommendedAction?.toolArgs || {}, null, 2)}`
                              )
                            }
                            className="px-3.5 py-1.5 rounded-lg bg-transparent text-primary font-label-md text-xs border border-outline hover:bg-surface-container transition-colors font-medium"
                          >
                            View Details
                          </button>

                          {msg.recommendedAction.status === 'executed' ? (
                            <span className="px-3 py-1.5 rounded-lg font-label-md text-xs bg-emerald-600/10 text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Executed on Target
                            </span>
                          ) : msg.recommendedAction.status === 'denied' ? (
                            <span className="px-3 py-1.5 rounded-lg font-label-md text-xs bg-surface-variant text-on-surface-variant font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">block</span>
                              Execution Cancelled
                            </span>
                          ) : msg.recommendedAction.status === 'executing' ? (
                            <span className="px-3.5 py-1.5 rounded-lg font-label-md text-xs bg-primary/10 text-primary font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                              Executing...
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => executeApproval(msg.id, true)}
                                className="px-3.5 py-1.5 rounded-lg font-label-md text-xs shadow-xs transition-all flex items-center gap-1 font-medium bg-primary text-on-primary hover:bg-primary-container active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                Approve & Execute
                              </button>
                              <button
                                onClick={() => executeApproval(msg.id, false)}
                                className="px-3 py-1.5 rounded-lg font-label-md text-xs transition-all flex items-center gap-1 font-medium text-error hover:bg-error/10 border border-error/30"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                                Deny
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hover-only Re-generate Response Button */}
                    <div className="flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => regenerateAssistantResponse(msg.id)}
                        title="Re-generate response"
                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-xs font-label-md py-1 px-2 rounded-lg hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        <span>Re-generate response</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiThinking && (
              <div className="flex justify-start w-full gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-sm flex-shrink-0 animate-pulse">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">smart_toy</span>
                </div>
                <div className="bg-surface-container rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Bottom Composer */}
      <div className="bg-surface border-t border-outline-variant/30 py-3 px-6 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-full flex items-center bg-surface-container-lowest rounded-full shadow-xs border border-outline-variant/60 px-4 py-2 focus-within:shadow-md focus-within:border-primary/40 transition-all">
            {/* Attachment Button */}
            <button
              onClick={() => setActiveTab('files')}
              title="Go to Files Page to select or upload files"
              className="p-1 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-full transition-colors flex items-center justify-center shrink-0 mr-1"
            >
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
            </button>

            {/* Attached Chip */}
            {attachedFile && (
              <span className="bg-primary/10 text-primary text-xs font-label-md px-2 py-1 rounded-full flex items-center gap-1 mr-2 shrink-0">
                <span>{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="hover:text-error">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your infrastructure..."
              className="w-full bg-transparent outline-none font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/50"
            />

            <button
              onClick={() => handleSend()}
              className="p-2 bg-primary text-on-primary hover:bg-primary-container rounded-full transition-all flex items-center justify-center shrink-0 ml-2 shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>

          <p className="text-center font-label-sm text-[11px] text-on-surface-variant/60 mt-2">
            SLOps IT Operations Assistant — Always verify critical actions before execution.
          </p>
        </div>
      </div>

      {/* Action Details Modal */}
      {detailModalContent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-container flex justify-between items-center border-b border-outline-variant">
              <h3 className="font-headline-sm text-base font-bold text-on-surface">Action Details</h3>
              <button
                onClick={() => setDetailModalContent(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 font-mono text-xs bg-surface-container-lowest text-on-surface space-y-1">
              <pre className="whitespace-pre-wrap">{detailModalContent}</pre>
            </div>
            <div className="p-3 bg-surface-container flex justify-end">
              <button
                onClick={() => setDetailModalContent(null)}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-label-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
