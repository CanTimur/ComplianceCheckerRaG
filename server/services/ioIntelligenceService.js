const OpenAI = require('openai');

/**
 * Service for interacting with IO Intelligence API
 */
class IOIntelligenceService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.IO_INTELLIGENCE_API_KEY,
      baseURL: 'https://api.intelligence.io.solutions/api/v1/',
    });
    
    // Default model for GDPR compliance analysis
    this.defaultModel = 'meta-llama/Llama-3.3-70B-Instruct';
  }

  /**
   * Get available models from IO Intelligence
   */
  async getAvailableModels() {
    try {
      const response = await this.client.models.list();
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch available models');
    }
  }

  /**
   * Analyze document content for GDPR compliance
   * @param {string} documentContent - The document content to analyze
   * @param {string} documentName - Name of the document
   * @returns {Object} Compliance analysis results
   */
  async analyzeGDPRCompliance(documentContent, documentName = 'document') {
    try {
      const prompt = this.createGDPRAnalysisPrompt(documentContent, documentName);
      
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are a GDPR compliance expert. Analyze documents for GDPR compliance and provide detailed, structured feedback. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 2000
      });

      const analysis = response.choices[0].message.content;
      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      console.error('Error analyzing GDPR compliance:', error);
      throw new Error('Failed to analyze document for GDPR compliance');
    }
  }

  /**
   * Create a comprehensive GDPR analysis prompt
   */
  createGDPRAnalysisPrompt(content, documentName) {
    return `
Please analyze the following document for GDPR compliance. Provide a structured analysis covering these key areas:

Document Name: ${documentName}

GDPR Compliance Areas to Check:
1. **Lawful Basis for Processing** - Does the document specify legal grounds for data processing?
2. **Data Subject Rights** - Are individual rights clearly explained (access, rectification, erasure, etc.)?
3. **Consent Management** - How is consent obtained, recorded, and withdrawn?
4. **Data Protection Impact Assessment (DPIA)** - Are high-risk processing activities identified?
5. **Data Retention** - Are retention periods specified and justified?
6. **Data Security** - What security measures are described?
7. **International Transfers** - How are data transfers outside EU handled?
8. **Breach Notification** - Are breach notification procedures defined?
9. **Privacy by Design** - Is privacy considered in system design?
10. **Record Keeping** - Are processing activities properly documented?

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting, no code blocks, no backticks:
{
  "overallScore": [0-100],
  "complianceLevel": ["Non-Compliant", "Partially Compliant", "Mostly Compliant", "Fully Compliant"],
  "summary": "Brief overview of compliance status",
  "strengths": ["List of compliant areas"],
  "weaknesses": ["List of non-compliant or missing areas"],
  "recommendations": ["Specific actionable recommendations"],
  "detailedAnalysis": {
    "lawfulBasis": {"status": "compliant/partial/missing", "details": "explanation"},
    "dataSubjectRights": {"status": "compliant/partial/missing", "details": "explanation"},
    "consentManagement": {"status": "compliant/partial/missing", "details": "explanation"},
    "dpia": {"status": "compliant/partial/missing", "details": "explanation"},
    "dataRetention": {"status": "compliant/partial/missing", "details": "explanation"},
    "dataSecurity": {"status": "compliant/partial/missing", "details": "explanation"},
    "internationalTransfers": {"status": "compliant/partial/missing", "details": "explanation"},
    "breachNotification": {"status": "compliant/partial/missing", "details": "explanation"},
    "privacyByDesign": {"status": "compliant/partial/missing", "details": "explanation"},
    "recordKeeping": {"status": "compliant/partial/missing", "details": "explanation"}
  }
}

Document Content:
${content}
`;
  }

  /**
   * Parse the AI response and structure it properly
   */
  parseAnalysisResponse(response) {
    try {
      let content = response.trim();
      
      // Clean up markdown formatting
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, create a structured response from the text
      return {
        overallScore: 50,
        complianceLevel: 'Partially Compliant',
        summary: 'Analysis completed but response format needs adjustment',
        strengths: ['Document was successfully analyzed'],
        weaknesses: ['Response format could not be parsed as JSON'],
        recommendations: ['Please review the document manually for detailed compliance assessment'],
        rawResponse: response
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return {
        overallScore: 0,
        complianceLevel: 'Analysis Error',
        summary: 'Failed to parse compliance analysis',
        strengths: [],
        weaknesses: ['Analysis could not be completed'],
        recommendations: ['Please try uploading the document again'],
        error: error.message,
        rawResponse: response
      };
    }
  }

  /**
   * Generate improvement suggestions based on compliance gaps
   */
  async generateImprovementSuggestions(analysisResult) {
    try {
      const prompt = `
Based on the following GDPR compliance analysis, provide specific, actionable improvement suggestions:

Analysis Summary: ${analysisResult.summary}
Compliance Level: ${analysisResult.complianceLevel}
Current Weaknesses: ${analysisResult.weaknesses?.join(', ')}

Please provide:
1. Priority ranking of improvements (High, Medium, Low)
2. Specific implementation steps
3. Template language or clauses that could be added
4. Timeline recommendations

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting, no code blocks, no backticks:
{
  "prioritizedImprovements": [
    {
      "priority": "High/Medium/Low",
      "area": "GDPR area name",
      "description": "What needs to be improved",
      "implementation": "Step-by-step guidance",
      "templateText": "Suggested clause or language to add",
      "timeline": "Recommended timeframe"
    }
  ]
}
`;

      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are a GDPR implementation specialist. Respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content.trim();
      
      // Clean up any markdown formatting
      let cleanContent = content;
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Error generating improvement suggestions:', error);
      return {
        prioritizedImprovements: [
          {
            priority: 'High',
            area: 'General Compliance',
            description: 'Review and update privacy policy based on analysis results',
            implementation: 'Consult with legal team and update documentation',
            templateText: 'Contact legal counsel for specific language recommendations',
            timeline: '30-60 days'
          }
        ]
      };
    }
  }
}

module.exports = IOIntelligenceService;
