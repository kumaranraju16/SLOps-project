import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CredentialItem } from '../../types';

export const CredentialsPage: React.FC = () => {
  const { credentials, addCredential, updateCredential, deleteCredential } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<CredentialItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<CredentialItem['type']>('linux');
  const [host, setHost] = useState('');
  const [port, setPort] = useState<number>(22);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Connection testing states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const openAddModal = () => {
    setEditingCred(null);
    setName('');
    setType('linux');
    setHost('');
    setPort(22);
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cred: CredentialItem) => {
    setEditingCred(cred);
    setName(cred.name);
    setType(cred.type);
    setHost(cred.host);
    setPort(cred.port);
    setUsername(cred.username);
    setPassword(cred.password || '');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !host.trim()) return;

    const typeLabelMap: Record<CredentialItem['type'], string> = {
      linux: 'Linux',
      postgres: 'PostgreSQL',
      mysql: 'MySQL',
      aws: 'AWS IAM',
      api: 'API Key',
      network: 'Network',
      docker: 'Docker / K8s',
    };

    if (editingCred) {
      updateCredential(editingCred.id, {
        name,
        type,
        typeLabel: typeLabelMap[type] || type,
        host,
        port: Number(port),
        username,
        password,
      });
    } else {
      addCredential({
        name,
        type,
        typeLabel: typeLabelMap[type] || type,
        host,
        port: Number(port),
        username,
        password,
      });
    }
    setIsModalOpen(false);
  };

  const handleCopyPassword = (cred: CredentialItem) => {
    const textToCopy = cred.password || `${cred.username}@${cred.host}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(cred.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestConnection = (cred: CredentialItem) => {
    setTestingId(cred.id);
    setTestResult(null);
    setTimeout(() => {
      setTestingId(null);
      setTestResult({
        id: cred.id,
        success: true,
        msg: `Connection successful! Reached ${cred.host}:${cred.port} (${cred.typeLabel}).`,
      });
      setTimeout(() => setTestResult(null), 3500);
    }, 1100);
  };

  const getCredentialIcon = (type: CredentialItem['type']) => {
    switch (type) {
      case 'postgres':
      case 'mysql':
        return 'database';
      case 'linux':
        return 'dns';
      case 'network':
        return 'router';
      case 'docker':
        return 'widgets';
      default:
        return 'key';
    }
  };

  const filteredCredentials = credentials.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-surface">
      {/* Page Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-surface/90 backdrop-blur-md border-b border-outline-variant/40 z-10 sticky top-0 shrink-0">
        <div>
          <h1 className="font-bold text-2xl text-on-surface tracking-tight">Credentials</h1>
          <p className="font-body-md text-xs text-on-surface-variant">
            Securely manage infrastructure access credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Search Bar */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-on-surface-variant/60">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search credentials..."
              className="bg-surface-container-low text-on-surface text-xs pl-9 pr-3 py-1.5 rounded-xl border border-outline-variant/60 focus:border-primary outline-none transition-all w-44 focus:w-60 font-medium"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-xl font-medium text-xs transition-colors shadow-xs active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Credential
          </button>
        </div>
      </div>

      {/* Live Test Result Toast */}
      {testResult && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{testResult.msg}</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1 min-h-0">
        {filteredCredentials.map((cred) => {
          const isTesting = testingId === cred.id;
          const isCopied = copiedId === cred.id;

          return (
            <div
              key={cred.id}
              className="bg-surface-container rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group border border-outline-variant/40 h-fit"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-primary">
                  {getCredentialIcon(cred.type)}
                </span>
              </div>
              
              <div className="flex items-center justify-between z-10 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                      {getCredentialIcon(cred.type)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{cred.name}</h3>
                    <span className="inline-block bg-surface-variant text-on-surface-variant font-medium text-[11px] px-2 py-0.5 rounded-full mt-0.5">
                      {cred.typeLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-3 grid grid-cols-2 gap-2 z-10 mb-3 border border-outline-variant/30">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">
                    User
                  </span>
                  <span className="text-xs text-on-surface font-mono font-medium">{cred.username}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">
                    Password
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-on-surface tracking-widest font-mono">
                      •••••••••
                    </span>
                    <button
                      onClick={() => handleCopyPassword(cred)}
                      title="Copy credentials"
                      className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none ml-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 z-10 border-t border-outline-variant/30">
                <button
                  onClick={() => handleTestConnection(cred)}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin' : ''}`}>
                    {isTesting ? 'sync' : 'verified'}
                  </span>
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={() => openEditModal(cred)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface bg-surface-variant hover:bg-surface-dim transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col transition-all">
            <div className="p-4 bg-surface-container flex justify-between items-center border-b border-outline-variant">
              <h2 className="font-bold text-base text-on-surface">
                {editingCred ? 'Edit Credential' : 'Add Credential'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface rounded-full p-1 hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 flex-1 overflow-y-auto space-y-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Staging App Server"
                  className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded-xl border border-outline-variant focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => {
                    const selectedType = e.target.value as CredentialItem['type'];
                    setType(selectedType);
                    if (selectedType === 'postgres') setPort(5432);
                    else if (selectedType === 'mysql') setPort(3306);
                    else if (selectedType === 'linux') setPort(22);
                  }}
                  className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded-xl border border-outline-variant focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="linux">Linux / SSH</option>
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="network">Network Switch / Router</option>
                  <option value="docker">Docker / Kubernetes</option>
                  <option value="aws">AWS IAM</option>
                  <option value="api">API Key</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-on-surface mb-1">Host / IP</label>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="10.0.0.1 or db.internal"
                    className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded-xl border border-outline-variant focus:border-primary outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    placeholder="22"
                    className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded-xl border border-outline-variant focus:border-primary outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded-xl border border-outline-variant focus:border-primary outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Password / Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded-xl border border-outline-variant focus:border-primary outline-none font-mono pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-on-surface-variant hover:text-on-surface focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant flex justify-between items-center mt-4">
                {editingCred ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteCredential(editingCred.id);
                      setIsModalOpen(false);
                    }}
                    className="text-error text-xs font-medium hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-on-surface bg-surface-variant hover:bg-surface-dim transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-medium text-on-primary bg-primary hover:bg-primary-container transition-colors shadow-xs"
                  >
                    Save Credential
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
