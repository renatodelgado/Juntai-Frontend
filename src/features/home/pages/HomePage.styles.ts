import styled from 'styled-components';

export const Landing = styled.div`
  & {
    --bg: #f5f3fb;
    --ink: #282043;
    --accent: #3e327f;
    --muted: #716b87;
    --surface: #ffffff;
    --panel: #ffffff;
    --line: #e8e3f2;
    --shape: #f5c7bd;
    --soft: #ede9f9;
    --closing: #e6655e;
    --closing-ink: #fff;
  }
  &,
  & * {
    box-sizing: border-box;
  }
  & {
    margin: 0;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      'Segoe UI',
      sans-serif;
    line-height: 1.55;
    color: var(--ink);
    background: var(--bg);
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button {
    font: inherit;
  }
  img {
    display: block;
    max-width: 100%;
  }
  .wrap {
    width: min(1190px, calc(100% - 48px));
    margin: auto;
  }
  .nav {
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 26px;
  }
  .logo {
    width: 128px;
  }
  .nav-links,
  .nav-actions,
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 25px;
  }
  .nav-links {
    font-size: 0.9rem;
    font-weight: 650;
  }
  .nav-actions {
    gap: 10px;
  }
  .btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    min-height: 49px;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 750;
    font-size: 0.9rem;
    transition: transform 0.2s;
  }
  .btn:hover {
    transform: translateY(-2px);
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-outline {
    border: 1px solid var(--line);
    background: transparent;
    color: var(--ink);
  }
  .nav .btn {
    min-height: 43px;
  }
  .tag {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--accent);
  }
  .tag:before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
  .hero {
    display: grid;
    grid-template-columns: 1.04fr 0.96fr;
    gap: 6%;
    align-items: center;
    padding: 76px 0 104px;
  }
  .hero h1 {
    font-size: clamp(3.2rem, 6vw, 5.8rem);
    line-height: 1.02;
    letter-spacing: -0.065em;
    margin: 22px 0 25px;
    max-width: 760px;
  }
  .hero h1 em {
    font-style: normal;
    color: var(--accent);
  }
  .hero p {
    font-size: 1.09rem;
    line-height: 1.8;
    max-width: 570px;
    color: var(--muted);
  }
  .hero-actions {
    margin-top: 30px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .hero-note {
    font-size: 0.83rem !important;
    margin-top: 25px;
    color: var(--muted);
  }
  .visual {
    min-height: 485px;
    position: relative;
    display: grid;
    place-items: center;
  }
  .visual-back {
    position: absolute;
    inset: 6% 8%;
    border-radius: 44% 56% 49% 51%;
    background: var(--shape);
    transform: rotate(-12deg);
  }
  .orbit {
    position: absolute;
    border: 1px solid var(--line);
    border-radius: 50%;
    width: 93%;
    aspect-ratio: 1;
  }
  .orbit.two {
    width: 67%;
  }
  .center {
    position: relative;
    width: 190px;
    height: 190px;
    background: #fff;
    border-radius: 50%;
    display: grid;
    place-items: center;
    box-shadow: 0 25px 75px #20134220;
  }
  .center img {
    width: 108px;
  }
  .bubble {
    position: absolute;
    background: var(--panel);
    border: 1px solid var(--line);
    padding: 15px 18px;
    border-radius: 16px;
    box-shadow: 0 15px 50px #21154d1c;
    font-size: 0.82rem;
    min-width: 170px;
    color: var(--ink);
  }
  .bubble strong,
  .bubble span {
    display: block;
  }
  .bubble span {
    color: var(--muted);
    font-size: 0.74rem;
  }
  .bubble.one {
    top: 11%;
    left: 3%;
  }
  .bubble.two {
    bottom: 14%;
    right: 0;
  }
  .bubble.three {
    bottom: 5%;
    left: 12%;
    min-width: 140px;
  }
  .section {
    padding: 105px 0;
  }
  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 35px;
    margin-bottom: 50px;
  }
  .section h2 {
    font-size: clamp(2.35rem, 4.5vw, 4rem);
    line-height: 1.08;
    letter-spacing: -0.05em;
    margin: 12px 0;
    max-width: 750px;
  }
  .section-heading > p {
    max-width: 390px;
    color: var(--muted);
  }
  .intro {
    background: var(--surface);
  }
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .feature {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 30px;
    min-height: 230px;
  }
  .feature-icon {
    width: 45px;
    height: 45px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    background: var(--soft);
    color: var(--accent);
    font-size: 1.35rem;
    font-weight: 800;
  }
  .feature h3 {
    font-size: 1.15rem;
    margin: 23px 0 9px;
  }
  .feature p {
    color: var(--muted);
    font-size: 0.94rem;
    margin: 0;
  }
  .audience {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .audience-card {
    padding: 40px;
    border-radius: 23px;
    background: var(--panel);
    border: 1px solid var(--line);
  }
  .audience-card h3 {
    font-size: 1.65rem;
    letter-spacing: -0.035em;
    margin: 14px 0;
  }
  .audience-card p {
    max-width: 460px;
    color: var(--muted);
  }
  .audience-card a {
    font-weight: 800;
    color: var(--accent);
    display: inline-block;
    margin-top: 14px;
  }
  .plans {
    background: var(--surface);
  }
  .notice {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 17px 20px;
    border-radius: 14px;
    background: var(--soft);
    color: var(--ink);
    font-size: 0.9rem;
    margin-bottom: 24px;
  }
  .notice strong {
    white-space: nowrap;
  }
  .pricing-scroll {
    overflow: auto;
    padding: 5px 0 20px;
  }
  .pricing {
    display: grid;
    grid-template-columns: repeat(5, minmax(190px, 1fr));
    gap: 11px;
    min-width: 1040px;
  }
  .plan {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 23px 18px;
    display: flex;
    flex-direction: column;
    min-height: 410px;
  }
  .plan.featured {
    border: 2px solid var(--accent);
    position: relative;
  }
  .plan .type {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 800;
    color: var(--accent);
  }
  .plan h3 {
    font-size: 1.05rem;
    letter-spacing: -0.02em;
    margin: 13px 0 5px;
  }
  .price {
    font-size: 2rem;
    letter-spacing: -0.06em;
    font-weight: 850;
    line-height: 1.1;
    margin: 13px 0;
  }
  .price small {
    font-size: 0.8rem;
    color: var(--muted);
    letter-spacing: 0;
    font-weight: 500;
  }
  .plan .desc {
    color: var(--muted);
    font-size: 0.8rem;
    min-height: 48px;
  }
  .plan ul {
    list-style: none;
    margin: 18px 0 24px;
    padding: 0;
    display: grid;
    gap: 10px;
    font-size: 0.8rem;
    line-height: 1.4;
  }
  .plan li {
    display: flex;
    gap: 8px;
  }
  .plan li:before {
    content: '✓';
    color: var(--accent);
    font-weight: 900;
  }
  .plan .plan-end {
    margin-top: auto;
    border-top: 1px solid var(--line);
    padding-top: 16px;
    color: var(--muted);
    font-size: 0.76rem;
    font-weight: 700;
  }
  .plans-foot {
    color: var(--muted);
    font-size: 0.82rem;
    max-width: 850px;
  }
  .closing {
    padding: 90px 0;
  }
  .closing-box {
    border-radius: 28px;
    padding: 60px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 25px;
    background: var(--closing);
    color: var(--closing-ink);
  }
  .closing h2 {
    font-size: clamp(2.2rem, 4vw, 3.6rem);
    line-height: 1.1;
    letter-spacing: -0.05em;
    max-width: 650px;
    margin: 12px 0;
  }
  .closing p {
    opacity: 0.8;
    max-width: 620px;
  }
  .footer {
    border-top: 1px solid var(--line);
    padding: 30px 0 45px;
  }
  .footer .wrap {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: center;
  }
  .footer p,
  .footer a {
    font-size: 0.8rem;
    color: var(--muted);
  }
  .footlinks {
    display: flex;
    gap: 18px;
  }
  .demo {
    position: fixed;
    bottom: 15px;
    right: 15px;
    border-radius: 99px;
    background: #1c1835;
    color: white;
    padding: 9px 14px;
    font-size: 11px;
    z-index: 10;
    box-shadow: 0 8px 25px #0003;
  }
  @media (max-width: 850px) {
    .nav-links {
      display: none;
    }
    .hero {
      grid-template-columns: 1fr;
      padding: 40px 0 65px;
    }
    .hero h1 {
      font-size: clamp(3rem, 10vw, 4.8rem);
    }
    .visual {
      min-height: 360px;
      max-width: 480px;
      width: 100%;
      margin: auto;
    }
    .orbit {
      width: 80%;
    }
    .orbit.two {
      width: 55%;
    }
    .feature-grid {
      grid-template-columns: 1fr;
    }
    .feature {
      min-height: 0;
    }
    .section {
      padding: 75px 0;
    }
    .section-heading {
      display: block;
    }
    .section-heading > p {
      max-width: 600px;
    }
    .audience {
      grid-template-columns: 1fr;
    }
    .closing-box {
      display: block;
      padding: 35px;
    }
    .footer .wrap {
      align-items: flex-start;
      flex-direction: column;
    }
    .nav-actions .btn-primary {
      display: none;
    }
  }
  @media (max-width: 480px) {
    .wrap {
      width: calc(100% - 32px);
    }
    .nav {
      height: 72px;
    }
    .logo {
      width: 110px;
    }
    .hero h1 {
      font-size: 3rem;
    }
    .hero-actions .btn {
      width: 100%;
    }
    .visual {
      min-height: 330px;
    }
    .bubble {
      font-size: 0.7rem;
      min-width: 140px;
    }
    .center {
      width: 150px;
      height: 150px;
    }
    .center img {
      width: 85px;
    }
    .notice {
      display: block;
    }
    .notice strong {
      display: block;
      margin-bottom: 5px;
    }
    .closing .btn {
      width: 100%;
    }
    .footlinks {
      flex-wrap: wrap;
    }
  }
  .nav {
    padding: 0 22px;
    background: #fff;
    border-radius: 0 0 20px 20px;
  }
  .hero {
    grid-template-columns: 1fr 1fr;
  }
  .hero h1 {
    font-size: clamp(3.4rem, 6vw, 5.6rem);
  }
  .visual {
    background: #3e327f;
    border-radius: 32px;
    overflow: hidden;
  }
  .visual-back {
    background: #eb7b6e;
    inset: 14%;
    border-radius: 50%;
    transform: none;
  }
  .orbit {
    border-color: #ffffff50;
  }
  .bubble {
    border: none;
  }
  .intro .feature:nth-child(2) {
    background: #fff2ed;
  }
  .audience-card:first-child {
    background: #3e327f;
    color: #fff;
  }
  .audience-card:first-child p {
    color: #d7d1e8;
  }
  .audience-card:first-child a {
    color: #ffaaa0;
  }
  .plans {
    background: #efecf7;
  }
  .plan.featured {
    background: #3e327f;
    color: white;
  }
  .plan.featured .desc,
  .plan.featured .plan-end,
  .plan.featured .price small {
    color: #dfd7f0;
  }
  .plan.featured .type,
  .plan.featured li:before {
    color: #ffa498;
  }
  .plan.featured .plan-end {
    border-color: #ffffff35;
  }
  .closing .btn-primary {
    background: #fff;
    color: #3e327f;
  }
  @media (max-width: 850px) {
    .hero {
      grid-template-columns: 1fr;
    }
  }
  .hero-actions a[href$='/cadastro/startup'] {
    background: #e6655e;
    color: white;
    border-color: #e6655e;
  }
  .hero-actions a[href$='/cadastro/investidor'] {
    background: #3e327f;
    color: white;
    border-color: #3e327f;
  }
  .visual {
    background: #f0edf9;
    border: 1px solid #e3ddf3;
    min-height: 485px;
  }
  .visual-back,
  .orbit {
    display: none;
  }
  .atom {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .center {
    width: 130px;
    height: 130px;
    box-shadow: 0 12px 40px #3e327f1f;
    z-index: 1;
  }
  .center img {
    width: 76px;
  }
  .bubble {
    z-index: 2;
    box-shadow: 0 10px 30px #3e327f0d;
    border: 1px solid #e6e0f3;
    min-width: 0;
    background: #fff;
  }
  .bubble.one {
    top: 8%;
    left: 5%;
  }
  .bubble.two {
    top: 13%;
    right: 5%;
    bottom: auto;
    left: auto;
  }
  .bubble.three {
    bottom: 7%;
    left: 50%;
    transform: translateX(-50%);
    min-width: 0;
  }
  .audience-card:first-child {
    background: #fff2ee;
    color: #422c36;
    border-color: #f5d8d0;
  }
  .audience-card:first-child p {
    color: #725d63;
  }
  .audience-card:first-child .tag {
    color: #bb4b43;
  }
  .audience-card:first-child a,
  .audience-card:last-child a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 11px 17px;
    border-radius: 11px;
    color: white;
  }
  .audience-card:first-child a {
    background: #e6655e;
  }
  .audience-card:last-child a {
    background: #3e327f;
  }
  .audience-card:last-child {
    background: #f0edf9;
    border-color: #e2dbf2;
  }
  .section-heading .heading-copy {
    max-width: 660px;
  }
  .section-heading .heading-copy p {
    max-width: 570px;
    color: var(--muted);
    margin: 15px 0 0;
    font-size: 1rem;
    line-height: 1.7;
  }
  @media (max-width: 850px) {
    .visual {
      min-height: 400px;
    }
  }
  @media (max-width: 480px) {
    .visual {
      min-height: 350px;
    }
    .center {
      width: 104px;
      height: 104px;
    }
    .center img {
      width: 63px;
    }
    .bubble {
      padding: 10px 12px;
    }
    .bubble.one {
      top: 8%;
      left: 4%;
    }
    .bubble.two {
      top: 14%;
      right: 4%;
    }
    .bubble.three {
      bottom: 6%;
    }
    .bubble span {
      font-size: 0.68rem;
    }
    .audience-card {
      padding: 30px;
    }
  }

  h1,
  h2,
  h3 {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .closing-tag {
    color: inherit;
  }
`;
