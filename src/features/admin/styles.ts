import styled from 'styled-components';

export const Shell = styled.div`
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.appBackground};
  color: ${({ theme }) => theme.colors.appText};
  > header {
    background: white;
    border-bottom: 1px solid ${({ theme }) => theme.colors.appBorder};
  }
  .top {
    max-width: 1280px;
    margin: auto;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .brand img {
    width: 105px;
    display: block;
  }
  .admin-label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.investor};
    background: ${({ theme }) => theme.colors.background};
    padding: 0.4rem 0.7rem;
    border-radius: 2rem;
  }
  nav {
    display: flex;
    gap: 0.25rem;
    flex: 1;
    flex-wrap: wrap;
  }
  nav a {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 0.75rem;
    border-radius: 0.7rem;
    text-decoration: none;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  nav a[aria-current='page'] {
    color: ${({ theme }) => theme.colors.investor};
    background: ${({ theme }) => theme.colors.background};
    font-weight: 700;
  }
  main {
    max-width: 1280px;
    margin: auto;
    padding: 2rem 1.5rem;
  }
  @media (max-width: 600px) {
    .top {
      gap: 0.75rem;
      padding: 1rem;
    }
    nav {
      order: 3;
      flex-basis: 100%;
    }
    main {
      padding: 1.25rem 1rem;
    }
  }
`;
export const Area = styled.div`
  display: grid;
  gap: 1.5rem;
  .cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
  .card,
  .panel {
    background: white;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 1rem;
    padding: 1.5rem;
    min-width: 0;
  }
  .card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  .card svg {
    color: ${({ theme }) => theme.colors.investor};
    background: ${({ theme }) => theme.colors.background};
    padding: 0.6rem;
    width: 46px;
    height: 46px;
    border-radius: 0.8rem;
    flex-shrink: 0;
  }
  .card strong {
    display: block;
    font-size: 2rem;
    line-height: 1.2;
    margin: 0.35rem 0;
  }
  .card span,
  .hint {
    color: ${({ theme }) => theme.colors.appMuted};
    font-size: 0.875rem;
  }
  h2 {
    font-size: 1.25rem;
    margin: 0 0 1rem;
  }
  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  input,
  select,
  textarea {
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 0.6rem;
    padding: 0.65rem 0.75rem;
    color: ${({ theme }) => theme.colors.appText};
    background: white;
    font: inherit;
    max-width: 100%;
  }
  input:focus,
  select:focus,
  textarea:focus {
    outline: 2px solid ${({ theme }) => theme.colors.investor};
    outline-offset: 2px;
  }
  .table-wrap {
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  th {
    text-align: left;
    color: ${({ theme }) => theme.colors.appMuted};
    font-weight: 500;
    background: ${({ theme }) => theme.colors.appBackground};
  }
  th,
  td {
    padding: 0.8rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.appBorder};
  }
  td:first-child {
    font-weight: 600;
  }
  .actions {
    display: flex;
    gap: 0.35rem;
  }
  .actions button {
    padding: 0.45rem 0.6rem;
    font-size: 0.8rem;
    min-height: 32px;
  }
  .badge {
    display: inline-block;
    padding: 0.25rem 0.55rem;
    border-radius: 2rem;
    background: #f3f1f8;
    color: #3e327f;
    font-size: 0.75rem;
  }
  .badge[data-status='pendente'] {
    background: #fffaeb;
    color: #8a5a14;
  }
  .badge[data-status='aprovado'],
  .badge[data-status='ativo'] {
    background: #e9f7f0;
    color: #246448;
  }
  .badge[data-status='rejeitado'],
  .badge[data-status='inativo'] {
    background: #feecec;
    color: #b42332;
  }
  .pagination {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    align-items: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  .empty {
    padding: 2rem 1rem;
    text-align: center;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  .feedback {
    padding: 1rem;
    border-radius: 0.75rem;
    background: #e9f7f0;
    color: #246448;
  }
  .error {
    padding: 1rem;
    border-radius: 0.75rem;
    background: #feecec;
    color: #b42332;
  }
  .tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .tabs button[aria-pressed='true'] {
    background: ${({ theme }) => theme.colors.investor};
    color: white;
  }
  .activity {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .activity li {
    padding: 1rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.appBorder};
    display: flex;
    gap: 1rem;
    align-items: start;
  }
  .activity svg {
    color: ${({ theme }) => theme.colors.investor};
    flex-shrink: 0;
  }
  .activity small {
    display: block;
    margin-top: 0.35rem;
    color: ${({ theme }) => theme.colors.appMuted};
  }
  @media (max-width: 720px) {
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .panel {
      padding: 1rem;
    }
    .card {
      padding: 1rem;
      gap: 0.65rem;
    }
  }
  @media (max-width: 400px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
`;
export const Detail = styled.div`
  display: grid;
  gap: 1rem;
  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin: 0;
  }
  dl div {
    min-width: 0;
    padding: 0.75rem;
    background: ${({ theme }) => theme.colors.appBackground};
    border-radius: 0.5rem;
  }
  dt {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.appMuted};
    margin-bottom: 0.3rem;
  }
  dd {
    margin: 0;
    font-size: 0.9rem;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
  img {
    max-width: 120px;
    max-height: 120px;
    object-fit: contain;
  }
  textarea,
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 0.5rem;
    font: inherit;
  }
  label {
    display: grid;
    gap: 0.4rem;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .error {
    color: ${({ theme }) => theme.colors.error};
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 0.8rem;
  }
  @media (max-width: 500px) {
    dl {
      grid-template-columns: 1fr;
    }
  }
`;
