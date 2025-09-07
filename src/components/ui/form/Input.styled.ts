import styled from 'styled-components';

type StyledProps = { $isFocused: boolean };

export const InputContainer = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  position: relative;
`;

export const StyledInput = styled.input`
  padding: 1.2rem 1.5rem 0;
  font-size: 1.4rem;
`;

export const InputLabel = styled.label<StyledProps>`
  position: absolute;
  display: block;
  z-index: 1;
  left: 1.5rem;
  top: ${(p) => (p.$isFocused ? '0.4rem' : '1.3rem')};
  color: #666;
  font-size: ${(p) => (p.$isFocused ? '1rem' : '1.4rem')};
  font-weight: ${(p) => (p.$isFocused ? '600' : '500')};
  transition: all 0.2s;
`;
