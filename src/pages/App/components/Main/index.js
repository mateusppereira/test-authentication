import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Container, Row } from "reactstrap";
import { API } from 'services';
import moment from 'moment';
import { Content, TestImage } from "./styles.js";


class Main extends Component {
  state = {
    errors: null,
    userTests: [],
    getUserTestInterval: 0
  };

  componentDidMount() {
    const user = JSON.parse(sessionStorage.getItem('userLogged'));
    API.get(`/get-user-test/${user.id}`)
    .then(({ data }) => {
      this.setState({ userTests: data })
    })

    const getUserTestInterval = setInterval(() => {
      API.get(`/get-user-test/${user.id}`)
      .then(({ data }) => {
        this.setState({ userTests: data })
      })
    }, 3000);
    this.setState({ getUserTestInterval });
  }

  getColor = status => {
    switch (status) {
      case "INDISPONIVEL":
        return "#F00"
      case "AGUARDANDO INICIO":
        return "#d8d838"
      case "EM ANDAMENTO":
        return "#2d39ad"
      case "CONCLUIDO":
        return "#1d8444"
    
      default:
        break;
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.getUserTestInterval);
  }

  render() {
    return (
      <Content>
        <h1 style={{ fontWeight: 700, color: "#2c2e2f"}} className='mb-2'>Provas</h1>
        { 
          [...this.state.userTests, ...this.state.userTests, ...this.state.userTests, ...this.state.userTests, ...this.state.userTests, ...this.state.userTests, ...this.state.userTests, ...this.state.userTests, ...this.state.userTests].map((element, key)=>{
            return (
              <Row
                style={{
                  background: "#fff",
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.16)",
                  width: "100%"
                }}
                key={key}
                noGutters
                className="p-2 mb-4 border align-items-center"
              >
                <Col md="4">
                  <TestImage src={element.test.img}/>
                </Col>
                <Col className="pl-4" md="6">
                  <p className="mb-0"><strong>Nome: </strong>{element.test.name}</p>
                  <p className="mb-0"><strong>Data da Prova: </strong>{moment(element.test.due_date).format("DD MMM YYYY")}</p>
                  <p className="mb-2"><strong>Duração: </strong>{element.test.duration} min</p>
                  <p className="mb-0" style={{ color: this.getColor(element.status) }}><strong>{element.status}</strong></p>
                </Col>
                {element.status === 'AGUARDANDO INICIO' &&
                  <Col sm="2">
                    <Link to={`/app/test/${element.test.id}/${element.id}`}>
                      <Button color="primary">
                        Iniciar
                      </Button>
                    </Link>
                  </Col>
                }
              </Row>
            )
          })
        }
      </Content>
    );
  }
}

export default Main;
