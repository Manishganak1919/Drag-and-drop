import { createRef, useEffect, useRef, useState } from "react";
import MyNote from "./MyNote";

const Notes = ({ notes = [], setNotes = () => {} }) => {
  const noteRefs = useRef([]); // For holding refs for each note
  const [draggingNote, setDraggingNote] = useState(null); // To track the currently dragged note
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // To store the offset during drag
  const [newNoteText, setNewNoteText] = useState(""); // For storing the input text

  useEffect(() => {
    // Local storage logic to persist note positions
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    const updatedNotes = notes.map((note) => {
      const savedNote = savedNotes.find((n) => n.id === note.id);
      if (savedNote) {
        return { ...note, position: savedNote.position };
      } else {
        const position = determineNewPosition();
        return { ...note, position };
      }
    });

    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }, [notes.length]);

  // Generate a new random position for a note (in case no saved position exists)
  const determineNewPosition = () => {
    const maxX = window.innerWidth - 250;
    const maxY = window.innerHeight - 250;

    return {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    };
  };

  // Start dragging a note
  const handleDragStart = (note, e) => {
    const { id } = note;
    const noteRef = noteRefs.current[id].current;
    const rect = noteRef.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setOffset({ x: offsetX, y: offsetY }); // Store offset between mouse and element
    setDraggingNote(id); // Track which note is being dragged

    const handleMouseMove = (e) => {
      if (draggingNote !== null) {
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        // Set the new position during dragging
        noteRef.style.left = `${newX}px`;
        noteRef.style.top = `${newY}px`;
      }
    };

    const handleMouseUp = () => {
      if (draggingNote !== null) {
        const finalRect = noteRef.getBoundingClientRect();
        const newPosition = { x: finalRect.left, y: finalRect.top };

        if (checkForOverlap(id)) {
          // If overlap, reset to the original position
          noteRef.style.left = `${note.position.x}px`;
          noteRef.style.top = `${note.position.y}px`;
        } else {
          // Update the note's position in the state and localStorage
          updateNotePosition(id, newPosition);
        }
        setDraggingNote(null); // Stop tracking the dragged note
      }

      // Clean up event listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Add listeners to move the note
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Function to check for overlap with other notes
  const checkForOverlap = (id) => {
    const currentNoteRef = noteRefs.current[id].current;
    const currentRect = currentNoteRef.getBoundingClientRect();

    // Check for overlap with other notes
    return notes.some((note) => {
      if (note.id === id) return false;

      const otherNoteRef = noteRefs.current[note.id].current;
      const otherRect = otherNoteRef.getBoundingClientRect();

      // Check if the rectangles overlap
      const overlap = !(
        currentRect.right < otherRect.left ||
        currentRect.left > otherRect.right ||
        currentRect.bottom < otherRect.top ||
        currentRect.top > otherRect.bottom
      );

      return overlap;
    });
  };

  // Update the note's position in the state and localStorage
  const updateNotePosition = (id, newPosition) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, position: newPosition } : note
    );
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  
  const handleAddNote = () => {
    if (newNoteText.trim()) {
      const newNote = {
        id: Date.now(), 
        text: newNoteText,
        position: determineNewPosition(),
      };
      setNotes([...notes, newNote]); 
      setNewNoteText(""); 
    }
  };

  return (
    <div>
      <div className="my-4 flex space-x-2 justify-center">
        <input
          type="text"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)} 
          placeholder="Add new text"
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[30%]"
        />
        <button
          onClick={handleAddNote}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>

      {notes.map((note) => (
        <MyNote
          key={note.id}
          ref={
            noteRefs.current[note.id]
              ? noteRefs.current[note.id]
              : (noteRefs.current[note.id] = createRef())
          }
          initialPos={note.position}
          content={note.text}
          onMouseDown={(e) => handleDragStart(note, e)} // Start drag
        />
      ))}
    </div>
  );
};

export default Notes;
