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

    const roleContext = {
      'software-engineer': 'You are conducting a technical interview for a Software Engineer position. Focus on programming skills, problem-solving, system design, and technical experience.',
      'product-manager': 'You are conducting an interview for a Product Manager position. Focus on product strategy, user research, prioritization, stakeholder management, and analytics.',
      'ux-designer': 'You are conducting an interview for a UX Designer position. Focus on design process, user research, prototyping, design systems, and user empathy.',
      'data-scientist': 'You are conducting an interview for a Data Scientist position. Focus on statistical analysis, machine learning, data visualization, and business problem-solving.',
      'marketing-manager': 'You are conducting an interview for a Marketing Manager position. Focus on campaign strategy, market research, brand management, and ROI measurement.',
      'sales-representative': 'You are conducting an interview for a Sales Representative position. Focus on sales techniques, customer relationship management, negotiation, and target achievement.'
    };

    const context = roleContext[role as keyof typeof roleContext] || 'You are conducting a professional job interview.';
    
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n' + 
        conversationHistory.map((msg: any) => `${msg.type === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n');
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${context}

${conversationContext}

Candidate's latest response: "${message}"

Please respond as the interviewer with a thoughtful follow-up question or feedback. Keep responses conversational, professional, and under 150 words. If this is early in the conversation, ask behavioral or experience-based questions. As the conversation progresses, you can ask more technical or role-specific questions.

Your response should:
1. Acknowledge their answer briefly if appropriate
2. Ask a relevant follow-up question that builds on their response
3. Keep the conversation flowing naturally
4. Gradually increase question difficulty

Response:`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate interview response');
    }

    const aiResponse = data.candidates[0].content.parts[0].text.trim();

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
    
    // Fallback responses based on role
    const fallbackResponses = [
      "That's an interesting perspective. Can you tell me about a specific challenge you faced in a previous project and how you overcame it?",
      "Thank you for sharing that. What would you say is your greatest strength, and how would it benefit our team?",
      "I appreciate your answer. Can you describe a time when you had to work with a difficult team member? How did you handle the situation?",
      "Good insight. Where do you see yourself professionally in the next 5 years, and how does this role align with those goals?",
      "That's helpful to know. Do you have any questions about the role, team, or company culture?"
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ response: randomResponse }),
    };
  }
};

export { handler };