import { FunctionComponent } from 'react'

type SpoonProps = {
  height: number,
  width: number
}

const Spoon: FunctionComponent<SpoonProps> = (props) => {
  const backupW = 245;
  const backupH = 357;
  return (
    <svg width={props.width} height={props.height} viewBox="0 0 247 357" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_ii)">
      <path d="M157.814 48.9212C184.314 11.9224 207.562 12.6635 216.02 17.7926C224.692 22.5532 236.957 42.3158 218.166 83.7652C206.385 109.751 192.64 122.4 181.416 128.598C171.536 134.054 163.618 134.505 160.764 134.667C160.377 134.689 160.083 134.706 159.89 134.729C158.375 134.945 154.459 136.857 151.293 142.861L51.5575 326.653L51.3537 327.029C49.2233 330.959 47.0341 334.997 43.5022 337.723C41.7957 339.04 39.9769 339.925 38.1037 340.083C35.1949 340.328 32.7656 339.656 30.8132 338.581C28.9063 337.428 27.1091 335.66 25.8673 333.018C25.0676 331.317 24.9248 329.299 25.212 327.163C25.8065 322.741 28.2091 318.826 30.5471 315.017L30.7707 314.652L140.071 136.382C143.688 130.639 143.387 126.291 142.816 124.871C142.739 124.693 142.607 124.43 142.433 124.084L142.432 124.084C141.146 121.531 137.577 114.448 137.363 103.163C137.119 90.3446 141.2 72.1167 157.814 48.9212Z" fill="url(#paint0_linear)"/>
      </g>
      <path d="M161.133 141.157L161.133 141.157C161.107 141.158 161.082 141.16 161.059 141.161C160.905 141.244 160.639 141.405 160.28 141.693C159.454 142.356 158.239 143.625 157.043 145.893L157.025 145.927L157.007 145.961L57.2714 329.752L57.2706 329.754L57.068 330.127C56.9965 330.259 56.924 330.393 56.8504 330.529C54.868 334.193 52.1096 339.291 47.4733 342.869C45.1804 344.638 42.1948 346.261 38.6503 346.56C34.3701 346.921 30.6685 345.921 27.6788 344.275L27.5625 344.211L27.4489 344.143C24.5289 342.376 21.812 339.671 19.9847 335.783C18.4715 332.564 18.384 329.167 18.77 326.297C19.5503 320.493 22.5861 315.555 24.7679 312.006C24.8487 311.875 24.9283 311.745 25.0066 311.618L161.133 141.157ZM161.133 141.157C164.398 140.971 173.442 140.427 184.559 134.288C197.201 127.306 211.825 113.493 224.086 86.4491C243.404 43.8389 232.332 19.4466 219.271 12.1625C206.432 4.49358 179.772 7.10129 152.53 45.1363C135.239 69.2761 130.589 88.8477 130.864 103.287C131.105 115.984 135.156 124.088 136.628 127.009L136.628 127.009L161.133 141.157ZM25.2293 311.255L25.0071 311.617L136.628 127.01C136.64 127.032 136.651 127.054 136.661 127.075C136.666 127.25 136.66 127.561 136.59 128.016C136.429 129.063 135.937 130.75 134.571 132.918L134.55 132.951L134.53 132.985L25.2303 311.253L25.2293 311.255Z" stroke="#373737" strokeWidth="13"/>
      <defs>
      <filter id="filter0_ii" x="12.0762" y="2.13095" width="228.898" height="351.003" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="23"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="-11" dy="-13"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"/>
      <feBlend mode="normal" in2="effect1_innerShadow" result="effect2_innerShadow"/>
      </filter>
      <linearGradient id="paint0_linear" x1="86" y1="171" x2="134" y2="217" gradientUnits="userSpaceOnUse">
      <stop stopColor="#A9A9A9"/>
      <stop offset="1" stopColor="#DFDFDF"/>
      </linearGradient>
      </defs>
    </svg>
  )
}

export default Spoon;