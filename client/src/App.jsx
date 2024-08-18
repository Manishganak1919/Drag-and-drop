import { useState } from 'react'
import myData from './data'
import './App.css'
import Notes from './components/Notes';

function App() {
 const [notes, setNotes] = useState(myData);

  return (
    <div>
      <Notes notes={notes} setNotes={setNotes}/>
    </div>
  )
}

export default App
