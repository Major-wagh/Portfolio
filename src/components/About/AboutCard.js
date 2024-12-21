import React from "react";
import Card from "react-bootstrap/Card";
// import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I am <span className="purple">Siddharth Wagh </span>
            from <span className="purple"> Pune, India.</span>
            <br />
            <br />
            
            I am currently employed as a Data Scientist at Jio Platforms Limited.
            <br />
            <br />
            
            I am a graduate in field of computer science from Ajeenkya D.Y Patil School of Engineering.
            <br />
            <br />
          </p>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
