export interface Note {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  organization_slug: string;
  title: string;
  description: string | null;
  content: string | null;
  is_public: boolean;
} 