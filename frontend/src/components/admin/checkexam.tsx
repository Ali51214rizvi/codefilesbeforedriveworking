import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./checkexam.css";

interface Submission {
  subject: string;
  class: string;
  department: string;
  rollNo: string;
  answers: string[];
  quizNumber: string;
  submittedAt: string;
  suspiciousWarnings?: number;
  restrictedWarnings?: number;
}

function CheckExam() {

  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<any>({});
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const [subject,setSubject] = useState("");
  const [studentClass,setStudentClass] = useState("");
  const [department,setDepartment] = useState("");
  const [rollNo,setRollNo] = useState("");

  const [marks,setMarks] = useState<number[]>([]);
  const [totalMarks,setTotalMarks] = useState(0);

  useEffect(()=>{
    const stored = JSON.parse(localStorage.getItem("subjectiveSubmissions") || "{}");
    setSubmissions(stored);
  },[]);


  const handleSearch = ()=>{

    if(!subject || !studentClass || !department || !rollNo){
      alert("Please fill all fields");
      return;
    }

    const key = `${subject}_${studentClass}_${department}_${rollNo}`;
    const found = submissions[key];

    if(found){

      setSelectedSubmission(found);

      setMarks(new Array(found.answers.length).fill(0));
      setTotalMarks(0);

    }
    else{
      alert("No exam submission found");
      setSelectedSubmission(null);
    }

  };


  const handleMarkChange = (index:number,value:string)=>{

    const updated = [...marks];
    updated[index] = Number(value) || 0;

    setMarks(updated);

    const sum = updated.reduce((a,b)=>a+b,0);
    setTotalMarks(sum);

  };


  const handleUploadMarks = ()=>{

    if(!selectedSubmission) return;

    const gradedData = JSON.parse(localStorage.getItem("subjectiveGrades") || "{}");

    const key = `${selectedSubmission.subject}_${selectedSubmission.class}_${selectedSubmission.department}_${selectedSubmission.rollNo}`;

    gradedData[key] = {
      ...selectedSubmission,
      marks,
      totalMarks,
      gradedAt:new Date().toISOString()
    };

    localStorage.setItem("subjectiveGrades",JSON.stringify(gradedData));

    alert("Marks uploaded successfully");

  };


  const subjects = ["Math","Physics","Computer"];
  const classes = ["10th","11th","12th"];
  const departments = ["Science","Arts","Commerce"];


  return (

    <div className="checkexam-wrapper">

      {/* NAVBAR */}

      <nav className="checkexam-navbar">

        <button
        className="ce-back-btn"
        onClick={()=>navigate("/admindashboard")}
        >
        ⟵
        </button>

        <h2>Subjective Exam Evaluation</h2>

      </nav>



      {/* SEARCH PANEL */}

      <div className="search-panel">

        <h3>Search Student Submission</h3>

        <div className="search-fields">

          <select
          value={subject}
          onChange={(e)=>setSubject(e.target.value)}
          >
          <option value="">Select Subject</option>
          {subjects.map((s,i)=>(
            <option key={i}>{s}</option>
          ))}
          </select>


          <select
          value={studentClass}
          onChange={(e)=>setStudentClass(e.target.value)}
          >
          <option value="">Select Class</option>
          {classes.map((c,i)=>(
            <option key={i}>{c}</option>
          ))}
          </select>


          <select
          value={department}
          onChange={(e)=>setDepartment(e.target.value)}
          >
          <option value="">Select Department</option>
          {departments.map((d,i)=>(
            <option key={i}>{d}</option>
          ))}
          </select>


          <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollNo}
          onChange={(e)=>setRollNo(e.target.value)}
          />

          <button
          className="search-btn"
          onClick={handleSearch}
          >
          Search
          </button>

        </div>

      </div>



      {/* SUBMISSION DETAILS */}

      {selectedSubmission && (

      <div className="submission-container">

        <div className="submission-info">

          <h3>Exam Information</h3>

          <p><strong>Subject:</strong> {selectedSubmission.subject}</p>
          <p><strong>Class:</strong> {selectedSubmission.class}</p>
          <p><strong>Department:</strong> {selectedSubmission.department}</p>
          <p><strong>Roll Number:</strong> {selectedSubmission.rollNo}</p>
          <p><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>

          <div className="warning-box">

            <p>⚠ Suspicious Warnings: <strong>{selectedSubmission.suspiciousWarnings || 0}</strong></p>
            <p>🚫 Restricted Warnings: <strong>{selectedSubmission.restrictedWarnings || 0}</strong></p>

          </div>

        </div>



        {/* ANSWER SHEET */}

        <div className="answers-section">

          <h3>Student Answer Sheet</h3>

          {selectedSubmission.answers.map((ans,index)=>(
            <div
            key={index}
            className="answer-block"
            >

              <label>Question {index+1}</label>

              <textarea
              readOnly
              value={ans}
              />

              <input
              type="number"
              min="0"
              placeholder="Enter Marks"
              onChange={(e)=>handleMarkChange(index,e.target.value)}
              />

            </div>
          ))}

        </div>



        {/* TOTAL MARKS */}

        <div className="marks-summary">

          <h3>Total Marks: {totalMarks}</h3>

          <button
          className="upload-btn"
          onClick={handleUploadMarks}
          >
          Upload Marks
          </button>

        </div>


      </div>

      )}


    </div>

  );

}

export default CheckExam;