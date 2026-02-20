"use client"

import { useState } from "react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    matchAnalysis,
    type MatchAnalysisResponse,
    type MatchedSkill,
    type MissingSkill,
    type ImprovementSuggestion,
} from "@/lib/api"
import { Chart as SkillsRadar } from "../dashboard/chart"
import {
    Target,
    Zap,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ArrowRight,
    Sparkles,
    FileSearch,
    Clock,
    GraduationCap,
    Briefcase,
    Tag,
    TrendingUp,
    Shield,
    Lightbulb,
    BarChart3,
    Clipboard,
    Loader2,
} from "lucide-react"
import "@/app/dashboard/dashboard.css"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function verdictColor(verdict: string) {
    if (!verdict) return "text-red-600 bg-red-500/15"
    const v = verdict.toLowerCase()
    if (v.includes("strong")) return "text-emerald-600 bg-emerald-500/15"
    if (v.includes("good")) return "text-blue-600 bg-blue-500/15"
    if (v.includes("needs work")) return "text-amber-600 bg-amber-500/15"
    return "text-red-600 bg-red-500/15"
}

function strengthBadge(strength: MatchedSkill["strength"]) {
    const map = {
        strong: "bg-emerald-500/20 text-emerald-700",
        moderate: "bg-blue-500/20 text-blue-700",
        basic: "bg-slate-500/20 text-slate-600",
    }
    return map[strength] || map.basic
}

function importanceBadge(importance: MissingSkill["importance"]) {
    const map = {
        required: "bg-red-500/20 text-red-700",
        preferred: "bg-amber-500/20 text-amber-700",
        "nice-to-have": "bg-slate-500/20 text-slate-600",
    }
    return map[importance] || map["nice-to-have"]
}

function priorityIcon(priority: ImprovementSuggestion["priority"]) {
    if (priority === "high") return <Zap className="w-4 h-4 text-red-500" />
    if (priority === "medium") return <AlertTriangle className="w-4 h-4 text-amber-500" />
    return <ArrowRight className="w-4 h-4 text-blue-500" />
}

function matchColor(pct: number) {
    if (pct >= 80) return "text-emerald-600"
    if (pct >= 60) return "text-blue-600"
    if (pct >= 40) return "text-amber-600"
    return "text-red-600"
}

function matchStrength(pct: number) {
    if (pct >= 90) return "Exceptional"
    if (pct >= 80) return "Strong"
    if (pct >= 70) return "Good"
    if (pct >= 60) return "Decent"
    if (pct >= 40) return "Moderate"
    return "Weak"
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MatchAnalysisPage() {
    const [jdText, setJdText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<MatchAnalysisResponse | null>(null)

    const handleAnalyze = async () => {
        if (jdText.trim().length < 20) {
            setError("Please enter at least 20 characters for the Job Description.")
            return
        }
        setError(null)
        setLoading(true)
        try {
            const res = await matchAnalysis(jdText)
            if (res.error) {
                setError(res.error)
            } else if (res.data) {
                console.log("[MatchAnalysis] Full API Result:", res.data);
                if (res.data.skill_heatmap) {
                    console.log("[MatchAnalysis] Skill Heatmap Length:", res.data.skill_heatmap.length);
                } else {
                    console.warn("[MatchAnalysis] skill_heatmap is MISSING in response!");
                }
                setResult(res.data)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <ProtectedRoute>
            <div className="dashboard-theme">
                <DynamicNavbar />
                <main className="min-h-screen bg-background pt-28 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* ── Header ── */}
                        <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-2">
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                                        JD Match Analysis
                                    </h1>
                                    <p className="text-muted-foreground font-medium mt-1">
                                        Compare your resume against any Job Description and get AI-powered insights
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ── JD Input ── */}
                        <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <Card className="p-6 bg-card/50 backdrop-blur-sm border-none shadow-none">
                                <label htmlFor="jd-input" className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <Clipboard className="w-4 h-4 text-primary" />
                                    Paste Job Description
                                </label>
                                <textarea
                                    id="jd-input"
                                    rows={8}
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                    className="w-full rounded-xl border-none bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none shadow-sm"
                                    placeholder={"Paste the full Job Description here…\n\nFor example:\nSenior Frontend Engineer – React, TypeScript, Next.js\nRequirements:\n• 3+ years experience with React & TypeScript\n• Experience with CI/CD pipelines\n• Strong communication skills\n…"}
                                />

                                {error && (
                                    <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-muted-foreground">
                                        {jdText.length} characters · {jdText.length >= 20 ? "✓ ready" : `${20 - jdText.length} more needed`}
                                    </p>
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={loading || jdText.trim().length < 20}
                                        className="gap-2 bg-linear-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl px-6 shadow-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Analyzing…
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Analyze Match
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </section>

                        {/* ── Loading State ── */}
                        {loading && (
                            <section className="mb-10 animate-in fade-in duration-300">
                                <Card className="p-12 bg-card/50 backdrop-blur-sm flex flex-col items-center gap-4 border-none shadow-none">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        AI is analyzing your resume against this JD…
                                    </p>
                                    <p className="text-xs text-muted-foreground">This may take 10-15 seconds</p>
                                </Card>
                            </section>
                        )}

                        {result && !loading && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

                                {/* Top Overview Section — Consolidated Match Info & Heatmap */}
                                <section>
                                    <Card className="p-8 bg-card/50 backdrop-blur-sm border-none shadow-none no-zoom overflow-hidden relative group">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/30 via-primary to-primary/30" />
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                                            {/* Score & Verdict Column */}
                                            <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                                                <div className="space-y-1">
                                                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overall Match</h2>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-7xl font-black tracking-tighter text-foreground">
                                                            {result.match_percentage}%
                                                        </span>
                                                        <span className="text-lg font-bold text-primary animate-pulse">MATCH</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                                                    <div className={`px-6 py-2.5 rounded-2xl text-base font-black text-center shadow-lg shadow-primary/5 border-none ${verdictColor(result.overall_verdict)}`}>
                                                        {result.overall_verdict.toUpperCase()}
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between px-4 py-2 bg-foreground/5 rounded-xl border-none">
                                                        <span className="text-xs font-medium text-muted-foreground">AI Confidence</span>
                                                        <span className="text-sm font-bold text-foreground">{result.confidence_score}%</span>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                                                    Your profile shows <span className="text-foreground font-semibold">{matchStrength(result.match_percentage)}</span> alignment with this role's core requirements.
                                                </p>
                                            </div>

                                            {/* Radar Chart Column */}
                                            <div className="lg:col-span-3 flex justify-center w-full min-h-[350px]">
                                                {result.skill_heatmap && (Array.isArray(result.skill_heatmap) ? result.skill_heatmap.length > 0 : Object.keys(result.skill_heatmap).length > 0) ? (
                                                    <SkillsRadar 
                                                        data={Array.isArray(result.skill_heatmap) 
                                                            ? result.skill_heatmap 
                                                            : Object.entries(result.skill_heatmap).map(([k, v]) => ({ category: k, value: v }))
                                                        } 
                                                        title="Skill Alignment Heatmap"
                                                        description="Domain-specific compatibility breakdown"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 py-10 opacity-60">
                                                        <div className="relative">
                                                            <AlertTriangle className="w-12 h-12 text-muted-foreground/30 animate-pulse" />
                                                            <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1 opacity-40" />
                                                        </div>
                                                        <p className="text-xs text-center font-medium max-w-[160px]">
                                                            Processing domain analysis...
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Row 2 — Summary + Quick Stats */}
                                <section>
                                    <Card className="p-6 bg-card/50 backdrop-blur-sm border-none shadow-none relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Sparkles className="w-16 h-16 text-primary" />
                                        </div>
                                        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
                                            <BarChart3 className="w-5 h-5 text-primary" />
                                            Executive Summary
                                        </h2>
                                        <p className="text-sm text-foreground/80 leading-relaxed max-w-4xl">
                                            {result.summary}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                                            <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    {result.matched_skills?.length || 0}
                                                </p>
                                                <p className="text-xs text-emerald-700/70 font-medium">Matched Skills</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-red-500/10 text-center">
                                                <p className="text-2xl font-bold text-red-600">
                                                    {result.missing_skills?.length || 0}
                                                </p>
                                                <p className="text-xs text-red-700/70 font-medium">Missing Skills</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                                                <p className={`text-2xl font-bold ${matchColor(result.keyword_analysis?.keyword_match_rate || 0)}`}>
                                                    {result.keyword_analysis?.keyword_match_rate || 0}%
                                                </p>
                                                <p className="text-xs text-blue-700/70 font-medium">Keyword Match</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-purple-500/10 text-center">
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {result.improvement_suggestions?.length || 0}
                                                </p>
                                                <p className="text-xs text-purple-700/70 font-medium">Suggestions</p>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Row 2 — Matched + Missing Skills */}
                                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Matched Skills */}
                                    <Card className="p-6 bg-card/50 backdrop-blur-sm border-none shadow-none">
                                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            Matched Skills
                                            <span className="ml-auto text-xs font-normal text-muted-foreground">
                                                {result.matched_skills?.length || 0} found
                                            </span>
                                        </h2>
                                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                            {(result.matched_skills || []).map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-500/5 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-sm text-foreground">{s.skill}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${strengthBadge(s.strength)}`}>
                                                                {s.strength}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">{s.context}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!result.matched_skills || result.matched_skills.length === 0) && (
                                                <p className="text-sm text-muted-foreground text-center py-6">No matched skills detected</p>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Missing Skills */}
                                    <Card className="p-6 bg-card/50 backdrop-blur-sm border-none shadow-none">
                                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                                            <XCircle className="w-5 h-5 text-red-500" />
                                            Missing Skills
                                            <span className="ml-auto text-xs font-normal text-muted-foreground">
                                                {result.missing_skills?.length || 0} gaps
                                            </span>
                                        </h2>
                                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                            {(result.missing_skills || []).map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-red-500/5 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-sm text-foreground">{s.skill}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${importanceBadge(s.importance)}`}>
                                                                {s.importance}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                                                            <Lightbulb className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                                                            {s.suggestion}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!result.missing_skills || result.missing_skills.length === 0) && (
                                                <p className="text-sm text-muted-foreground text-center py-6">No missing skills — great match!</p>
                                            )}
                                        </div>
                                    </Card>
                                </section>

                                {/* Row 3 — Keyword, Experience, Education */}
                                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Keyword Analysis */}
                                    <Card className="p-5 bg-card/50 backdrop-blur-sm border-none shadow-none">
                                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground">
                                            <Tag className="w-4 h-4 text-primary" />
                                            Keyword Analysis
                                        </h3>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                                <span>Keyword Match Rate</span>
                                                <span className="font-bold">{result.keyword_analysis?.keyword_match_rate || 0}%</span>
                                            </div>
                                            <div className="h-2.5 rounded-full bg-border overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-all duration-1000"
                                                    style={{ width: `${result.keyword_analysis?.keyword_match_rate || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold text-emerald-600 mb-1.5">Found ({result.keyword_analysis?.jd_keywords_found?.length || 0})</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(result.keyword_analysis?.jd_keywords_found || []).map((kw, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-medium">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-red-500 mb-1.5">Missing ({result.keyword_analysis?.jd_keywords_missing?.length || 0})</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(result.keyword_analysis?.jd_keywords_missing || []).map((kw, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 font-medium">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Experience Match */}
                                    <Card className="p-5 bg-card/50 backdrop-blur-sm border-none shadow-none">
                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                            Experience Match
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                                <span className="text-xs text-muted-foreground">Required</span>
                                                <span className="text-sm font-bold text-foreground">{result.experience_match?.years_required}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                                <span className="text-xs text-muted-foreground">Your Experience</span>
                                                <span className="text-sm font-bold text-foreground">{result.experience_match?.years_detected}</span>
                                            </div>
                                            <div className={`flex items-center justify-between p-3 rounded-lg ${result.experience_match?.experience_fit === "full"
                                                    ? "bg-emerald-500/10"
                                                    : result.experience_match?.experience_fit === "partial"
                                                        ? "bg-amber-500/10"
                                                        : "bg-red-500/10"
                                                }`}>
                                                <span className="text-xs text-muted-foreground">Fit</span>
                                                <span className={`text-sm font-bold capitalize ${result.experience_match?.experience_fit === "full"
                                                        ? "text-emerald-600"
                                                        : result.experience_match?.experience_fit === "partial"
                                                            ? "text-amber-600"
                                                            : "text-red-600"
                                                    }`}>
                                                    {result.experience_match?.experience_fit || "Unknown"}
                                                </span>
                                            </div>
                                            {result.experience_match?.notes && (
                                                <p className="text-xs text-muted-foreground italic">{result.experience_match.notes}</p>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Education Match */}
                                    <Card className="p-5 bg-card/50 backdrop-blur-sm border-none shadow-none">
                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground">
                                            <GraduationCap className="w-4 h-4 text-primary" />
                                            Education Match
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-lg bg-muted/30">
                                                <p className="text-xs text-muted-foreground mb-1">Required</p>
                                                <p className="text-sm font-semibold text-foreground">{result.education_match?.required}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/30">
                                                <p className="text-xs text-muted-foreground mb-1">Your Education</p>
                                                <p className="text-sm font-semibold text-foreground">{result.education_match?.detected}</p>
                                            </div>
                                            <div className={`flex items-center gap-2 p-3 rounded-lg ${result.education_match?.match
                                                    ? "bg-emerald-500/10"
                                                    : "bg-red-500/10"
                                                }`}>
                                                {result.education_match?.match ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                                <span className={`text-sm font-bold ${result.education_match?.match ? "text-emerald-600" : "text-red-500"}`}>
                                                    {result.education_match?.match ? "Education Matches" : "Education Gap"}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Row 4 — Improvement Suggestions */}
                                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Card className="p-6 bg-card/50 backdrop-blur-sm border-none shadow-none">
                                        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-foreground">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                            Improvement Roadmap
                                        </h2>
                                        <div className="space-y-4">
                                            {(result.improvement_suggestions || []).map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-card/80 transition-all group"
                                                >
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0 group-hover:scale-110 transition-transform">
                                                        {priorityIcon(s.priority)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <span className="font-bold text-sm text-foreground">{s.category}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${s.priority === "high"
                                                                    ? "bg-red-500/15 text-red-600"
                                                                    : s.priority === "medium"
                                                                        ? "bg-amber-500/15 text-amber-600"
                                                                        : "bg-blue-500/15 text-blue-600"
                                                                }`}>
                                                                {s.priority} priority
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-foreground/80">{s.suggestion}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {s.estimated_effort}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Shield className="w-3 h-3" />
                                                                {s.impact}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!result.improvement_suggestions || result.improvement_suggestions.length === 0) && (
                                                <p className="text-sm text-muted-foreground text-center py-6">No suggestions — your resume is well-aligned!</p>
                                            )}
                                        </div>
                                    </Card>
                                </section>

                                {/* Analyze Again CTA */}
                                <section className="flex justify-center">
                                    <Button
                                        onClick={() => {
                                            setResult(null)
                                            setJdText("")
                                            window.scrollTo({ top: 0, behavior: "smooth" })
                                        }}
                                        variant="outline"
                                        className="gap-2 rounded-xl px-8 text-primary hover:bg-primary/10"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Analyze Another JD
                                    </Button>
                                </section>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}
