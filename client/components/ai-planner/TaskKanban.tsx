"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle, Trash2, Lock, Grip } from "lucide-react"
import { moveTask, deleteTask } from "@/lib/plannerApi"
import { useState, useEffect } from "react"

interface Task {
    id: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimated_hours: number
    milestone_title: string
    dependencies: any[]
    is_blocked: boolean
}

interface Props {
    tasks: Task[]
    onUpdate: () => void
}

export function TaskKanban({ tasks, onUpdate }: Props) {
    // Local state for optimistic updates
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
    const [loading, setLoading] = useState<string | null>(null)

    // Sync local tasks with props
    useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])

    const todoTasks = localTasks.filter(t => t.status === 'todo')
    const inProgressTasks = localTasks.filter(t => t.status === 'in-progress')
    const completedTasks = localTasks.filter(t => t.status === 'completed')

    const priorityColors: Record<string, string> = {
        low: "bg-blue-500/20 text-blue-600 border-blue-500/30",
        medium: "bg-amber-500/20 text-amber-600 border-amber-500/30",
        high: "bg-orange-500/20 text-orange-600 border-orange-500/30",
        critical: "bg-red-500/20 text-red-600 border-red-500/30",
    }

    const difficultyColors: Record<string, string> = {
        beginner: "bg-green-500/20 text-green-600",
        intermediate: "bg-yellow-500/20 text-yellow-600",
        advanced: "bg-purple-500/20 text-purple-600",
    }

    function handleDragStart(e: React.DragEvent<HTMLDivElement>, task: Task) {
        if (task.is_blocked) {
            e.preventDefault()
            return
        }
        setDraggingTaskId(task.id)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
    }

    function handleDragEnd() {
        setDraggingTaskId(null)
        setDragOverColumn(null)
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    function handleDragEnter(columnStatus: string) {
        setDragOverColumn(columnStatus)
    }

    function handleDragLeave() {
        setDragOverColumn(null)
    }

    async function handleDrop(e: React.DragEvent<HTMLDivElement>, newStatus: 'todo' | 'in-progress' | 'completed') {
        e.preventDefault()
        e.stopPropagation()

        setDragOverColumn(null)

        if (!draggingTaskId) return

        const task = localTasks.find(t => t.id === draggingTaskId)
        if (!task || task.status === newStatus) {
            setDraggingTaskId(null)
            return
        }

        if (task.is_blocked && newStatus !== 'todo') {
            alert("This task is blocked by dependencies. Please complete the prerequisite tasks first.")
            setDraggingTaskId(null)
            return
        }

        // OPTIMISTIC UPDATE: Update UI immediately
        setLocalTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === draggingTaskId ? { ...t, status: newStatus } : t
            )
        )
        setDraggingTaskId(null)

        // Then sync with backend
        setLoading(draggingTaskId)
        try {
            await moveTask(draggingTaskId, newStatus)
            // Refresh from server to get accurate data
            await onUpdate()
        } catch (error: any) {
            // Revert optimistic update on error
            setLocalTasks(tasks)
            alert(error.message || "Failed to move task")
        } finally {
            setLoading(null)
        }
    }

    async function handleDelete(taskId: string, e: React.MouseEvent) {
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this task?")) return

        // Optimistic update
        setLocalTasks(prevTasks => prevTasks.filter(t => t.id !== taskId))

        setLoading(taskId)
        try {
            await deleteTask(taskId)
            await onUpdate()
        } catch (error: any) {
            // Revert on error
            setLocalTasks(tasks)
            alert(error.message || "Failed to delete task")
        } finally {
            setLoading(null)
        }
    }

    function TaskCard({ task }: { task: Task }) {
        const isDragging = draggingTaskId === task.id
        const isLoading = loading === task.id

        return (
            <div
                draggable={!task.is_blocked && !isLoading}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                className={`
          group relative mb-3 cursor-grab active:cursor-grabbing
          transition-all duration-300 ease-out
          ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
          ${task.is_blocked ? 'cursor-not-allowed opacity-60' : ''}
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
            >
                <Card className={`
          p-4 border-border/40 bg-card
          hover:shadow-lg hover:border-primary/30
          transition-all duration-300
          ${isDragging ? 'shadow-2xl' : ''}
        `}>
                    {/* Drag Handle */}
                    {!task.is_blocked && !isLoading && (
                        <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Grip className="w-4 h-4 text-muted-foreground" />
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm flex-1 pr-8 pl-4">{task.title}</h3>
                        {task.is_blocked ? (
                            <div className="flex-shrink-0" title="Blocked by dependencies">
                                <Lock className="w-4 h-4 text-amber-500" />
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={(e) => handleDelete(task.id, e)}
                                disabled={isLoading}
                            >
                                <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                        )}
                    </div>

                    {task.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 pl-4">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3 pl-4">
                        <Badge className={priorityColors[task.priority]} variant="outline">
                            {task.priority}
                        </Badge>
                        <Badge className={difficultyColors[task.difficulty]} variant="outline">
                            {task.difficulty}
                        </Badge>
                        {task.estimated_hours > 0 && (
                            <Badge variant="secondary" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimated_hours}h
                            </Badge>
                        )}
                    </div>

                    <div className="text-xs text-muted-foreground mb-2 pl-4">
                        Milestone: {task.milestone_title}
                    </div>

                    {task.dependencies && task.dependencies.length > 0 && (
                        <div className="pt-2 border-t border-border/40 pl-4">
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                                <AlertCircle className="w-3 h-3" />
                                <span>{task.dependencies.length} prerequisite{task.dependencies.length > 1 ? 's' : ''} required</span>
                            </div>
                            {task.is_blocked && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Complete prerequisites first to unlock
                                </p>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        )
    }

    function Column({
        title,
        tasks,
        status,
        count,
        color
    }: {
        title: string
        tasks: Task[]
        status: 'todo' | 'in-progress' | 'completed'
        count: number
        color: string
    }) {
        const isOver = dragOverColumn === status

        return (
            <div className="flex-1 min-w-[300px]">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <Badge variant="secondary" className={color}>{count}</Badge>
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${color.replace('/20', '')}`}
                            style={{ width: `${count > 0 ? 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status)}
                    className={`
            bg-muted/30 rounded-lg p-4 min-h-[500px]
            transition-all duration-300
            ${isOver ? 'bg-primary/10 border-2 border-primary border-dashed scale-[1.02]' : 'border-2 border-transparent'}
          `}
                >
                    {tasks.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-12">
                            {isOver ? (
                                <div className="flex flex-col items-center gap-2 animate-in fade-in duration-200">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-2xl">↓</span>
                                    </div>
                                    <p className="font-medium">Drop task here</p>
                                </div>
                            ) : (
                                <p>No tasks here yet</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {tasks.map(task => <TaskCard key={task.id} task={task} />)}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (localTasks.length === 0) {
        return (
            <Card className="p-12 text-center border-border/40 bg-card/50">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
                <p className="text-muted-foreground">
                    Generate a roadmap to see your personalized tasks here
                </p>
            </Card>
        )
    }

    return (
        <div>
            {/* Instructions */}
            <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Grip className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">How to use Kanban Board</h4>
                        <p className="text-sm text-muted-foreground">
                            Drag and drop tasks between columns to update their status instantly.
                            Tasks with a lock icon are blocked by prerequisites and must wait.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                <Column
                    title="To Do"
                    tasks={todoTasks}
                    status="todo"
                    count={todoTasks.length}
                    color="bg-blue-500/20 text-blue-600"
                />
                <Column
                    title="In Progress"
                    tasks={inProgressTasks}
                    status="in-progress"
                    count={inProgressTasks.length}
                    color="bg-amber-500/20 text-amber-600"
                />
                <Column
                    title="Completed"
                    tasks={completedTasks}
                    status="completed"
                    count={completedTasks.length}
                    color="bg-emerald-500/20 text-emerald-600"
                />
            </div>
        </div>
    )
}
