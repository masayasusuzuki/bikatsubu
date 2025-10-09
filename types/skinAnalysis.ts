export interface SkinAnalysisResult {
  skinType: string;
  concerns: string[];
  condition: {
    moisture: string;
    texture: string;
    clarity: string;
    moistureScore?: number; // 1-5
    textureScore?: number;  // 1-5
    clarityScore?: number;  // 1-5
    elasticityScore?: number; // 1-5 (弾力)
    poreScore?: number;     // 1-5 (毛穴)
  };
  recommendations: string[];
  avoid: string[];
}
