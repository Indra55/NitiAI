"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Target, Clock, Zap, Play, Sparkles } from "lucide-react"
import { moveTask } from "@/lib/plannerApi"
import { useState } from "react"

interface Task {
    id: string
    title: string
    status: string
    estimated_hours: number
    is_blocked: boolean
    priority: string
}

interface Props {
    progress: any
    tasks: Task[]
    onUpdate: () => void
}

export function ProgressDashboard({ progress, tasks, onUpdate }: Props) {
    const [loading, setLoading] = useState(false)

    if (!progress) {
        return (
            <Card className="p-12 text-center border-border/40 bg-card/50">
                <p className="text-muted-foreground">No progress data available</p>
            </Card>
        )
    }

    // Find next suggested task (highest priority, not blocked, todo status)
    const nextTask = tasks
        .filter(t => t.status === 'todo' && !t.is_blocked)
        .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
            return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        })[0]

    async function handleStartTask(taskId: string) {
        setLoading(true)
        try {
            await moveTask(taskId, 'in-progress')
            onUpdate()
        } catch (error: any) {
            alert(error.message || "Failed to start task")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Main Progress Card */}
            <Card className="p-8 border-border/40 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-1">{progress.roadmap_title}</h3>
                        <p className="text-muted-foreground">Your learning progress</p>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold text-primary mb-1">
                            {progress.progress_percentage}%
                        </div>
                        <p className="text-sm text-muted-foreground">Complete</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-muted rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                        style={{ width: `${progress.progress_percentage}%` }}
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-500 mb-1">
                            {progress.completed_tasks}
                        </div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-amber-500 mb-1">
                            {progress.in_progress_tasks}
                        </div>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-1">
                            {progress.todo_tasks}
                        </div>
                        <p className="text-sm text-muted-foreground">To Do</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-500 mb-1">
                            {progress.total_tasks}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Tasks</p>
                    </div>
                </div>
            </Card>

            {/* Time Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 border-border/40 bg-card/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{progress.total_estimated_hours}h</p>
                            <p className="text-sm text-muted-foreground">Estimated Total</p>
                        </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                    </div>
                </Card>

                <Card className="p-6 border-border/40 bg-card/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{progress.total_actual_hours || 0}h</p>
                            <p className="text-sm text-muted-foreground">Time Spent</p>
                        </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{
                                width: `${progress.total_estimated_hours > 0
                                    ? Math.min((progress.total_actual_hours / progress.total_estimated_hours) * 100, 100)
                                    : 0}%`
                            }}
                        />
                    </div>
                </Card>
            </div>

            {/* Next Suggested Task */}
            {nextTask && (
                <Card className="p-6 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold">Suggested Next Task</h3>
                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                    {nextTask.priority}
                                </Badge>
                            </div>
                            <h4 className="text-lg font-bold mb-2">{nextTask.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{nextTask.estimated_hours}h estimated</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            className="gap-2"
                            onClick={() => handleStartTask(nextTask.id)}
                            disabled={loading}
                        >
                            <Play className="w-4 h-4" />
                            Start Task
                        </Button>
                    </div>
                </Card>
            )}

            {/* Completion Celebration */}
            {progress.progress_percentage === 100 && (
                <Card className="p-8 text-center border-border/40 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                    <p className="text-muted-foreground mb-4">
                        You've completed your entire roadmap! Time to celebrate and plan your next journey.
                    </p>
                    <Button size="lg" className="gap-2">
                        <Sparkles className="w-5 h-5" />
                        Generate New Roadmap
                    </Button>
                </Card>
            )}
        </div>
    )
}
