import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, role, conversationHistory, isFirstMessage, resumeContent } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Formal interview role definitions
    const interviewerProfiles = {
      'software-engineer': {
        title: 'Senior Software Engineering Manager',
        company: 'TechCorp',
        greeting: 'Good morning/afternoon. I\'m Sarah Johnson, Senior Engineering Manager here at TechCorp. Thank you for taking the time to interview with us today for the Software Engineer position.',
        focus: 'technical problem-solving, coding proficiency, system design, software development lifecycle, teamwork in technical environments',
        interviewFlow: [
          'Personal introduction and background',
          'Technical experience and programming languages',
          'Problem-solving and algorithmic thinking',
          'System design and architecture',
          'Code quality and best practices',
          'Team collaboration and project experience',
          'Career goals and company fit'
        ]
      },
      'product-manager': {
        title: 'Director of Product Management',
        company: 'InnovateCorp',
        greeting: 'Good morning/afternoon. I\'m Michael Chen, Director of Product Management at InnovateCorp. I\'m pleased to meet with you today regarding the Product Manager position.',
        focus: 'product strategy, user research, stakeholder management, data-driven decision making, market analysis, roadmap planning',
        interviewFlow: [
          'Background and product management experience',
          'Product strategy and vision',
          'User research and customer insights',
          'Stakeholder management and communication',
          'Data analysis and metrics',
          'Prioritization and roadmap planning',
          'Leadership and team collaboration'
        ]
      },
      'ux-designer': {
        title: 'Head of User Experience Design',
        company: 'DesignFirst Inc',
        greeting: 'Good morning/afternoon. I\'m Emma Rodriguez, Head of UX Design at DesignFirst Inc. Thank you for your interest in the UX Designer position.',
        focus: 'design thinking, user research, prototyping, design systems, accessibility, user empathy, design process',
        interviewFlow: [
          'Design background and philosophy',
          'Design process and methodology',
          'User research and testing experience',
          'Portfolio discussion and case studies',
          'Design systems and collaboration',
          'Accessibility and inclusive design',
          'Career aspirations in UX'
        ]
      },
      'data-scientist': {
        title: 'Principal Data Scientist',
        company: 'DataTech Solutions',
        greeting: 'Good morning/afternoon. I\'m Dr. James Wilson, Principal Data Scientist at DataTech Solutions. I\'m excited to discuss the Data Scientist opportunity with you today.',
        focus: 'statistical analysis, machine learning, data modeling, business problem-solving, programming skills, research methodology',
        interviewFlow: [
          'Educational background and data science journey',
          'Statistical analysis and methodology',
          'Machine learning experience and applications',
          'Programming and technical skills',
          'Business problem-solving approach',
          'Data visualization and communication',
          'Research experience and continuous learning'
        ]
      },
      'marketing-manager': {
        title: 'VP of Marketing',
        company: 'GrowthCorp',
        greeting: 'Good morning/afternoon. I\'m Lisa Thompson, VP of Marketing at GrowthCorp. I\'m delighted to speak with you about the Marketing Manager position.',
        focus: 'marketing strategy, campaign management, brand development, market research, digital marketing, ROI analysis',
        interviewFlow: [
          'Marketing background and experience',
          'Campaign strategy and execution',
          'Brand management and positioning',
          'Market research and analysis',
          'Digital marketing and channels',
          'Performance measurement and ROI',
          'Team leadership and collaboration'
        ]
      },
      'sales-representative': {
        title: 'Regional Sales Director',
        company: 'SalesPro Inc',
        greeting: 'Good morning/afternoon. I\'m Robert Davis, Regional Sales Director at SalesPro Inc. Thank you for your interest in the Sales Representative position.',
        focus: 'sales methodology, relationship building, negotiation, pipeline management, target achievement, customer service',
        interviewFlow: [
          'Sales background and achievements',
          'Sales process and methodology',
          'Relationship building and networking',
          'Negotiation and closing techniques',
          'Pipeline management and forecasting',
          'Customer service and retention',
          'Goal setting and performance'
        ]
      }
    };

    const interviewer = interviewerProfiles[role as keyof typeof interviewerProfiles] || {
      title: 'Hiring Manager',
      company: 'Professional Corp',
      greeting: 'Good morning/afternoon. Thank you for your interest in this position.',
      focus: 'professional experience and skills',
      interviewFlow: ['Background', 'Experience', 'Skills', 'Goals']
    };

    // Handle first message (greeting)
    if (isFirstMessage) {
      const welcomeResponse = `${interviewer.greeting}\n\nTo conduct a thorough interview, I'd like to review your background first. Could you please share:\n\n1. Your resume or a summary of your experience\n2. Any portfolio links, project links, or relevant work samples\n3. Any other materials you'd like me to consider\n\nPlease paste your resume content and any links in your next message.`;
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).json({ response: welcomeResponse });
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory.slice(-8).map((msg: any) => 
        `${msg.type === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
      ).join('\n');
    }

    // Determine interview stage
    const messageCount = conversationHistory ? conversationHistory.length : 0;
    const currentStage = Math.min(Math.floor(messageCount / 2), interviewer.interviewFlow.length - 1);
    const nextTopic = interviewer.interviewFlow[currentStage + 1] || 'wrap-up questions';

    // Check if this is resume submission (second message)
    const isResumeSubmission = messageCount === 1;
    
    let prompt = '';
    
    if (isResumeSubmission) {
      prompt = `You are ${interviewer.title} at ${interviewer.company}. The candidate has just shared their resume/portfolio for the ${role.replace('-', ' ')} position.

CANDIDATE'S RESUME/PORTFOLIO:
"${message}"

Your task:
1. Acknowledge receipt of their materials professionally
2. Based on their background, ask ONE specific question about their most relevant experience
3. Focus on something specific from their resume that relates to ${interviewer.focus}
4. Keep response under 80 words
5. Be formal and professional

Respond as the interviewer:`;
    } else {
      prompt = `You are ${interviewer.title} at ${interviewer.company}, interviewing for ${role.replace('-', ' ')}.

CANDIDATE'S BACKGROUND (from earlier):
${resumeContent || 'Not provided'}

CONVERSATION:
${conversationContext}

CANDIDATE'S LATEST RESPONSE:
"${message}"

Based on their response and background:
1. Acknowledge their answer briefly
2. Ask ONE follow-up question that builds on what they said
3. Reference their background when relevant
4. Focus on: ${interviewer.focus}
5. Keep under 80 words
6. Stay formal and professional

Respond as the interviewer:`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate interview response');
    }

    let aiResponse = data.candidates[0].content.parts[0].text.trim();
    aiResponse = aiResponse.replace(/^(Response:|Your response:|Interviewer:|As the interviewer:|As .*?:)\s*/i, '');
    
    console.log('Gemini API response:', aiResponse);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    
    const messageCount = req.body.conversationHistory ? req.body.conversationHistory.length : 0;
    const isResumeSubmission = messageCount === 1;
    const fallbackResponse = isResumeSubmission 
      ? "Thank you for sharing your background. Based on your experience, could you tell me about a specific project or achievement you're most proud of?"
      : "I appreciate your response. Could you provide more specific details about your experience with this?";
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json({ response: fallbackResponse });
  }
}