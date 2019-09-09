import React from "react";
import styled from "styled-components";
import { WaveLoading } from "styled-spinkit";

const Container = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);

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
          {/* <img src={loadingIcon} alt="loading" /> */}
        </Icon>
      </Container>
    )}
  </>
);

export default Loading;
