import React from 'react';

const HeaderNav = () => (
  <div className="nav-container">
    <nav className="primary-nav light">
    </nav>
    <div className="logo light">
      {/*<Link to="/" className="logo-link">*/}
        <a className="logo-link">
        <span className="hide-content"></span>
        <div className="big-logo" aria-hidden="true">
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 32' width='64' height='32' fill='currentcolor'>
            <path d='M30 28 L42 28 L42 6 L34 6 L30 6 L30 10 L38 10 L38 24 L34 24 L34 22 L30 22 M30 10 L30 18 L34 18 L38 18 L37.90909090909091 14.09090909090909 L34 14 L34 10 M22 2 L26 2 L26 6 L22 6 M22 10 L26 10 L26 24 L22 24 M14 0 L18 0 L18 24 L14 24 M0 0 L10 0 L10 4 L4 4 L4 8 L8 8 L8 12 L4 12 L4 24 L0 24 L0 4 M46 0 L46 24 L50 24 L50 10 L54 10 L54 24 L58 24 L58 10 L58 6 L50 6 L50 0 Z' />
          </svg>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 32' width='64' height='32' fill='#888888'>
            <path d='M4 6 L4 0 L8 0 L8 6 L12 6 L12 10 L8 10 L8 24 L4 24 L4 10 L0 10 L0 6 M20 0 L32 0 L32 4 L24 4 L24 10 L32 10 L32 14 L24 14 L24 20 L32 20 L32 24 L20 24 M36 6 L40 6 L40 0 L44 0 L44 6 L48 6 L48 10 L44 10 L44 24 L40 24 L40 10 L36 10 M52 0 L52 24 L56 24 L56 10 L60 10 L60 24 L64 24 L64 6 L56 6 L56 0 Z' />
          </svg>
        </div>
        </a>
      {/*</Link>*/}
    </div>
    <nav className="secondary-nav light">
    </nav>
  </div>
);

export default HeaderNav;
