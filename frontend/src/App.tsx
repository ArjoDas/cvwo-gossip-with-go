import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    axios.get('/api/ping')
      .then(res => {
        console.log("Response:", res.data)
        setMessage(res.data.message)
      })
      .catch(err => {
        console.error("Error connecting:", err)
        setMessage("Error connecting to backend")
      })
  }, [])

  return (
    <>
      <h1>Gossip with Go</h1>
      <div>
        <p>Backend Status: <strong>{message}</strong></p>
      </div>
    </>
  )
}

export default App