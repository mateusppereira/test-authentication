import React, { Component } from "react";
import { Link } from "react-router-dom";
import { validateFormGroup, getRawValue } from "utils/form";
import logoQuero from "res/img/quero.jpg";
import { Container, Col, Row, Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import { Content, LogoImg } from './styles.js'
import history from 'routes/history';
import { API } from 'services'

class SignIn extends Component {
  state = {
    errors: null,
    loading: false,
    formUser: {
      controls: {
        email: {
          value: "mateus.pereira@quero.com.br",
          required: true,
          isEmail: true,
          maxLength: 100,
          alias: "Email"
        },
        password: {
          value: "123123",
          required: true,
          minLength: 1,
          maxLength: 100,
          alias: "Senha"
        }
      }
    }
  };

  handleFormChange = (key, value) => {
    let formCopy = Object.assign({}, this.state.formUser);
    formCopy.controls[key].value = value;
    this.setState({ formUser: formCopy });
  };

  doLogin = (e) => {
    e.preventDefault();
    this.setState({ formUser: validateFormGroup(this.state.formUser) }, () => {
        if (this.state.formUser.valid) {
            const user = getRawValue(this.state.formUser);
            API.post('/auth', user)
            .then(({ data }) => {
              if (!data) {
                return;
              }

              sessionStorage.setItem('userLogged', JSON.stringify(data));
              history.push("/app/")
            })
        }
    });
  };

  render() {
    return (
        <Content>
            <Container fluid>
                <Row className="justify-content-center">
                    <Col className="text-center" sm={4}>
                        <LogoImg src={logoQuero} alt="logo-quero" />
                    </Col>
                </Row>
                <Row className="mb-2 justify-content-center">
                    <Col sm={6}>
                        <Form onSubmit={(e)=> this.doLogin(e)}>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input 
                                    invalid={this.state.formUser.controls.email.invalid}
                                    valid={this.state.formUser.controls.email.valid}
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    placeholder="Insira o email" 
                                    value={this.state.formUser.controls.email.value}
                                    onChange={(e)=> this.handleFormChange('email', e.target.value )}
                                />
                                { this.state.formUser.controls.email.invalid && <FormFeedback invalid>Preencha corretamente o Email</FormFeedback>}
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">Senha</Label>
                                <Input 
                                    invalid={this.state.formUser.controls.password.invalid}
                                    valid={this.state.formUser.controls.password.valid}
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="Insira a senha" 
                                    value={this.state.formUser.controls.password.value}
                                    onChange={(e)=> this.handleFormChange('password', e.target.value )}
                                />
                                { this.state.formUser.controls.password.invalid && <FormFeedback invalid>Preencha corretamente a Senha</FormFeedback>}
                            </FormGroup>
                            <Row noGutters className="justify-content-center">
                                <Col className="col-auto">
                                    <Button type="submit" className="mr-1" color="primary">
                                        Login
                                    </Button>
                                    <Link to="/login/sign-up">
                                        <Button type="button" className="ml-1" color="primary">
                                            Cadastrar
                                        </Button>
                                    </Link>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </Content>
    );
  }
}

export default SignIn;
