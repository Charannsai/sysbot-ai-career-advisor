import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { skills } = JSON.parse(event.body || '{}');
    
    if (!skills) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Skills are required' }),
      };
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As a career advisor AI, analyze these skills and provide exactly 3 career recommendations in JSON format:

Skills: "${skills}"

Please respond with ONLY a valid JSON array containing exactly 3 career objects. Each object must have:
- title: Career title
- match: Match percentage (e.g., "92%")
- description: Brief career description (max 100 chars)
- skillsUsed: Array of 3-4 relevant skills from the input
- roadmap: Array of 3-4 specific learning steps

Example format:
[
  {
    "title": "Software Engineer",
    "match": "92%",
    "description": "Build scalable applications using programming skills",
    "skillsUsed": ["JavaScript", "Problem Solving", "React"],
    "roadmap": ["Master advanced JavaScript", "Learn system design", "Practice algorithms"]
  }
]

Ensure realistic match percentages and practical roadmap steps.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate career suggestions');
    }

    let suggestions;
    try {
      const generatedText = data.candidates[0].content.parts[0].text;
      // Clean the response to extract JSON
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON format in response');
      }
    } catch (parseError) {
      // Fallback to mock data if parsing fails
      suggestions = [
        {
          title: "Software Engineer",
          match: "92%",
          description: "Build scalable applications using your programming skills",
          skillsUsed: ["Programming", "Problem Solving", "Technical Analysis"],
          roadmap: ["Master full-stack development", "Learn system design", "Practice algorithms", "Build portfolio projects"]
        },
        {
          title: "Data Scientist",
          match: "88%",
          description: "Analyze data to drive business insights and decisions",
          skillsUsed: ["Data Analysis", "Python", "Statistics"],
          roadmap: ["Master Python/R", "Learn machine learning", "Practice SQL", "Build data projects"]
        },
        {
          title: "Product Manager",
          match: "85%",
          description: "Lead product strategy and coordinate development teams",
          skillsUsed: ["Communication", "Analysis", "Strategy"],
          roadmap: ["Learn product frameworks", "Develop user research skills", "Master analytics tools", "Practice stakeholder management"]
        }
      ];
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ suggestions }),
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