export type UserRole = 'admin' | 'manager' | 'user';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type FeedbackType = 'performance' | 'behavior' | 'project' | '360';

export type FeedbackStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TeamMemberRole = 'member' | 'leader' | 'specialist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  position: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  manager: User;
  managerId: string;
  members: User[];
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  giverId: string;
  receiverId: string;
  teamId?: string;
  title: string;
  description: string;
  rating: number;
  priority: Priority;
  status: FeedbackStatus;
  competencies: CompetencyRating[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetencyRating {
  competencyId: string;
  competencyName: string;
  rating: number;
  comments?: string;
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalFeedbacks: number;
  pendingFeedbacks: number;
  averageRating: number;
  activeUsers: number;
  feedbackTrends: FeedbackTrend[];
  topPerformers: User[];
}

export interface FeedbackTrend {
  month: string;
  count: number;
  averageRating: number;
}