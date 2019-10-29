import React from "react";
import styled from "styled-components";
import { WaveLoading } from "styled-spinkit";

const Container = styled.div`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 999999;
`;

const Icon = styled.div`
  position: relative;
  z-index: 5;

  img {
    height: 25rem;
    width: 25rem;
  }
`;

const Loading = ({ visible }) => (
  <>
    {visible && (
      <Container>
        <Icon>
          <WaveLoading
            size={60}
            color={'#007bff'}
          />
        </Icon>
      </Container>
    )}
  </>
);

export default Loading;
