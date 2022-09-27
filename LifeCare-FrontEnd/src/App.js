import "./App.css";
import Home from "./components/common/Home";
import About from "./components/common/About";
import Login from "./components/auth/Login";
import Contact from "./components/common/Contact";
import HospitalDashboard from "./components/hospital/HospitalDashboard";
import Usersignup from "./components/auth/Usersignup";
import AdminDashboard from "./components/admin/AdminDashboard";
import AddHospital from "./components/admin/AddHospital";
import Hospitallist from "./components/admin/Hospitallist";
import Userlist from "./components/admin/Userlist";
import AddBed from "./components/hospital/AddBed";
import AddBlood from "./components/hospital/AddBlood";
import AddOxygen from "./components/hospital/AddOxygen";
import AddDoctorinfo from "./components/hospital/AddDoctorinfo";
import UserDashBoard from "./components/user/UserDashBoard";
import Userbedbook from "./components/user/Userbedbook";
import Bedavailability from "./components/user/Bedavailability";
import Bloodavailability from "./components/user/Bloodavailability";
import Oxygenavailability from "./components/user/Oxygenavailability";
import Bookingstatus from "./components/user/Bookingstatus";
import DoctorInfo from "./components/user/DoctorInfo";
import AmbulanceContact from "./components/hospital/AmbulanceContact";
import BedList from "./components/user/BedList";
import BloodList from "./components/user/BloodList";
import OxygenList from "./components/user/OxygenList";
import DoctorInfoList from "./components/user/DoctorInfoList";
import ApproveRejectRequest from "./components/hospital/ApproveRejectRequest";
import ViewRequest from "./components/user/ViewRequest";
import Updateuser from "./components/hospital/Updateuser";
import Updatehospital from "./components/admin/Updatehospital";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
       
      <div className="d-flex w-100%">
      <Routes>        
        <Route exact path="/" element={<Home />}></Route>
        <Route exact path="/about" element={<About />}></Route>
        <Route exact path="/contact" element={<Contact />}></Route>        
        <Route exact path="/login" element={<Login />}></Route>
        <Route exact path="/usersignup" element={<Usersignup />}></Route>
        <Route exact path="/admindashboard" element={<AdminDashboard />}></Route>
        <Route exact path="/addhospital" element={<AddHospital />}></Route>
        <Route exact path="/viewhospital" element={<Hospitallist />}></Route>
        <Route exact path="/viewuser" element={<Userlist />}></Route>
        <Route exact path="/hospitaldashboard" element={<HospitalDashboard />}></Route>
        <Route exact path="/addbed" element={<AddBed />}></Route>
        <Route exact path="/addblood" element={<AddBlood />}></Route>
        <Route exact path="/addoxygen" element={<AddOxygen />}></Route>
        <Route exact path="/adddoctorinfo" element={<AddDoctorinfo />}></Route>
        <Route exact path="/bedlist" element={<BedList />}></Route>
        <Route exact path="/bloodlist" element={<BloodList />}></Route>
        <Route exact path="/oxygenlist" element={<OxygenList />}></Route>
        <Route exact path="/doctorinfolist" element={<DoctorInfoList />}></Route>
        <Route exact path="/approverejectrequest" element={<ApproveRejectRequest />}></Route>
        <Route exact path="/viewrequest" element={<ViewRequest />}></Route>
        <Route exact path="/userdashboard" element={<UserDashBoard />}></Route>
        <Route exact path="/userbedbook" element={<Userbedbook />}></Route>
        <Route exact path="/bedavailability" element={<Bedavailability />}></Route>
        <Route exact path="/bloodavailability" element={<Bloodavailability />}></Route>
        <Route exact path="/oxygenavailability" element={<Oxygenavailability />}></Route>
        <Route exact path="/bookingstatus" element={<Bookingstatus />}></Route>
        <Route exact path="/ambulancecontact" element={<AmbulanceContact />}></Route>
        <Route exact path="/doctorinfo" element={<DoctorInfo />}></Route>
        <Route exact path="/updateuser/:userid" element={<Updateuser />}></Route>
        <Route exact path="/updatehospital/:hospid" element={<Updatehospital/>}></Route>
      </Routes>
      </div>
    </>
  );
}
export default App;
