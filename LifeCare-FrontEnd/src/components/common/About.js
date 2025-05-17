import React from "react";
import "./About.css";
import aniruddh from "../images/team1.webp";
import shubham from "../images/team2.webp";
import omkar from "../images/team3.webp";
import vaibhav from "../images/team4.webp";

export default function About() {
  return (
    <>
      <div className="container">
        <br />
        <h2 className="text-start pb-2">About Us</h2>
        <hr />
        <h3>LifeCare Portal</h3> 
        <h4>
        <br />
        LifeCare Portal aims at to provide easy access to all the aspects of management and operations of Hospital. We have taken the inspiration of the project from the last years Corona Pandemic. So, in the near future a situation like Corona comes again into human life, at that time LifeCare will help the people a lot in the procedure of finding facilities. The main purpose of LifeCare is to make Hospital related task easy and saves the time of public while searching health care facilities. LifeCare helps to maintains the details of Hospital related queries like Oxygen availability, Bed availability, etc. With the help of LifeCare people can get the information of nearby Hospital location from wherever they are.
        </h4>
        <br />         
        <hr />      
        <h3>Final Project Team</h3> 
        <div class="wrapper">
          <div class="team">
            <div class="team_member">
              <div class="team_img">
                <img src={aniruddh} alt="Team_image" />
              </div>
              <h3>Aniruddh Patil</h3>
            </div>
            <div class="team_member">
              <div class="team_img">
                <img src={shubham} alt="Team_image" />
              </div>
              <h3>Shubham Yadav</h3>
            </div>            
            <div class="team_member">
              <div class="team_img">
                <img src={omkar} alt="Team_image" />
              </div>
              <h3>Omkar More</h3>
            </div>
            <div class="team_member">
              <div class="team_img">
                <img src={vaibhav} alt="Team_image" />
              </div>
              <h3>Vaibhav Pawar</h3>
            </div>
          </div>
        </div>        
      </div>
    </>
  );
}
