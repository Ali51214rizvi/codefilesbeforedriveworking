// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Select from './components/exam/select';
import Login from './components/auth/login';
import SignUp from './components/auth/signup';
import StudentDashBoard from './components/student/studentdashboard';
import ExamInstructions from './components/exam/examinstructions';
import AdminDashboard from './components/admin/admindashboard';
import AddQuestion from './components/admin/addquestion';
import Objective from './components/exam/objective';
import Subjective from './components/exam/subjective';
import ViewResult from './components/student/viewresult';
import StartSubjectiveExam from './components/exam/startsubjectiveexam';
import StartObjectiveExam from './components/exam/startobjectiveexam';
import CheckExam from './components/admin/checkexam';
import CheckMarks from './components/admin/checkmarks';
import StudentAttendence from './components/student/studentattendence';


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
