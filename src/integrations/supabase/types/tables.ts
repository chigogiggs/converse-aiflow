export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  profiles?: Profile;
}