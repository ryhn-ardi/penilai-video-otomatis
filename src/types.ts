export interface RubricWeights {
  creativity: number;
  audio: number;
  visual: number;
  theme: number;
}

export interface StudentVlogEntry {
  id: string;
  name: string;
  className: string;
  videoUrl: string;
  videoTitle?: string;
  status: 'pending' | 'evaluating' | 'evaluated' | 'error';
  
  // 4 Objective Criteria (0-100)
  creativityScore?: number;
  creativityFeedback?: string;
  audioScore?: number;
  audioFeedback?: string;
  visualScore?: number;
  visualFeedback?: string;
  themeRelevanceScore?: number;
  themeFeedback?: string;
  
  // Overall results
  finalScore?: number;
  grade?: 'A' | 'B' | 'C' | 'D';
  isPassed?: boolean;
  strengths?: string[];
  improvements?: string[];
  overallComment?: string;
  
  // Teacher manual override & notes
  teacherManualScore?: number;
  teacherManualComment?: string;
  
  // Video meta info
  presentationPace?: string;
  estimatedDuration?: string;
  qualityAssessment?: 'poor' | 'fair' | 'good' | 'excellent';
  detectedIssues?: string[];
  evaluatedAt?: string;
  errorMessage?: string;
}

export interface AssignmentSettings {
  title: string;
  theme: string;
  subjectName: string;
  schoolName: string;
  teacherName: string;
  passingGrade: number; // e.g. 75
  weights: RubricWeights;
  targetDuration: string;
  instructions: string;
  strictnessMode: 'strict' | 'standard' | 'lenient'; // default 'strict'
}

export interface FilterState {
  search: string;
  selectedClass: string;
  status: string; // 'all' | 'evaluated' | 'pending'
  grade: string; // 'all' | 'A' | 'B' | 'C' | 'D'
  sortBy: 'rank' | 'score_desc' | 'score_asc' | 'name_asc' | 'class_asc' | 'date_desc';
}

export interface ClassSummary {
  className: string;
  totalStudents: number;
  evaluatedCount: number;
  highestScore: number;
  highestStudent?: string;
  lowestScore: number;
  lowestStudent?: string;
  averageScore: number;
  passedCount: number;
  passRate: number;
  creativityAvg: number;
  audioAvg: number;
  visualAvg: number;
  themeAvg: number;
}

export interface ClassInsightReport {
  executiveSummary: string;
  topStrengthPattern: string;
  commonChallengePattern: string;
  teachingRecommendations: string[];
}
