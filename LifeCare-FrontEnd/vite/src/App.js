import "./App.css";
import Home from "./components/common/Home";
import About from "./components/common/About";
import Login from "./components/auth/Login";
import Contact from "./components/common/Contact";
import HospitalDashboard from "./components/hospital/HospitalDashboard";
import Usersignup from "./components/auth/Usersignup";
import GoogleCallback from "./components/auth/GoogleCallback";
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
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usersignup" element={<Usersignup />} />
        <Route path="/login/google/callback" element={<GoogleCallback />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/addhospital" element={<AddHospital />} />
        <Route path="/viewhospital" element={<Hospitallist />} />
        <Route path="/viewuser" element={<Userlist />} />
        <Route path="/hospitaldashboard" element={<HospitalDashboard />} />
        <Route path="/addbed" element={<AddBed />} />
        <Route path="/addblood" element={<AddBlood />} />
        <Route path="/addoxygen" element={<AddOxygen />} />
        <Route path="/adddoctorinfo" element={<AddDoctorinfo />} />
        <Route path="/bedlist" element={<BedList />} />
        <Route path="/bloodlist" element={<BloodList />} />
        <Route path="/oxygenlist" element={<OxygenList />} />
        <Route path="/doctorinfolist" element={<DoctorInfoList />} />
        <Route path="/approverejectrequest" element={<ApproveRejectRequest />} />
        <Route path="/viewrequest" element={<ViewRequest />} />
        <Route path="/userdashboard" element={<UserDashBoard />} />
        <Route path="/userbedbook" element={<Userbedbook />} />
        <Route path="/bedavailability" element={<Bedavailability />} />
        <Route path="/bloodavailability" element={<Bloodavailability />} />
        <Route path="/oxygenavailability" element={<Oxygenavailability />} />
        <Route path="/bookingstatus" element={<Bookingstatus />} />
        <Route path="/ambulancecontact" element={<AmbulanceContact />} />
        <Route path="/doctorinfo" element={<DoctorInfo />} />
        <Route path="/updateuser/:userid" element={<Updateuser />} />
        <Route path="/updatehospital/:hospid" element={<Updatehospital />} />
    </Routes>
  );
}
export default App;
