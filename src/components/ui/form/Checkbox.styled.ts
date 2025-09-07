import styled from 'styled-components';

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const CheckboxInput = styled.input`
  width: 2.5rem;
  height: 2.5rem;
  border: 0.1rem solid #6b7280;
  padding: 0;
  position: relative;

  &:checked::before {
    display: none;
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 0.4rem;
    left: 0.8rem;
    width: 0.4rem;
    height: 1rem;
    transform: rotate(45deg);
    border-style: solid;
    border-color: #000000;
    border-width: 0 0.2rem 0.2rem 0;

    @media (min-width: 1024px) {
      top: 0.2rem;
      left: 0.8rem;
      width: 0.5rem;
      height: 1.3rem;
    }
  }

  &:focus {
    outline: none;
  }

  @media (min-width: 1024px) {
    &:hover {
      border: 0.1rem solid #0891b2;
    }
  }
`;
