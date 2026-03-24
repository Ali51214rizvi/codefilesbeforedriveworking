// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Select from './components/select';
import Login from './components/login';
import SignUp from './components/signup';
import StudentDashBoard from './components/studentdashboard';
import ExamInstructions from './components/examinstructions';
import AdminDashboard from './components/admindashboard';
import AddQuestion from './components/addquestion';
import Objective from './components/objective';
import Subjective from './components/subjective';
import ViewResult from './components/viewresult';
import StartSubjectiveExam from './components/startsubjectiveexam';
import StartObjectiveExam from './components/startobjectiveexam';
import CheckExam from './components/checkexam';
import CheckMarks from './components/checkmarks';
import StudentAttendence from './components/studentattendence';


import './App.css'; 

function App() {
  return (
    <Router>
      <div className="app-container"> 
<Routes>
  <Route path="/" element={<Select />} />
  <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp/>} />
   <Route path="/studentdashboard" element={<StudentDashBoard/>} /> 
    <Route path="/examinstructions" element={<ExamInstructions />} />
 <Route path="/admindashboard" element={<AdminDashboard />} />
<Route path="/addquestion" element={<AddQuestion />} />
<Route path="/objective" element={<Objective />} />
<Route path="/subjective" element={<Subjective />} />
<Route path="/startsubjectiveexam" element={<StartSubjectiveExam />} />
<Route path="/startobjectiveexam" element={<StartObjectiveExam />} />
<Route path="/viewresult" element={<ViewResult />} />
<Route path="/checkexam" element={<CheckExam />} />
<Route path="/checkmarks" element={<CheckMarks />} />
<Route path="/studentattendence" element={<StudentAttendence />} />
{/*
<Route path="/studentlist" element={<StudentList />} /> */}
</Routes>

      </div>
    </Router>
  );
}

export default App;
