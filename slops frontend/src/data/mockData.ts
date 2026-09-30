import { Conversation, KnowledgeFile, CredentialItem } from '../types';

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Network Issue',
    group: 'Today',
    updatedAt: '10:42 AM',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Why is the primary database failing to accept connections?',
        timestamp: '10:40 AM',
      },
      {
        id: 'msg-2',
        sender: 'assistant',
        text: 'I found a possible connectivity issue.',
        timestamp: '10:41 AM',
        analysisSummary: [
          { status: 'success', text: 'Database server is reachable via ICMP.' },
          { status: 'error', text: 'PostgreSQL service is not responding.' },
          { status: 'error', text: 'Port 5432 is currently unavailable.' },
        ],
        recommendedAction: {
          title: 'Recommended Action',
          description: 'Restart the PostgreSQL service on node db-prod-01.',
          target: 'db-prod-01',
          status: 'idle',
        },
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Database Error',
    group: 'Today',
    updatedAt: '09:15 AM',
    messages: [
      {
        id: 'msg-21',
        sender: 'user',
        text: 'Are there any deadlocks in the PostgreSQL cluster?',
        timestamp: '09:14 AM',
      },
      {
        id: 'msg-22',
        sender: 'assistant',
        text: 'Analysis of active queries shows 2 blocked transactions on node db-prod-01.',
        timestamp: '09:15 AM',
        analysisSummary: [
          { status: 'success', text: 'Primary node lock tables scanned.' },
          { status: 'error', text: 'Exclusive lock contention on table orders_q3.' },
        ],
        recommendedAction: {
          title: 'Terminate Blocking Session',
          description: 'Cancel PID 48291 to release lock on orders_q3.',
          status: 'idle',
        },
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Server Troubleshooting',
    group: 'Yesterday',
    updatedAt: 'Yesterday',
    messages: [
      {
        id: 'msg-31',
        sender: 'user',
        text: 'Check disk space on app-web-02.',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-32',
        sender: 'assistant',
        text: 'Disk usage on /var/log has reached 94%.',
        timestamp: 'Yesterday',
        analysisSummary: [
          { status: 'error', text: '/var/log utilization is above threshold (94%).' },
          { status: 'success', text: 'Root filesystem / is healthy at 42%.' },
        ],
        recommendedAction: {
          title: 'Rotate and Compress Logs',
          description: 'Run logrotate on /var/log/nginx/*.log.',
          status: 'idle',
        },
      },
    ],
  },
  {
    id: 'conv-4',
    title: 'Docker Issue',
    group: 'Yesterday',
    updatedAt: 'Yesterday',
    messages: [
      {
        id: 'msg-41',
        sender: 'user',
        text: 'Auth service container keeps restarting in crash loop.',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-42',
        sender: 'assistant',
        text: 'Container exited with status 137 (OOM Killed).',
        timestamp: 'Yesterday',
        analysisSummary: [
          { status: 'error', text: 'Memory limit of 512MB exceeded by auth-service container.' },
        ],
        recommendedAction: {
          title: 'Increase Container Memory Limit',
          description: 'Set memory limit to 1024MB in docker-compose.yml.',
          status: 'idle',
        },
      },
    ],
  },
];

export const INITIAL_FILES: KnowledgeFile[] = [
  {
    id: 'file-1',
    name: 'network_topology.pdf',
    type: 'PDF',
    size: '4.2 MB',
    status: 'Indexed',
    uploadDate: 'Oct 24, 2023',
    usageCount: 2,
  },
  {
    id: 'file-2',
    name: 'server_configuration.pdf',
    type: 'PDF',
    size: '2.8 MB',
    status: 'Indexed',
    uploadDate: 'Oct 22, 2023',
    usageCount: 5,
  },
  {
    id: 'file-3',
    name: 'auth_service_logs_Q3.txt',
    type: 'LOG',
    size: '12.4 MB',
    status: 'Indexing...',
    uploadDate: 'Today',
    usageCount: 0,
  },
  {
    id: 'file-4',
    name: 'database_schema.pdf',
    type: 'PDF',
    size: '1.5 MB',
    status: 'Indexed',
    uploadDate: 'Oct 19, 2023',
    usageCount: 3,
  },
  {
    id: 'file-5',
    name: 'linux_manual.pdf',
    type: 'PDF',
    size: '8.1 MB',
    status: 'Indexed',
    uploadDate: 'Oct 10, 2023',
    usageCount: 1,
  },
];

export const INITIAL_CREDENTIALS: CredentialItem[] = [
  {
    id: 'cred-1',
    name: 'Production Linux Server',
    type: 'linux',
    typeLabel: 'Linux',
    host: '10.0.0.12',
    port: 22,
    username: 'admin',
    password: 'supersecretpassword123',
  },
  {
    id: 'cred-2',
    name: 'Production Database',
    type: 'postgres',
    typeLabel: 'PostgreSQL',
    host: 'db.internal',
    port: 5432,
    username: 'postgres',
    password: 'dbpassword456',
  },
];
