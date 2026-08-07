"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Upload, FileText, User, Phone, MapPin, Calendar } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { submitBasicInfo, submitCareerGoals, submitSkills, uploadResume } from "@/lib/api"
import AuthLayout from "@/components/ui/auth-layout"
import { FieldBox, AuthButton } from "@/components/ui/auth-forms"

interface OnboardingData {
  name: string
  age: string
  phone: string
  gender: string
  location: string
  role: string
  currentStatus: string
  experience: string
  skills: string[]
  resumeUrl?: string
  resumeAutoFill: boolean
}

export default function JourneyOnboarding() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated, refreshUser } = useAuth()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    age: "",
    phone: "",
    gender: "",
    location: "",
    role: "",
    currentStatus: "",
    experience: "",
    skills: [],
    resumeAutoFill: false,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isUploadingResume, setIsUploadingResume] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [authLoading, isAuthenticated, router])

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        location: user.location || prev.location,
        age: user.age?.toString() || prev.age,
      }))

      if (user.onboarding_step && user.onboarding_step > 0) {
        setStep(user.onboarding_step)
      }
    }
  }, [user])

  const genders = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
    { id: "other", label: "Other" },
    { id: "prefer-not-to-say", label: "Prefer not to say" },
  ]

  const roles = [
    { id: "software-engineer", label: "Software Engineer", desc: "Building applications & systems" },
    { id: "data-scientist", label: "Data Scientist", desc: "Analyzing data & insights" },
    { id: "product-manager", label: "Product Manager", desc: "Leading product strategy" },
    { id: "designer", label: "Designer", desc: "Creating user experiences" },
    { id: "marketing", label: "Marketing", desc: "Growth & brand building" },
    { id: "other", label: "Other", desc: "Different profession" },
  ]

  const currentStatuses = [
    { id: "student", label: "Student", desc: "Currently studying" },
    { id: "graduated", label: "Graduated", desc: "Recently completed studies" },
    { id: "working", label: "Working", desc: "Currently employed" },
  ]

  const experienceLevels = [
    { id: "beginner", label: "Beginner", desc: "Just starting out (0-1 years)" },
    { id: "junior", label: "Junior", desc: "Early career (1-3 years)" },
    { id: "mid", label: "Mid-Level", desc: "Experienced (3-5 years)" },
    { id: "senior", label: "Senior", desc: "Advanced (5-8 years)" },
  ]

  const skillCategories = [
    { id: "programming", label: "Programming", desc: "Languages, frameworks, tools" },
    { id: "frontend", label: "Frontend", desc: "React, Vue, UI/UX" },
    { id: "backend", label: "Backend", desc: "APIs, databases" },
    { id: "mobile", label: "Mobile", desc: "iOS, Android" },
    { id: "cloud", label: "Cloud", desc: "AWS, Azure, Docker" },
    { id: "data", label: "Data", desc: "SQL, Python, ML" },
  ]

  const handleNext = async () => {
    if (step === 0) {
      setIsSaving(true)
      setApiError(null)

      try {
        const result = await submitBasicInfo({
          name: formData.name,
          phone: formData.phone || undefined,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender || undefined,
          location: formData.location || undefined,
        })

        if (result.error) {
          setApiError(result.error)
          setIsSaving(false)
          return
        }

        setStep(1)
      } catch (error) {
        setApiError("Failed to save. Please try again.")
      }

      setIsSaving(false)
    } else if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleRoleSelect = async (roleId: string) => {
    setFormData({ ...formData, role: roleId })

    setIsSaving(true)
    setApiError(null)

    try {
      const result = await submitCareerGoals({
        role: roleId,
        status: formData.currentStatus || "student", 
      })

      if (result.error) {
        setApiError(result.error)
        setIsSaving(false)
        return
      }

      setTimeout(() => {
        setStep(2)
        setIsSaving(false)
      }, 300)
    } catch (error) {
      setApiError("Failed to save. Please try again.")
      setIsSaving(false)
    }
  }

  const handleStatusAndExperience = async () => {
    setIsSaving(true)
    setApiError(null)

    try {
      const result = await submitCareerGoals({
        role: formData.role,
        status: formData.currentStatus,
        experience: formData.experience,
      })

      if (result.error) {
        setApiError(result.error)
        setIsSaving(false)
        return
      }

      setStep(3)
    } catch (error) {
      setApiError("Failed to save. Please try again.")
    }

    setIsSaving(false)
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
      setIsUploadingResume(true)
      setApiError(null)

      try {
        const result = await uploadResume(file)

        if (result.error) {
          setApiError(result.error)
          setIsUploadingResume(false)
          return
        }

        setFormData({ ...formData, resumeUrl: file.name, resumeAutoFill: true })

        if (result.data) {
          setFormData((prev) => ({
            ...prev,
            resumeAutoFill: true,
            skills: prev.skills.length === 0 ? ["programming", "frontend", "backend"] : prev.skills,
          }))
        }
      } catch (error) {
        setApiError("Failed to upload resume. Please try again.")
      }

      setIsUploadingResume(false)
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    setApiError(null)

    try {
      const result = await submitSkills({
        skills: formData.skills.length > 0 ? formData.skills : ["general"],
      })

      if (result.error) {
        setApiError(result.error)
        setIsSaving(false)
        return
      }

      await refreshUser()

      localStorage.setItem("onboardingData", JSON.stringify(formData))
      localStorage.setItem("profileData", JSON.stringify(formData))

      setIsComplete(true)
    } catch (error) {
      setApiError("Failed to complete onboarding. Please try again.")
    }

    setIsSaving(false)
  }

  const handleManualComplete = () => {
    setFormData({ ...formData, resumeAutoFill: false })
    handleComplete()
  }

  const handleStart = () => {
    router.push("/dashboard")
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.name && formData.age && formData.phone && formData.gender && formData.location
      case 1:
        return formData.role
      case 2:
        return formData.currentStatus && formData.experience
      case 3:
        return formData.resumeUrl || formData.skills.length > 0
      default:
        return false
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <Spinner className="size-8 text-black dark:text-white" />
      </div>
    )
  }

  return (
    <main className="relative min-h-screen w-full bg-background">
      <AuthLayout>
        {isComplete ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">
            <h1 className="whitespace-nowrap text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px] mb-3">
              Perfect!
            </h1>
            <p className="whitespace-nowrap text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl lg:text-2xl xl:text-3xl mb-12">
              Your profile is ready.
            </p>

            <div className="space-y-4">
              <AuthButton onClick={handleStart}>
                Go to Dashboard
              </AuthButton>
              <button onClick={() => router.push("/profile")} className="w-full flex h-12 items-center justify-center rounded-[10px] border border-black/25 bg-white text-xl font-medium text-black transition-colors hover:bg-black/[0.03] dark:border-white/20 dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-white/5">
                Complete Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
            {/* Step Indicator */}
            <div className="mb-10 w-full flex items-center justify-between">
              <div className="flex gap-2 flex-1 mr-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-[10px] transition-all duration-300 ${
                      i <= step ? "bg-black dark:bg-white" : "bg-black/10 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-black/40 dark:text-white/40 font-medium whitespace-nowrap">Step {step + 1} of 4</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {apiError}
              </div>
            )}

            {/* Page 1 */}
            {step === 0 && (
              <div className="flex-1">
                <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px] mb-3">
                  About yourself
                </h1>
                <p className="text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl mb-8">
                  We'll use this to personalize your experience.
                </p>

                <div className="space-y-5">
                  <FieldBox
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSaving}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldBox
                      label="Age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      disabled={isSaving}
                    />
                    <FieldBox
                      label="Phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-black/60 dark:text-white/60 mb-3 block">Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                      {genders.map((gender) => (
                        <button
                          key={gender.id}
                          onClick={() => setFormData({ ...formData, gender: gender.id })}
                          disabled={isSaving}
                          className={`flex h-12 items-center justify-center rounded-[10px] border px-4 transition-colors ${
                            formData.gender === gender.id
                              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                              : "border-black/20 bg-transparent text-black/70 hover:bg-black/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <span className="text-sm font-medium">{gender.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <FieldBox
                    label="Location (City, Country)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={isSaving}
                  />

                  <AuthButton onClick={handleNext} disabled={!canProceed() || isSaving}>
                    {isSaving ? "Saving..." : "Continue"}
                  </AuthButton>
                </div>
              </div>
            )}

            {/* Page 2 */}
            {step === 1 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px] mb-3">
                  What's your role?
                </h1>
                <p className="text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl mb-8">
                  Select the role that best describes your profession.
                </p>

                <div className="grid gap-3 sm:grid-cols-2 mb-8">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      disabled={isSaving}
                      className={`flex flex-col items-start justify-center text-left p-4 rounded-[10px] border transition-colors ${
                        formData.role === role.id
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-black/20 bg-transparent text-black/70 hover:bg-black/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className={`font-medium mb-1 ${formData.role === role.id ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                        {role.label}
                      </span>
                      <span className={`text-xs ${formData.role === role.id ? "text-white/80 dark:text-black/80" : "text-black/50 dark:text-white/50"}`}>
                        {role.desc}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-auto pt-8 flex">
                  <button onClick={handleBack} disabled={isSaving} className="inline-flex h-12 items-center justify-center rounded-lg border border-black/20 px-6 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5 disabled:opacity-50">
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {/* Page 3 */}
            {step === 2 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px] mb-3">
                  Current status?
                </h1>
                <p className="text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl mb-8">
                  Help us understand your career journey.
                </p>

                <div className="space-y-8">
                  <div>
                    <label className="text-sm font-medium text-black/60 dark:text-white/60 mb-3 block">Status</label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {currentStatuses.map((status) => (
                        <button
                          key={status.id}
                          onClick={() => setFormData({ ...formData, currentStatus: status.id })}
                          disabled={isSaving}
                          className={`flex flex-col items-start p-4 rounded-[10px] border transition-colors ${
                            formData.currentStatus === status.id
                              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                              : "border-black/20 bg-transparent text-black/70 hover:bg-black/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <span className={`font-medium mb-1 ${formData.currentStatus === status.id ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                            {status.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-black/60 dark:text-white/60 mb-3 block">Experience</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setFormData({ ...formData, experience: level.id })}
                          disabled={isSaving}
                          className={`flex flex-col items-start p-4 rounded-[10px] border transition-colors ${
                            formData.experience === level.id
                              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                              : "border-black/20 bg-transparent text-black/70 hover:bg-black/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <span className={`font-medium mb-1 ${formData.experience === level.id ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                            {level.label}
                          </span>
                          <span className={`text-xs ${formData.experience === level.id ? "text-white/80 dark:text-black/80" : "text-black/50 dark:text-white/50"}`}>
                            {level.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-8">
                    <button onClick={handleBack} disabled={isSaving} className="inline-flex h-12 items-center justify-center rounded-lg border border-black/20 px-6 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5 disabled:opacity-50">
                      ← Back
                    </button>
                    <div className="flex-1">
                      <AuthButton onClick={handleStatusAndExperience} disabled={!canProceed() || isSaving}>
                        {isSaving ? "Saving..." : "Continue"}
                      </AuthButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 4 */}
            {step === 3 && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px] mb-3">
                  Add Skills
                </h1>
                <p className="text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl mb-8">
                  Upload your resume or add manually.
                </p>

                <div className="space-y-6">
                  {/* Resume Upload */}
                  <div className="rounded-[10px] border border-black/20 p-6 dark:border-white/10 dark:bg-white/5 bg-black/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-black dark:text-white">Upload Resume</h3>
                        <p className="text-sm text-black/50 dark:text-white/50">Auto-fill your profile details</p>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-white/10 rounded-[10px]">
                        <Upload className="w-5 h-5 text-black dark:text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-upload"
                      disabled={isUploadingResume || isSaving}
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`flex w-full h-12 items-center justify-center gap-2 rounded-[10px] border border-black/25 bg-white text-sm font-medium text-black transition-colors hover:bg-black/[0.03] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer ${
                        isUploadingResume || isSaving ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isUploadingResume ? (
                        <>
                          <Spinner className="w-4 h-4 text-black dark:text-white" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>{resumeFile ? resumeFile.name : "Choose File"}</span>
                        </>
                      )}
                    </label>
                    {formData.resumeAutoFill && (
                      <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Resume parsed! Review and continue.
                      </p>
                    )}
                  </div>

                  {!formData.resumeAutoFill && (
                    <div className="rounded-[10px] border border-black/20 p-6 dark:border-white/10 dark:bg-white/5 bg-black/[0.02]">
                      <h3 className="text-lg font-medium text-black dark:text-white mb-1">Select Skills</h3>
                      <p className="text-sm text-black/50 dark:text-white/50 mb-4">Or choose from the list below</p>
                      
                      <div className="grid gap-2 grid-cols-2">
                        {skillCategories.map((skill) => {
                          const isSelected = formData.skills.includes(skill.id)
                          return (
                            <button
                              key={skill.id}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  skills: isSelected
                                    ? formData.skills.filter((id) => id !== skill.id)
                                    : [...formData.skills, skill.id],
                                })
                              }}
                              disabled={isSaving}
                              className={`flex h-10 items-center justify-center rounded-[10px] border transition-colors ${
                                isSelected
                                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                  : "border-black/20 bg-white text-black/70 hover:bg-black/5 dark:border-white/20 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                              }`}
                            >
                              <span className="text-xs font-medium">{skill.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-8 pt-4">
                    <button onClick={handleBack} disabled={isSaving} className="inline-flex h-12 items-center justify-center rounded-lg border border-black/20 px-6 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5 disabled:opacity-50">
                      ← Back
                    </button>
                    <div className="flex-1">
                      <AuthButton onClick={formData.resumeAutoFill ? handleComplete : handleManualComplete} disabled={!canProceed() || isSaving}>
                        {isSaving ? "Completing..." : "Complete Profile"}
                      </AuthButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </AuthLayout>
    </main>
  )
}
