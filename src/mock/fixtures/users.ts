export type WorkspaceRole = "owner" | "analyst" | "read-only";
export type WorkspaceUserStatus = "active" | "pending";

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  status: WorkspaceUserStatus;
  invitedOn?: string;
  lastActiveOn?: string;
}

export const users: WorkspaceUser[] = [
  {
    id: "user-kyle",
    name: "Kyle Robitaille",
    email: "kyle@emrealestate.ca",
    role: "owner",
    status: "active",
    lastActiveOn: "2026-08-10",
  },
  {
    id: "user-marie",
    name: "Marie Tremblay",
    email: "marie@emrealestate.ca",
    role: "analyst",
    status: "pending",
    invitedOn: "2026-08-07",
  },
  {
    id: "user-charles",
    name: "Charles Beaudoin",
    email: "charles@emrealestate.ca",
    role: "read-only",
    status: "active",
    invitedOn: "2026-05-14",
    lastActiveOn: "2026-08-08",
  },
];
