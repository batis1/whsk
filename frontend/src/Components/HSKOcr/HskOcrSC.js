import styled from "styled-components";

export const MainWrapper = styled.div`
  margin: 0 0 5rem 5rem;
  .divider {
    display: flex;
  }
  @media (max-width: 400px) {
    .divider {
      display: flex;
      flex-direction: column;
    }
  }
`;
