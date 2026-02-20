"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Network, Lock, CheckCircle2, Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"

interface Task {
    id: string
    title: string
    status: string
    dependencies: any[]
    is_blocked: boolean
}

interface Props {
    tasks: Task[]
}

export function DependencyGraph({ tasks }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current || tasks.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = canvas.offsetWidth
        canvas.height = Math.max(600, tasks.length * 80)

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Simple force-directed layout simulation
        const nodes = tasks.map((task, i) => ({
            ...task,
            x: 150 + (i % 3) * 250,
            y: 100 + Math.floor(i / 3) * 150,
            radius: 40
        }))

        // Draw dependency lines
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        tasks.forEach((task, i) => {
            if (task.dependencies && task.dependencies.length > 0) {
                task.dependencies.forEach((dep: any) => {
                    const sourceIndex = tasks.findIndex(t => t.id === dep.id)
                    if (sourceIndex >= 0) {
                        const source = nodes[sourceIndex]
                        const target = nodes[i]

                        ctx.beginPath()
                        ctx.moveTo(source.x, source.y)
                        ctx.lineTo(target.x, target.y)
                        ctx.stroke()

                        // Draw arrow
                        const angle = Math.atan2(target.y - source.y, target.x - source.x)
                        const arrowSize = 10
                        ctx.save()
                        ctx.translate(target.x, target.y)
                        ctx.rotate(angle)
                        ctx.beginPath()
                        ctx.moveTo(-arrowSize, -arrowSize / 2)
                        ctx.lineTo(0, 0)
                        ctx.lineTo(-arrowSize, arrowSize / 2)
                        ctx.stroke()
                        ctx.restore()
                    }
                })
            }
        })

        ctx.setLineDash([])

        // Draw nodes
        nodes.forEach(node => {
            // Node circle
            const color =
                node.status === 'completed' ? '#10b981' :
                    node.status === 'in-progress' ? '#f59e0b' :
                        node.is_blocked ? '#6b7280' : '#3b82f6'

            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
            ctx.fill()

            // Node border
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 3
            ctx.stroke()

            // Node text
            ctx.fillStyle = '#ffffff'
            ctx.font = '12px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            const maxWidth = node.radius * 1.5
            const words = node.title.split(' ')
            let line = ''
            let y = node.y - 5

            words.forEach((word, i) => {
                const testLine = line + word + ' '
                const metrics = ctx.measureText(testLine)
                if (metrics.width > maxWidth && i > 0) {
                    ctx.fillText(line, node.x, y)
                    line = word + ' '
                    y += 12
                } else {
                    line = testLine
                }
            })
            ctx.fillText(line, node.x, y)
        })

    }, [tasks])

    if (tasks.length === 0) {
        return (
            <Card className="p-12 text-center border-border/40 bg-card/50 backdrop-blur-sm">
                <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No tasks to visualize</p>
            </Card>
        )
    }

    const blockedTasks = tasks.filter(t => t.is_blocked)
    const availableTasks = tasks.filter(t => !t.is_blocked && t.status === 'todo')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    return (
        <div className="space-y-6">
            {/* Legend */}
            <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                        <span className="text-sm">Completed ({completedTasks.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500" />
                        <span className="text-sm">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-sm">Available ({availableTasks.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-500" />
                        <span className="text-sm flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Blocked ({blockedTasks.length})
                        </span>
                    </div>
                </div>
            </Card>

            {/* Graph Canvas */}
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full"
                    style={{ minHeight: '600px' }}
                />
            </Card>

            {/* Task List with Dependencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map(task => (
                    <Card key={task.id} className="p-4 border-border/40 bg-card/50">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {task.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : task.status === 'in-progress' ? (
                                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                ) : task.is_blocked ? (
                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                                {task.dependencies && task.dependencies.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Prerequisites:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {task.dependencies.map((dep: any, i: number) => (
                                                <Badge
                                                    key={i}
                                                    variant="outline"
                                                    className={`text-xs ${dep.status === 'completed'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-muted'
                                                        }`}
                                                >
                                                    {dep.title}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
