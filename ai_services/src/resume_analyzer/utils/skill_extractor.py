
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("api key not found")


Client =  genai.Client(api_key=api_key)


def extract_skills(text):
    """
    Hybrid skill extraction using:
    1. Local keyword scan (fast)
    2. Gemini LLM refinement (semantic understanding)
    
    Returns:
        dict: {
            'tech_skills': list of technical skills,
            'soft_skills': list of soft skills,
            'projects': list of projects
        }
    """
   
    tech_keywords = [
            "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "GoLang", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
            "HTML", "CSS", "SASS", "Bootstrap", "Tailwind CSS", "React", "Next.js", "Angular", "Vue.js", "jQuery",
            "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET Core",
            "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Firebase", "Oracle", "Redis", "Cassandra",
            "AWS", "Azure", "Google Cloud", "Firebase", "Docker", "Kubernetes", "Jenkins", "Terraform", "CI/CD", "Ansible", "Linux", "Bash",
            "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "OpenCV", "NLP", "Hugging Face",
            "LLM", "LangChain", "RAG", "Transformers", "Machine Learning", "Deep Learning", "Neural Networks", "Computer Vision",
            "Apache Spark", "Hadoop", "Kafka", "Airflow", "ETL", "Data Warehousing", "Snowflake", "Databricks",
            "React Native", "Flutter", "SwiftUI", "Android Studio", "Xcode", "Ionic",
            "Ethical Hacking", "Penetration Testing", "Network Security", "Firewall", "Cryptography", "Wireshark",
            "Git", "GitHub", "Bitbucket", "Agile", "Scrum", "Jira", "VS Code", "Eclipse", "IntelliJ IDEA", "Postman",
            "Selenium", "JUnit", "PyTest", "Mocha", "Chai", "Jest", "Cypress", "Postman Testing", "Manual Testing", "Automation Testing",
            "Figma", "Adobe XD", "Photoshop", "Canva", "Wireframing", "Prototyping",
            "API Development", "Microservices", "GraphQL", "REST API", "WebSockets", "OAuth2", "JWT", "Blockchain", "Solidity", "IoT", "Edge Computing", "AR/VR", "Quantum Computing",
    ]

    soft_skills = [

        "Communication", "Active Listening", "Public Speaking", "Presentation Skills", "Negotiation", "Collaboration", "Teamwork", 
        "Interpersonal Skills", "Empathy", "Relationship Building", "Conflict Resolution", "Customer Service",
        "Problem Solving", "Analytical Thinking", "Critical Thinking", "Decision Making", "Creativity", "Innovation", 
        "Strategic Thinking", "Logical Reasoning", "Research Skills", "Troubleshooting",
        "Leadership", "Mentoring", "Coaching", "Team Management", "Project Management", "Delegation", "Accountability",
        "Goal Setting", "Motivational Skills", "Time Management", "Performance Management",
        "Adaptability", "Flexibility", "Resilience", "Work Ethic", "Integrity", "Reliability", "Discipline",
        "Self-Motivation", "Positive Attitude", "Emotional Intelligence", "Stress Management", "Patience",
        "Organizational Skills", "Multitasking", "Planning", "Prioritization", "Attention to Detail", "Focus", "Meeting Deadlines",
        "Remote Collaboration", "Cross-functional Communication", "Virtual Teamwork", "Feedback Management", "Stakeholder Communication",
        "Design Thinking", "Brainstorming", "Open-mindedness", "Storytelling", "Curiosity", "Continuous Learning",
        "Professionalism", "Cultural Awareness", "Ethical Judgment", "Diversity and Inclusion", "Accountability", "Confidentiality",
        "Self-Reflection", "Growth Mindset", "Goal Orientation", "Learning Agility", "Initiative"
    ]

    projects =[

    ]

    detected_tech_skills = [
        skill for skill in tech_keywords if skill.lower() in text.lower()
    ]

    detected_soft_skills = [
        skill for skill in soft_skills if skill.lower() in text.lower()
    ]
    detected_projects = [
        skill for skill in projects if skill.lower() in text.lower()
    ]

    prompt = f"""You are a resume analyzer AI. From the following resume text, extract all relevant information and output ONLY valid JSON (no markdown, no code blocks, no explanations).

            Extract:
            1. Technical skills - programming languages, frameworks, tools, technologies
            2. Soft skills - communication, leadership, teamwork, problem-solving, etc.
            3. Projects - project names or brief descriptions

            Output format (must be valid JSON):
            {{
                "tech_skills": ["skill1", "skill2", ...],
                "soft_skills": ["skill1", "skill2", ...],
                "projects": ["project1", "project2", ...]
            }}

            Resume Text:
            {text[:2000]}
            """

    result = {
        'tech_skills': detected_tech_skills.copy(),
        'soft_skills': detected_soft_skills.copy(),
        'projects': detected_projects.copy()
    }

    try:
        response = Client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        if response and response.text:
            gemini_output = response.text.strip()
            
            # Remove markdown code blocks if present
            if gemini_output.startswith('```json'):
                gemini_output = gemini_output[7:]
            elif gemini_output.startswith('```'):
                gemini_output = gemini_output[3:]
            if gemini_output.endswith('```'):
                gemini_output = gemini_output[:-3]
            gemini_output = gemini_output.strip()
            
            try:
                parsed_data = json.loads(gemini_output)
                
                # Merge tech skills
                if 'tech_skills' in parsed_data:
                    for skill in parsed_data['tech_skills']:
                        skill = skill.strip()
                        if skill and skill not in result['tech_skills']:
                            result['tech_skills'].append(skill)
                
                # Add soft skills
                if 'soft_skills' in parsed_data:
                    for skill in parsed_data['soft_skills']:
                        skill = skill.strip()
                        if skill and skill not in result['soft_skills']:
                            result['soft_skills'].append(skill)
                
                # Add projects
                if 'projects' in parsed_data:
                     for skill in parsed_data['projects']:
                        skill = skill.strip()
                        if skill and skill not in result['projects']:
                            result['projects'].append(skill)
                    
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON from Gemini: {e}")
                print(f"Raw output: {gemini_output[:200]}")
                
    except Exception as e:
        print("Gemini refinement failed:", e)

    return result 
    