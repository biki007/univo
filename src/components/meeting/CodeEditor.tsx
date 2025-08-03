'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  PlayIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

interface CodeEditorProps {
  roomId: string
  isReadOnly?: boolean
  className?: string
}

interface CodeFile {
  id: string
  name: string
  language: string
  content: string
  isActive: boolean
}

interface Participant {
  id: string
  name: string
  color: string
  cursor?: {
    line: number
    column: number
  }
}

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'html', name: 'HTML', extension: '.html' },
  { id: 'css', name: 'CSS', extension: '.css' },
  { id: 'json', name: 'JSON', extension: '.json' },
  { id: 'markdown', name: 'Markdown', extension: '.md' },
]

const THEMES = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'monokai', name: 'Monokai' },
  { id: 'github', name: 'GitHub' },
]

const DEFAULT_CODE_TEMPLATES = {
  javascript: `// Welcome to the collaborative code editor!
// You can write JavaScript code here

function greetClass(className) {
    console.log(\`Hello, \${className}! Let's learn together.\`);
}

// Example: Working with arrays
const students = ['Alice', 'Bob', 'Charlie'];
students.forEach(student => {
    greetClass(student);
});

// Try running this code!`,
  
  python: `# Welcome to the collaborative code editor!
# You can write Python code here

def greet_class(class_name):
    print(f"Hello, {class_name}! Let's learn together.")

# Example: Working with lists
students = ['Alice', 'Bob', 'Charlie']
for student in students:
    greet_class(student)

# Try running this code!`,
  
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning HTML</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .highlight { background-color: yellow; }
    </style>
</head>
<body>
    <h1>Welcome to Our Coding Class!</h1>
    <p>This is a <span class="highlight">collaborative</span> HTML document.</p>
    <ul>
        <li>Learn together</li>
        <li>Share ideas</li>
        <li>Build amazing things</li>
    </ul>
</body>
</html>`,
}

export function CodeEditor({ roomId, isReadOnly = false, className }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: 'main',
      name: 'main.js',
      language: 'javascript',
      content: DEFAULT_CODE_TEMPLATES.javascript,
      isActive: true,
    }
  ])
  
  const [activeFileId, setActiveFileId] = useState('main')
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState(14)
  const [showSettings, setShowSettings] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Teacher', color: '#3b82f6' },
    { id: '2', name: 'Student 1', color: '#ef4444' },
    { id: '3', name: 'Student 2', color: '#10b981' },
  ])

  const activeFile = files.find(f => f.id === activeFileId) || files[0]

  // Handle file content change
  const handleContentChange = (content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { ...file, content }
        : file
    ))
  }

  // Add new file
  const addNewFile = () => {
    const language = 'javascript'
    const extension = LANGUAGES.find(l => l.id === language)?.extension || '.js'
    const newFile: CodeFile = {
      id: `file_${Date.now()}`,
      name: `untitled${extension}`,
      language,
      content: DEFAULT_CODE_TEMPLATES[language as keyof typeof DEFAULT_CODE_TEMPLATES] || '',
      isActive: false,
    }
    
    setFiles(prev => [...prev, newFile])
    setActiveFileId(newFile.id)
  }

  // Delete file
  const deleteFile = (fileId: string) => {
    if (files.length <= 1) return // Keep at least one file
    
    setFiles(prev => prev.filter(f => f.id !== fileId))
    if (activeFileId === fileId) {
      setActiveFileId(files.find(f => f.id !== fileId)?.id || files[0].id)
    }
  }

  // Change file language
  const changeLanguage = (language: string) => {
    const extension = LANGUAGES.find(l => l.id === language)?.extension || '.txt'
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { 
            ...file, 
            language,
            name: file.name.replace(/\.[^.]+$/, extension)
          }
        : file
    ))
  }

  // Run code (mock implementation)
  const runCode = async () => {
    if (!activeFile.content.trim()) {
      setOutput('❌ Error: No code to execute. Please write some code first.')
      return
    }

    setIsRunning(true)
    setOutput('Running code...\n')
    
    try {
      // Simulate code execution with error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random errors for demonstration
          const hasError = Math.random() < 0.1 // 10% chance of error
          
          if (hasError) {
            reject(new Error('Syntax error: Unexpected token'))
          } else {
            resolve(null)
          }
        }, 1500 + Math.random() * 1000) // Random execution time
      })

      // Success output
      if (activeFile.language === 'javascript') {
        setOutput(`> Running ${activeFile.name}\nHello, Class! Let's learn together.\nHello, Alice! Let's learn together.\nHello, Bob! Let's learn together.\nHello, Charlie! Let's learn together.\n\n✅ Code executed successfully!`)
      } else if (activeFile.language === 'python') {
        setOutput(`> Running ${activeFile.name}\nHello, Class! Let's learn together.\nHello, Alice! Let's learn together.\nHello, Bob! Let's learn together.\nHello, Charlie! Let's learn together.\n\n✅ Code executed successfully!`)
      } else if (activeFile.language === 'html') {
        setOutput(`> ${activeFile.name} rendered successfully!\n\n🌐 HTML document is ready for preview.\n\nTip: You can view this in a browser to see the rendered output.`)
      } else {
        setOutput(`> ${activeFile.name} processed successfully!\n\n📝 File is ready for use.`)
      }
    } catch (error) {
      // Error output
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setOutput(`> Running ${activeFile.name}\n❌ Execution failed!\n\nError: ${errorMessage}\n\nPlease check your code and try again.`)
    } finally {
      setIsRunning(false)
    }
  }

  // Copy code to clipboard
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content)
      setOutput(prev => prev + '\n📋 Code copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy code:', err)
      setOutput(prev => prev + '\n❌ Failed to copy code to clipboard.')
    }
  }

  // Download file
  const downloadFile = () => {
    try {
      const blob = new Blob([activeFile.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeFile.name
      a.click()
      URL.revokeObjectURL(url)
      setOutput(prev => prev + `\n💾 Downloaded ${activeFile.name}`)
    } catch (error) {
      console.error('Failed to download file:', error)
      setOutput(prev => prev + '\n❌ Failed to download file.')
    }
  }

  // Get syntax highlighting classes (basic implementation)
  const getSyntaxHighlighting = (content: string, language: string) => {
    // This is a very basic syntax highlighting
    // In a real implementation, you'd use a proper syntax highlighter like Prism.js or Monaco Editor
    return content
  }

  return (
    <div className={`flex flex-col h-full bg-gray-900 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-white">Code Editor</h3>
          <div className="flex items-center space-x-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: participant.color }}
                />
                <span className="text-xs text-gray-300">{participant.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-300 hover:text-white"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center overflow-x-auto bg-gray-800 border-b border-gray-700">
        {files.map(file => (
          <div
            key={file.id}
            className={`flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer hover:bg-gray-700 ${
              file.id === activeFileId ? 'bg-gray-700 text-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveFileId(file.id)}
          >
            <span className="text-sm">{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFile(file.id)
                }}
                className="ml-2 text-gray-500 hover:text-red-400"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addNewFile}
          className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          +
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <select
            value={activeFile.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded"
            title="Select programming language"
            aria-label="Programming language"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          
          <Badge variant="secondary" className="text-xs">
            {activeFile.content.split('\n').length} lines
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="text-gray-300 hover:text-white"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadFile}
            className="text-gray-300 hover:text-white"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlayIcon className="w-4 h-4 mr-1" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex flex-col flex-1">
          <div className="relative flex-1">
            <textarea
              ref={editorRef}
              value={activeFile.content}
              onChange={(e) => handleContentChange(e.target.value)}
              readOnly={isReadOnly}
              className="w-full h-full p-4 font-mono text-white bg-gray-900 resize-none focus:outline-none"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
              placeholder="Start coding here..."
              spellCheck={false}
            />
            
            {/* Line numbers (basic implementation) */}
            <div className="absolute top-0 left-0 p-4 font-mono text-gray-500 pointer-events-none select-none">
              {activeFile.content.split('\n').map((_, index) => (
                <div key={index} style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}>
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col bg-gray-800 border-l border-gray-700 w-80">
          <div className="p-3 border-b border-gray-700">
            <h4 className="font-semibold text-white">Output</h4>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
              {output || 'Click "Run" to execute your code...'}
            </pre>
          </div>
          
          {/* Quick Actions */}
          <div className="p-3 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOutput('')}
                className="text-xs"
              >
                Clear Output
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={runCode}
                disabled={isRunning}
                className="text-xs"
              >
                Run Again
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute z-10 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg top-16 right-4">
          <div className="p-4">
            <h4 className="mb-3 font-semibold text-white">Editor Settings</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm text-gray-300">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded"
                  title="Select editor theme"
                  aria-label="Editor theme"
                >
                  {THEMES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-gray-300">Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                  title="Adjust font size"
                  aria-label="Font size slider"
                />
                <span className="text-xs text-gray-400">{fontSize}px</span>
              </div>
            </div>
            
            <div className="pt-3 mt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}