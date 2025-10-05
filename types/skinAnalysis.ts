export interface SkinAnalysisResult {
  skinType: string;
  concerns: string[];
  condition: {
    moisture: string;
    texture: string;
    clarity: string;
  };
  recommendations: string[];
  avoid: string[];
}
