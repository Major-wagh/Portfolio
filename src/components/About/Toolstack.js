import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiVisualstudiocode,
  SiLinux,
  SiJupyter,
  SiAzuredevops
} from "react-icons/si";

function Toolstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons">
        <SiLinux />
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiVisualstudiocode />
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        < SiJupyter/>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        < SiAzuredevops/>
      </Col>
    </Row>
  );
}

export default Toolstack;
