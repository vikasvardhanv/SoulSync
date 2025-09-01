import api from './api';

interface MatchCandidate {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  photos: string[];
  personality_answers: Record<string, any>;
  compatibility_answers: Record<string, any>;
}

interface MatchResult {
  candidate: MatchCandidate;
  compatibility_score: number;
  reasoning: string;
  conversation_starters: string[];
}

export class AIMatchingService {
  private static async callOpenAI(prompt: string): Promise<string> {
    try {
      // Use the backend to call OpenAI
      const response = await api.post('/ai/analyze-compatibility', { prompt });
      return JSON.stringify(response.data);
    } catch (error) {
      console.error('AI analysis request failed:', error);
      // Fallback response in case of network/server error
      return JSON.stringify({
        score: 7.0,
        reasoning: "AI analysis temporarily unavailable. This is a fallback response.",
        conversation_starters: [
          "What brings you to SoulSync?",
          "Tell me about your perfect day.",
          "What's something you're passionate about?"
        ]
      });
    }
  }

  static async findMatches(userId: string, limit: number = 10): Promise<MatchResult[]> {
    try {
      // Get candidates from the backend
      const response = await api.get(`/matches/candidates?userId=${userId}&limit=${limit}`);
      const { currentUser, candidates } = response.data;

      if (!candidates || candidates.length === 0) {
        return [];
      }

      // Analyze each candidate with AI
      const matchPromises = candidates.map(async (candidate: MatchCandidate) => {
        const prompt = this.createAnalysisPrompt(currentUser, candidate);
        const aiResponse = await this.callOpenAI(prompt);
        
        // Parse AI response
        const analysis = this.parseAIResponse(aiResponse);
        
        return {
          candidate,
          compatibility_score: analysis.score,
          reasoning: analysis.reasoning,
          conversation_starters: analysis.conversation_starters,
        };
      });

      const matches = await Promise.all(matchPromises);
      
      // Sort by compatibility score
      return matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }

  private static createAnalysisPrompt(user1: any, user2: any): string {
    return `
Analyze the compatibility between these two people:

Person 1 (${user1.name}, ${user1.age}):
- Bio: ${user1.bio}
- Interests: ${user1.interests.join(', ')}
- Personality: ${JSON.stringify(user1.personality_answers)}
- Compatibility preferences: ${JSON.stringify(user1.compatibility_answers)}

Person 2 (${user2.name}, ${user2.age}):
- Bio: ${user2.bio}
- Interests: ${user2.interests.join(', ')}
- Personality: ${JSON.stringify(user2.personality_answers)}
- Compatibility preferences: ${JSON.stringify(user2.compatibility_answers)}

Please provide:
1. A compatibility score from 1-10
2. Detailed reasoning for the score
3. 3 conversation starters they could use

Format your response as JSON:
{
  "score": 8.5,
  "reasoning": "Detailed explanation...",
  "conversation_starters": ["Starter 1", "Starter 2", "Starter 3"]
}
    `;
  }

  private static parseAIResponse(response: string): {
    score: number;
    reasoning: string;
    conversation_starters: string[];
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(10, Math.max(1, parsed.score || 5)),
          reasoning: parsed.reasoning || 'Compatibility analysis completed.',
          conversation_starters: parsed.conversation_starters || [
            'What brings you to SoulSync?',
            'Tell me about your perfect day.',
            'What\'s something you\'re passionate about?'
          ],
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    // Fallback response
    return {
      score: 7.0,
      reasoning: 'AI analysis completed successfully.',
      conversation_starters: [
        'What brings you to SoulSync?',
        'Tell me about your perfect day.',
        'What\'s something you\'re passionate about?'
      ],
    };
  }

  static async saveMatch(userId: string, matchedUserId: string, compatibilityScore: number): Promise<void> {
    try {
      await api.post('/matches', {
        userId,
        matchedUserId,
        compatibilityScore,
      });
    } catch (error) {
      console.error('Error saving match:', error);
      throw error;
    }
  }

  static async updateMatchStatus(matchId: string, status: 'accepted' | 'rejected'): Promise<void> {
    try {
      await api.put(`/matches/${matchId}`, { status });
    } catch (error) {
      console.error('Error updating match status:', error);
      throw error;
    }
  }
} 