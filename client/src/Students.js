import React, { useState } from 'react';
import './App.css';
const $ = require('jquery');

function Students(){

  const masterList = (() => {
    let temp = null;
    $.ajax({
      async: false,
      type: "GET",
      global: false,
      crossDomain: true,
      dataType: "json",
      url: "/getStudents",
      success: (data) => {
        temp = data;
      }
    });
    return temp;
  })();

  const [studentList, setStudentList] = useState(masterList);

  function enterClicked(event) {
    if(event.keyCode === 13) search();
  }

  function search(){
    let query = $('#search-input').val();
    let updatedList = [];
    let tempList = [...masterList];

    tempList.forEach(record => {
      let elements = Object.values(record);

      elements.some((element) => {
        if ((typeof element === "string" && element.search(new RegExp(query, "i")) !== -1) ||
          element == query) {
          updatedList.push(record);
          return true;
        }
      })
    });

    setStudentList(updatedList);
  }

  return(
    <div id="students-list">
      <div id="header">
        <span>Students Roster</span>
        <div id="search-box" class="form-inline">
          <input type="text" id="search-input" placeholder="Search" class="form-control" onKeyUp={enterClicked}/>
          <button id="search-btn" class="btn btn-outline-secondary" onClick={search}>
            <i className="fa fa-search" />
          </button>
        </div>
      </div>
      <table>
        <tr id="header">
          <th>UMID</th>
          <th>Name</th>
          <th>Project</th>
          <th>Email</th>
          <th>Phone Number</th>
          <th width="20%">Scheduled</th>
        </tr>
        <StudentList studentList={studentList}/>
      </table>
    </div>
  )
}

function StudentList(props){
  
  return props.studentList.map(student => (
    <tr>
      <td>{student.umid}</td>
      <td>{student.firstname} {student.lastname}</td>
      <td>{student.title}</td>
      <td>{student.email}</td>
      <td>{student.phone}</td>
      <td>{student.scheduled}</td>
    </tr>
  ))
}

export default Students;