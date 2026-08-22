export type SkillType = 'recognition' | 'reasoning' | 'diagnosis' | 'correction' | 'implementation';

export type ConceptType = 'fundamental' | 'intermediate' | 'advanced';

export type MisconceptionSeverity = 'minor' | 'moderate' | 'critical';

export interface ConceptNode {
  conceptId: string;
  name: string;
  description: string;
  type: ConceptType;
  prerequisites: string[]; // Concept IDs required before mastering this concept
  children: string[];      // Dependent concept IDs
  supportedSkills: SkillType[];
  difficultyRange: [number, number]; // [min, max] e.g. [1, 2]
  commonErrors: string[]; // Misconception IDs associated with this concept
}

export interface ConceptGraph {
  concepts: Record<string, ConceptNode>;
}
