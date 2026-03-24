/**
 * AI Service Mock
 * Simulates Biometric Face Matching and AI Vision Work Classification
 */

export interface VerificationResult {
  score: number;
  match: boolean;
}

export interface ClassificationResult {
  tag: string;
  confidence: number;
}

const WORK_TAGS = [
  'Cleaning completed',
  'Stock arranged',
  'Delivery completed',
  'Maintenance activity',
  'Issue detected'
];

export const aiService = {
  /**
   * Simulates comparing an uploaded photo with the user's base biometric profile
   */
  verifyFace: async (uploadedUrl: string, registeredUrl?: string): Promise<VerificationResult> => {
    // Simulating API latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!registeredUrl) {
      return { score: 0, match: false };
    }

    // Deterministic mock score based on URL length for demo consistency
    // In a real app, this would call a vision API
    const score = Math.floor(Math.random() * 21) + 80; // Typically 80-100%
    
    // Simulate rare failures
    if (uploadedUrl.includes('fail')) return { score: 45, match: false };
    
    return { 
      score, 
      match: score >= 80 
    };
  },

  /**
   * Simulates AI Vision classification of work based on images
   */
  classifyWork: async (imageUrl: string): Promise<ClassificationResult> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Intelligence simulation: check for keywords in URL
    let tag = WORK_TAGS[Math.floor(Math.random() * WORK_TAGS.length)];
    
    if (imageUrl.toLowerCase().includes('clean')) tag = 'Cleaning completed';
    if (imageUrl.toLowerCase().includes('stock') || imageUrl.toLowerCase().includes('box')) tag = 'Stock arranged';
    if (imageUrl.toLowerCase().includes('truck') || imageUrl.toLowerCase().includes('package')) tag = 'Delivery completed';
    if (imageUrl.toLowerCase().includes('fix') || imageUrl.toLowerCase().includes('tool')) tag = 'Maintenance activity';
    if (imageUrl.toLowerCase().includes('broken') || imageUrl.toLowerCase().includes('leak')) tag = 'Issue detected';

    return {
      tag,
      confidence: Math.floor(Math.random() * 15) + 85 // 85-100%
    };
  }
};
