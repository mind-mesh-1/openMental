import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

export function DocumentQA() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceId, setSourceId] = useState<string>('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    setFile(e.target.files[0])
    const formData = new FormData()
    formData.append('file', e.target.files[0])

    try {
      setLoading(true)
      const response = await fetch('http://localhost:50564/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setSourceId(data.source_id)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAskQuestion = async () => {
    if (!sourceId || !question) return

    try {
      setLoading(true)
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          question,
        }),
      })
      const data = await response.json()
      setAnswer(data.answer)
    } catch (error) {
      console.error('Error asking question:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Upload Document</h2>
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={loading}
          />
          {sourceId && (
            <p className="mt-2 text-sm text-gray-500">
              Document ID: {sourceId}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Ask a Question</h2>
          <Textarea
            placeholder="Enter your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!sourceId || loading}
            className="mb-2"
          />
          <Button
            onClick={handleAskQuestion}
            disabled={!sourceId || !question || loading}
          >
            {loading ? 'Processing...' : 'Ask Question'}
          </Button>
        </div>

        {answer && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Answer</h2>
            <div className="p-4 bg-gray-100 rounded-lg">
              {answer}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}