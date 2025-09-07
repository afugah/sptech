import styled from 'styled-components';

type StyledProps = {
  $status: string;
};

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: 1.5rem;
  font-size: 1.2rem;
`;

export const Indicator = styled.div<StyledProps>`
  width: 1rem;
  height: 1rem;
  border-radius: 0.5rem;
  margin-top: 0.1rem;
  background: ${(p) =>
    p.$status === 'outOfStock' ? '#e64d4d' : p.$status === 'fewLeft' ? '#e69503' : 'rgb(9, 174, 76)'};
`;
