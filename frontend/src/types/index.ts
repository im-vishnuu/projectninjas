export interface User {
  userId: number;
  email: string;
  createdAt: string;
}

export interface Project {
  projectId: number;
  title: string;
  abstract: string;
  keywords: string[];
  ownerId: number;
  ownerEmail?: string;
  createdAt: string;
  files?: ProjectFile[];
}

// --- THIS IS THE FIX ---
export interface ProjectFile {
  fileId: number;
  fileName: string;
  filePath: string;
  fileType: string; // This line was missing
  uploadDate: string;
  projectId: number;
}

export interface AccessRequest {
  requestId: number;
  status: 'pending' | 'approved' | 'denied';
  requesterId: number;
  requesterEmail?: string;
  projectId: number;
  projectTitle?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}