import React, { Component } from "react";
import { Row } from "reactstrap";
import { Loading } from "elements";
import styled from "styled-components";
import { API } from "services";
import { sort } from 'utils/array';
import moment from "moment";

const MarginRow = styled.div`
  margin: 50px;
`;

const TableContainer = styled.div`
  width: 50%;
`;

const Table = styled.table`
  color: #212529;
  margin-bottom: 1rem;
  width: 100%;
`;

const Tr = styled.tr`
  background-color: ${props => props.background};
`;

const TrHeader = styled.tr`
  background-color: rgba(0, 0, 0, 0.03);
`;

const Td = styled.td`
  border-top: 1px solid #dee2e6;
  padding: 12px;
  vertical-align: top;
`;

const CardDeck = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 70%;
`;

const Card = styled.div`
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.125);
  display: flex;
  flex-direction: column;
  height: 250px;
  justify-content: flex-start;
  margin-top: 25px;
  width: 250px;
`;

const CardHeader = styled.div`
  align-items: center;
  background-color: #e4e4e4;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px;
  width: 100%;

  > span {
    font-size: 20px;
    text-align: center;
  }
`;

const CardBody = styled.div`
  align-items: center;
  background: ${props => props.bgColor};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
`;

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      open: false,
      focusAfterClose: true,
      keywordsAndSaid: JSON.parse(sessionStorage.getItem("keywordsAndSaid")) || { keywords: [], said: []},
      fraude: 0,
      events: [],
      loading: false
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    setTimeout(() => {
      API.get(`/user-test-event-get/${this.props.match.params.userTestId}`).then(({ data }) => {
        if (data && data.length) {
          data = data.map(d => {
            d.started_at = moment(d.started_at).format("DD/MM/YYYY HH:mm:ss");
            d.finished_at = moment(d.finished_at).format("DD/MM/YYYY HH:mm:ss");
            d.weight = d.type.weight;
            return d;
          });
          this.setState({ loading: false, events: sort("weight", data, false) }, () => {
            this.calculateFraude();
          });
        } else {
          this.setState({ loading: false, events: [] }, () => {
            this.calculateFraude();
          });
        }
      });
    }, 2000);
  }

  getBackgroundColor = weight => {
    // 1, 2, 3, 5, 8, 13
    switch (weight) {
      case 1:
      case 2:
        return "#afaf00";
      case 3:
        return "#c0c000";
      case 5:
        return "#e2df22";
      case 8:
        return "#e65c00";
      case 13:
        return "#f44242";
      default:
        return "";
    }
  };
  
  getFraudeData = fraude => {
    if (fraude < 10) {
      return { color: "#0b910d", text: 'Baixo risco'} 
    } else if (fraude < 20) {
      return { color: "#dde02f", text: 'Risco razoável'}
    } else if (fraude < 25) {
      return { color: "#d39730", text: 'Risco eminente'}
    } else if (fraude < 35) {
      return { color: "#9b2b99", text: 'Risco alto'}
    } else {
      return { color: "#f00", text: 'Fraude'}
    }
  };

  calculateFraude = () => {
    const { events } = this.state;
    let sumWeight = 0;
    for (let i = 0; i < events.length; i++) {
      sumWeight += events[i].type.weight;
    }
    this.setState({ fraude: sumWeight });
  };

  renderCard = (title, value, color = "#fff") => (
    <Card>
      <CardHeader tag="h3">
        <span>{title}</span>
      </CardHeader>
      <CardBody bgColor={color}>
        <h1 style={{ color: title === 'Rating' && "#fff" }}>{value}</h1>
      </CardBody>
    </Card>
  );

  render() {
    const { text, color } = this.getFraudeData(this.state.fraude)
    return (
      <>
        <Loading visible={this.state.loading} />
        <MarginRow>
          <Row className="justify-content-center">
            <CardDeck>
              {this.renderCard("Eventos", this.state.events.length)}
              {this.renderCard("Palavras Pronunciadas", `${this.state.keywordsAndSaid.said.length}/${this.state.keywordsAndSaid.keywords.length}`)}
              {this.renderCard("Rating", text, color)}
            </CardDeck>
          </Row>
        </MarginRow>
        <Row className="justify-content-center">
          <TableContainer>
            <Table>
              <thead>
                <TrHeader>
                  <Td scope="col">
                    <b>Palavras Pronunciadas</b>
                  </Td>
                </TrHeader>
              </thead>
              <tbody>
                {this.state.keywordsAndSaid.said.map((word, i) => (
                  <Tr key={i}>
                    <Td>{word}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </Row>
        <MarginRow>
          <Row className="justify-content-center">
            <h2>Eventos Registrados</h2>
          </Row>
        </MarginRow>
        <Row className="justify-content-center">
          <TableContainer>
            <Table>
              <thead>
                <TrHeader>
                  <Td scope="col">
                    <b>#</b>
                  </Td>
                  <Td scope="col">
                    <b>Evento</b>
                  </Td>
                  <Td scope="col">
                    <b>Peso</b>
                  </Td>
                  <Td scope="col">
                    <b>Início</b>
                  </Td>
                  <Td scope="col">
                    <b>Fim</b>
                  </Td>
                </TrHeader>
              </thead>
              <tbody>
                {this.state.events.map((event, i) => (
                  <Tr key={i} background={this.getBackgroundColor(event.type.weight)}>
                    <Td scope="row">{i + 1}</Td>
                    <Td>{event.type.type}</Td>
                    <Td>{event.type.weight}</Td>
                    <Td>{event.started_at}</Td>
                    <Td>{event.finished_at}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </Row>
      </>
    );
  }
}

export default Dashboard;
