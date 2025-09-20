import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { message, role, conversationHistory } = JSON.parse(event.body || '{}');
    
    if (!message || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message and role are required' }),
      };
    }

    // Enhanced role contexts with specific interview guidelines
    const roleContexts = {
      'software-engineer': {
        role: 'Senior Technical Interviewer for Software Engineer position',
        focus: 'programming skills, algorithms, system design, code quality, problem-solving approach, technical experience',
        questionTypes: [
          'Technical coding problems and algorithms',
          'System design and architecture questions',
          'Code review and best practices',
          'Debugging and troubleshooting scenarios',
          'Technology choices and trade-offs',
          'Past project technical challenges'
        ]
      },
      'product-manager': {
        role: 'Senior Product Manager conducting PM interview',
        focus: 'product strategy, user research, prioritization, stakeholder management, analytics, market understanding',
        questionTypes: [
          'Product strategy and roadmap planning',
          'User research and customer insights',
          'Feature prioritization frameworks',
          'Stakeholder management scenarios',
          'Metrics and success measurement',
          'Product launch and go-to-market'
        ]
      },
      'ux-designer': {
        role: 'Senior UX Designer conducting design interview',
        focus: 'design process, user research, prototyping, design systems, user empathy, visual design',
        questionTypes: [
          'Design process and methodology',
          'User research and testing approaches',
          'Prototyping and wireframing',
          'Design system creation and maintenance',
          'Accessibility and inclusive design',
          'Design critique and iteration'
        ]
      },
      'data-scientist': {
        role: 'Senior Data Scientist conducting technical interview',
        focus: 'statistical analysis, machine learning, data visualization, business problem-solving, model evaluation',
        questionTypes: [
          'Statistical analysis and hypothesis testing',
          'Machine learning algorithms and applications',
          'Data preprocessing and feature engineering',
          'Model evaluation and validation',
          'Business problem translation to data problems',
          'Data visualization and storytelling'
        ]
      },
      'marketing-manager': {
        role: 'Senior Marketing Manager conducting marketing interview',
        focus: 'campaign strategy, market research, brand management, ROI measurement, digital marketing',
        questionTypes: [
          'Marketing campaign strategy and execution',
          'Market research and competitive analysis',
          'Brand positioning and messaging',
          'ROI measurement and attribution',
          'Digital marketing channels and optimization',
          'Customer segmentation and targeting'
        ]
      },
      'sales-representative': {
        role: 'Sales Director conducting sales interview',
        focus: 'sales techniques, customer relationship management, negotiation, target achievement, pipeline management',
        questionTypes: [
          'Sales process and methodology',
          'Customer relationship building',
          'Negotiation and closing techniques',
          'Pipeline management and forecasting',
          'Objection handling and problem-solving',
          'Territory management and prospecting'
        ]
      }
    };

    const roleContext = roleContexts[role as keyof typeof roleContexts] || {
      role: 'Professional Interviewer',
      focus: 'general professional skills and experience',
      questionTypes: ['Professional experience', 'Problem-solving', 'Teamwork', 'Leadership']
    };
    
    // Build conversation history with better context
    let conversationSummary = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-6); // Last 6 messages for context
      conversationSummary = recentMessages.map((msg: any) => 
        `${msg.type === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
      ).join('\n');
    }
    
    // Determine interview stage based on conversation length
    const messageCount = conversationHistory ? conversationHistory.length : 0;
    let interviewStage = 'opening';
    if (messageCount > 8) interviewStage = 'deep-dive';
    else if (messageCount > 4) interviewStage = 'technical';
    else if (messageCount > 2) interviewStage = 'experience';

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a ${roleContext.role} conducting a professional interview. 

ROLE CONTEXT:
- Position: ${role.replace('-', ' ').toUpperCase()}
- Focus Areas: ${roleContext.focus}
- Interview Stage: ${interviewStage}
- Question Types to Consider: ${roleContext.questionTypes.join(', ')}

CONVERSATION HISTORY:
${conversationSummary}

CANDIDATE'S LATEST RESPONSE:
"${message}"

INTERVIEW GUIDELINES:
1. Act as an experienced interviewer who is genuinely interested in the candidate
2. Provide specific, constructive feedback on their response when appropriate
3. Ask follow-up questions that build naturally on their answer
4. Vary your question types based on the interview stage:
   - Opening: General experience and motivation questions
   - Experience: Behavioral questions using STAR method
   - Technical: Role-specific technical or strategic questions
   - Deep-dive: Complex scenarios and problem-solving

5. For ${role.replace('-', ' ')} specifically:
   ${roleContext.questionTypes.map(type => `- ${type}`).join('\n   ')}

6. Keep responses conversational, professional, and under 150 words
7. Show genuine curiosity about their thought process and experience
8. Gradually increase question complexity as the interview progresses
9. If they give a good answer, acknowledge it specifically before asking the next question
10. If their answer lacks detail, ask for specific examples or clarification

IMPORTANT: Respond as the interviewer would in a real interview. Be engaging, professional, and adapt your questions based on their responses. Don't just ask generic questions - make it feel like a real conversation.

Your response:`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate interview response');
    }

    let aiResponse = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up the response if it has any unwanted formatting
    aiResponse = aiResponse.replace(/^(Response:|Your response:|Interviewer:)\s*/i, '');
    
    console.log('Generated interview response:', aiResponse);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ response: aiResponse }),
    };
  } catch (error) {
    console.error('Error:', error);
    
    // Enhanced contextual fallback responses based on role and conversation stage
    const getContextualFallback = (role: string, messageCount: number) => {
      const roleSpecificFallbacks = {
        'software-engineer': {
          opening: [
            "Great background! Can you tell me about a challenging technical problem you've solved recently and walk me through your approach?",
            "That's interesting experience. What programming languages and technologies are you most passionate about, and why?"
          ],
          experience: [
            "Excellent example. Now, let's dive deeper - can you describe your approach to code reviews and ensuring code quality in a team environment?",
            "That's a solid approach. Tell me about a time when you had to debug a production issue under pressure. What was your methodology?"
          ],
          technical: [
            "Interesting perspective. Let's say you need to design a system that can handle 1 million concurrent users. Walk me through your high-level architecture.",
            "Good point. How would you approach optimizing a slow database query that's affecting user experience?"
          ],
          'deep-dive': [
            "That's a comprehensive approach. What's your philosophy on technical debt, and how do you balance it with feature development?",
            "Excellent insight. How do you stay current with rapidly evolving technologies while maintaining productivity in your current stack?"
          ]
        },
        'product-manager': {
          opening: [
            "Great background! Can you walk me through how you approach understanding customer needs and translating them into product requirements?",
            "That's valuable experience. Tell me about a product you're particularly proud of and your role in its success."
          ],
          experience: [
            "Excellent example. How do you handle conflicting priorities when you have limited engineering resources and multiple stakeholder requests?",
            "That's a thoughtful approach. Describe a time when user feedback contradicted your initial product assumptions. How did you pivot?"
          ],
          technical: [
            "Good insight. Walk me through how you would prioritize features for a new product launch with tight deadlines.",
            "Interesting perspective. How do you measure product success, and what metrics do you focus on?"
          ],
          'deep-dive': [
            "That's comprehensive. How do you influence engineering and design teams when you don't have direct authority over them?",
            "Excellent approach. Describe your process for conducting competitive analysis and positioning your product in the market."
          ]
        },
        'ux-designer': {
          opening: [
            "Great background! Can you walk me through your design process from initial research to final implementation?",
            "That's interesting experience. Tell me about a design challenge you're particularly proud of solving."
          ],
          experience: [
            "Excellent example. How do you approach user research when you have limited time and resources?",
            "That's thoughtful. Describe a time when stakeholders disagreed with your design decisions. How did you handle it?"
          ],
          technical: [
            "Good insight. How do you ensure your designs are accessible and inclusive for users with different abilities?",
            "Interesting approach. Walk me through how you would redesign a feature that users find confusing."
          ],
          'deep-dive': [
            "That's comprehensive. How do you balance user needs with business constraints and technical limitations?",
            "Excellent perspective. Describe your approach to creating and maintaining design systems across multiple products."
          ]
        }
      };
      
      const stage = messageCount > 8 ? 'deep-dive' : messageCount > 4 ? 'technical' : messageCount > 2 ? 'experience' : 'opening';
      const roleQuestions = roleSpecificFallbacks[role as keyof typeof roleSpecificFallbacks];
      
      if (roleQuestions && roleQuestions[stage as keyof typeof roleQuestions]) {
        const stageQuestions = roleQuestions[stage as keyof typeof roleQuestions];
        return stageQuestions[Math.floor(Math.random() * stageQuestions.length)];
      }
      
      // Generic fallbacks
      const genericFallbacks = [
        "That's an interesting perspective. Can you give me a specific example of how you've applied this in your work?",
        "Thank you for sharing that. What would you say is your greatest professional strength, and how has it contributed to your success?",
        "I appreciate your answer. Can you describe a challenging situation you faced and how you overcame it?",
        "Good insight. Where do you see yourself professionally in the next few years, and how does this role align with those goals?"
      ];
      
      return genericFallbacks[Math.floor(Math.random() * genericFallbacks.length)];
    };
    
    const fallbackResponse = getContextualFallback(role, messageCount);
    
    console.log('Using fallback response for role:', role, 'message count:', messageCount);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ response: fallbackResponse }),
    };
  }
};

export { handler };