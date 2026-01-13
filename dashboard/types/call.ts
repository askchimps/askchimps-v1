export type CallStatus =
  | "ACTIVE"
  | "DISCONNECTED"
  | "RESCHEDULED"
  | "MISSED"
  | "COMPLETED";

export type Sentiment = "HOT" | "WARM" | "COLD" | "NEUTRAL";

export interface Call {
  id: string;
  organisationId: string;
  agentId: string;
  leadId: string;
  name: string | null;
  endedReason: string | null;
  externalId: string | null;
  duration: number;
  status: CallStatus;
  sentiment: Sentiment | null;
  recordingUrl: string | null;
  shortSummary: string | null;
  detailedSummary: string | null;
  analysis: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CallMessage {
  id: string;
  callId: string;
  organisationId: string;
  role: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

