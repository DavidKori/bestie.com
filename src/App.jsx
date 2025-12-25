import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import './App.css';

// import { Toaster } from 'react-hot-toast';
// import BestieEntry from './pages/landing';
// import BestieWelcome from './pages/home';
// import SongDedication from './components/songDedication';
// import MessagesExperience from './components/messages';
// import PhotoJourney from './components/gallery';
// import JokesExperience from './components/jokes';
// import InteractiveQuestions from './components/question';
// import ReasonsWhyILoveYou from './components/reason';
// import PlaylistExperience from './components/playlist';

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//     <Toaster/>
//     <Routes>
//       <Route path='/' element={<Navigate to={"landing"} />} />
//       <Route path='/landing' element={<BestieEntry/>} />
//        <Route path='/home' element={<BestieWelcome/>} />
//       {/* <Route path='/content' element={<ContentPage/>} /> */}
//       <Route path='/test' element={<PlaylistExperience/>} />

//     </Routes>
      
//     </>
//   )
// }

// export default App



import ExperienceController from './common/mainController';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    
    <div className="App">
      <Toaster/>
      <ExperienceController />
    </div>
  );
}