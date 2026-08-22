import { SQL_CONCEPTS } from './graphData';
import { ConceptNode } from './types';

export class KnowledgeGraphManager {
  private concepts: Record<string, ConceptNode>;

  constructor(concepts: Record<string, ConceptNode> = SQL_CONCEPTS) {
    this.concepts = concepts;
  }

  public getConcept(conceptId: string): ConceptNode | undefined {
    return this.concepts[conceptId];
  }

  public getAllConcepts(): ConceptNode[] {
    return Object.values(this.concepts);
  }

  public getPrerequisites(conceptId: string): ConceptNode[] {
    const concept = this.getConcept(conceptId);
    if (!concept) return [];
    return concept.prerequisites
      .map(id => this.getConcept(id))
      .filter((c): c is ConceptNode => c !== undefined);
  }

  public getChildren(conceptId: string): ConceptNode[] {
    const concept = this.getConcept(conceptId);
    if (!concept) return [];
    return concept.children
      .map(id => this.getConcept(id))
      .filter((c): c is ConceptNode => c !== undefined);
  }

  /**
   * Check if all prerequisites for a given concept are sufficiently mastered.
   */
  public isPrerequisitesMet(
    conceptId: string,
    masteryMap: Record<string, number>,
    threshold: number = 0.5
  ): boolean {
    const prereqs = this.getPrerequisites(conceptId);
    if (prereqs.length === 0) return true;

    return prereqs.every(prereq => {
      const mastery = masteryMap[prereq.conceptId] ?? 0;
      return mastery >= threshold;
    });
  }

  public getUnmetPrerequisites(
    conceptId: string,
    masteryMap: Record<string, number>,
    threshold: number = 0.5
  ): ConceptNode[] {
    const prereqs = this.getPrerequisites(conceptId);
    return prereqs.filter(prereq => {
      const mastery = masteryMap[prereq.conceptId] ?? 0;
      return mastery < threshold;
    });
  }
}

export const knowledgeGraph = new KnowledgeGraphManager();
