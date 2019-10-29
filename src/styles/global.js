import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *{
    box-sizing: border-box;
    margin: 0;
    outline: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }

  html, body, #root {
    height: 100%;
    overflow-x: hidden;
  }
`;

export default GlobalStyle;
