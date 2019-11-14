import React, { useState } from 'react';
import Cookies from 'js-cookie';
import './App.css';
import Cleave from 'cleave.js/react';
require('cleave.js/dist/addons/cleave-phone.us');
const $ = require('jquery');

function useForceUpdate() {
  let [value, setState] = useState(true);
  return () => setState(!value);
}

function Home() {

  return (
    <div className="signup">
      <Form />
    </div>
  );
}

function Form(){
  const forceUpdate = useForceUpdate();
  const [scheduleDiff, setScheduleDiff] = useState('');
  const [invalidList, setInvalidList] = useState([]);

  let cookie = Cookies.get('umid');

  if(!cookie){

    return(
      <div id="form-container">
        <div class="alert alert-danger" id="alert" role="alert">
          <h5 class="alert-heading" id="alert-header">Invalid Data</h5>
          <hr />
          <AlertBody invalidList={invalidList} />
        </div>
        <div className="form-group" id="signin-form">
          <ScheduleUpdateModal updatedTime={scheduleDiff} forceUpdate={forceUpdate}/>
          <h2>Sign Up</h2>
          <label for="umidInput">UMID</label>
          <input type="text" className="form-control" id="umidInput" placeholder="UMID" />
          <div className="form-row">
            <div className="col-md-6">
              <label for="firstInput">First Name</label>
              <input type="text" className="form-control" id="firstInput" placeholder="First Name" />
            </div>
            <div className="col-md-6">
              <label for="lastInput">Last Name</label>
              <input type="text" className="form-control" id="lastInput" placeholder="Last Name" />
            </div>
          </div>
          <label for="projectInput">Project Title</label>
          <input type="text" className="form-control" id="projectInput" placeholder="Project Title" />
          <label for="emailInput">Email</label>
          <input type="text" className="form-control" id="emailInput" placeholder="sample@email.com" />
          <label for="phoneInput">Phone Number</label>
          <Cleave placeholder="123 456 7890" options={{phone: true, phoneRegionCode: 'US'}} className="form-control" id="phoneInput" />
          <label for="timeSelect">Select Time</label>
          <select id="timeSelect" className="custom-select mr-sm-2">
            <option>-Select One-</option>
            <TimeSlots />
          </select>
          <div id="btn-container">
            <button id="submitBtn" className="btn btn-primary" onClick={()=>{bookReservation(setScheduleDiff, setInvalidList, forceUpdate)}}>Submit</button>
          </div>
        </div>
      </div>
    )
  } else {

    let reservation;

    const request = {
      umid: Cookies.get('umid')
    }

    $.ajax({
      async: false,
      type: 'POST',
      crossDomain: true,
      global: false,
      datatype: 'json',
      url: '/getReservation',
      data: request,
      success: function(data) {
        reservation = data;
      }
    });

    console.log(reservation);

    return(
      <div id="reservation-table">
        <table>
          <tbody>
            <tr>
              <th colSpan="2"><h2>Your Reservation</h2></th>
            </tr>
            <tr>
              <td>UMID:</td>
              <td>{reservation[0].umid}</td>
            </tr>
            <tr>
              <td>Name:</td>
              <td>{reservation[0].firstname + ' ' + reservation[0].lastname}</td>
            </tr>
            <tr>
              <td>Project Title:</td>
              <td>{reservation[0].title}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>{reservation[0].email}</td>
            </tr>
            <tr>
              <td>Phone Number:</td>
              <td>{reservation[0].phone}</td>
            </tr>
            <tr>
              <td for="timeSelect">Scheduled Time:</td>
              <td>{reservation[0].scheduled}</td>
            </tr>
            <tr>
              <td colSpan="2" id="btn-container">
                <button id="editBtn" className="btn btn-danger" onClick={()=>{deleteReservation(); forceUpdate()}}>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

function ScheduleUpdateModal(props) {

  let newScheduled = $('#timeSelect option:selected').text();
  newScheduled = newScheduled.substring(0, newScheduled.length - 4);

  return(
    <div id="modal-backdrop">
      <div id="sched-modal" tabindex="-1" class="modal" role="dialog">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5>Scheduling Conflict</h5>
              <button type="button" class="close">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>
                This UMID already exists in the system with a different scheduled time.
                Would you like to change the time?
              </p>
              <ul>
                <li>Previous: {props.updatedTime}</li>
                <li>Updated: {newScheduled}</li>
              </ul>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline-primary" id="yes-btn" onClick={()=>{updateSchedule(newScheduled);props.forceUpdate()}}>Yes</button>
              <button class="btn btn-outline-primary" id="no-btn" onClick={()=>{updateSchedule();props.forceUpdate()}}>No</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function updateSchedule(schedule){

  const umid = $('#umidInput').val();

  if(schedule != null){
    console.log('schedule is not null');
    let request = {
      schedule,
      umid
    }

    $.ajax({
      async: false,
      type: 'POST',
      crossDomain: true,
      global: false,
      datatype: 'json',
      url: '/updateSchedule',
      data: request,
      success: function(data) {
        console.log(data);
      }
    })
  }

  $("#modal-backdrop").css("display", "none");
  $("#sched-modal").css("display", "none");

  Cookies.set('umid', umid);
}

function TimeSlots(){

  let timeSlotList = [];
  $.ajax({
    async: false,
    type: 'GET',
    crossDomain: true,
    global: false,
    datatype: 'json',
    url: '/getTimeSlots',
    success: function(data) {
      timeSlotList = data;
    }
  });

  timeSlotList = timeSlotList.filter(slot => slot['occupants'] > 0);

  return timeSlotList.map(slot => (
      <option>{slot['timeframe'] + ' (' + slot['occupants'] + ')'}</option>
  ));

}

function bookReservation(setScheduleDiff, setInvalidList, forceUpdate){

  let scheduled = $('#timeSelect option:selected').val();
  scheduled = scheduled.substring(0, scheduled.length - 4);
  let form = {
    umid: $('#umidInput').val(),
    first: $('#firstInput').val(),
    last: $('#lastInput').val(),
    title: $('#projectInput').val(),
    email: $('#emailInput').val(),
    phone: $('#phoneInput').val(),
    scheduled
  };

  if(isValid(setInvalidList)){
    $('#alert').css('visiblility', 'hidden');

    $.ajax({
      async: false,
      type: 'POST',
      crossDomain: true,
      global: false,
      datatype: 'json',
      url: '/bookReservation',
      data: form,
      statusCode: {
        200: () => {
          Cookies.set('umid', $('#umidInput').val());
          forceUpdate();  
        },
        302: (data) => {
          let scheduled = data.responseJSON[0].scheduled
          if(form.scheduled !== scheduled){
            setScheduleDiff(scheduled);
            $("#modal-backdrop").css("display", "block");
            $("#sched-modal").css("display", "block");
          } else {
            Cookies.set('umid', $('#umidInput').val());
            forceUpdate();
          }
        },
        400: (data) => {
          $('#alert-header').text('Invalid Selection');
          setInvalidList(['There are no available slots for the selected time frame']);
          $('#alert').css('visiblililty', 'visible');
        }
      }
    })
  }
}

function isValid(setInvalidList){
  let fieldList = [$('#umidInput'), $('#firstInput'), $('#lastInput'),
                   $('#projectInput'), $('#emailInput'), $('#phoneInput')]
  let invalidFieldList = [];
  let invalidLabels = [];

  fieldList.forEach(field => {
    if(!field.val())
      invalidFieldList.push(field);
    else
      field.css('border','none');
  })

  if($('#timeSelect').val() === "-Select One-"){
    invalidFieldList.push($('#timeSelect'));
  } else {
    $('#timeSelect').css('border','none');
  }

  invalidFieldList.forEach((object)=>{
    console.log(object);
    object.css('border','1px solid red');
    invalidLabels.push($('label[for="' + object.attr('id') + '"]').text() + ' is a required field');
  });

  setInvalidList(invalidLabels);
  $('#alert-header').text('Required Data Missing');
  $('#alert').css("visibility","visible");

  return invalidFieldList.length === 0 && isValidFormat(setInvalidList);
}

function isValidFormat(setInvalidList){
  let fieldList = [$('#umidInput'), $('#firstInput'), $('#lastInput'),
                   $('#projectInput'), $('#emailInput'), $('#phoneInput')]
  
  let invalidFieldList = [];
  let invalidLabels = [];
  console.log(fieldList[0].val().length !== 8);
  console.log(!$.isNumeric(fieldList[0].val()));
  if(fieldList[0].val().length !== 8 || !$.isNumeric(fieldList[0].val())){
    invalidFieldList.push(fieldList[0]);
    invalidLabels.push('UMID must be 8 digits');
  }
  if(!isValidEmail(fieldList[4])){
    invalidFieldList.push(fieldList[4]);
    invalidLabels.push('Email is an invalid format');
  }

  if(fieldList[5].val().length < 12){
    invalidFieldList.push(fieldList[5]);
    invalidLabels.push('Phone Number is invalid');
  }

  invalidFieldList.forEach((object)=>{
    object.css('border','1px solid red');
  });

  setInvalidList(invalidLabels);
  $('#alert-header').text('Invalid Data');
  $('#alert').css("visibility","visible");

  return  invalidFieldList.length === 0;
}

function isValidEmail(emailField){

  let email = emailField.val().split('@') || "";
  let domain;
  
  if(email[1] != null)
    domain = email[1].split(".") || "";
  else
    return false;

  if(!email[0] && email[0].length <= 0)
    return false;

  if(!domain[0] && domain[0].length <= 0)
    return false;

  if(!domain[1] && domain[1].length <= 0)
    return false;    

  return true;
}

function deleteReservation(){

  const data = {
    umid: Cookies.get('umid')
  }

  Cookies.remove('umid');

  $.ajax({
    async: false,
    type: 'POST',
    crossDomain: true,
    global: false,
    datatype: 'json',
    url: '/removeSchedule',
    data,
    success: function(data) {
      console.log(data);
    }
  })
}

function AlertBody(props){
  return props.invalidList.map(item => (
    <li>{item}</li>
  ))
}

export default Home;