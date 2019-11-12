import styled from 'styled-components';

export const Content = styled.div`
  align-items: center;
  background: ##f6f8fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
`;

export const FeaturesText = styled.p`
  font-size: 0.7rem;
  margin-bottom: 0;
`;

export const OverlayReport = styled.div`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999999;
  
  h2 {
      color: white;
      text-align: center;
  }
`;