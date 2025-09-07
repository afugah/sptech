import styled from 'styled-components';

type StyledProps = {
  blurBackgroundColor?: boolean;
};

export const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 60rem;
  min-height: 20rem;
  border-radius: 0.5rem;
  background: #ffffff;
  top: 50%;
  left: 2rem;
  right: 2rem;
  transform: translateY(-50%);
  padding: 2rem 2rem 3rem;
  color: #000000;
  z-index: 10001;

  @media (min-width: 768px) {
    height: auto;
    padding: 2rem 3rem 3rem;
  }

  h2 {
    position: relative;
    text-align: center;
  }

  p {
    margin: 0 0 0.5rem;
    color: #000000;
  }
`;

export const Blur = styled.div<StyledProps>`
  position: fixed;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10001;
`;
