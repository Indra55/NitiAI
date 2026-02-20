/**
 * API Service Layer
 * Handles all communication with the backend server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    name?: string;
    phone?: string;
    location?: string;
    age?: number;
    proficiency_level?: string;
    preferred_work_mode?: string;
    availability_timeline?: string;
    career_goal_short?: string;
    career_goal_long?: string;
    onboarding_completed?: boolean;
    onboarding_step?: number;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    user: User;
    token: string;
}

interface RegisterResponse {
    message: string;
    user: User;
}

interface BasicInfoData {
    name: string;
    phone?: string;
    age?: number;
    gender?: string;
    location?: string;
}

interface CareerGoalsData {
    role: string;
    status?: string;
    experience?: string;
}

interface SkillsData {
    skills: string[];
}

// Helper to make authenticated requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const token = localStorage.getItem("token");

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };

        if (token) {
            (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: "include", // Include cookies for JWT
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || "An error occurred" };
        }

        return { data };
    } catch (error) {
        console.error("API request failed:", error);
        return { error: "Network error. Please check your connection." };
    }
}

// ==================== AUTH API ====================

export async function register(userData: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    return apiRequest<RegisterResponse>("/api/users/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });
}

export async function login(credentials: LoginData): Promise<ApiResponse<LoginResponse>> {
    const result = await apiRequest<LoginResponse>("/api/users/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    // Store token in localStorage if login successful
    if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
    }

    return result;
}

export async function logout(): Promise<ApiResponse<{ message: string }>> {
    const result = await apiRequest<{ message: string }>("/api/users/logout", {
        method: "POST",
    });

    // Clear token from localStorage
    localStorage.removeItem("token");

    return result;
}

export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest<{ user: User }>("/api/users/me");
}

export async function updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ message: string; user: User }>> {
    return apiRequest<{ message: string; user: User }>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(profileData),
    });
}

// ==================== ONBOARDING API ====================

export async function submitBasicInfo(data: BasicInfoData): Promise<ApiResponse<{ message: string; next_step: number }>> {
    return apiRequest<{ message: string; next_step: number }>("/api/onboarding/basic-info", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function submitCareerGoals(data: CareerGoalsData): Promise<ApiResponse<{ message: string; next_step: number }>> {
    return apiRequest<{ message: string; next_step: number }>("/api/onboarding/career-goals", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function submitSkills(data: SkillsData): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>("/api/onboarding/skills", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ==================== RESUME API ====================

export interface ResumeInfo {
    extracted_name: string;
    extracted_email: string;
    extracted_phone: string;
    extracted_location: string;
    linkedin_url: string;
    portfolio_url: string;
    professional_title: string;
    years_of_experience: number;
    professional_summary: string;
    technical_skills: string[];
    soft_skills: string[];
    education: Array<{
        degree: string;
        institution: string;
        field: string;
        year?: string;
        graduation_year?: string;
        field_of_study?: string;
    }>;
    experience: Array<{
        title: string;
        company: string;
        start?: string;
        end?: string;
        start_date?: string;
        end_date?: string;
        description: string;
    }>;
    projects: Array<{
        name: string;
        description: string;
        technologies: string[];
        url: string;
    }>;
    certifications: string[];
    completeness_score: number;
    ats_score: number;
    strengths: string[];
    improvement_areas: string[];
    career_insights?: any;
    skill_heatmap?: Array<{ category: string; value: number }>;
    uploaded_at: string;
    updated_at: string;
}

export async function uploadResume(file: File): Promise<ApiResponse<{ message: string; data: unknown }>> {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("resume", file);

        const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: "include",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || "Failed to upload resume" };
        }

        return { data };
    } catch (error) {
        console.error("Resume upload failed:", error);
        return { error: "Failed to upload resume. Please try again." };
    }
}

export async function getResumeInfo(): Promise<ApiResponse<ResumeInfo>> {
    return apiRequest<ResumeInfo>("/api/resume/info");
}

export interface TailoredResumeResponse {
    tailored_resume_data: ResumeInfo;
    changes_made: string[];
    match_score_improvement: string;
}

export async function tailorResume(jobDescription: string): Promise<ApiResponse<TailoredResumeResponse>> {
    return apiRequest<TailoredResumeResponse>("/api/resume/tailor", {
        method: "POST",
        body: JSON.stringify({ jobDescription }),
    });
}

export async function updateResume(currentData: ResumeInfo, instruction: string): Promise<ApiResponse<ResumeInfo>> {
    return apiRequest<ResumeInfo>("/api/resume/update", {
        method: "POST",
        body: JSON.stringify({ currentData, instruction }),
    });
}

export async function generateLaTeX(data: ResumeInfo, template: string): Promise<ApiResponse<{ latex_code: string }>> {
    return apiRequest<{ latex_code: string }>("/api/resume/generate-latex", {
        method: "POST",
        body: JSON.stringify({ data, template }),
    });
}

export async function chatInsights(query: string): Promise<ApiResponse<{ response: string }>> {
    return apiRequest<{ response: string }>("/api/resume/chat-insights", {
        method: "POST",
        body: JSON.stringify({ query }),
    });
}

// ==================== MATCH ANALYSIS API ====================

export interface MatchedSkill {
    skill: string;
    context: string;
    strength: "strong" | "moderate" | "basic";
}

export interface MissingSkill {
    skill: string;
    importance: "required" | "preferred" | "nice-to-have";
    suggestion: string;
}

export interface ImprovementSuggestion {
    category: string;
    priority: "high" | "medium" | "low";
    suggestion: string;
    estimated_effort: string;
    impact: string;
}

export interface MatchAnalysisResponse {
    match_percentage: number;
    summary: string;
    matched_skills: MatchedSkill[];
    missing_skills: MissingSkill[];
    keyword_analysis: {
        jd_keywords_found: string[];
        jd_keywords_missing: string[];
        keyword_match_rate: number;
    };
    experience_match: {
        years_required: string;
        years_detected: string;
        experience_fit: string;
        notes: string;
    };
    education_match: {
        required: string;
        detected: string;
        match: boolean;
    };
    analysis_summary?: {
        current_level: string;
        primary_domain: string;
        profile_strength_score: number;
        profile_completeness: number;
    };
    improvement_suggestions: ImprovementSuggestion[];
    skill_heatmap?: Array<{ category: string; value: number }>;
    overall_verdict: string;
    confidence_score: number;
    analyzed_at: string;
}

export async function matchAnalysis(jobDescription: string): Promise<ApiResponse<MatchAnalysisResponse>> {
    // Call backend directly — this AI call can take 30-60s which exceeds Next.js proxy timeout
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555";
    try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

        const response = await fetch(`${BACKEND_URL}/api/resume/match-analysis`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({ jobDescription }),
            signal: controller.signal,
        });

        clearTimeout(timeout);
        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || "Match analysis failed" };
        }
        return { data };
    } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
            return { error: "Analysis timed out. Please try again." };
        }
        console.error("Match analysis failed:", error);
        return { error: "Network error. Please check your connection." };
    }
}

// ==================== DASHBOARD API ====================

export interface DashboardData {
    user_id: string;
    user_name: string;
    profile_overview: {
        completeness_percentage: number;
        completeness_breakdown: {
            basic_info: number;
            skills: number;
            education: number;
            experience: number;
            preferences: number;
            resume: number;
            peer_learning: number;
        };
        onboarding_completed: boolean;
        has_resume: boolean;
        resume_score: number | null;
    };
    career_dashboard: {
        profile_summary?: {
            current_level: string;
            primary_domain: string;
            profile_strength_score: number;
            profile_completeness: number;
        };
        recommended_career_paths?: Array<{
            title: string;
            match_score: number;
            reasoning: string;
            skill_gaps: string[];
            estimated_transition_time: string;
            salary_range: string;
            growth_outlook: string;
        }>;
        trending_roles_2026?: Array<{
            title: string;
            demand_level: string;
            why_trending: string;
            relevance_to_profile: string;
        }>;
        fast_growing_industries?: Array<{
            industry: string;
            growth_rate: string;
            key_roles: string[];
            skills_needed: string[];
            fit_for_profile: string;
        }>;
        skill_development_priorities?: Array<{
            skill: string;
            priority: string;
            reason: string;
            learning_resources: string[];
            estimated_time: string;
        }>;
        career_trajectory?: {
            short_term_goal: string;
            medium_term_goal: string;
            long_term_vision: string;
        };
        action_items?: string[];
        skill_heatmap?: Array<{ category: string; value: number }>;
        generated_at?: string;
        data_sources?: string[];
    };
    quick_stats: {
        total_skills: number;
        technical_skills_count: number;
        years_of_experience: number;
        education_count: number;
        experience_count: number;
        current_goal: string;
    };
    generated_at: string;
}

export interface CareerRecommendation {
    title: string;
    reason: string;
    match_score: number;
}

export interface Skill {
    id: string;
    skill_name: string;
    skill_type?: string;
    proficiency?: number;
}

export interface Education {
    id: string;
    degree: string;
    major: string;
    institution: string;
    graduation_year: number;
}

export interface Experience {
    id: string;
    title: string;
    organization: string;
    description: string;
    start_date: string;
    end_date: string;
}

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return apiRequest<DashboardData>("/api/recommendations/dashboard");
}

export async function getCareerRecommendations(): Promise<ApiResponse<{ user_id: string; recommendations: CareerRecommendation[] }>> {
    return apiRequest<{ user_id: string; recommendations: CareerRecommendation[] }>("/api/recommendations/career");
}

export async function getTrendingRoles(): Promise<ApiResponse<unknown>> {
    return apiRequest<unknown>("/api/recommendations/trending");
}

export async function getSkills(): Promise<ApiResponse<{ skills: Skill[] }>> {
    return apiRequest<{ skills: Skill[] }>("/api/skills");
}

// ==================== PROFILE API ====================

export async function getProfileData(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest<{ user: User }>("/api/users/me");
}

export async function getEducation(): Promise<ApiResponse<{ education: Education[] }>> {
    return apiRequest<{ education: Education[] }>("/api/profile/education");
}

export async function getExperience(): Promise<ApiResponse<{ experience: Experience[] }>> {
    return apiRequest<{ experience: Experience[] }>("/api/profile/experience");
}

// Export types
export type { User, RegisterData, LoginData, BasicInfoData, CareerGoalsData, SkillsData };
