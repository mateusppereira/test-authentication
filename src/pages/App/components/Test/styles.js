import styled from 'styled-components';

export const Content = styled.div`
    min-height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to top, #18acc4, #0e5780);
`;

export const FeaturesText = styled.p`
    font-size: 0.7rem;
    margin-bottom: 0;
`;

export const OverlayReport = styled.div`
    top: 0;
    left: 0;
    z-index: 999999;
    width: 100%;
    height: 100%;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    h2 {
        text-align: center;
        color: white;
    }
`;