export interface HackathonInput {
  theme: string;
  duration: '24h' | '48h' | '72h';
  teamSize: 'Solo' | '2-3 people' | '4-5 people';
  skills: string[];
}

export interface CodeSnippet {
  language: string;
  filename: string;
  code: string;
  explanation: string;
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  tasks: string[];
}

export interface PitchQnA {
  question: string;
  answer: string;
}

export interface ProjectIdea {
  id: string;
  name: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: { name: string; reason: string }[];
  wowFactor: string;
  problem: string;
  solution: string;
  architecture: string;
  mermaidDiagram: string;
  /** @deprecated use setupCommands array instead */
  setupCommand?: string;
  setupCommands?: string[];
  features: string[];
  codeSnippets: CodeSnippet[];
  timeline: TimelinePhase[];
  pitchQnA: PitchQnA[];
  
  // Advanced Utilities
  monetization: string;
  roadblocks: string[];
  apiEndpoints: { method: string; path: string; description: string; requestBody?: string; response?: string }[];
  
  // High-Value Hackathon Artifacts
  dbSchemaDiagram: string;
  uiMockupFlow: string[];
  architectureFlow: string[];
  pitchScript: { section: string; duration: string; script: string }[];
  competitorAnalysis: { name: string; weakness: string }[];
  techTradeoffs: { choice: string; alternative: string; reasonNotUsed: string }[];
  targetSponsorships: { company: string; api: string; integrationIdea: string }[];
}

export interface AgentResponse {
  ideas: ProjectIdea[];
}

// Concrete export to satisfy ESM module requirements
export const HACKDRAFT_VERSION = "1.1.0";
