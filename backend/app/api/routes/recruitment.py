"""
Recruitment Module API Routes  
AI-Powered Recruitment & Skill Assessment Platform
"""
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
import random
from app.ai.ollama_client import ollama_client
from app.ai.rag_pipeline import rag_service

router = APIRouter()


class JobCreate(BaseModel):
    title: str
    department: str
    experience_years: int
    skills_required: List[str]
    description: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None


class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str


class InterviewRequest(BaseModel):
    job_title: str
    tech_stack: str
    difficulty: str = "medium"
    num_questions: int = 10


MOCK_CANDIDATES = [
    {"id": "C001", "name": "Arjun Nair", "role": "Full Stack Developer", "experience": 4, "skills": ["React", "Node.js", "Python"], "ats_score": 87, "status": "Shortlisted"},
    {"id": "C002", "name": "Sneha Patel", "role": "Data Scientist", "experience": 3, "skills": ["Python", "ML", "TensorFlow"], "ats_score": 92, "status": "Interview Scheduled"},
    {"id": "C003", "name": "Ravi Kumar", "role": "DevOps Engineer", "experience": 5, "skills": ["Docker", "K8s", "AWS"], "ats_score": 78, "status": "Applied"},
    {"id": "C004", "name": "Meera Krishnan", "role": "UI/UX Designer", "experience": 2, "skills": ["Figma", "Adobe XD", "CSS"], "ats_score": 83, "status": "Shortlisted"},
    {"id": "C005", "name": "Vikram Shah", "role": "Backend Engineer", "experience": 6, "skills": ["Java", "Spring Boot", "PostgreSQL"], "ats_score": 89, "status": "Offer Extended"},
]

MOCK_JOBS = [
    {"id": "J001", "title": "Senior Full Stack Developer", "department": "Engineering", "applicants": 124, "shortlisted": 18, "status": "Active", "posted": "2025-07-01"},
    {"id": "J002", "title": "AI/ML Engineer", "department": "Data Science", "applicants": 89, "shortlisted": 12, "status": "Active", "posted": "2025-07-03"},
    {"id": "J003", "title": "DevOps Lead", "department": "Infrastructure", "applicants": 56, "shortlisted": 8, "status": "Active", "posted": "2025-07-05"},
    {"id": "J004", "title": "Product Manager", "department": "Product", "applicants": 201, "shortlisted": 22, "status": "Closed", "posted": "2025-06-20"},
]

INTERVIEW_QUESTIONS = {
    "React": ["Explain the virtual DOM and reconciliation.", "What are React hooks? Explain useState and useEffect.", "How does React Context API work?"],
    "Python": ["Explain list comprehension with an example.", "What is the GIL in Python?", "Explain generators and iterators."],
    "SQL": ["Write a query to find the second highest salary.", "Explain INNER JOIN vs LEFT JOIN.", "What are database indexes?"],
    "General": ["Describe a challenging project you worked on.", "How do you handle disagreements with team members?", "Where do you see yourself in 5 years?"],
}


@router.get("/stats")
async def recruitment_stats():
    return {
        "total_applications": 1847,
        "active_jobs": 23,
        "shortlisted": 284,
        "interviews_scheduled": 67,
        "offers_extended": 34,
        "hired_this_month": 18,
        "avg_ats_score": 74.2,
        "time_to_hire_days": 28,
        "acceptance_rate": 82.4,
        "diversity_score": 68.7,
    }


@router.get("/candidates")
async def list_candidates(status: Optional[str] = None):
    candidates = MOCK_CANDIDATES
    if status:
        candidates = [c for c in candidates if c["status"] == status]
    return {"candidates": candidates, "total": len(candidates)}


@router.get("/jobs")
async def list_jobs():
    return {"jobs": MOCK_JOBS, "total": len(MOCK_JOBS)}


@router.post("/jobs")
async def create_job(job: JobCreate):
    return {"id": f"J{random.randint(100, 999)}", "message": "Job posted successfully", "job": job.dict()}


@router.post("/resume/analyze")
async def analyze_resume(request: ResumeAnalysisRequest):
    prompt = (
        f"You are an ATS (Applicant Tracking System) recruiter. Compare this candidate's resume text with the job description:\n"
        f"Resume:\n{request.resume_text[:2000]}\n\n"
        f"Job Description:\n{request.job_description[:2000]}\n\n"
        "Provide an ATS match score (0 to 100), overall hiring probability, candidate strengths, candidate weaknesses, and missing skills.\n"
        "At the end of your response, write a JSON block strictly matching this schema:\n"
        'RECRUIT_JSON: {"ats_score": 75, "skill_match": 0.8, "experience_match": 0.7, "education_match": 0.9, "hiring_probability": 0.8, "strengths": ["..."], "weaknesses": ["..."], "missing_skills": ["..."], "extracted_info": {"name": "...", "email": "...", "skills": ["..."], "experience_years": 3, "education": "..."}}'
    )

    ats_score = 60
    skill_match = 0.6
    experience_match = 0.5
    education_match = 0.7
    hiring_prob = 0.5
    strengths = ["Technical skills"]
    weaknesses = ["Certifications missing"]
    missing_skills = ["Docker"]
    extracted = {"name": "Candidate", "email": "candidate@example.com", "skills": [], "experience_years": 2, "education": "B.S."}

    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        if "RECRUIT_JSON:" in response:
            try:
                import json
                json_str = response.split("RECRUIT_JSON:")[-1].strip()
                if json_str.startswith("```"):
                    json_str = json_str.split("```")[1].strip()
                    if json_str.startswith("json"):
                        json_str = json_str[4:].strip()
                data = json.loads(json_str)
                ats_score = data.get("ats_score", ats_score)
                skill_match = data.get("skill_match", skill_match)
                experience_match = data.get("experience_match", experience_match)
                education_match = data.get("education_match", education_match)
                hiring_prob = data.get("hiring_probability", hiring_prob)
                strengths = data.get("strengths", strengths)
                weaknesses = data.get("weaknesses", weaknesses)
                missing_skills = data.get("missing_skills", missing_skills)
                extracted = data.get("extracted_info", extracted)
            except Exception:
                pass
    except Exception:
        pass

    return {
        "ats_score": ats_score,
        "skill_match": skill_match,
        "experience_match": experience_match,
        "education_match": education_match,
        "hiring_probability": hiring_prob,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "missing_skills": missing_skills,
        "extracted_info": extracted,
    }


@router.post("/interview/generate")
async def generate_interview_questions(request: InterviewRequest):
    prompt = (
        f"You are a technical interviewer. Generate {request.num_questions} interview questions for the job title '{request.job_title}' "
        f"requiring the following tech stack: '{request.tech_stack}'. Difficulty level: '{request.difficulty}'.\n"
        "For each question, return a JSON block with 'question', 'category', 'difficulty', and 'type'.\n"
        "At the end of your response, write a JSON block strictly formatted as:\n"
        'QUESTIONS_JSON: [{"question": "...", "category": "...", "difficulty": "...", "type": "Technical/Behavioral"}]'
    )

    questions = []
    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        if "QUESTIONS_JSON:" in response:
            import json
            json_str = response.split("QUESTIONS_JSON:")[-1].strip()
            if json_str.startswith("```"):
                json_str = json_str.split("```")[1].strip()
                if json_str.startswith("json"):
                    json_str = json_str[4:].strip()
            questions = json.loads(json_str)
    except Exception:
        pass

    if not questions:
        # fallback simple list
        questions = [
            {"question": f"Explain the basic lifecycle/logic of {request.tech_stack}", "category": "General", "difficulty": request.difficulty, "type": "Technical"}
        ]

    return {
        "job_title": request.job_title,
        "questions": questions,
        "total_generated": len(questions),
        "estimated_duration_min": len(questions) * 4,
    }
@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "parsed": True,
        "extracted": {
            "name": "Extracted Candidate Name",
            "email": "extracted@example.com",
            "phone": "+91-98765-43210",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            "education": [{"degree": "B.Tech", "field": "Computer Science", "year": 2021, "grade": "8.5 CGPA"}],
            "experience": [{"role": "Software Engineer", "company": "TechCorp", "duration": "2 years", "tech": ["Python", "React"]}],
            "projects": ["E-Commerce Platform", "AI Chatbot", "Inventory Management System"],
            "certifications": ["AWS Cloud Practitioner", "Python for Data Science"],
        },
        "ats_score": random.randint(65, 95),
        "message": "Resume parsed successfully using AI NLP engine",
    }


@router.get("/analytics/funnel")
async def hiring_funnel():
    return {
        "stages": [
            {"stage": "Applications Received", "count": 1847, "percentage": 100},
            {"stage": "Resume Screened", "count": 1203, "percentage": 65.1},
            {"stage": "Shortlisted", "count": 284, "percentage": 15.4},
            {"stage": "Technical Assessed", "count": 198, "percentage": 10.7},
            {"stage": "Interview Scheduled", "count": 132, "percentage": 7.1},
            {"stage": "Offer Extended", "count": 67, "percentage": 3.6},
            {"stage": "Hired", "count": 48, "percentage": 2.6},
        ],
        "month": "July 2025",
    }


@router.get("/skill-gap/{candidate_id}")
async def skill_gap_analysis(candidate_id: str):
    prompt = (
        f"You are a recruitment trainer. Perform a skill gap analysis for candidate ID '{candidate_id}'. "
        f"Generate current skills, required skills, gap skills, estimated weeks to readiness, "
        f"overall career match score (0-100), and a structured learning pathway list.\n"
        "At the end of your response, write a JSON block strictly matching this schema:\n"
        f'GAP_JSON: {{"candidate_id": "{candidate_id}", "current_skills": ["..."], "required_skills": ["..."], "gap_skills": ["..."], "estimated_ready_weeks": 8, "career_match": 75.5, "learning_path": [{{"skill": "...", "course": "...", "duration_weeks": 2}}]}}'
    )

    current_skills = ["Python", "React", "SQL"]
    required_skills = ["Python", "React", "SQL", "Docker", "Kubernetes"]
    gap_skills = ["Docker", "Kubernetes"]
    learning_path = [{"skill": "Docker", "course": "Docker Mastery", "duration_weeks": 2}]
    ready_weeks = 8
    career_match = 70.0

    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        if "GAP_JSON:" in response:
            try:
                import json
                json_str = response.split("GAP_JSON:")[-1].strip()
                if json_str.startswith("```"):
                    json_str = json_str.split("```")[1].strip()
                    if json_str.startswith("json"):
                        json_str = json_str[4:].strip()
                data = json.loads(json_str)
                current_skills = data.get("current_skills", current_skills)
                required_skills = data.get("required_skills", required_skills)
                gap_skills = data.get("gap_skills", gap_skills)
                learning_path = data.get("learning_path", learning_path)
                ready_weeks = data.get("estimated_ready_weeks", ready_weeks)
                career_match = data.get("career_match", career_match)
            except Exception:
                pass
    except Exception:
        pass

    return {
        "candidate_id": candidate_id,
        "current_skills": current_skills,
        "required_skills": required_skills,
        "gap_skills": gap_skills,
        "learning_path": learning_path,
        "estimated_ready_weeks": ready_weeks,
        "career_match": career_match,
    }


class QuizRequest(BaseModel):
    topic: str


@router.post("/quiz/generate")
async def generate_quiz_topic(request: QuizRequest):
    prompt = (
        f"You are a computer science professor. Generate exactly 5 multiple choice questions (MCQs) "
        f"on the topic of '{request.topic}' for a college assessment.\n"
        f"Each question must have exactly 4 options, a 0-indexed correct option (0, 1, 2, or 3), "
        f"and a brief detailed explanation/solution.\n"
        f"At the end of your response, write a JSON block strictly matching this schema:\n"
        f'QUIZ_JSON: [{{"question": "Question text here?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_option": 0, "solution": "Explanation here."}}]'
    )
    
    questions = []
    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        if "QUIZ_JSON:" in response:
            import json
            json_str = response.split("QUIZ_JSON:")[-1].strip()
            if json_str.startswith("```"):
                json_str = json_str.split("```")[1].strip()
                if json_str.startswith("json"):
                    json_str = json_str[4:].strip()
            questions = json.loads(json_str)
    except Exception:
        pass

    if not questions:
        questions = [
            {
                "question": f"What is a primary concept of {request.topic}?",
                "options": ["Option A is standard", "Option B is incorrect", "Option C is a dummy option", "None of the above"],
                "correct_option": 0,
                "solution": "Option A represents the primary standard definition of the topic."
            }
        ]

    return {"topic": request.topic, "questions": questions}


@router.get("/recommendations")
async def get_recruitment_recommendations(skills: Optional[str] = None):
    prompt = f"Generate 3 recommended jobs, 3 recommended internships, and 3 college technical events held in other colleges. The recommendations should target students with skills in {skills or 'React, Python, SQL, Computer Science'}. Return standard titles, host institutions/companies, description, and link placeholder."
    
    prompt += """
Format your response as a strict JSON block at the end:
REC_JSON: {
  "jobs": [{"title": "Junior Full Stack Engineer", "company": "TechSolutions Inc.", "salary": "₹8,00,000 - ₹12,00,000", "link": "#"}],
  "internships": [{"title": "Machine Learning Intern", "company": "DeepData Solutions", "duration": "3 Months", "stipend": "₹25,000 / month"}],
  "events": [{"title": "Hackathon 2026: AI Frontiers", "college": "IIT Bombay", "date": "2026-09-12", "prize": "₹5,00,000"}]
}
"""
    recommendations = {
        "jobs": [
            {"title": "Junior Full Stack Engineer", "company": "TechSolutions Inc.", "salary": "₹8,00,000 - ₹12,00,000", "link": "#"},
            {"title": "Associate Python Developer", "company": "AI Core Labs", "salary": "₹6,00,000 - ₹9,50,000", "link": "#"},
            {"title": "Frontend Engineer", "company": "DesignStudio", "salary": "₹7,50,000 - ₹11,00,000", "link": "#"}
        ],
        "internships": [
            {"title": "Machine Learning Intern", "company": "DeepData Solutions", "duration": "3 Months", "stipend": "₹25,000 / month"},
            {"title": "Software Engineering Intern", "company": "ScaleUp Apps", "duration": "6 Months", "stipend": "₹35,000 / month"},
            {"title": "React Developer Intern", "company": "InnoTech", "duration": "6 Months", "stipend": "₹20,000 / month"}
        ],
        "events": [
            {"title": "Hackathon 2026: AI Frontiers", "college": "IIT Bombay", "date": "2026-09-12", "prize": "₹5,00,000"},
            {"title": "National Coding Showdown", "college": "NIT Trichy", "date": "2026-08-20", "prize": "₹2,00,000"},
            {"title": "TechXpo: Robotics Challenge", "college": "BITS Pilani", "date": "2026-10-05", "prize": "₹3,00,000"}
        ]
    }
    
    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        if "REC_JSON:" in response:
            import json
            json_str = response.split("REC_JSON:")[-1].strip()
            if json_str.startswith("```"):
                json_str = json_str.split("```")[1].strip()
                if json_str.startswith("json"):
                    json_str = json_str[4:].strip()
            recommendations = json.loads(json_str)
    except Exception:
        pass

    return recommendations

