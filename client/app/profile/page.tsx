"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Edit,
  Upload,
  FileText,
  Linkedin,
  Globe,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  ExternalLink,
  Clock,
  Building2,
  RefreshCw,
  Save,
  X,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import "@/app/dashboard/dashboard.css"
import { getResumeInfo, uploadResume, ResumeInfo, updateProfile, getProfileData } from "@/lib/api"
import { toaster } from "@/lib/toaster"
import { Spinner } from "@/components/ui/spinner"

interface JobApplication {
  id: string
  job_id: string
  job_title: string
  company: string
  location: string
  job_url: string
  applied_at: string
  status: string
  notes: string | null
}

interface ProfileFormData {
  username: string
  name: string
  email: string
  phone: string
  location: string
  age: string
  proficiency_level: string
  preferred_work_mode: string
  availability_timeline: string
  career_goal_short: string
  career_goal_long: string
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Profile Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [profileData, setProfileData] = useState<ProfileFormData>({
    username: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    age: "",
    proficiency_level: "",
    preferred_work_mode: "",
    availability_timeline: "",
    career_goal_short: "",
    career_goal_long: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getResumeInfo()
        if (response.data) {
          setResumeInfo(response.data)
        } else if (response.error) {
          // If no resume found, that's okay, we'll show empty state
          if (!response.error.includes("No resume found")) {
            setError(response.error)
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch job applications
  useEffect(() => {
    async function fetchApplications() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/jobs/applications`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setApplications(data.applications || [])
        }
      } catch (err) {
        console.error("Failed to fetch applications", err)
      } finally {
        setLoadingApplications(false)
      }
    }
    fetchApplications()
  }, [])

  // Handle resume upload
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadSuccess(false)
    setError(null)

    try {
      const response = await uploadResume(file)
      if (response.error) {
        setError(response.error)
        toaster.create({
          title: "Upload Failed",
          description: response.error,
          type: "error"
        })
      } else {
        setUploadSuccess(true)
        toaster.create({
          title: "Upload Successful",
          description: "Resume uploaded successfully!",
          type: "success"
        })
        // Refresh resume info after successful upload
        const infoResponse = await getResumeInfo()
        if (infoResponse.data) {
          setResumeInfo(infoResponse.data)
        }
        // Reset success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000)
      }
    } catch (err) {
      console.error("Upload failed:", err)
      setError("Failed to upload resume. Please try again.")
      toaster.create({
        title: "Upload Error",
        description: "Failed to upload resume. Please try again.",
        type: "error"
      })
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Open edit dialog and populate with current data
  const openEditDialog = async () => {
    // First fetch fresh profile data
    try {
      const response = await getProfileData()
      if (response.data?.user) {
        const userData = response.data.user
        setProfileData({
          username: userData.username || "",
          name: userData.name || resumeInfo?.extracted_name || "",
          email: userData.email || "",
          phone: userData.phone || resumeInfo?.extracted_phone || "",
          location: userData.location || resumeInfo?.extracted_location || "",
          age: userData.age?.toString() || "",
          proficiency_level: userData.proficiency_level || "",
          preferred_work_mode: userData.preferred_work_mode || "",
          availability_timeline: userData.availability_timeline || "",
          career_goal_short: userData.career_goal_short || "",
          career_goal_long: userData.career_goal_long || "",
        })
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err)
      // Fall back to current user state
      setProfileData({
        username: user?.username || "",
        name: user?.name || resumeInfo?.extracted_name || "",
        email: user?.email || "",
        phone: user?.phone || resumeInfo?.extracted_phone || "",
        location: user?.location || resumeInfo?.extracted_location || "",
        age: user?.age?.toString() || "",
        proficiency_level: user?.proficiency_level || "",
        preferred_work_mode: user?.preferred_work_mode || "",
        availability_timeline: user?.availability_timeline || "",
        career_goal_short: user?.career_goal_short || "",
        career_goal_long: user?.career_goal_long || "",
      })
    }
    setEditDialogOpen(true)
    setSaveSuccess(false)
  }

  // Handle form input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true)
    setError(null)

    try {
      const dataToSend = {
        ...profileData,
        age: profileData.age ? parseInt(profileData.age) : undefined,
      }

      const response = await updateProfile(dataToSend)

      if (response.error) {
        setError(response.error)
        toaster.create({
          title: "Save Failed",
          description: response.error,
          type: "error"
        })
      } else {
        setSaveSuccess(true)
        toaster.create({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
          type: "success"
        })
        // Refresh user data in auth context
        if (refreshUser) {
          await refreshUser()
        }
        // Close dialog after short delay to show success
        setTimeout(() => {
          setEditDialogOpen(false)
          setSaveSuccess(false)
        }, 1500)
      }
    } catch (err) {
      console.error("Failed to save profile:", err)
      setError("Failed to save profile. Please try again.")
      toaster.create({
        title: "Save Error",
        description: "Failed to save profile. Please try again.",
        type: "error"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-500/20 text-blue-600'
      case 'interviewing':
        return 'bg-purple-500/20 text-purple-600'
      case 'offered':
        return 'bg-emerald-500/20 text-emerald-600'
      case 'rejected':
        return 'bg-red-500/20 text-red-600'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-background text-foreground selection:bg-primary/20">
        <DynamicNavbar />

        {/* Hero Section with Glassmorphism */}
        <div className="relative pt-32 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-primary/20 to-transparent z-0" />
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-full opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                <Avatar className="w-32 h-32 border-4 border-background relative">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-linear-to-br from-gray-800 to-gray-900 text-white text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                      {resumeInfo?.extracted_name || user?.name || "Welcome, User"}
                    </h1>
                    <p className="text-xl text-muted-foreground flex items-center gap-2 mt-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      {resumeInfo?.professional_title || "Career Explorer"}
                    </p>
                  </div>


                  <div className="flex gap-3">
                    {/* Hidden file input for resume upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                    />

                    {/* Resume Upload/Re-upload Button */}
                    <Button
                      variant="outline"
                      className="rounded-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={triggerFileUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Spinner className="w-4 h-4" />
                          Uploading...
                        </>
                      ) : resumeInfo ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Update Resume
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Resume
                        </>
                      )}
                    </Button>

                    {resumeInfo?.linkedin_url && (
                      <Button variant="outline" size="icon" className="rounded-full hover:bg-[#0077b5] hover:text-white transition-colors" asChild>
                        <a href={resumeInfo.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      </Button>
                    )}
                    {resumeInfo?.portfolio_url && (
                      <Button variant="outline" size="icon" className="rounded-full hover:bg-emerald-500 hover:text-white transition-colors" asChild>
                        <a href={resumeInfo.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-5 h-5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                      onClick={openEditDialog}
                    >
                      <Edit className="w-4 h-4" /> Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  {(resumeInfo?.extracted_location || user?.location) && (
                    <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1 rounded-full border border-secondary/50">
                      <MapPin className="w-4 h-4 text-primary" />
                      {resumeInfo?.extracted_location || user?.location}
                    </div>
                  )}
                  {resumeInfo?.extracted_email && (
                    <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1 rounded-full border border-secondary/50">
                      <Mail className="w-4 h-4 text-primary" />
                      {resumeInfo.extracted_email}
                    </div>
                  )}
                  {resumeInfo?.extracted_phone && (
                    <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1 rounded-full border border-secondary/50">
                      <Phone className="w-4 h-4 text-primary" />
                      {resumeInfo.extracted_phone}
                    </div>
                  )}
                  {resumeInfo?.years_of_experience !== undefined && (
                    <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1 rounded-full border border-secondary/50">
                      <Calendar className="w-4 h-4 text-primary" />
                      {resumeInfo.years_of_experience} Years Exp.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="applications" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Job Applications
                {applications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">
                    {applications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab Content */}
            <TabsContent value="profile">
              {/* Upload Success/Error Notifications */}


              {!resumeInfo ? (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-border/50 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">No Profile Data Found</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Upload your resume to automatically generate your professional profile and get personalized career insights.
                  </p>
                  <Button
                    size="lg"
                    className="rounded-full gap-2"
                    onClick={triggerFileUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Spinner className="w-5 h-5" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column - Stats & Skills */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Scores Card */}
                    <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Profile Strength
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 p-4 rounded-2xl border border-border/50 text-center">
                          <div className="text-3xl font-bold text-primary mb-1">{resumeInfo.completeness_score}%</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Completeness</div>
                          <Progress value={resumeInfo.completeness_score} className="h-1.5 mt-3" />
                        </div>
                        <div className="bg-background/50 p-4 rounded-2xl border border-border/50 text-center">
                          <div className="text-3xl font-bold text-emerald-500 mb-1">{resumeInfo.ats_score}%</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">ATS Score</div>
                          <Progress value={resumeInfo.ats_score} className="h-1.5 mt-3 bg-emerald-950 [&>div]:bg-emerald-500" />
                        </div>
                      </div>
                    </Card>

                    {/* Skills Card */}
                    <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-md shadow-xl">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeInfo.technical_skills?.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                        {(!resumeInfo.technical_skills || resumeInfo.technical_skills.length === 0) && (
                          <p className="text-muted-foreground text-sm italic">No technical skills found</p>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mt-8 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" /> Soft Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeInfo.soft_skills?.map((skill, i) => (
                          <Badge key={i} variant="outline" className="border-border/60 hover:bg-secondary/50 px-3 py-1 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Card>

                    {/* AI Insights */}
                    <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-md shadow-xl">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" /> AI Insights
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-emerald-500 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Key Strengths
                          </h4>
                          <ul className="space-y-2">
                            {resumeInfo.strengths?.slice(0, 3).map((strength, i) => (
                              <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-emerald-500/30">
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-amber-500 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Areas for Improvement
                          </h4>
                          <ul className="space-y-2">
                            {resumeInfo.improvement_areas?.slice(0, 3).map((area, i) => (
                              <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-amber-500/30">
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Column - Detailed Info */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Summary */}
                    {resumeInfo.professional_summary && (
                      <Card className="p-8 border-border/50 bg-card/40 backdrop-blur-md shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-primary to-accent"></div>
                        <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {resumeInfo.professional_summary}
                        </p>
                      </Card>
                    )}

                    {/* Experience */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2 px-2">
                        <Briefcase className="w-5 h-5 text-primary" /> Experience
                      </h3>
                      {resumeInfo.experience?.map((exp, i) => (
                        <Card key={i} className="p-6 border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-colors group">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{exp.title}</h4>
                              <p className="text-primary/80 font-medium">{exp.company}</p>
                            </div>
                            <Badge variant="outline" className="w-fit whitespace-nowrap bg-background/50">
                              {exp.start} - {exp.end}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {exp.description}
                          </p>
                        </Card>
                      ))}
                      {(!resumeInfo.experience || resumeInfo.experience.length === 0) && (
                        <Card className="p-8 border-dashed border-2 border-border/50 bg-transparent text-center">
                          <p className="text-muted-foreground">No experience records found</p>
                        </Card>
                      )}
                    </div>

                    {/* Projects */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2 px-2">
                        <Globe className="w-5 h-5 text-primary" /> Projects
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumeInfo.projects?.map((project, i) => (
                          <Card key={i} className="p-6 border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-colors flex flex-col h-full">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-lg font-bold">{project.name}</h4>
                              {project.url && (
                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                  <Globe className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-4 grow line-clamp-3">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                              {project.technologies?.map((tech, j) => (
                                <span key={j} className="text-xs bg-secondary/50 px-2 py-1 rounded text-secondary-foreground">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                      {(!resumeInfo.projects || resumeInfo.projects.length === 0) && (
                        <Card className="p-8 border-dashed border-2 border-border/50 bg-transparent text-center">
                          <p className="text-muted-foreground">No projects found</p>
                        </Card>
                      )}
                    </div>

                    {/* Education */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2 px-2">
                        <GraduationCap className="w-5 h-5 text-primary" /> Education
                      </h3>
                      {resumeInfo.education?.map((edu, i) => (
                        <Card key={i} className="p-6 border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {edu.institution[0]}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold">{edu.institution}</h4>
                                <p className="text-muted-foreground">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="w-fit">
                              {edu.year}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                      {(!resumeInfo.education || resumeInfo.education.length === 0) && (
                        <Card className="p-8 border-dashed border-2 border-border/50 bg-transparent text-center">
                          <p className="text-muted-foreground">No education records found</p>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Job Applications Tab Content */}
            <TabsContent value="applications">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Your Job Applications</h2>
                    <p className="text-muted-foreground">Track the jobs you&apos;ve applied to</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {applications.length} Applications
                  </Badge>
                </div>

                {loadingApplications ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Loading your applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <Card className="p-12 border-dashed border-2 border-border/50 bg-transparent text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Start applying to jobs and track your progress here. When you apply through our platform,
                      it will automatically appear here.
                    </p>
                    <Button asChild>
                      <a href="/linkedin-jobs">Browse Jobs</a>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {applications.map((app) => (
                      <Card key={app.id} className="p-6 border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="grow">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{app.job_title}</h3>
                              <Badge className={getStatusColor(app.status)}>
                                {app.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4" />
                                {app.company}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {app.location}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Applied {formatDate(app.applied_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {app.job_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                  View Job
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="dashboard-theme max-w-2xl max-h-[90vh] overflow-y-auto bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2 text-foreground">
                <Edit className="w-6 h-6 text-primary" />
                Edit Your Profile
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update your personal information and career preferences. All fields are optional.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground">Username</Label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={profileData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-foreground">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={profileData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-foreground">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={profileData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>

              {/* Career Goals Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <TrendingUp className="w-5 h-5" />
                  Career Goals
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="career_goal_short" className="text-foreground">Short-term Goal</Label>
                    <Textarea
                      id="career_goal_short"
                      placeholder="What do you want to achieve in the next 6-12 months?"
                      value={profileData.career_goal_short}
                      onChange={(e) => handleInputChange("career_goal_short", e.target.value)}
                      rows={2}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career_goal_long" className="text-foreground">Long-term Goal</Label>
                    <Textarea
                      id="career_goal_long"
                      placeholder="Where do you see yourself in 3-5 years?"
                      value={profileData.career_goal_long}
                      onChange={(e) => handleInputChange("career_goal_long", e.target.value)}
                      rows={2}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Briefcase className="w-5 h-5" />
                  Work Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proficiency_level" className="text-foreground">Proficiency Level</Label>
                    <Select
                      value={profileData.proficiency_level}
                      onValueChange={(value) => handleInputChange("proficiency_level", value)}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="dashboard-theme bg-card border-border/50">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_work_mode" className="text-foreground">Work Mode</Label>
                    <Select
                      value={profileData.preferred_work_mode}
                      onValueChange={(value) => handleInputChange("preferred_work_mode", value)}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent className="dashboard-theme bg-card border-border/50">
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability_timeline" className="text-foreground">Availability</Label>
                    <Input
                      id="availability_timeline"
                      placeholder="e.g., Immediately, 2 weeks"
                      value={profileData.availability_timeline}
                      onChange={(e) => handleInputChange("availability_timeline", e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Profile updated successfully!</span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
                className="border-border/50 hover:bg-secondary/50 text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
