import styled from 'styled-components';

const NavigationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  &:hover {
    background-color: lightgray;
    cursor: pointer;
  }
`;

export default NavigationItem;
