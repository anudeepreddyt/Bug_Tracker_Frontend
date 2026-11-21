// Exact backend enums from com.anudeepreddy.Bug_Tracker.Common
export const ISSUE_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

export const ISSUE_STATUS_LIST = [
  { value: ISSUE_STATUS.TODO, label: 'To Do', shortLabel: 'TODO' },
  { value: ISSUE_STATUS.IN_PROGRESS, label: 'In Progress', shortLabel: 'IN_PROGRESS' },
  { value: ISSUE_STATUS.COMPLETED, label: 'Completed', shortLabel: 'COMPLETED' },
];

export const ISSUE_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

export const ISSUE_PRIORITY_LIST = [
  { value: ISSUE_PRIORITY.LOW, label: 'Low' },
  { value: ISSUE_PRIORITY.MEDIUM, label: 'Medium' },
  { value: ISSUE_PRIORITY.HIGH, label: 'High' },
];

export const PROJECT_ROLE = {
  MANAGER: 'MANAGER',
  DEVELOPER: 'DEVELOPER',
};

export const PROJECT_ROLE_LIST = [
  { value: PROJECT_ROLE.MANAGER, label: 'Manager' },
  { value: PROJECT_ROLE.DEVELOPER, label: 'Developer' },
];

export const SYSTEM_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const STORAGE_KEYS = {
  TOKEN: 'bugtracker_jwt_token',
  USER: 'bugtracker_user_profile',
  KNOWN_PROJECT_IDS: 'bugtracker_known_project_ids',
  PROJECT_MEMBERS_CACHE: 'bugtracker_project_members_cache',
  THEME: 'bugtracker_theme',
};
