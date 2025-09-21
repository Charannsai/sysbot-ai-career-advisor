import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { role, questionNumber, userAnswer, resumeContent } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Generate dynamic questions based on resume content using Gemini
    const generateQuestion = async (questionNum: number) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are conducting a voice interview for a ${role.replace('-', ' ')} position. This is question ${questionNum + 1}.

CANDIDATE'S BACKGROUND:
${resumeContent || 'No resume provided'}

Generate ONE specific interview question based on their background. The question should:
- Be directly related to their experience or skills mentioned in their resume
- Be appropriate for a ${role.replace('-', ' ')} role
- Be conversational and suitable for voice interview
- Reference specific projects, technologies, or experiences from their background
- Be under 30 words

If this is question 1, start with asking about a specific project or experience from their resume.
If this is question ${questionNum + 1} and they have ${questionNum} previous questions, ask about a different aspect of their background.

Question:`
              }]
            }]
          })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
          return data.candidates[0].content.parts[0].text.trim().replace(/^Question:\s*/i, '');
        }
      } catch (error) {
        console.error('Error generating question:', error);
      }
      
      // Fallback questions
      const fallbacks = [
        "Tell me about a project you're most proud of from your background.",
        "What's the most challenging problem you've solved in your experience?",
        "How do you approach learning new technologies or skills?",
        "Describe a time when you had to work under pressure.",
        "What motivates you most in your professional work?"
      ];
      return fallbacks[questionNum % fallbacks.length];
    };

    // If requesting a question
    if (userAnswer === undefined) {
      const questionIndex = questionNumber || 0;
      
      if (questionIndex < 5) { // Limit to 5 questions
        const question = await generateQuestion(questionIndex);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).json({ 
          question,
          hasMoreQuestions: questionIndex < 4
        });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).json({ 
          question: "Thank you for completing the interview practice. You provided excellent insights! This concludes our session.",
          hasMoreQuestions: false
        });
      }
    }

    // If processing an answer and generating feedback
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As an interviewer for ${role.replace('-', ' ')}, provide brief feedback on this answer:

"${userAnswer}"

Feedback (1-2 sentences, encouraging):`
          }]
        }]
      })
    });

    const data = await response.json();
    let feedback = '';
    
    if (response.ok && data.candidates && data.candidates[0]) {
      feedback = data.candidates[0].content.parts[0].text.trim().replace(/^Feedback:\s*/i, '');
    } else {
      feedback = "Thank you for your thoughtful answer. Let's continue.";
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}