import { Loading } from "elements";
import * as faceapi from "face-api.js";
import React, { Component } from "react";
import Webcam from "react-webcam";
import { Container, Col, Row, Button, Input, Badge, Form, FormGroup, Label } from "reactstrap";
import { API } from "services";
import { createMatcher, getFullFaceDescription, loadModels } from "services/face";
import { upsert } from "../../../../utils/array.js";
import { Content, FeaturesText, OverlayReport } from "./styles.js";
import moment from "moment";

import history from "routes/history";
const inputSize = 160;

class Test extends Component {
  constructor(props) {
    super(props);
    this.canvasWrapper = React.createRef();
    this.canvasRef = React.createRef();
    this.webcam = React.createRef();
    this.state = {
      test: null,
      answers: [],
      imagesBlob: {
        happy: null,
        angry: null,
        sad: null,
        neutral: null
      },
      getExpression: {
        angry: "Bravo",
        sad: "Triste",
        neutral: "Normal",
        happy: "Feliz"
      },
      detections: [],
      intruserStarted: null,
      cellPhoneStarted: null,
      noBodyStarted: null,
      descriptors: [],
      userDescriptors: [],
      anomalyObjectEvents: {},
      anomalyFaceEvents: {},
      match: null,
      faceMatcher: null,
      acceptedExpressions: ["angry", "sad", "neutral", "happy"],
      firstStepDone: false,
      anomalyFace: "",
      anomalyObject: "",
      user: {},
      events: {},
      intervalTest: null,
      focusInterval: 0,
      hasFocus: false,
      hasFocusEvents: [],
      intervalFaceTest: null,
      intervalObjectTest: null,
      voiceRecognition: null,
      transcript: ''
    };
  }
  componentWillMount() {
    API.get("/get-event-type").then(({ data }) => {
      let objectByKey = {};
      data.map(event => {
        objectByKey[event.key] = event.id;
      });
      this.setState({ events: objectByKey });
    });

    const { testId, userTestId } = this.props.match.params;
    this.setState({ testId: testId });
    API.get(`get-test/${testId}`).then(({ data }) => {
      this.setState({ test: data });
    });

    let user = sessionStorage.getItem("userLogged");
    this.setState({ user: JSON.parse(user), userTestId });
    this.setState({ loading: true });
  }
  componentDidMount() {
    this.webcam.current.video.addEventListener('play', () => {
      this.startTracking()
    })

    this.setState({ hasFocus: document.hasFocus() });
    const focusInterval = setInterval(() => {
      const focusTypeId = this.state.events['LEFTTEST'];
      const openedEvents = this.state.hasFocusEvents.filter(item => (item.fk_type === focusTypeId && !item.finished_at))
      
      if (!document.hasFocus()) {
        if (openedEvents.length > 0) {
          return;
        }
        this.setState({
          hasFocusEvents: [...this.state.hasFocusEvents, {
            fk_user_test: this.state.userTestId,
            fk_type: focusTypeId,
            started_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            finished_at: ''
          }]
        })
      } else {
        if (openedEvents.length === 0) {
          return;
        }
        const updatedEvents = this.state.hasFocusEvents.map(item => {
          if (item.fk_type === focusTypeId && !item.finished_at) {
            return {
              ...item,
              finished_at: moment().format('YYYY-MM-DD HH:mm:ss')
            }
          }
          return item;
        })
        
        this.setState({ hasFocusEvents: updatedEvents });
      }
    }, 1000);
    this.setState({ focusInterval });
  }
  changeTestStatus(status) {
    API.put("/user-test/set-status", {
      id: this.state.userTestId,
      status: status
    }).then(({ data }) => {});
  }
  startTracking = async () => {
    this.changeTestStatus("EM ANDAMENTO");
    await loadModels();
    let canvas = document.createElement("canvas");
    let video = this.webcam.current.video;
    canvas.width = "100%";
    canvas.height = "100%";
    canvas.style.position = "absolute";
    canvas.style.left = 0;
    canvas.style.top = 0;
    this.canvasWrapper.current.appendChild(canvas);
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
    faceapi.matchDimensions(canvas, displaySize);

    let detectInterval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      if (this.state.loading && !this.state.firstStepDone) {
        this.setState({ loading: false });
      }
      if (detections && detections.length === 1) {
        let expressions = detections[0].expressions;
        Object.keys(expressions).forEach(expression => {
          if (expressions[expression] > 0.9) {
            if (expression === "fearful") {
              expression = "angry";
            }
            if (!this.state.imagesBlob[expression] && this.state.acceptedExpressions.indexOf(expression) > -1) {
              this.setState({
                ...this.state,
                imagesBlob: {
                  ...this.state.imagesBlob,
                  [expression]: this.webcam.current.getScreenshot()
                }
              });
              let clearInterval = true;
              Object.keys(this.state.imagesBlob).forEach(expression => {
                if (!this.state.imagesBlob[expression]) {
                  clearInterval = false;
                }
              });
              if (clearInterval) {
                clearTimeout(detectInterval);
                this.setState({ firstStepDone: true }, () => {
                  this.startTest();
                });
                canvas.remove();
              }
            }
          }
        });
      }
    }, 100);
  };
  handleImage = async image => {
    await getFullFaceDescription(image).then(fullDesc => {
      if (!fullDesc[0]) return false;
      this.setState({ userDescriptors: [...this.state.userDescriptors, fullDesc[0].descriptor] });
    });
  };
  startTest = async () => {
    let recognition =  new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang="pt-BR";
    recognition.onresult = (event) => { 
      let currentTranscript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript;
        }
      }
      this.setState({ transcript: this.state.transcript + currentTranscript })
		}
    recognition.start();
    this.setState({ loading: true });
    await Promise.all(
      Object.keys(this.state.imagesBlob).map(async expression => {
        return await this.handleImage(this.state.imagesBlob[expression]);
      })
    );
    this.setState({
      faceMatcher: await createMatcher({
        USUARIO: {
          name: this.state.user.name,
          descriptors: this.state.userDescriptors
        }
      })
    });
    this.startInterval();
  };
  startInterval() {
    let intervalObjectTest = setInterval(async () => {
      if (window.cocossdLoaded) {
        window.cocossdLoaded.detect(this.webcam.current.video).then(predictions => {
          predictions = predictions.filter(predictions => {
            return predictions.class === "cell phone";
          });
          this.checkObjectAnomaly(predictions);
          this.renderPredictions(predictions);
        });
      }
    }, 500);

    let intervalFaceTest = setInterval(async () => {
      let matchFace = null;
      await getFullFaceDescription(this.webcam.current.getScreenshot(), inputSize).then(fullDesc => {
        if (!!fullDesc) {
          this.setState({
            detections: fullDesc.map(fd => fd.detection),
            descriptors: fullDesc.map(fd => fd.descriptor)
          });
        }
      });
      if (!!this.state.descriptors && !!this.state.faceMatcher) {
        let match = await this.state.descriptors.map(descriptor => this.state.faceMatcher.findBestMatch(descriptor));
        matchFace = match;
        this.setState({ match });
      }
      this.checkFaceAnomaly(matchFace);
      if (this.state.loading) {
        this.setState({ loading: false });
      }
    }, 500);
    this.setState({ intervalFaceTest, intervalObjectTest });
  }
  checkObjectAnomaly(objectsPredictions) {
    if (objectsPredictions && objectsPredictions.length) {
      if (!this.state.cellPhoneStarted) {
        this.setState({ cellPhoneStarted: moment().format("YYYY-MM-DD HH:mm:ss.SSS") });
      }
      this.setState({ anomalyObject: "Não é permitido a utilização de celulares durante a prova, por favor, guarde-o." });
    } else {
      let anomalyObjectEvents = { ...this.state.anomalyObjectEvents };
      if (this.state.cellPhoneStarted) {
        let startedAt = this.state.cellPhoneStarted;
        anomalyObjectEvents[startedAt] = {
          fk_user_test: this.state.userTestId,
          fk_type: this.state.events["CELLPHONE"],
          started_at: startedAt,
          finished_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS")
        };
      }
      this.setState({ anomalyObjectEvents, anomalyObject: "", cellPhoneStarted: null });
    }
  }

  checkFaceAnomaly(matchFace) {
    if (!matchFace || !matchFace.length || (matchFace.length === 1 && matchFace[0]._label === "unknown")) {
      if (!this.state.noBodyStarted) {
        this.setState({ noBodyStarted: moment().format("YYYY-MM-DD HH:mm:ss.SSS") });
      }
      this.setState({ anomalyFace: "Nenhum usuário encontrado" });
    } else if (matchFace.length > 1) {
      if (!this.state.intruserStarted) {
        this.setState({ intruserStarted: moment().format("YYYY-MM-DD HH:mm:ss.SSS") });
      }
      this.setState({ anomalyFace: "Mais de um usuário na câmera, por favor, fique sozinho no ambiente." });
    } else {
      let anomalyFaceEvents = { ...this.state.anomalyFaceEvents };
      if (this.state.intruserStarted) {
        let startedAt = this.state.intruserStarted;
        anomalyFaceEvents[startedAt] = {
          fk_user_test: this.state.userTestId,
          fk_type: this.state.events["SOMEBODY"],
          started_at: startedAt,
          finished_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS")
        };
      }
      if (this.state.noBodyStarted) {
        let startedAt = this.state.noBodyStarted;
        anomalyFaceEvents[startedAt] = {
          fk_user_test: this.state.userTestId,
          fk_type: this.state.events["NOBODY"],
          started_at: startedAt,
          finished_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS")
        };
      }
      this.setState({ anomalyFaceEvents, anomalyFace: "", noBodyStarted: null, intruserStarted: null });
    }
  }
  renderPredictions = predictions => {
    if (!this.canvasRef.current)
      return;
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };
  getDetections() {
    const { match, detections } = this.state;
    return detections.map((detection, i) => {
      let _H = detection.box.height;
      let _W = detection.box.width;
      let _X = detection.box._x;
      let _Y = detection.box._y;
      return (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              border: "solid",
              borderColor: "blue",
              left: 0,
              top: 0,
              height: _H,
              width: _W,
              transform: `translate(${_X}px,${_Y}px)`
            }}
          >
            {!!match && !!match[i] ? (
              <p
                style={{
                  backgroundColor: "blue",
                  border: "solid",
                  borderColor: "blue",
                  width: _W,
                  marginTop: 0,
                  top: 0,
                  left: 0,
                  color: "#fff",
                  transform: `translate(-3px,${_H}px)`
                }}
              >
                {match[i]._label}
              </p>
            ) : null}
          </div>
        </div>
      );
    });
  }
  getTextAnswer(question) {
    const answer = this.state.answers.filter(item => item.fk_question === question.id);
    if (answer.length > 0) {
      return answer[0].value;
    }
    return "";
  }
  concludeTest = () => {
    const { keywords } = this.state.test;
    let saidTestKeywords = [];
    for (let i = 0; i < keywords.length; i++) {
      if (this.state.transcript.toLowerCase().indexOf(keywords[i].toLowerCase()) > 0) {
        saidTestKeywords.push(keywords[i].toLowerCase());
      }
    }
    const keywordsAndSaid = {
      keywords,
      said: saidTestKeywords
    };
    sessionStorage.setItem("keywordsAndSaid", JSON.stringify(keywordsAndSaid));

    const { answers } = this.state;
    for (let n = 0; n < answers.length; n++) {
      const questionKeywords = this.state.test.questions.filter(question => question.id === answers[n].fk_question)[0].keywords;
      let keysInAnswer = [];
      for (let m = 0; m < questionKeywords.length; m++) {
        if (answers[n].value.indexOf(questionKeywords[m].keyword) > 0) {
          keysInAnswer.push(questionKeywords[m].keyword);
        }
      }
      
      const updatedAnswers = upsert(this.state.answers, "fk_question", {
        ...answers[n],
        keysInAnswer
      });
      this.setState({ answers: updatedAnswers });
    }

    let anomalyFaceEvents = Object.keys(this.state.anomalyFaceEvents).map(key => {
      return this.state.anomalyFaceEvents[key];
    });
    let anomalyObjectEvents = Object.keys(this.state.anomalyObjectEvents).map(key => {
      return this.state.anomalyObjectEvents[key];
    });
    clearInterval(this.state.intervalFaceTest);
    clearInterval(this.state.intervalObjectTest);
    clearInterval(this.state.focusInterval);
    this.canvasRef.current.remove();
    API.post(`/user-test-event-add`, [...anomalyFaceEvents, ...anomalyObjectEvents, ...this.state.hasFocusEvents]).then(({ data }) => {
      this.changeTestStatus("CONCLUIDO");
      setTimeout(()=>{
        history.push(`/app/dashboard/${this.state.userTestId}`);
      }, 1000)
    });
  };
  renderQuestion = question => (
    <>
      <Row noGutters>
        <Col>
          <FormGroup>
            <Label for="exampleEmail">{question.question}</Label>
            {question.type === "TEXTO" && <Input type="email" name="email" id="exampleEmail" placeholder="Preencha o campo" />}
            {question.type === "MULTIPLA ESCOLHA" && (
              <Input type="select" name="select" id="exampleSelect">
                <option>Resposta 1</option>
                <option>Resposta 2</option>
                <option>Resposta 3</option>
                <option>Resposta 4</option>
                <option>Resposta 5</option>
              </Input>
            )}
          </FormGroup>
        </Col>
      </Row>
    </>
  );

  render() {
    let drawBox = null;
    drawBox = this.getDetections();
    return (
      <Content>
        <Loading visible={this.state.loading} />
        <Container fluid>
          {!this.state.firstStepDone && (
            <Row className="justify-content-center mb-2">
              <Col style={{ background: "#fff", boxShadow: "0 0 5px #fff", borderRadius: "4px" }} sm={6} className="border p-2">
                <p className="mb-1 text-muted">Primeiro precisamos identificar que você existe, faça as seguintes expressões faciais para continuar: </p>
                <Row>
                  <Col>
                    <FeaturesText className="text-muted mb-0">
                      Sorria -
                      <Badge className="ml-1" href="#" color={this.state.imagesBlob.happy ? "success" : "danger"}>
                        {this.state.imagesBlob.happy ? "Concluido" : "Pendente"}
                      </Badge>
                    </FeaturesText>
                  </Col>
                  <Col>
                    <FeaturesText className="text-muted mb-0">
                      Triste -
                      <Badge className="ml-1" href="#" color={this.state.imagesBlob.sad ? "success" : "danger"}>
                        {this.state.imagesBlob.sad ? "Concluido" : "Pendente"}
                      </Badge>
                    </FeaturesText>
                  </Col>
                  <Col>
                    <FeaturesText className="text-muted mb-0">
                      Bravo -
                      <Badge className="ml-1" href="#" color={this.state.imagesBlob.angry ? "success" : "danger"}>
                        {this.state.imagesBlob.angry ? "Concluido" : "Pendente"}
                      </Badge>
                    </FeaturesText>
                  </Col>
                  <Col>
                    <FeaturesText className="text-muted mb-0">
                      Neutro -
                      <Badge className="ml-1" href="#" color={this.state.imagesBlob.neutral ? "success" : "danger"}>
                        {this.state.imagesBlob.neutral ? "Concluido" : "Pendente"}
                      </Badge>
                    </FeaturesText>
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
          {this.state.firstStepDone && (
            <Row className="justify-content-center mb-2">
              <Col style={{ background: "#fff", boxShadow: "0 0 5px #fff", borderRadius: "4px" }} sm={6} className="border p-2">
                <p className="mb-1 text-muted">Parabéns, agora podemos iniciar a prova, você pode avaliar suas imagens abaixo:</p>
                <Row noGutters>
                  {Object.keys(this.state.imagesBlob).map((expression, key) => {
                    return (
                      <Col sm={3} className="text-center">
                        <FeaturesText>{this.state.getExpression[expression]}</FeaturesText>
                        <img key={key} alt={expression} src={this.state.imagesBlob[expression]} width="100" height="100" />
                      </Col>
                    );
                  })}
                </Row>
              </Col>
            </Row>
          )}
          <Row className="justify-content-center">
            <Col className="col-auto">
              <div style={{ position: "relative" }} ref={this.canvasWrapper}>
                <Webcam
                  audio={false}
                  height={240}
                  width={320}
                  ref={this.webcam}
                  style={{ boxShadow: "0 0 5px #fff", borderRadius: '3px' }}
                  videoConstraints={{
                    width: 320,
                    height: 240,
                    facingMode: "user"
                  }}
                  screenshotFormat="image/jpeg"
                />
                {!!drawBox ? drawBox : null}
              </div>
              {this.state.firstStepDone && <canvas style={{ position: "absolute", left: 0, top: 0 }} className="size" ref={this.canvasRef} width={320} height={240} />}
            </Col>
            {this.state.test && this.state.firstStepDone && (
              <Col style={{ background: "#fff", boxShadow: "0 0 5px #fff", borderRadius: "4px", maxHeight: "500px", overflowY: "auto" }} className="border p-2 mr-2" >
                <Form>{this.state.test.questions.map(question => this.renderQuestion(question))}</Form>
                <Row noGutters>
                  <Col>
                    <Button color="primary" onClick={this.concludeTest}>
                      Concluir Prova
                    </Button>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
          {(this.state.anomalyFace.length > 0 || this.state.anomalyObject.length > 0) && (
            <OverlayReport>
              {this.state.anomalyFace.length > 0 && <h2>{this.state.anomalyFace}</h2>}
              {this.state.anomalyObject.length > 0 && <h2>{this.state.anomalyObject}</h2>}
            </OverlayReport>
          )}
        </Container>
      </Content>
    );
  }
}

export default Test;
