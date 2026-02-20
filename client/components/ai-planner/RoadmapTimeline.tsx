"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock } from "lucide-react"

interface Milestone {
    id: string
    title: string
    description: string
    sequence_order: number
    progress_percentage: number
    total_tasks: number
    completed_tasks: number
}

interface Task {
    id: string
    title: string
    status: string
    milestone_id?: string
    milestone_title?: string
}

interface Props {
    milestones: Milestone[]
    tasks: Task[]
}

export function RoadmapTimeline({ milestones, tasks }: Props) {
    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Overall Progress</h3>
                    <span className="text-sm text-muted-foreground">
                        {milestones.filter(m => m.progress_percentage === 100).length} / {milestones.length} Milestones
                    </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-500"
                        style={{
                            width: `${milestones.length > 0 ?
                                (milestones.filter(m => m.progress_percentage === 100).length / milestones.length) * 100
                                : 0}%`
                        }}
                    />
                </div>
            </Card>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                {/* Milestones */}
                <div className="space-y-6">
                    {milestones
                        .sort((a, b) => a.sequence_order - b.sequence_order)
                        .map((milestone, index) => {
                            const isCompleted = milestone.progress_percentage === 100
                            const isInProgress = milestone.progress_percentage > 0 && milestone.progress_percentage < 100

                            return (
                                <div key={milestone.id} className="relative flex items-start gap-6">
                                    {/* Timeline Node */}
                                    <div className="relative z-10 shrink-0">
                                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${isCompleted ? 'border-emerald-500 bg-emerald-500' :
                                                isInProgress ? 'border-primary bg-primary' :
                                                    'border-border bg-background'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-8 h-8 text-white" />
                                            ) : isInProgress ? (
                                                <Clock className="w-8 h-8 text-white animate-pulse" />
                                            ) : (
                                                <Circle className="w-8 h-8 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Milestone Content */}
                                    <Card className={`flex-1 p-6 border-border/40 transition-all ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' :
                                            isInProgress ? 'bg-primary/5 border-primary/20' :
                                                'bg-card/50'
                                        }`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        Milestone {milestone.sequence_order}
                                                    </Badge>
                                                    {isCompleted && (
                                                        <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                                                            Completed
                                                        </Badge>
                                                    )}
                                                    {isInProgress && (
                                                        <Badge className="bg-primary/20 text-primary border-primary/30">
                                                            In Progress
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold">{milestone.title}</h3>
                                                {milestone.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">
                                                    {milestone.completed_tasks} / {milestone.total_tasks} tasks completed
                                                </span>
                                                <span className="font-semibold">{milestone.progress_percentage}%</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' :
                                                            isInProgress ? 'bg-primary' :
                                                                'bg-muted-foreground/30'
                                                        }`}
                                                    style={{ width: `${milestone.progress_percentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Tasks Preview */}
                                        <div className="flex flex-wrap gap-2">
                                            {tasks
                                                .filter(t => {
                                                    // Find which milestone this task belongs to
                                                    const taskMilestone = milestones.find(m => {
                                                        const milestoneTasks = tasks.filter(task => {
                                                            // This is a simple check - you might need to adjust based on your data structure
                                                            return task.milestone_title === m.title
                                                        })
                                                        return milestoneTasks.some(mt => mt.id === t.id)
                                                    })
                                                    return taskMilestone?.id === milestone.id
                                                })
                                                .slice(0, 5)
                                                .map((task: any) => (
                                                    <Badge
                                                        key={task.id}
                                                        variant="outline"
                                                        className={`text-xs ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                task.status === 'in-progress' ? 'bg-primary/10 text-primary border-primary/20' :
                                                                    'bg-muted'
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </Badge>
                                                ))}
                                        </div>
                                    </Card>
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}
