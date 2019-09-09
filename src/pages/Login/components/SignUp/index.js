import React, { Component } from "react";
import { Link } from "react-router-dom";
import { validateFormGroup, getRawValue } from "utils/form";
import logoQuero from "res/img/quero.jpg";
import { Container, Col, Row, Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import { Content, LogoImg } from './styles.js'
class SignUp extends Component {
  state = {
    errors: null,
    loading: false,
    formUser: {
      controls: {
        name: {
          value: "",
          required: true,
          minLength: 6,
          maxLength: 100,
          alias: "Nome",
          minSlices: 2
        },
        email: {
          value: "",
          required: true,
          isEmail: true,
          maxLength: 100,
          alias: "Email"
        },
        document: { 
            value: "", 
            required: true, 
            isCPF: true, 
            alias: "CPF" 
        },
        password: {
          value: "",
          required: true,
          minLength: 8,
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

  doRegister = (e) => {
    e.preventDefault();
    this.setState({ formUser: validateFormGroup(this.state.formUser) }, () => {
        if (this.state.formUser.valid) {

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
                        <Form onSubmit={(e)=> this.doRegister(e)}>
                            <FormGroup>
                                <Label for="name">Nome</Label>
                                <Input 
                                    invalid={this.state.formUser.controls.name.invalid}
                                    valid={this.state.formUser.controls.name.valid}
                                    type="text" 
                                    name="name" 
                                    id="name" 
                                    placeholder="Insira o nome" 
                                    value={this.state.formUser.controls.name.value}
                                    onChange={(e)=> this.handleFormChange('name', e.target.value )}
                                />
                                { this.state.formUser.controls.name.invalid && <FormFeedback invalid>Preencha corretamente o Nome</FormFeedback>}
                            </FormGroup>
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
                                <Label for="cpf">CPF</Label>
                                <Input 
                                    invalid={this.state.formUser.controls.document.invalid}
                                    valid={this.state.formUser.controls.document.valid}
                                    type="text" 
                                    name="email" 
                                    id="cpf" 
                                    placeholder="Insira o CPF" 
                                    value={this.state.formUser.controls.document.value}
                                    onChange={(e)=> this.handleFormChange('document', e.target.value )}
                                />
                                { this.state.formUser.controls.document.invalid && <FormFeedback invalid>Preencha corretamente o CPF</FormFeedback>}
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
                                    <Link to="/login/sign-in">
                                        <Button type="button" className="mr-1" color="primary">
                                            Login
                                        </Button>
                                    </Link>
                                    <Button type="submit" className="ml-1" color="primary">
                                        Cadastrar
                                    </Button>
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

export default SignUp;
