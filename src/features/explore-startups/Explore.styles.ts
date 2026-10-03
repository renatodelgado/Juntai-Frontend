import styled from 'styled-components';

export const Shell = styled.div`
  min-height: 100dvh;
  background: #faf9f6;
  color: #302c43;
  a {
    text-decoration: none;
  }
  button,
  select,
  input {
    min-height: 44px;
  }
  button {
    cursor: pointer;
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none !important;
      animation: none !important;
    }
  }
`;
export const Main = styled.main`
  width: min(100% - 4rem, 82.5rem);
  margin: 0 auto;
  padding: 2rem 0 4rem;
  h1 {
    font-size: clamp(28px, 3vw, 38px);
    letter-spacing: -1.2px;
    margin: 0 0 12px;
  }
  p {
    color: #756f80;
  }
  small {
    color: #756f80;
  }
  > header {
    margin-bottom: 1.5rem;
  }
  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .notice {
    padding: 12px 18px;
    border: 1px solid #dfd8ed;
    background: #f2edf7;
    border-radius: 10px;
    margin: 16px 0;
    font-size: 13px;
  }
  .empty {
    text-align: center;
    padding: 55px 20px;
  }
  .empty p {
    margin-bottom: 24px;
  }
  .personalize {
    border-left: 3px solid #e6655e;
    padding: 12px 20px;
    margin-bottom: 24px;
  }
  .personalize h3,
  .personalize p {
    margin: 0 0 8px;
  }
  .results {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin: 30px 0 20px;
  }
  .results h2 {
    margin: 0;
    font-size: 19px;
  }
  .results small {
    font-size: 12px;
  }
  .results select {
    border: 0;
    background: transparent;
    color: #5a5369;
    max-width: 220px;
    font-size: 12px;
  }
  .view-toggle {
    display: flex;
    border: 1px solid #e6e1de;
    padding: 3px;
    border-radius: 9px;
  }
  .view-toggle button {
    border: 0;
    background: transparent;
    border-radius: 6px;
    width: 40px;
    min-height: 36px;
    color: #766f81;
  }
  .view-toggle [aria-pressed='true'] {
    background: #eeeaf5;
    color: #3e327f;
  }
  .demo-note {
    font-size: 11px;
    margin-top: 28px;
  }

  @media (max-width: 700px) {
    width: calc(100% - 2rem);
    padding: 1.25rem 0 3rem;
    .heading-actions button {
      padding: 10px;
    }
    .heading-actions .saved-label {
      display: none;
    }
  }
`;
export const Hero = styled.section`
  display: flex;
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: space-between;
  padding: 28px 34px;
  background: #efeaf3;
  border-radius: 18px;
  margin-bottom: 28px;
  min-height: 196px;
  > div:first-child {
    max-width: 590px;
    position: relative;
    z-index: 1;
  }
  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6d5e85;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.7px;
  }
  h2 {
    margin: 12px 0 10px;
    font-size: clamp(23px, 2.3vw, 30px);
    letter-spacing: -0.7px;
  }
  p {
    max-width: 510px;
    font-size: 13px;
    margin: 0 0 18px;
    color: #73697f;
  }
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 22px;
    font-size: 11px;
    color: #81768d;
  }
  .stats strong {
    color: #3e327f;
    font-size: 16px;
    margin-right: 5px;
  }
  .brand-symbol {
    width: 180px;
    height: 140px;
    object-fit: contain;
    flex-shrink: 0;
    margin-left: 28px;
    opacity: 0.85;
  }
  @media (max-width: 900px) {
    .brand-symbol {
      display: none;
    }
    padding: 25px;
  }
`;

export const SearchArea = styled.section`
  .search {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #e4dfdc;
    border-radius: 12px;
    padding: 3px 17px;
    background: white;
    color: #8a8193;
  }
  .search input {
    width: 100%;
    border: 0;
    background: transparent;
    outline-offset: 0;
    padding: 12px 0;
    font-size: 13px;
    color: #302c43;
    min-width: 0;
  }
  .filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 14px;
    align-items: center;
  }
  select,
  .filter-button {
    max-width: 205px;
    min-height: 40px;
    border: 1px solid #e7e1dd;
    border-radius: 8px;
    background: transparent;
    padding: 8px 12px;
    color: #756d7f;
    font-size: 11px;
  }
  select[data-active='true'],
  .filter-button[aria-expanded='true'] {
    color: #3e327f;
    border-color: #bcb0d6;
    background: #f0edf7;
  }
  .filter-button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .clear {
    border: 0;
    background: transparent;
    color: #3e327f;
    font-size: 12px;
    margin-left: auto;
  }
  .chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .chips button {
    background: #eeeaf6;
    border: 0;
    color: #3e327f;
    border-radius: 20px;
    padding: 6px 12px;
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 11px;
  }
`;
export const Form = styled.form`
  display: grid;
  gap: 18px;
  label {
    display: grid;
    gap: 7px;
    font-size: 13px;
    font-weight: 600;
  }
  input,
  select,
  textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #ded8e8;
    border-radius: 9px;
    background: white;
    padding: 10px 12px;
    color: #302c43;
  }
  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  p {
    margin: 0;
    font-size: 12px;
  }
  .error {
    color: #b42332;
  }
  @media (max-width: 450px) {
    .pair {
      grid-template-columns: 1fr;
    }
  }
`;
export const Grid = styled.div<{ $list: boolean }>`
  display: grid;
  grid-template-columns: ${({ $list }) => ($list ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
  gap: 24px;
  align-items: start;
  @media (min-width: 1450px) {
    grid-template-columns: ${({ $list }) => ($list ? '1fr' : 'repeat(3, minmax(0, 1fr))')};
  }
  @media (min-width: 1800px) {
    grid-template-columns: ${({ $list }) => ($list ? '1fr' : 'repeat(4, minmax(0, 1fr))')};
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;
export const Card = styled.article<{ $list: boolean }>`
  display: inline-block;
  width: 100%;
  break-inside: avoid;
  background: white;
  border: 1px solid #e8e2dc;
  border-radius: 17px;
  overflow: hidden;
  margin-bottom: 24px;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  &:hover {
    box-shadow: 0 10px 28px #3528460a;
    transform: translateY(-3px);
  }
  .body {
    padding: 24px;
  }
  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .card-top > div:nth-child(2) {
    flex: 1;
  }
  h3 {
    margin: 3px 0 5px;
    font-size: 21px;
    letter-spacing: -0.6px;
  }
  .segment {
    font-size: 10px;
    color: #93829c;
    text-transform: uppercase;
    letter-spacing: 1.3px;
  }
  .location {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 11px;
    margin: 0;
  }
  .tagline {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 25px;
    color: #3a3448;
    line-height: 1.3;
    letter-spacing: -0.7px;
    margin: 24px 0 12px;
    font-weight: 600;
  }
  .description {
    font-size: 13px;
    line-height: 1.8;
    margin: 16px 0;
  }
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 18px 0;
  }
  .tags span {
    font-size: 10px;
    padding: 5px 9px;
    border-radius: 5px;
    background: #f5f3f0;
    color: #756b7b;
  }
  .investment {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6a7653;
    font-size: 11px;
    margin-top: 12px;
  }
  .card-footer {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    border-top: 1px solid #eee9e4;
    padding-top: 18px;
    margin-top: 20px;
  }
  .card-footer a {
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    gap: 8px;
    align-items: center;
    color: #3e327f;
    min-height: 44px;
  }
  .interest {
    font-size: 12px;
    border: 1px solid #d8cfe7;
    background: #f1edf7;
    color: #3e327f;
    border-radius: 8px;
    padding: 8px 14px;
    font-weight: 600;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .interest:hover:not(:disabled) {
    background: #e8e1f2;
    border-color: #b7a5cf;
  }
  .interest:disabled {
    font-size: 11px;
    border: 0;
    background: transparent;
    color: #7b856f;
    cursor: default;
    padding: 0;
    font-weight: 400;
  }
  ${({ $list }) => $list && '.visual { display: none; } .tagline { font-size: 20px; margin: 15px 0; } .body { padding: 22px; }'}
`;
export const Logo = styled.span<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: ${({ $color }) => $color};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 19px;
  font-weight: 700;
  color: #514e3e;
`;
export const SaveButton = styled.button`
  border: 0;
  background: transparent;
  color: #8b8194;
  padding: 6px;
  display: grid;
  place-items: center;
  min-width: 40px;
  &[aria-pressed='true'] {
    color: #3e327f;
  }
`;
export const Compatibility = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #3e327f;
  font-weight: 600;
  padding: 7px 10px;
  background: #f1edf7;
  border-radius: 6px;
`;
export const Visual = styled.div<{ $color: string }>`
  height: 180px;
  background: ${({ $color }) => $color};
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 20px 25px;
  color: #506451;
  .caption {
    z-index: 1;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .field {
    position: absolute;
    border: 1px solid #a4b7a4;
    width: 280px;
    height: 140px;
    border-radius: 50%;
    transform: rotate(-30deg);
    right: -30px;
    top: 28px;
  }
  .field:nth-child(2) {
    right: -55px;
    top: 48px;
  }
  .field:nth-child(3) {
    right: -80px;
    top: 68px;
  }
  .seed {
    position: absolute;
    width: 30px;
    height: 50px;
    border-radius: 50% 50% 0 50%;
    background: #7e9779;
    transform: rotate(-30deg);
    right: 105px;
    top: 48px;
  }
  .seed:last-child {
    transform: rotate(55deg);
    right: 64px;
    top: 38px;
    background: #afbd92;
  }
`;
export const Profile = styled.div`
  .back {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: #766f81;
    margin-bottom: 25px;
    min-height: 44px;
  }
  .profile-header {
    padding: 36px;
    border-radius: 20px;
    background: #efeaf3;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 22px;
    margin-bottom: 32px;
  }
  .profile-header > div {
    flex: 1;
    min-width: 180px;
  }
  .profile-header .startup-name {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    margin: 6px 0 12px;
    font-size: 26px;
  }
  .profile-header p {
    margin: 0 0 15px;
  }
  .profile-header .meta {
    font-size: 12px;
  }
  .profile-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(250px, 1fr);
    gap: 44px;
  }
  section {
    padding-bottom: 26px;
    margin-bottom: 24px;
    border-bottom: 1px solid #e7e1dc;
  }
  section h2 {
    font-size: 22px;
    margin: 0 0 20px;
  }
  section h3 {
    font-size: 15px;
    margin: 24px 0 8px;
  }
  section p {
    font-size: 14px;
  }
  dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    margin: 0;
  }
  dt {
    font-size: 11px;
    color: #8b8194;
  }
  dd {
    margin: 5px 0 0;
    font-size: 14px;
    font-weight: 500;
  }
  .needs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .needs span {
    padding: 6px 10px;
    border: 1px solid #dfd8e8;
    border-radius: 6px;
    font-size: 12px;
  }
  .affinity {
    border: 1px solid #e2dbed;
    padding: 24px;
    background: #f5f1f8;
    border-radius: 16px;
  }
  .affinity h2 {
    font-size: 19px;
  }
  .affinity li {
    margin: 12px 0;
    font-size: 12px;
    color: #6e617f;
  }
  .affinity ul {
    padding-left: 18px;
  }
  details {
    border-top: 1px solid #e5deea;
    padding: 16px 0;
  }
  summary {
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }
  @media (max-width: 900px) {
    .profile-layout {
      grid-template-columns: 1fr;
      gap: 15px;
    }
    .profile-header {
      padding: 25px;
    }
  }
`;
