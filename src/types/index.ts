export interface Dashboard {
  total_projects: number;
  total_scans: number;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  average_score: number;
  recent_scans: RecentScan[];
  findings_by_severity: SeverityCount[];
}

export interface RecentScan {
  id: string;
  project_name: string;
  status: string;
  score: number | null;
  created_at: string;
}

export interface SeverityCount {
  severity: string;
  count: number;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  repository_url: string | null;
  default_branch: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  project_id: string;
  branch: string;
  status: string;
  trigger: string;
  priority: number;
  score: number | null;
  progress: number;
  created_at: string;
  completed_at: string | null;
}

export interface ScanResult {
  id: string;
  scan_job_id: string;
  status: string;
  score: number;
  total_files: number;
  total_rules: number;
  total_findings: number;
  suppressed_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  duration_ms: number;
  created_at: string;
}

export interface Finding {
  id: string;
  scan_result_id: string;
  rule_id: string;
  severity: string;
  category: string;
  file_path: string;
  line: number;
  column: number;
  message: string;
  recommendation: string;
  fix_example: string | null;
  is_suppressed: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  scan_result_id: string;
  format: string;
  content: string;
  file_path: string | null;
  file_size: number;
  created_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  event_type: string;
  title: string;
  message: string;
  severity: string;
  resource_type: string | null;
  resource_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Progress {
  scan_id: string;
  status: string;
  progress: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
