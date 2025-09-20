import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { role, questionNumber, userAnswer } = JSON.parse(event.body || '{}');
    
    if (!role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Role is required' }),
      };
    }

    const roleQuestions = {
      'software-engineer': [
        "Tell me about yourself and your experience in software development.",
        "Describe a challenging technical problem you've solved recently. What was your approach?",
        "How do you approach debugging when you encounter a complex issue?",
        "What programming languages and frameworks are you most comfortable with, and why?",
        "How do you stay updated with the latest technologies and best practices in software development?",
        "Describe your experience with version control systems like Git. How do you handle merge conflicts?",
        "Tell me about a time when you had to optimize the performance of an application. What strategies did you use?"
      ],
      'product-manager': [
        "Tell me about your experience in product management and what drew you to this field.",
        "How do you prioritize features when you have limited resources and competing stakeholder demands?",
        "Describe a time when you had to make a difficult product decision. What was your process?",
        "How do you gather and incorporate user feedback into your product roadmap?",
        "What metrics do you use to measure product success, and how do you track them?",
        "Tell me about a product launch you've managed. What challenges did you face?",
        "How do you balance technical debt with new feature development?"
      ],
      'ux-designer': [
        "Walk me through your design process from initial concept to final delivery.",
        "How do you approach user research, and what methods do you find most effective?",
        "Describe a challenging design problem you solved. What was your methodology?",
        "How do you balance user needs with business requirements when they conflict?",
        "What design tools and prototyping methods do you prefer, and why?",
        "Tell me about a time when user testing revealed unexpected insights. How did you adapt?",
        "How do you ensure consistency across different platforms and devices in your designs?"
      ]
    };

    // If requesting a question
    if (userAnswer === undefined) {
      const questions = roleQuestions[role as keyof typeof roleQuestions] || [];
      const questionIndex = questionNumber || 0;
      
      if (questionIndex < questions.length) {
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ 
            question: questions[questionIndex],
            hasMoreQuestions: questionIndex < questions.length - 1
          }),
        };
      } else {
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ 
            question: "Thank you for completing the interview practice. You did a great job! This concludes our session.",
            hasMoreQuestions: false
          }),
        };
      }
    }

    // If processing an answer and generating feedback
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As an experienced interviewer for a ${role.replace('-', ' ')} position, provide brief constructive feedback on this candidate's answer:

Answer: "${userAnswer}"

Your feedback should:
- Be encouraging and professional
- Highlight what they did well
- Suggest one specific area for improvement if applicable
- Be concise (2-3 sentences maximum)
- End with "Let's continue with the next question" if appropriate

Feedback:`
          }]
        }]
      })
    });

    const data = await response.json();
    let feedback = '';
    
    if (response.ok && data.candidates && data.candidates[0]) {
      feedback = data.candidates[0].content.parts[0].text.trim();
    } else {
      feedback = "Thank you for your thoughtful answer. You provided good insight into your experience. Let's continue with the next question.";
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ feedback }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };