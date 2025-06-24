"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Clock,
  Plus,
  Search,
  Calendar,
  Timer,
  BarChart3,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Save,
  X,
  Play,
  Pause,
  RotateCcw,
  List,
  Grid3X3,
} from "lucide-react"

// Enhanced Task interface with modern features
interface Task {
  id: string
  title: string
  description?: string
  column: string
  priority: "urgent" | "high" | "medium" | "low"
  tags: string[]
  dueDate?: string
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  timerMinutesLeft?: number // remaining timer minutes when paused
  timerSecondsLeft?: number // remaining timer seconds when paused
  isTimerPaused?: boolean // whether timer is paused for this task
  subtasks: SubTask[]
  createdAt: string
  completedAt?: string
  isRecurring?: boolean
  recurringPattern?: "daily" | "weekly" | "monthly"
}

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface PomodoroSession {
  taskId: string
  duration: number
  completedAt: string
}

export default function ModernTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete quarterly review presentation",
      description: "Prepare slides and data analysis for Q4 review meeting",
      column: "todo",
      priority: "urgent",
      tags: ["work", "presentation"],
      dueDate: "2024-01-15",
      estimatedTime: 120,
      subtasks: [
        { id: "1-1", title: "Gather Q4 metrics", completed: true },
        { id: "1-2", title: "Create slide deck", completed: false },
        { id: "1-3", title: "Practice presentation", completed: false },
      ],
      createdAt: "2024-01-10T10:00:00Z",
    },
    {
      id: "2",
      title: "Update portfolio website",
      description: "Add recent projects and refresh design",
      column: "inProgress",
      priority: "high",
      tags: ["personal", "coding"],
      estimatedTime: 180,
      actualTime: 45,
      timerMinutesLeft: 15,
      timerSecondsLeft: 30,
      isTimerPaused: true,
      subtasks: [
        { id: "2-1", title: "Design new layout", completed: true },
        { id: "2-2", title: "Code responsive design", completed: false },
      ],
      createdAt: "2024-01-08T14:30:00Z",
    },
    {
      id: "3",
      title: "Plan weekend hiking trip",
      column: "todo",
      priority: "low",
      tags: ["personal", "outdoor"],
      estimatedTime: 30,
      subtasks: [],
      createdAt: "2024-01-12T09:15:00Z",
    },
    {
      id: "4",
      title: "Learn TypeScript advanced patterns",
      column: "completed",
      priority: "medium",
      tags: ["learning", "coding"],
      estimatedTime: 240,
      actualTime: 280,
      subtasks: [
        { id: "4-1", title: "Read documentation", completed: true },
        { id: "4-2", title: "Complete exercises", completed: true },
      ],
      createdAt: "2024-01-05T16:00:00Z",
      completedAt: "2024-01-11T18:30:00Z",
    },
  ])

  const [newTask, setNewTask] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"urgent" | "high" | "medium" | "low">("medium")
  const [newTaskTags, setNewTaskTags] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [newTaskEstimate, setNewTaskEstimate] = useState("")
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<SubTask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [filterPriority, setFilterPriority] = useState("")

  // Drag and drop states
  const [dragging, setDragging] = useState<string | null>(null)
  const [isDraggingOverBin, setIsDraggingOverBin] = useState(false)

  // Pomodoro timer states
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])

  // Edit states
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // View states
  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const [showStats, setShowStats] = useState(false)

  const dragItem = useRef<string | null>(null)
  const dragNode = useRef<EventTarget | null>(null)
  const binRef = useRef<HTMLDivElement>(null)

  // Modern minimalist color schemes
  const priorityColors = {
    urgent: "bg-gradient-to-r from-red-500/20 to-red-600/20",
    high: "bg-gradient-to-r from-orange-500/20 to-orange-600/20",
    medium: "bg-gradient-to-r from-gray-500/20 to-gray-600/20",
    low: "bg-gradient-to-r from-green-500/20 to-green-600/20",
  }

  const priorityBorders = {
    urgent: "border-l-4 border-l-red-500/60",
    high: "border-l-4 border-l-orange-500/60",
    medium: "border-l-4 border-l-gray-500/60",
    low: "border-l-4 border-l-green-500/60",
  }

  const priorityDots = {
    urgent: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-gray-500",
    low: "bg-green-500",
  }

  const columnColors = {
    todo: "from-gray-900/20 to-gray-800/20",
    inProgress: "from-gray-800/20 to-gray-900/20",
    completed: "from-gray-800/20 to-gray-900/20",
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1)
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1)
          setTimerSeconds(59)
        } else {
          // Timer completed
          setIsTimerRunning(false)
          if (activeTimer) {
            const session: PomodoroSession = {
              taskId: activeTimer,
              duration: 25,
              completedAt: new Date().toISOString(),
            }
            setPomodoroSessions((prev) => [...prev, session])

            // Add actual time to task and clear timer state
            setTasks((prev) =>
              prev.map((task) =>
                task.id === activeTimer
                  ? {
                      ...task,
                      actualTime: (task.actualTime || 0) + (task.estimatedTime || 25),
                      timerMinutesLeft: undefined,
                      timerSecondsLeft: undefined,
                      isTimerPaused: false,
                    }
                  : task,
              ),
            )
          }
          setActiveTimer(null)
          setTimerMinutes(25)
          setTimerSeconds(0)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerMinutes, timerSeconds, activeTimer])

  // Get all unique tags
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)))

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !filterTag || task.tags.includes(filterTag)
    const matchesPriority = !filterPriority || task.priority === filterPriority
    return matchesSearch && matchesTag && matchesPriority
  })

  const getTasksByColumn = (column: string) => {
    return filteredTasks.filter((task) => task.column === column)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragItem.current = taskId
    dragNode.current = e.target
    dragNode.current?.addEventListener("dragend", handleDragEnd)
    setTimeout(() => setDragging(taskId), 0)
  }

  const handleDragEnd = () => {
    setDragging(null)
    setIsDraggingOverBin(false)
    dragNode.current?.removeEventListener("dragend", handleDragEnd)
    dragItem.current = null
    dragNode.current = null
  }

  const handleDragEnter = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    if (dragging) {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === dragging) {
            const updatedTask = { ...task, column: targetColumn }
            if (targetColumn === "completed" && !task.completedAt) {
              updatedTask.completedAt = new Date().toISOString()
            }
            return updatedTask
          }
          return task
        }),
      )
    }
  }

  const handleDropOnBin = (e: React.DragEvent) => {
    e.preventDefault()
    if (dragging) {
      setTasks((prev) => prev.filter((task) => task.id !== dragging))
      setIsDraggingOverBin(false)
    }
  }

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false,
      }
      setNewTaskSubtasks((prev) => [...prev, newSubtask])
      setNewSubtaskTitle("")
    }
  }

  const removeSubtask = (subtaskId: string) => {
    setNewTaskSubtasks((prev) => prev.filter((subtask) => subtask.id !== subtaskId))
  }

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTaskItem: Task = {
        id: Date.now().toString(),
        title: newTask.trim(),
        description: newTaskDescription.trim() || undefined,
        column: "todo",
        priority: newTaskPriority,
        tags: newTaskTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        dueDate: newTaskDueDate || undefined,
        estimatedTime: newTaskEstimate ? Number.parseInt(newTaskEstimate) : undefined,
        subtasks: newTaskSubtasks,
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [...prev, newTaskItem])

      // Reset form
      setNewTask("")
      setNewTaskDescription("")
      setNewTaskPriority("medium")
      setNewTaskTags("")
      setNewTaskDueDate("")
      setNewTaskEstimate("")
      setNewTaskSubtasks([])
      setNewSubtaskTitle("")
      setShowAddForm(false)
    }
  }

  const startTimer = (taskId: string) => {
    // First, save current timer state if there's an active timer
    if (activeTimer && activeTimer !== taskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === activeTimer
            ? {
                ...task,
                timerMinutesLeft: timerMinutes,
                timerSecondsLeft: timerSeconds,
                isTimerPaused: true,
              }
            : task,
        ),
      )
    }

    // Find the task and use its timer state or estimated time
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      if (task.isTimerPaused && task.timerMinutesLeft !== undefined && task.timerSecondsLeft !== undefined) {
        // Resume from paused state
        setTimerMinutes(task.timerMinutesLeft)
        setTimerSeconds(task.timerSecondsLeft)
      } else {
        // Start new timer using estimated time or default to 25 minutes
        const estimatedMinutes = task.estimatedTime || 25
        setTimerMinutes(estimatedMinutes)
        setTimerSeconds(0)
      }
    }

    setActiveTimer(taskId)
    setIsTimerRunning(true)

    // Clear the paused state for this task
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              isTimerPaused: false,
            }
          : task,
      ),
    )
  }

  const pauseTimer = () => {
    if (activeTimer) {
      // Save current timer state to the task
      setTasks((prev) =>
        prev.map((task) =>
          task.id === activeTimer
            ? {
                ...task,
                timerMinutesLeft: timerMinutes,
                timerSecondsLeft: timerSeconds,
                isTimerPaused: true,
              }
            : task,
        ),
      )
    }
    setIsTimerRunning(false)
    setActiveTimer(null)
  }

  const resetTimer = () => {
    if (activeTimer) {
      // Clear timer state from the task
      setTasks((prev) =>
        prev.map((task) =>
          task.id === activeTimer
            ? {
                ...task,
                timerMinutesLeft: undefined,
                timerSecondsLeft: undefined,
                isTimerPaused: false,
              }
            : task,
        ),
      )
    }
    setIsTimerRunning(false)
    setTimerMinutes(25)
    setTimerSeconds(0)
    setActiveTimer(null)
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
              ),
            }
          : task,
      ),
    )
  }

  const startEditing = (task: Task) => {
    setEditingTask(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
  }

  const saveEdit = () => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask ? { ...task, title: editTitle, description: editDescription || undefined } : task,
        ),
      )
      setEditingTask(null)
      setEditTitle("")
      setEditDescription("")
    }
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditTitle("")
    setEditDescription("")
  }

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.column === "completed").length,
    inProgress: tasks.filter((t) => t.column === "inProgress").length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== "completed").length,
    totalTimeSpent: tasks.reduce((acc, task) => acc + (task.actualTime || 0), 0),
    avgCompletionTime:
      tasks.filter((t) => t.completedAt && t.actualTime).reduce((acc, task) => acc + (task.actualTime || 0), 0) /
        tasks.filter((t) => t.completedAt && t.actualTime).length || 0,
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif] antialiased">
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="border-b border-gray-800/30 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white tracking-tight">TaskFlow</h1>
                  <p className="text-sm text-gray-400 font-light">Modern task management</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 rounded-full border border-gray-800/50">
                <Zap className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-300 font-medium">
                  {stats.completed}/{stats.total} completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer Display */}
              {activeTimer && (
                <div className="flex items-center gap-3 bg-gray-900/60 px-4 py-2.5 rounded-xl border border-gray-800/50 backdrop-blur-sm">
                  <Timer className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-lg font-medium text-white tracking-wider">
                    {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={isTimerRunning ? pauseTimer : () => setIsTimerRunning(true)}
                      className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    >
                      {isTimerRunning ? (
                        <Pause className="w-3.5 h-3.5 text-gray-300" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-gray-300" />
                      )}
                    </button>
                    <button
                      onClick={resetTimer}
                      className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => setViewMode(viewMode === "board" ? "list" : "board")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 text-sm font-medium text-gray-300"
              >
                {viewMode === "board" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                {viewMode === "board" ? "List" : "Board"}
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:outline-none focus:border-gray-600/50 focus:ring-1 focus:ring-gray-600/20 text-gray-200 placeholder-gray-500 font-light transition-all duration-200"
              />
            </div>

            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-gray-200 font-light min-w-32"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-gray-200 font-light min-w-36"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      </header>

      {/* Stats Panel */}
      {showStats && (
        <div className="border-b border-gray-800/30 bg-gray-950/30 backdrop-blur-sm">
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-sm text-gray-500 font-light">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.completed}</div>
                <div className="text-sm text-gray-500 font-light">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-300 mb-1">{stats.inProgress}</div>
                <div className="text-sm text-gray-500 font-light">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">{stats.overdue}</div>
                <div className="text-sm text-gray-500 font-light">Overdue</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-300 mb-1">{Math.round(stats.totalTimeSpent / 60)}h</div>
                <div className="text-sm text-gray-500 font-light">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-300 mb-1">{Math.round(stats.avgCompletionTime)}m</div>
                <div className="text-sm text-gray-500 font-light">Avg Time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 text-white">Add New Task</h3>

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Task title..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-white placeholder-gray-500 font-light"
                autoFocus
              />

              <textarea
                placeholder="Description (optional)..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-gray-600/50 resize-none text-white placeholder-gray-500 font-light"
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-white font-light"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>

                <input
                  type="number"
                  placeholder="Est. minutes"
                  value={newTaskEstimate}
                  onChange={(e) => setNewTaskEstimate(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-white placeholder-gray-500 font-light"
                />
              </div>

              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-white font-light"
              />

              <input
                type="text"
                placeholder="Tags (comma separated)..."
                value={newTaskTags}
                onChange={(e) => setNewTaskTags(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-white placeholder-gray-500 font-light"
              />

              {/* Subtasks Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Subtasks</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSubtask()}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-gray-600/50 text-white placeholder-gray-500 font-light"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 transition-colors text-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtasks List */}
                {newTaskSubtasks.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newTaskSubtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center justify-between bg-gray-800/30 px-4 py-3 rounded-xl border border-gray-700/30"
                      >
                        <span className="text-sm text-gray-300 font-light">{subtask.title}</span>
                        <button
                          type="button"
                          onClick={() => removeSubtask(subtask.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleAddTask}
                className="flex-1 py-3 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors text-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8">
        {viewMode === "board" ? (
          <BoardView
            tasks={filteredTasks}
            getTasksByColumn={getTasksByColumn}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            startTimer={startTimer}
            toggleSubtask={toggleSubtask}
            startEditing={startEditing}
            editingTask={editingTask}
            editTitle={editTitle}
            editDescription={editDescription}
            setEditTitle={setEditTitle}
            setEditDescription={setEditDescription}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            dragging={dragging}
            priorityColors={priorityColors}
            priorityBorders={priorityBorders}
            priorityDots={priorityDots}
            activeTimer={activeTimer}
            columnColors={columnColors}
          />
        ) : (
          <ListView
            tasks={filteredTasks}
            startTimer={startTimer}
            toggleSubtask={toggleSubtask}
            startEditing={startEditing}
            editingTask={editingTask}
            editTitle={editTitle}
            editDescription={editDescription}
            setEditTitle={setEditTitle}
            setEditDescription={setEditDescription}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            priorityColors={priorityColors}
            priorityBorders={priorityBorders}
            priorityDots={priorityDots}
            activeTimer={activeTimer}
          />
        )}
      </main>

      {/* Trash Bin */}
      <div
        ref={binRef}
        className={`fixed bottom-8 right-8 w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          isDraggingOverBin
            ? "bg-red-600 scale-125 shadow-2xl shadow-red-500/50"
            : "bg-gray-900/80 border border-gray-800/50 hover:bg-gray-800/80 backdrop-blur-sm"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDraggingOverBin(true)
        }}
        onDragLeave={() => setIsDraggingOverBin(false)}
        onDrop={handleDropOnBin}
      >
        <Trash2 className={`w-6 h-6 ${isDraggingOverBin ? "text-white" : "text-gray-400"}`} />
      </div>
    </div>
  )
}

// Board View Component
interface BoardViewProps {
  tasks: Task[]
  getTasksByColumn: (column: string) => Task[]
  handleDragStart: (e: React.DragEvent, taskId: string) => void
  handleDragEnter: (e: React.DragEvent, targetColumn: string) => void
  startTimer: (taskId: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  startEditing: (task: Task) => void
  editingTask: string | null
  editTitle: string
  editDescription: string
  setEditTitle: (value: string) => void
  setEditDescription: (value: string) => void
  saveEdit: () => void
  cancelEdit: () => void
  dragging: string | null
  priorityColors: Record<string, string>
  priorityBorders: Record<string, string>
  priorityDots: Record<string, string>
  activeTimer: string | null
  columnColors: Record<string, string>
}

function BoardView({
  getTasksByColumn,
  handleDragStart,
  handleDragEnter,
  startTimer,
  toggleSubtask,
  startEditing,
  editingTask,
  editTitle,
  editDescription,
  setEditTitle,
  setEditDescription,
  saveEdit,
  cancelEdit,
  dragging,
  priorityColors,
  priorityBorders,
  priorityDots,
  activeTimer,
  columnColors,
}: BoardViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* To Do Column */}
      <div
        className={`bg-gradient-to-br ${columnColors.todo} border border-gray-800/30 rounded-2xl overflow-hidden backdrop-blur-sm`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDragEnter(e, "todo")}
      >
        <div className="p-6 border-b border-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-white">To Do</h2>
            </div>
            <span className="text-sm text-gray-400 font-medium bg-gray-800/50 px-3 py-1 rounded-full">
              {getTasksByColumn("todo").length}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
          {getTasksByColumn("todo").map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onStartTimer={startTimer}
              onToggleSubtask={toggleSubtask}
              onStartEdit={startEditing}
              isEditing={editingTask === task.id}
              editTitle={editTitle}
              editDescription={editDescription}
              onEditTitleChange={setEditTitle}
              onEditDescriptionChange={setEditDescription}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              dragging={dragging}
              priorityColors={priorityColors}
              priorityBorders={priorityBorders}
              priorityDots={priorityDots}
              activeTimer={activeTimer}
            />
          ))}
        </div>
      </div>

      {/* In Progress Column */}
      <div
        className={`bg-gradient-to-br ${columnColors.inProgress} border border-gray-800/30 rounded-2xl overflow-hidden backdrop-blur-sm`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDragEnter(e, "inProgress")}
      >
        <div className="p-6 border-b border-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-white">In Progress</h2>
            </div>
            <span className="text-sm text-gray-400 font-medium bg-gray-800/50 px-3 py-1 rounded-full">
              {getTasksByColumn("inProgress").length}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
          {getTasksByColumn("inProgress").map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onStartTimer={startTimer}
              onToggleSubtask={toggleSubtask}
              onStartEdit={startEditing}
              isEditing={editingTask === task.id}
              editTitle={editTitle}
              editDescription={editDescription}
              onEditTitleChange={setEditTitle}
              onEditDescriptionChange={setEditDescription}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              dragging={dragging}
              priorityColors={priorityColors}
              priorityBorders={priorityBorders}
              priorityDots={priorityDots}
              activeTimer={activeTimer}
            />
          ))}
        </div>
      </div>

      {/* Completed Column */}
      <div
        className={`bg-gradient-to-br ${columnColors.completed} border border-gray-800/30 rounded-2xl overflow-hidden backdrop-blur-sm`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDragEnter(e, "completed")}
      >
        <div className="p-6 border-b border-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold text-white">Completed</h2>
            </div>
            <span className="text-sm text-gray-400 font-medium bg-gray-800/50 px-3 py-1 rounded-full">
              {getTasksByColumn("completed").length}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
          {getTasksByColumn("completed").map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onStartTimer={startTimer}
              onToggleSubtask={toggleSubtask}
              onStartEdit={startEditing}
              isEditing={editingTask === task.id}
              editTitle={editTitle}
              editDescription={editDescription}
              onEditTitleChange={setEditTitle}
              onEditDescriptionChange={setEditDescription}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              dragging={dragging}
              priorityColors={priorityColors}
              priorityBorders={priorityBorders}
              priorityDots={priorityDots}
              activeTimer={activeTimer}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// List View Component
interface ListViewProps {
  tasks: Task[]
  startTimer: (taskId: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  startEditing: (task: Task) => void
  editingTask: string | null
  editTitle: string
  editDescription: string
  setEditTitle: (value: string) => void
  setEditDescription: (value: string) => void
  saveEdit: () => void
  cancelEdit: () => void
  priorityColors: Record<string, string>
  priorityBorders: Record<string, string>
  priorityDots: Record<string, string>
  activeTimer: string | null
}

function ListView({
  tasks,
  startTimer,
  toggleSubtask,
  startEditing,
  editingTask,
  editTitle,
  editDescription,
  setEditTitle,
  setEditDescription,
  saveEdit,
  cancelEdit,
  priorityColors,
  priorityBorders,
  priorityDots,
  activeTimer,
}: ListViewProps) {
  const columns = [
    { key: "todo", title: "To Do", icon: Circle },
    { key: "inProgress", title: "In Progress", icon: Clock },
    { key: "completed", title: "Completed", icon: CheckCircle2 },
  ]

  return (
    <div className="space-y-8">
      {columns.map(({ key, title, icon: Icon }) => {
        const columnTasks = tasks.filter((task) => task.column === key)
        if (columnTasks.length === 0) return null

        return (
          <div key={key} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Icon className={`w-5 h-5 ${key === "completed" ? "text-green-500" : "text-gray-400"}`} />
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <span className="text-sm text-gray-400 font-medium bg-gray-800/50 px-3 py-1 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={() => {}}
                  onStartTimer={startTimer}
                  onToggleSubtask={toggleSubtask}
                  onStartEdit={startEditing}
                  isEditing={editingTask === task.id}
                  editTitle={editTitle}
                  editDescription={editDescription}
                  onEditTitleChange={setEditTitle}
                  onEditDescriptionChange={setEditDescription}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  dragging={null}
                  priorityColors={priorityColors}
                  priorityBorders={priorityBorders}
                  priorityDots={priorityDots}
                  activeTimer={activeTimer}
                  isListView={true}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Task Card Component
interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onStartTimer: (taskId: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onStartEdit: (task: Task) => void
  isEditing: boolean
  editTitle: string
  editDescription: string
  onEditTitleChange: (value: string) => void
  onEditDescriptionChange: (value: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  dragging: string | null
  priorityColors: Record<string, string>
  priorityBorders: Record<string, string>
  priorityDots: Record<string, string>
  activeTimer: string | null
  isListView?: boolean
}

function TaskCard({
  task,
  onDragStart,
  onStartTimer,
  onToggleSubtask,
  onStartEdit,
  isEditing,
  editTitle,
  editDescription,
  onEditTitleChange,
  onEditDescriptionChange,
  onSaveEdit,
  onCancelEdit,
  dragging,
  priorityColors,
  priorityBorders,
  priorityDots,
  activeTimer,
  isListView = false,
}: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.column !== "completed"
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length
  const progressPercentage = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0
  const isActiveTimer = activeTimer === task.id
  const hasPausedTimer =
    task.isTimerPaused && task.timerMinutesLeft !== undefined && task.timerSecondsLeft !== undefined

  return (
    <div
      className={`bg-gray-900/40 backdrop-blur-sm border border-gray-800/30 ${priorityBorders[task.priority]} rounded-2xl p-6 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 group ${
        !isListView ? "cursor-grab active:cursor-grabbing" : ""
      } ${dragging === task.id ? "opacity-50 scale-95" : ""} ${
        isOverdue ? "ring-1 ring-red-500/30" : ""
      } ${isActiveTimer ? "ring-1 ring-gray-400/30" : ""} hover:shadow-xl hover:shadow-black/20`}
      draggable={!isListView}
      onDragStart={(e) => !isListView && onDragStart(e, task.id)}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-4">
        {isEditing ? (
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-gray-600/50 font-light"
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-gray-600/50 resize-none font-light"
              rows={2}
              placeholder="Description..."
            />
            <div className="flex gap-2">
              <button
                onClick={onSaveEdit}
                className="p-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-2 rounded-full ${priorityDots[task.priority]}`} />
                <h3 className="font-medium text-white text-lg leading-tight">{task.title}</h3>
              </div>
              {task.description && <p className="text-gray-400 font-light leading-relaxed">{task.description}</p>}
            </div>
            <button
              onClick={() => onStartEdit(task)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Timer Status */}
      {(isActiveTimer || hasPausedTimer) && (
        <div className="mb-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 font-light">
                {isActiveTimer ? "Timer Running" : "Timer Paused"}
              </span>
            </div>
            {hasPausedTimer && (
              <span className="font-mono text-sm text-white font-medium">
                {String(task.timerMinutesLeft).padStart(2, "0")}:{String(task.timerSecondsLeft).padStart(2, "0")} left
              </span>
            )}
          </div>
        </div>
      )}

      {/* Subtasks Progress */}
      {task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-3 font-light">
            <span>Subtasks</span>
            <span>
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-gray-500 to-gray-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-3">
                <button
                  onClick={() => onToggleSubtask(task.id, subtask.id)}
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    subtask.completed
                      ? "bg-gray-500 border-gray-500"
                      : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50"
                  }`}
                >
                  {subtask.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <span
                  className={`font-light ${
                    subtask.completed ? "line-through text-gray-500" : "text-gray-300"
                  } transition-colors duration-200`}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-800/50 text-xs rounded-full text-gray-400 border border-gray-700/30 font-light"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Task Meta Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {task.dueDate && (
            <div className={`flex items-center gap-2 ${isOverdue ? "text-red-400" : ""}`}>
              <Calendar className="w-4 h-4" />
              <span className="font-light">{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.estimatedTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-light">{task.estimatedTime}m</span>
            </div>
          )}
          {task.actualTime && (
            <div className="flex items-center gap-2 text-gray-400">
              <Timer className="w-4 h-4" />
              <span className="font-light">{task.actualTime}m</span>
            </div>
          )}
        </div>

        {task.column !== "completed" && (
          <button
            onClick={() => onStartTimer(task.id)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isActiveTimer
                ? "text-gray-300 bg-gray-700/50"
                : hasPausedTimer
                  ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-700/50"
            }`}
            title={isActiveTimer ? "Timer Active" : hasPausedTimer ? "Resume Timer" : "Start Timer"}
          >
            <Play className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
