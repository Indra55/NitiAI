"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Bell, Linkedin, MapPin, Briefcase, DollarSign, Star, ExternalLink, Settings, CheckCircle2, Wand2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import "@/app/dashboard/dashboard.css"

interface JobNotification {
    id: string
    title: string
    company: string
    location: string
    salary: string
    match: number
    posted: string
    type: "new" | "updated" | "recommended"
    description: string
    url?: string
}

export default function LinkedInJobsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<JobNotification[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<JobNotification | null>(null)
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
    const [savingApplication, setSavingApplication] = useState(false)

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true)
                console.log("Frontend: Fetching jobs from /api/jobs/linkedin")

                const token = localStorage.getItem("token")
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/jobs/linkedin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                })

                console.log("Frontend: Response status:", res.status, res.statusText)

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Frontend: Response error text:", errorText);
                    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`)
                }

                const data = await res.json()
                console.log("Frontend: Received data:", data)
                setNotifications(data.jobs || [])
            } catch (error) {
                console.error("Frontend: Error fetching jobs:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchJobs()
        } else {
            setLoading(false)
        }
    }, [user])

    const handleApplyClick = (job: JobNotification) => {
        // Open LinkedIn in a new tab
        if (job.url) {
            window.open(job.url, '_blank', 'noopener,noreferrer')
        }
        // Set the selected job and open the dialog
        setSelectedJob(job)
        setDialogOpen(true)
    }

    const handleTailorResume = (job: JobNotification) => {
        // Save the JD to localStorage
        localStorage.setItem("tailor_jd", job.description)
        // Navigate to resume builder
        router.push("/resume-builder")
    }

    const handleConfirmApplication = async () => {
        if (!selectedJob) return

        setSavingApplication(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/jobs/applications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    job_id: selectedJob.id,
                    job_title: selectedJob.title,
                    company: selectedJob.company,
                    location: selectedJob.location,
                    job_url: selectedJob.url,
                }),
            })

            if (res.ok) {
                // Add to applied jobs set to show visual feedback
                setAppliedJobs(prev => new Set(prev).add(selectedJob.id))
                console.log("Application saved successfully")
            } else {
                console.error("Failed to save application")
            }
        } catch (error) {
            console.error("Error saving application:", error)
        } finally {
            setSavingApplication(false)
            setDialogOpen(false)
            setSelectedJob(null)
        }
    }

    const handleCancelDialog = () => {
        setDialogOpen(false)
        setSelectedJob(null)
    }

    const stats = {
        total: notifications.length,
        new: notifications.filter((n) => n.type === "new").length,
        highMatch: notifications.filter((n) => n.match >= 90).length,
    }

    const typeColors = {
        new: "bg-emerald-500/20 text-emerald-600",
        updated: "bg-blue-500/20 text-blue-600",
        recommended: "bg-primary/20 text-primary",
    }

    return (
        <ProtectedRoute>
            <div className="dashboard-theme">
                <DynamicNavbar />
                <main className="min-h-screen bg-background pt-28 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Linkedin className="w-8 h-8 text-primary" />
                                        <h1 className="text-4xl font-bold">LinkedIn Job Notifications</h1>
                                    </div>
                                    <p className="text-muted-foreground">
                                        Personalized job alerts based on your profile and preferences
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="gap-2">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Button>
                                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                                        <Bell className="w-4 h-4" />
                                        Manage Alerts
                                    </Button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total Notifications</p>
                                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                        </div>
                                        <Bell className="w-6 h-6 text-primary opacity-70" />
                                    </div>
                                </Card>
                                <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">New Today</p>
                                            <p className="text-2xl font-bold text-foreground">{stats.new}</p>
                                        </div>
                                        <Star className="w-6 h-6 text-emerald-500 opacity-70" />
                                    </div>
                                </Card>
                                <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">High Match (90%+)</p>
                                            <p className="text-2xl font-bold text-foreground">{stats.highMatch}</p>
                                        </div>
                                        <Star className="w-6 h-6 text-primary opacity-70" />
                                    </div>
                                </Card>
                            </div>
                        </section>

                        {/* Job Notifications */}
                        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">Finding the best opportunities for you...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((job) => (
                                    <Card
                                        key={job.id}
                                        className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                                                    <Badge className={typeColors[job.type] || "bg-secondary"}>{job.type}</Badge>
                                                    <Badge className="bg-primary/20 text-primary">{job.match}% match</Badge>
                                                    {appliedJobs.has(job.id) && (
                                                        <Badge className="bg-emerald-500/20 text-emerald-600 gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Applied
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Briefcase className="w-4 h-4" />
                                                        {job.company}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {job.location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4" />
                                                        {job.salary}
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground mb-3">{job.description}</p>
                                                <p className="text-xs text-muted-foreground">Posted {job.posted}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                className="flex-1 bg-primary hover:bg-primary/90"
                                                onClick={() => handleApplyClick(job)}
                                            >
                                                Apply Now
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-primary/20 hover:bg-primary/5 text-primary"
                                                onClick={() => handleTailorResume(job)}
                                            >
                                                Tailor Resume
                                                <Wand2 className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">No jobs found matching your profile.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </main>

                {/* Application Confirmation Dialog */}
                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl">Did you apply for this job?</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="text-muted-foreground">
                                    {selectedJob && (
                                        <div className="mt-2 p-4 bg-secondary/30 rounded-lg">
                                            <p className="font-semibold text-foreground">{selectedJob.title}</p>
                                            <p className="text-sm">{selectedJob.company} • {selectedJob.location}</p>
                                        </div>
                                    )}
                                    <p className="mt-4">
                                        If you applied, we&apos;ll track this application to help you stay organized.
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCancelDialog} disabled={savingApplication}>
                                No, I didn&apos;t apply
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmApplication}
                                disabled={savingApplication}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {savingApplication ? "Saving..." : "Yes, I applied!"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ProtectedRoute>
    )
}