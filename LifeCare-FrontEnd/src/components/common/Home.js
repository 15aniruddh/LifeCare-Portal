import React from "react";
import { Carousel, Card } from "react-bootstrap";
import blood from "../images/blood.jpg";
import oxygen from "../images/oxygen-cylinder3.jpg";
import doctor from "../images/doctor1.jpg";
import bed from "../images/bed5.jpg";
import ventilator from "../images/ventilator.jpg";
import waitingroom from "../images/waitingroom.jpg";
import surgeryhospital from "../images/surgery-hospital.gif";
import blooddonation from "../images/blooddonation.gif";
import hospitalbed from "../images/hospitalbed.gif";

 
export default function Home() {
  return (
    <>   

    <div class="container overflow-hidden m-5 mt-4 justify-content-center text-center">
    <h1><span class="badge rounded-pill bg-danger">Welcome to LifeCare Portal</span></h1>
    <br />
      <div class="row g-5">
      
    <Carousel>
        <Carousel.Item interval={3500}>
          <img className="d-block w-100" src={surgeryhospital} alt="First slide" />          
        </Carousel.Item>
        <Carousel.Item interval={3500}>
          <img className="d-block w-100" src={blooddonation} alt="Second slide" />          
        </Carousel.Item>
        <Carousel.Item interval={3500}>
          <img className="d-block w-100" src={hospitalbed} alt="Third slide" />          
        </Carousel.Item>
    </Carousel>

    <h1><span class="badge rounded-pill bg-success">Information Available</span></h1>
        <div class="col-4">
      <Card border="dark" style={{ width: '20rem' }} >
      <Card.Img variant="top" src={oxygen} />
      <Card.Body>
        <Card.Title>Search for Oxygen Cylinder</Card.Title>
        <Card.Text>
          You can Search for Oxygen Cylinder from various Hospital's.
        </Card.Text>
      </Card.Body>
      </Card>
    </div>
    <div class="col-4">
      <Card border="dark" style={{ width: '20rem' }} >
      <Card.Img variant="top" src={blood} />
      <Card.Body>
        <Card.Title>Search for type of Blood</Card.Title>
        <Card.Text>
        You can Search for Blood type from various Hospital's.
        </Card.Text>
      </Card.Body>
      </Card>
    </div>
    <div class="col-4">
      <Card border="dark" style={{ width: '20rem' }} >
      <Card.Img variant="top" src={ventilator} />
      <Card.Body>
        <Card.Title>Search for type of Beds</Card.Title>
        <Card.Text>
        You can Search for Bed type from various Hospital's.
        </Card.Text>
      </Card.Body>
      </Card>
    </div>
    <div class="col-4">
      <Card border="dark" style={{ width: '20rem' }} >
      <Card.Img variant="top" src={bed} />
      <Card.Body>
        <Card.Title>Book your type of Beds</Card.Title>
        <Card.Text>
        You can Book your Bed type from various Hospital's.
        </Card.Text>
      </Card.Body>
      </Card>
    </div>
    <div class="col-4">
      <Card border="dark" style={{ width: '20rem' }} >
      <Card.Img variant="top" src={doctor} />
      <Card.Body>
        <Card.Title>Search for Doctor's</Card.Title>
        <Card.Text>
        You can Search for Doctor's from various Hospital's.
        </Card.Text>
      </Card.Body>
      </Card>
    </div>
    <div class="col-4">
      <Card border="dark" style={{ width: '20rem' }} >
      <Card.Img variant="top" src={waitingroom} />
      <Card.Body>
        <Card.Title>Get reply from Hospital</Card.Title>
        <Card.Text>
          Get quick reply from Hospital's if they have the vacancy for extra Bed.
        </Card.Text>
      </Card.Body>
      </Card>
    </div>
  </div>
</div>
    </>
  );
}
