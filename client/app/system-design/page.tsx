"use client"

import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import { io, Socket } from "socket.io-client"
import {
  Boxes,
  Cloud,
  Database,
  GitBranch,
  Globe2,
  HardDrive,
  MonitorSmartphone,
  Network,
  Server,
  Trash2,
  Users,
} from "lucide-react"
import { VoiceInterviewer } from "@/components/system-design/VoiceInterviewer"
import { TranscriptEntry } from "@/components/system-design/VoiceInterviewer"

type InfrastructureType =
  | "client"
  | "load-balancer"
  | "web-server"
  | "cache"
  | "database"
  | "queue"
  | "read-replica"
  | "cdn"

type InfrastructureData = { label: string; kind: InfrastructureType }

const palette: Array<{ kind: InfrastructureType; label: string; icon: typeof Users; accent: string }> = [
  { kind: "client", label: "Client", icon: Users, accent: "#58a6ff" },
  { kind: "load-balancer", label: "Load Balancer", icon: Network, accent: "#a371f7" },
  { kind: "web-server", label: "Web Server", icon: Server, accent: "#3fb950" },
  { kind: "cache", label: "Cache (Redis)", icon: HardDrive, accent: "#f85149" },
  { kind: "database", label: "Database (Postgres)", icon: Database, accent: "#58a6ff" },
  { kind: "queue", label: "Queue", icon: GitBranch, accent: "#d29922" },
  { kind: "read-replica", label: "Read Replica", icon: Boxes, accent: "#3fb950" },
  { kind: "cdn", label: "CDN", icon: Cloud, accent: "#d29922" },
]

const paletteByKind = Object.fromEntries(palette.map((item) => [item.kind, item])) as Record<
  InfrastructureType,
  (typeof palette)[number]
>

function InfrastructureNode({ data, selected }: NodeProps<Node<InfrastructureData>>) {
  const item = paletteByKind[data.kind]
  const Icon = item.icon

  return (
    <div
      className={`min-w-40 rounded-xl border px-4 py-3 shadow-lg transition ${
        selected ? "border-orange-400 ring-2 ring-orange-400/30" : "border-slate-700"
      } bg-slate-950`}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-slate-950" style={{ background: item.accent }} />
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.accent}22`, color: item.accent }}>
          <Icon size={19} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{data.kind.replaceAll("-", " ")}</p>
          <p className="text-sm font-semibold text-slate-100">{data.label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-slate-950" style={{ background: item.accent }} />
    </div>
  )
}

const nodeTypes = { infrastructure: InfrastructureNode }
const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555"

export default function SystemDesignPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<InfrastructureData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [reactFlow, setReactFlow] = useState<ReactFlowInstance<Node<InfrastructureData>, Edge> | null>(null)
  const [syncState, setSyncState] = useState<"connecting" | "synced" | "offline">("connecting")
  const [critique, setCritique] = useState<{ text: string; languageCode: string } | null>(null)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const [playbackStatus, setPlaybackStatus] = useState<"idle" | "queued" | "playing">("idle")
  const [audioError, setAudioError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const graphRef = useRef({ nodes, edges })
  const evaluationTimer = useRef<number | null>(null)
  const recentExplanation = useRef<TranscriptEntry | null>(null)
  const audioQueue = useRef<Array<{ audioBase64: string; mimeType: string }>>([])
  const activeAudio = useRef<HTMLAudioElement | null>(null)
  const isPlayingAudio = useRef(false)

  const playNextAudio = useCallback(() => {
    if (isPlayingAudio.current) return
    const next = audioQueue.current.shift()
    if (!next) {
      setPlaybackStatus("idle")
      return
    }
    isPlayingAudio.current = true
    setPlaybackStatus("playing")
    try {
      const binary = atob(next.audioBase64)
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
      const audioUrl = URL.createObjectURL(new Blob([bytes], { type: next.mimeType }))
      const audio = new Audio(audioUrl)
      activeAudio.current = audio
      const complete = () => {
        URL.revokeObjectURL(audioUrl)
        activeAudio.current = null
        isPlayingAudio.current = false
        setPlaybackStatus(audioQueue.current.length ? "queued" : "idle")
        playNextAudio()
      }
      audio.onended = complete
      audio.onerror = () => {
        setAudioError("The voice critique could not be played by this browser.")
        complete()
      }
      void audio.play().catch(() => {
        setAudioError("Your browser blocked automatic audio playback. Click Start explaining once, then try again.")
        complete()
      })
    } catch {
      isPlayingAudio.current = false
      setAudioError("The server returned invalid voice audio.")
      playNextAudio()
    }
  }, [])

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket", "polling"] })
    socketRef.current = socket
    socket.on("connect", () => setSyncState("synced"))
    socket.on("disconnect", () => setSyncState("offline"))
    socket.on("connect_error", () => setSyncState("offline"))
    socket.on("canvas_synced", () => setSyncState("synced"))
    socket.on("architecture_evaluation", (result) => {
      if (result?.critique) {
        setCritique({ text: result.critique, languageCode: result.languageCode || "en-IN" })
        setEvaluationError(null)
      }
    })
    socket.on("architecture_evaluation_error", (result) => setEvaluationError(result?.message || "Critique service is unavailable."))
    socket.on("critique_audio", (result) => {
      if (!result?.audioBase64) return
      setAudioError(null)
      audioQueue.current.push({ audioBase64: result.audioBase64, mimeType: result.mimeType || "audio/wav" })
      setPlaybackStatus(isPlayingAudio.current ? "queued" : "playing")
      playNextAudio()
    })
    socket.on("critique_audio_error", (result) => setAudioError(result?.message || "Voice critique is unavailable."))
    return () => {
      socket.disconnect()
      activeAudio.current?.pause()
      activeAudio.current = null
      audioQueue.current = []
    }
  }, [playNextAudio])

  useEffect(() => {
    graphRef.current = { nodes, edges }
    const debounce = window.setTimeout(() => {
      const socket = socketRef.current
      if (socket?.connected) socket.emit("canvas_update", graphRef.current)
    }, 500)
    return () => window.clearTimeout(debounce)
  }, [nodes, edges])

  const triggerEvaluation = useCallback((entry?: TranscriptEntry) => {
    if (entry) recentExplanation.current = entry
    if (evaluationTimer.current) window.clearTimeout(evaluationTimer.current)
    evaluationTimer.current = window.setTimeout(() => {
      const socket = socketRef.current
      const recent = recentExplanation.current
      if (socket?.connected) socket.emit("evaluate_architecture", {
        graph: graphRef.current,
        transcript: recent?.text || "",
        languageCode: recent?.languageCode || "en-IN",
      })
    }, 800)
  }, [])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          { ...connection, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: "#fb923c" }, style: { stroke: "#fb923c", strokeWidth: 2 } },
          current,
        ),
      )
      triggerEvaluation()
    },
    [setEdges, triggerEvaluation],
  )

  const onDragStart = (event: DragEvent<HTMLButtonElement>, kind: InfrastructureType) => {
    event.dataTransfer.setData("application/wire-it-up-node", kind)
    event.dataTransfer.effectAllowed = "move"
  }

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const kind = event.dataTransfer.getData("application/wire-it-up-node") as InfrastructureType
      if (!kind || !reactFlow || !paletteByKind[kind]) return
      const position = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const item = paletteByKind[kind]
      const id = `${kind}-${crypto.randomUUID()}`
      setNodes((current) => [...current, { id, type: "infrastructure", position, data: { kind, label: item.label } }])
    },
    [reactFlow, setNodes],
  )

  const graphJson = useMemo(() => JSON.stringify({ nodes, edges }, null, 2), [nodes, edges])
  const deleteSelected = () => {
    setNodes((current) => current.filter((node) => !node.selected))
    setEdges((current) => current.filter((edge) => !edge.selected))
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-[#0d1320] px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"><MonitorSmartphone size={21} /></span>
          <div>
            <h1 className="text-lg font-semibold">Wire It Up</h1>
            <p className="text-xs text-slate-400">AI System Design Interviewer</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
          <span className={`h-2 w-2 rounded-full ${syncState === "synced" ? "bg-emerald-400" : syncState === "connecting" ? "bg-amber-400" : "bg-red-400"}`} />
          {syncState === "synced" ? "Canvas synced" : syncState === "connecting" ? "Connecting…" : "Backend offline"}
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-73px)] grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_320px]">
        <aside className="border-b border-slate-800 bg-[#0d1320] p-5 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold"><Globe2 size={16} className="text-orange-400" /> Infrastructure palette</div>
          <p className="mb-4 text-xs leading-5 text-slate-400">Drag a component onto the canvas. Connect the handles to describe request flow.</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {palette.map((item) => {
              const Icon = item.icon
              return <button key={item.kind} draggable onDragStart={(event) => onDragStart(event, item.kind)} className="flex cursor-grab items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-left text-sm transition hover:border-slate-600 hover:bg-slate-800 active:cursor-grabbing"><Icon size={16} style={{ color: item.accent }} /><span>{item.label}</span></button>
            })}
          </div>
          <button onClick={deleteSelected} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-red-400/70 hover:text-red-300"><Trash2 size={14} /> Delete selected</button>
        </aside>

        <section className="relative min-h-[560px]" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
          <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-xs text-slate-400 backdrop-blur"><span className="font-medium text-slate-200">Architecture canvas</span><span className="mx-2 text-slate-600">•</span>{nodes.length} nodes · {edges.length} edges</div>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onInit={setReactFlow} fitView deleteKeyCode="Backspace" defaultEdgeOptions={{ type: "smoothstep" }}>
            <Background color="#253149" gap={22} size={1} />
            <Controls className="!border-slate-700 !bg-slate-900 [&>button]:!border-slate-700 [&>button]:!bg-slate-900 [&>button]:!fill-slate-300" />
            <MiniMap className="!border !border-slate-700 !bg-slate-950" nodeColor="#fb923c" maskColor="rgba(9,13,22,.7)" />
          </ReactFlow>
        </section>

        <aside className="border-t border-slate-800 bg-[#0d1320] p-5 lg:border-l lg:border-t-0">
          <VoiceInterviewer onUserPaused={triggerEvaluation} />
          {critique && <section className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-semibold uppercase tracking-wider text-orange-300">Senior tech lead · {critique.languageCode}</p><span className="text-[10px] text-orange-200/80">Voice: {playbackStatus}</span></div><p className="mt-1 text-sm leading-6 text-orange-50">{critique.text}</p></section>}
          {evaluationError && <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 p-2 text-xs text-red-200">{evaluationError}</p>}
          {audioError && <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 p-2 text-xs text-red-200">{audioError}</p>}
          <div className="mb-2 text-sm font-semibold">Live graph JSON</div>
          <p className="mb-4 text-xs leading-5 text-slate-400">This exact state is debounced for 500ms and emitted as <code className="text-orange-300">canvas_update</code>.</p>
          <pre className="max-h-[470px] overflow-auto rounded-lg border border-slate-800 bg-[#080c14] p-3 text-[11px] leading-5 text-slate-300">{graphJson}</pre>
        </aside>
      </div>
    </main>
  )
}
