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
            text: `You are a career advisor AI. Analyze the following skills and provide exactly 3 DIVERSE career recommendations. Make sure to suggest different types of careers (technical, creative, business, etc.) based on the skills provided.

Skills: "${skills}"

IMPORTANT: Respond with ONLY valid JSON. No additional text, explanations, or markdown formatting.

Provide exactly 3 career objects in this exact format:
[
  {
    "title": "Career Title",
    "match": "XX%",
    "description": "Brief description under 120 characters",
    "skillsUsed": ["skill1", "skill2", "skill3"],
    "roadmap": [
      "Step 1 with timeframe",
      "Step 2 with timeframe",
      "Step 3 with timeframe",
      "Step 4 with timeframe",
      "Step 5 with timeframe"
    ],
    "resources": [
      {
        "name": "Resource Name",
        "url": "https://example.com",
        "type": "course",
        "description": "Resource description"
      },
      {
        "name": "Resource Name 2",
        "url": "https://example2.com",
        "type": "tutorial",
        "description": "Resource description 2"
      },
      {
        "name": "Resource Name 3",
        "url": "https://example3.com",
        "type": "practice",
        "description": "Resource description 3"
      }
    ]
  }
]

Requirements:
- Suggest 3 DIFFERENT career types (not all technical or all business)
- Match percentages should vary (e.g., 92%, 85%, 78%)
- Include real, working URLs to free resources
- Each career should have 5 roadmap steps with timeframes
- Each career should have 3-4 resources
- Resources must be free and accessible`
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
      const generatedText = data.candidates[0].content.parts[0].text.trim();
      console.log('Raw Gemini response:', generatedText);
      
      // Try to extract JSON from the response
      let jsonText = generatedText;
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      
      // Try to find JSON array in the text
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      // Parse the JSON
      suggestions = JSON.parse(jsonText);
      
      // Validate the structure
      if (!Array.isArray(suggestions) || suggestions.length !== 3) {
        throw new Error('Invalid suggestions format');
      }
      
      // Ensure each suggestion has required fields
      suggestions = suggestions.map((career, index) => ({
        title: career.title || `Career Option ${index + 1}`,
        match: career.match || `${90 - index * 5}%`,
        description: career.description || 'Career description not available',
        skillsUsed: career.skillsUsed || ['Skill 1', 'Skill 2', 'Skill 3'],
        roadmap: career.roadmap || ['Learning step 1', 'Learning step 2', 'Learning step 3'],
        resources: career.resources || []
      }));
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Generate diverse fallback suggestions based on skills
      const skillsLower = skills.toLowerCase();
      const fallbackSuggestions = [];
      
      // Determine career suggestions based on skills mentioned
      if (skillsLower.includes('programming') || skillsLower.includes('coding') || skillsLower.includes('javascript') || skillsLower.includes('python') || skillsLower.includes('software')) {
        fallbackSuggestions.push({
          title: "Software Engineer",
          match: "92%",
          description: "Build scalable applications using your programming skills",
          skillsUsed: ["Programming", "Problem Solving", "Technical Analysis"],
          roadmap: [
            "Master programming fundamentals (2-3 months)",
            "Learn modern frameworks (2-3 months)",
            "Understand backend development (2-3 months)",
            "Practice algorithms daily (ongoing)",
            "Build portfolio projects (3-4 months)"
          ],
          resources: [
            {
              name: "freeCodeCamp",
              url: "https://www.freecodecamp.org/",
              type: "course",
              description: "Comprehensive programming courses"
            },
            {
              name: "LeetCode",
              url: "https://leetcode.com/",
              type: "practice",
              description: "Algorithm practice platform"
            },
            {
              name: "The Odin Project",
              url: "https://www.theodinproject.com/",
              type: "course",
              description: "Full-stack development curriculum"
            }
          ]
        });
      }
      
      if (skillsLower.includes('data') || skillsLower.includes('analysis') || skillsLower.includes('statistics') || skillsLower.includes('machine learning')) {
        fallbackSuggestions.push({
          title: "Data Scientist",
          match: "88%",
          description: "Analyze data to drive business insights and decisions",
          skillsUsed: ["Data Analysis", "Statistics", "Python"],
          roadmap: [
            "Master Python for data science (2-3 months)",
            "Learn statistics fundamentals (2-3 months)",
            "Understand machine learning (3-4 months)",
            "Practice with real datasets (ongoing)",
            "Build data science portfolio (3-4 months)"
          ],
          resources: [
            {
              name: "Kaggle Learn",
              url: "https://www.kaggle.com/learn",
              type: "course",
              description: "Free data science micro-courses"
            },
            {
              name: "Python.org Tutorial",
              url: "https://docs.python.org/3/tutorial/",
              type: "tutorial",
              description: "Official Python tutorial"
            },
            {
              name: "Kaggle Competitions",
              url: "https://www.kaggle.com/competitions",
              type: "practice",
              description: "Data science competitions"
            }
          ]
        });
      }
      
      if (skillsLower.includes('design') || skillsLower.includes('ui') || skillsLower.includes('ux') || skillsLower.includes('creative')) {
        fallbackSuggestions.push({
          title: "UX Designer",
          match: "85%",
          description: "Create intuitive user experiences and interfaces",
          skillsUsed: ["Design Thinking", "User Research", "Prototyping"],
          roadmap: [
            "Learn design fundamentals (2-3 months)",
            "Master design tools (1-2 months)",
            "Understand user research (2-3 months)",
            "Practice prototyping (ongoing)",
            "Build design portfolio (3-4 months)"
          ],
          resources: [
            {
              name: "Google UX Design Course",
              url: "https://www.coursera.org/professional-certificates/google-ux-design",
              type: "course",
              description: "Free Google UX design certificate"
            },
            {
              name: "Figma Academy",
              url: "https://www.figma.com/academy/",
              type: "tutorial",
              description: "Free Figma design tutorials"
            },
            {
              name: "Material Design",
              url: "https://material.io/design",
              type: "documentation",
              description: "Google's design system guidelines"
            }
          ]
        });
      }
      
      if (skillsLower.includes('management') || skillsLower.includes('leadership') || skillsLower.includes('strategy') || skillsLower.includes('business')) {
        fallbackSuggestions.push({
          title: "Product Manager",
          match: "82%",
          description: "Lead product strategy and coordinate development teams",
          skillsUsed: ["Strategy", "Communication", "Analysis"],
          roadmap: [
            "Learn product management basics (1-2 months)",
            "Understand user research (2-3 months)",
            "Master analytics tools (2-3 months)",
            "Practice stakeholder management (ongoing)",
            "Build product case studies (2-3 months)"
          ],
          resources: [
            {
              name: "Product School YouTube",
              url: "https://www.youtube.com/c/ProductSchool",
              type: "tutorial",
              description: "Product management tutorials"
            },
            {
              name: "Mind the Product",
              url: "https://www.mindtheproduct.com/",
              type: "documentation",
              description: "Product management resources"
            },
            {
              name: "Product Hunt",
              url: "https://www.producthunt.com/",
              type: "practice",
              description: "Discover and analyze products"
            }
          ]
        });
      }
      
      if (skillsLower.includes('marketing') || skillsLower.includes('social media') || skillsLower.includes('content') || skillsLower.includes('communication')) {
        fallbackSuggestions.push({
          title: "Digital Marketing Manager",
          match: "80%",
          description: "Drive online marketing campaigns and brand growth",
          skillsUsed: ["Marketing", "Analytics", "Content Creation"],
          roadmap: [
            "Learn digital marketing fundamentals (1-2 months)",
            "Master social media marketing (1-2 months)",
            "Understand SEO and SEM (2-3 months)",
            "Practice content creation (ongoing)",
            "Build marketing portfolio (2-3 months)"
          ],
          resources: [
            {
              name: "Google Digital Marketing Course",
              url: "https://learndigital.withgoogle.com/digitalgarage",
              type: "course",
              description: "Free Google digital marketing course"
            },
            {
              name: "HubSpot Academy",
              url: "https://academy.hubspot.com/",
              type: "course",
              description: "Free marketing courses and certifications"
            },
            {
              name: "Moz SEO Guide",
              url: "https://moz.com/beginners-guide-to-seo",
              type: "tutorial",
              description: "Comprehensive SEO learning guide"
            }
          ]
        });
      }
      
      // Ensure we have at least 3 suggestions
      if (fallbackSuggestions.length < 3) {
        const additionalSuggestions = [
          {
            title: "Business Analyst",
            match: "78%",
            description: "Analyze business processes and recommend improvements",
            skillsUsed: ["Analysis", "Problem Solving", "Communication"],
            roadmap: [
              "Learn business analysis fundamentals (1-2 months)",
              "Master data analysis tools (2-3 months)",
              "Understand process mapping (1-2 months)",
              "Practice stakeholder interviews (ongoing)",
              "Build analysis portfolio (2-3 months)"
            ],
            resources: [
              {
                name: "Coursera Business Analysis",
                url: "https://www.coursera.org/courses?query=business%20analysis",
                type: "course",
                description: "Free business analysis courses"
              },
              {
                name: "Microsoft Excel Training",
                url: "https://support.microsoft.com/en-us/office/excel-help-center-1f1c78ab-a9d9-4266-b518-c6b619b3e7e1",
                type: "tutorial",
                description: "Free Excel tutorials and training"
              },
              {
                name: "IIBA Resources",
                url: "https://www.iiba.org/career-resources/",
                type: "documentation",
                description: "Business analysis career resources"
              }
            ]
          },
          {
            title: "Project Manager",
            match: "75%",
            description: "Lead projects from initiation to completion",
            skillsUsed: ["Leadership", "Organization", "Communication"],
            roadmap: [
              "Learn project management basics (1-2 months)",
              "Understand Agile methodologies (1-2 months)",
              "Master project tools (1-2 months)",
              "Practice team leadership (ongoing)",
              "Build project portfolio (2-3 months)"
            ],
            resources: [
              {
                name: "Google Project Management",
                url: "https://www.coursera.org/professional-certificates/google-project-management",
                type: "course",
                description: "Free Google project management certificate"
              },
              {
                name: "PMI Resources",
                url: "https://www.pmi.org/learning/library",
                type: "documentation",
                description: "Project management resources"
              },
              {
                name: "Trello Guide",
                url: "https://trello.com/guide",
                type: "tutorial",
                description: "Project management tool tutorials"
              }
            ]
          }
        ];
        
        fallbackSuggestions.push(...additionalSuggestions.slice(0, 3 - fallbackSuggestions.length));
      }
      
      suggestions = fallbackSuggestions.slice(0, 3);
    }
    
    console.log('Final suggestions:', JSON.stringify(suggestions, null, 2));

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