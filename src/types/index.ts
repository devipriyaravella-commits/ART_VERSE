export type UserRole = 'artist' | 'explorer';

export type ArtCategory =
  | 'Visual Art'
  | 'Digital Art'
  | 'Photography'
  | 'Music'
  | 'Design'
  | 'Dance'
  | 'Film'
  | 'Writing'
  | '3D / Animation';

export type ExperienceLevel = 'Beginner' | 'Emerging' | 'Professional';

export interface Artist {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  location: string;
  region: string;
  country: string;
  category: ArtCategory;
  experience: ExperienceLevel;
  availability: 'Available' | 'Busy' | string;
  bio: string;
  statement: string;
  skills: string[];
  tags: string[];
  achievements: string[];
  socialLinks: {
    instagram?: string;
    youtube?: string;
    behance?: string;
    website?: string;
  };
  avatar: string;
  coverImage: string;
  followersCount: number;
  profileViews: number;
  artworkViews?: number;
  viewsGrowth: string;
  engagementGrowth: string;
  isRising: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: string;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  artistLocation: string;
  imageUrl: string;
  description: string;
  category: ArtCategory;
  medium: string;
  tags: string[];
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  commentsCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export type OpportunityCategory =
  | 'Jobs'
  | 'Freelance'
  | 'Competitions'
  | 'Exhibitions'
  | 'Grants'
  | 'Collaborations'
  | 'Internships'
  | 'Workshops'
  | 'Scholarships';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  orgLogo?: string;
  category: OpportunityCategory;
  location: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  deadline: string;
  compensation?: string;
  prize?: string;
  description: string;
  requirements: string[];
  eligibility?: string;
  tags: string[];
  applyUrl?: string;
  featured: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  artworkId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName?: string;
  artworkId?: string;
  opportunityId?: string;
  projectTitle: string;
  projectDescription?: string;
  type: string;
  requiredSkills?: string[];
  message: string;
  budget?: string;
  timeline?: string;
  status: 'pending' | 'accepted' | 'declined' | 'rejected';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type:
    | 'follower'
    | 'like'
    | 'save'
    | 'comment'
    | 'collaboration'
    | 'collaboration_accepted'
    | 'collaboration_rejected'
    | 'collab_request'
    | 'collab_accepted'
    | 'collab_rejected'
    | 'opp_recommendation'
    | 'deadline'
    | 'ai_recommendation'
    | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export interface AIMatchResult {
  artistId: string;
  matchPercentage: number;
  reason: string;
  skillsMatched?: string[];
}
