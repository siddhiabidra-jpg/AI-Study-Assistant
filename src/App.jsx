import { useState } from 'react'
import './App.css'

const exampleQuestions = [
  'Explain Fourier Transform in simple words',
  'What is IoT and how does it work?',
  'Explain Newton’s laws with examples',
]

function formatInline(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    return part
  })
}

function formatAnswer(text) {
  return text
    .replace(/\\([#*_ -])/g, '$1')
    .split('\n')
    .map((line, index) => {
      const value = line.trim()

      if (!value) {
        return <div key={index} className="answer-space" />
      }

      if (/^#{1,3}\s+/.test(value)) {
        return (
          <h3 key={index} className="answer-heading">
            {formatInline(value.replace(/^#{1,3}\s+/, ''))}
          </h3>
        )
      }

      if (/^---+$/.test(value)) {
        return <hr key={index} className="answer-divider" />
      }

      if (/^[-*•]\s+/.test(value)) {
        return (
          <div key={index} className="answer-bullet">
            <span>•</span>
            <p>{formatInline(value.replace(/^[-*•]\s+/, ''))}</p>
          </div>
        )
      }

      if (/^\d+\.\s+/.test(value)) {
        return (
          <div key={index} className="answer-number">
            <span>{value.match(/^\d+/)[0]}.</span>
            <p>{formatInline(value.replace(/^\d+\.\s+/, ''))}</p>
          </div>
        )
      }

      return (
        <p key={index} className="answer-paragraph">
          {formatInline(value)}
        </p>
      )
    })
}

function App() {
  const [topic, setTopic] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedTopic = topic.trim()

    if (!trimmedTopic) {
      setError('Please enter a topic or question.')
      setAnswer('')
      return
    }

    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await fetch('http://localhost:5000/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: trimmedTopic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.')
      }

      setAnswer(data.answer)
    } catch (error) {
      console.error('Frontend error:', error)
      setError(
        'Unable to generate the explanation. Please make sure the backend server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (question) => {
    setTopic(question)
    setError('')
  }

  const handleClear = () => {
    setTopic('')
    setAnswer('')
    setError('')
  }

  return (
    <main className="app">
      <div className="background-shape shape-one" aria-hidden="true"></div>
      <div className="background-shape shape-two" aria-hidden="true"></div>

      <section className="container">
        <header className="header">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">✦</span>
            <span>StudyAI</span>
          </div>

          <span className="status">
            <span className="status-dot" aria-hidden="true"></span>
            AI Assistant Online
          </span>
        </header>

        <section className="hero-section">
          <div className="badge">
            ✨ AI-POWERED LEARNING
          </div>

          <h1>
            Learn smarter.
            <br />
            <span>Understand faster.</span>
          </h1>

          <p className="subtitle">
            Your personal AI study assistant for clear, simple and
            student-friendly explanations.
          </p>

          <form onSubmit={handleSubmit} className="study-form">
            <label htmlFor="topic">
              What do you want to learn?
            </label>

            <div className="input-wrapper">
              <textarea
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Ask anything... e.g. Explain Fourier Transform in simple words"
                rows="4"
                disabled={loading}
              />

              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    Thinking...
                  </>
                ) : (
                  <>
                    Explain with AI
                    <span className="arrow" aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>

            <p className="help-text">
              💡 Tip: Ask about any engineering concept, formula or topic.
            </p>

            {error && (
              <p className="error-message" role="alert">
                ⚠️ {error}
              </p>
            )}
          </form>

          <div className="examples">
            <p>Try an example</p>

            <div className="example-list">
              {exampleQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="example-button"
                  onClick={() => handleExampleClick(question)}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </section>

        {answer && (
          <section className="answer-card" aria-live="polite">
            <div className="answer-header">
              <div className="answer-icon" aria-hidden="true">✦</div>

              <div>
                <span className="answer-label">
                  AI RESPONSE
                </span>

                <h2>Your Explanation</h2>
              </div>

              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

            <div className="answer-content">
              {formatAnswer(answer)}
            </div>
          </section>
        )}

        <footer className="footer">
          <span>Built for smarter learning</span>
          <span>•</span>
          <span>Powered by Gemini AI</span>
        </footer>
      </section>
    </main>
  )
}

export default App