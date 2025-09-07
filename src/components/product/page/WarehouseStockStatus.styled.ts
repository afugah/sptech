import styled from 'styled-components';

export const Container = styled.div`
  border: 0.1rem solid #e5e7eb;
  margin: 2rem 0;
  display: block;
`;

export const Header = styled.div`
  padding: 1.2rem 2rem;

  display: flex;
  align-items: center;

  svg {
    width: 1.8rem;
    height: 1.8rem;
    margin-right: 0.8rem;
    fill: #0891b2;
  }
`;

export const Store = styled.div`
  padding: 1.2rem 2rem;
  border-top: 0.1rem solid #e5e7eb;
  display: flex;
  justify-content: space-between;
`;
