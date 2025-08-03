'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  PencilIcon,
  PaintBrushIcon,
  Square3Stack3DIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline'

interface WhiteboardProps {
  roomId: string
  isReadOnly?: boolean
  className?: string
}

interface DrawingPoint {
  x: number
  y: number
  pressure?: number
}

interface DrawingStroke {
  id: string
  points: DrawingPoint[]
  color: string
  width: number
  tool: 'pen' | 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle'
  timestamp: number
}

interface WhiteboardState {
  strokes: DrawingStroke[]
  currentStroke: DrawingStroke | null
  undoStack: DrawingStroke[][]
  redoStack: DrawingStroke[][]
}

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
]

const BRUSH_SIZES = [2, 4, 8, 12, 16, 24]

export function Whiteboard({ roomId, isReadOnly = false, className }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle'>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentWidth, setCurrentWidth] = useState(4)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBrushPicker, setShowBrushPicker] = useState(false)
  
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>({
    strokes: [],
    currentStroke: null,
    undoStack: [],
    redoStack: [],
  })

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.color-picker-container')) {
        setShowColorPicker(false)
      }
      if (!target.closest('.brush-picker-container')) {
        setShowBrushPicker(false)
      }
    }

    if (showColorPicker || showBrushPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker, showBrushPicker])

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw all strokes
    whiteboardState.strokes.forEach(stroke => {
      drawStroke(ctx, stroke)
    })

    // Draw current stroke if exists
    if (whiteboardState.currentStroke) {
      drawStroke(ctx, whiteboardState.currentStroke)
    }
  }, [whiteboardState.strokes, whiteboardState.currentStroke])

  // Draw a single stroke
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length === 0) return

    ctx.save()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    if (stroke.tool === 'rectangle') {
      const startPoint = stroke.points[0]
      const endPoint = stroke.points[stroke.points.length - 1]
      const width = endPoint.x - startPoint.x
      const height = endPoint.y - startPoint.y
      
      ctx.strokeRect(startPoint.x, startPoint.y, width, height)
    } else if (stroke.tool === 'circle') {
      const startPoint = stroke.points[0]
      const endPoint = stroke.points[stroke.points.length - 1]
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      )
      
      ctx.beginPath()
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    } else if (stroke.tool === 'line') {
      const startPoint = stroke.points[0]
      const endPoint = stroke.points[stroke.points.length - 1]
      
      ctx.beginPath()
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(endPoint.x, endPoint.y)
      ctx.stroke()
    } else {
      // Free drawing (pen, brush, eraser)
      ctx.beginPath()
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
    }

    ctx.restore()
  }

  // Redraw when state changes
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // Get mouse/touch position
  const getEventPosition = (event: React.MouseEvent | React.TouchEvent): DrawingPoint => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
        pressure: 1,
      }
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
        pressure: 1,
      }
    }
  }

  // Start drawing
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly) return

    event.preventDefault()
    setIsDrawing(true)

    const point = getEventPosition(event)
    const newStroke: DrawingStroke = {
      id: `stroke_${Date.now()}_${Math.random()}`,
      points: [point],
      color: currentTool === 'eraser' ? '#ffffff' : currentColor,
      width: currentWidth,
      tool: currentTool,
      timestamp: Date.now(),
    }

    setWhiteboardState(prev => ({
      ...prev,
      currentStroke: newStroke,
      redoStack: [], // Clear redo stack when starting new action
    }))
  }

  // Continue drawing
  const continueDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isReadOnly || !whiteboardState.currentStroke) return

    event.preventDefault()
    const point = getEventPosition(event)

    setWhiteboardState(prev => ({
      ...prev,
      currentStroke: prev.currentStroke ? {
        ...prev.currentStroke,
        points: [...prev.currentStroke.points, point],
      } : null,
    }))
  }

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing || !whiteboardState.currentStroke) return

    setIsDrawing(false)

    setWhiteboardState(prev => ({
      ...prev,
      strokes: [...prev.strokes, prev.currentStroke!],
      currentStroke: null,
      undoStack: [...prev.undoStack, prev.strokes],
    }))
  }

  // Undo
  const undo = () => {
    if (whiteboardState.undoStack.length === 0) return

    const previousState = whiteboardState.undoStack[whiteboardState.undoStack.length - 1]
    
    setWhiteboardState(prev => ({
      ...prev,
      strokes: previousState,
      undoStack: prev.undoStack.slice(0, -1),
      redoStack: [...prev.redoStack, prev.strokes],
    }))
  }

  // Redo
  const redo = () => {
    if (whiteboardState.redoStack.length === 0) return

    const nextState = whiteboardState.redoStack[whiteboardState.redoStack.length - 1]
    
    setWhiteboardState(prev => ({
      ...prev,
      strokes: nextState,
      redoStack: prev.redoStack.slice(0, -1),
      undoStack: [...prev.undoStack, prev.strokes],
    }))
  }

  // Clear canvas
  const clearCanvas = () => {
    setWhiteboardState(prev => ({
      ...prev,
      strokes: [],
      currentStroke: null,
      undoStack: [...prev.undoStack, prev.strokes],
      redoStack: [],
    }))
  }

  // Export canvas as image
  const exportCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `whiteboard_${roomId}_${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* Drawing Tools */}
          <div className="flex items-center p-1 space-x-1 bg-white border rounded-lg">
            <Button
              variant={currentTool === 'pen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('pen')}
              className="p-2"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'brush' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('brush')}
              className="p-2"
            >
              <PaintBrushIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'eraser' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('eraser')}
              className="p-2"
            >
              <Square3Stack3DIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Shape Tools */}
          <div className="flex items-center p-1 space-x-1 bg-white border rounded-lg">
            <Button
              variant={currentTool === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('line')}
              className="p-2"
            >
              <span className="font-mono text-xs">—</span>
            </Button>
            <Button
              variant={currentTool === 'rectangle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('rectangle')}
              className="p-2"
            >
              <span className="font-mono text-xs">□</span>
            </Button>
            <Button
              variant={currentTool === 'circle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('circle')}
              className="p-2"
            >
              <span className="font-mono text-xs">○</span>
            </Button>
          </div>

          {/* Color Picker */}
          <div className="relative color-picker-container">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2"
            >
              <div 
                className="w-6 h-6 border-2 border-gray-300 rounded"
                style={{ backgroundColor: currentColor }}
              />
            </Button>
            {showColorPicker && (
              <div className="absolute left-0 z-10 p-2 mt-1 bg-white border rounded-lg shadow-lg top-full">
                <div className="grid grid-cols-4 gap-1">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      title={`Select color ${color}`}
                      className={`w-8 h-8 rounded border-2 ${
                        currentColor === color ? 'border-gray-600' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setCurrentColor(color)
                        setShowColorPicker(false)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Brush Size */}
          <div className="relative brush-picker-container">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBrushPicker(!showBrushPicker)}
              className="p-2"
            >
              <div 
                className="bg-gray-800 rounded-full"
                style={{ 
                  width: Math.min(currentWidth + 4, 20), 
                  height: Math.min(currentWidth + 4, 20) 
                }}
              />
            </Button>
            {showBrushPicker && (
              <div className="absolute left-0 z-10 p-2 mt-1 bg-white border rounded-lg shadow-lg top-full">
                <div className="flex flex-col space-y-2">
                  {BRUSH_SIZES.map(size => (
                    <button
                      key={size}
                      title={`Select brush size ${size}px`}
                      className={`flex items-center justify-center w-12 h-8 rounded ${
                        currentWidth === size ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setCurrentWidth(size)
                        setShowBrushPicker(false)
                      }}
                    >
                      <div
                        className="bg-gray-800 rounded-full"
                        style={{ width: size, height: size }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={whiteboardState.undoStack.length === 0}
            className="p-2"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={whiteboardState.redoStack.length === 0}
            className="p-2"
          >
            <ArrowUturnRightIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="p-2 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportCanvas}
            className="p-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-white cursor-crosshair"
        style={{ cursor: currentTool === 'eraser' ? 'grab' : 'crosshair' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={continueDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={continueDrawing}
          onTouchEnd={stopDrawing}
        />
        
        {whiteboardState.strokes.length === 0 && !whiteboardState.currentStroke && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-center">
              <PencilIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">Start drawing on the whiteboard</p>
              <p className="text-sm">Use the tools above to draw, write, or add shapes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}