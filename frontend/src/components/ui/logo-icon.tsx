import React from 'react';

interface LogoIconProps {
  type: string;
  size?: number;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ 
  type, 
  size = 32, 
  className = '', 
  primaryColor = '#3B82F6',
  secondaryColor = '#FFFFFF'
}) => {
  const iconProps = {
    width: size,
    height: size,
    className: className,
    fill: primaryColor,
    stroke: secondaryColor,
    strokeWidth: 1
  };

  switch (type) {
    case 'circle':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );

    case 'square':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="2" />
        </svg>
      );

    case 'triangle':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L22 20H2L12 2Z" />
        </svg>
      );

    case 'diamond':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L22 12L12 22L2 12L12 2Z" />
        </svg>
      );

    case 'star':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
        </svg>
      );

    case 'hexagon':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L20 6V18L12 22L4 18V6L12 2Z" />
        </svg>
      );

    case 'shield':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L4 6V12C4 16.55 7.84 20.74 12 22C16.16 20.74 20 16.55 20 12V6L12 2Z" />
        </svg>
      );

    case 'crown':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M5 16L3 8L8.5 10L12 4L15.5 10L21 8L19 16H5ZM5 16H19V18H5V16Z" />
        </svg>
      );

    case 'flame':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14.5 12 14.5C14.5 14.5 16 12.5 16 10C16 6 12 2 12 2Z" />
          <path d="M12 15C8 15 5 12 5 8C5 6 6 4 8 3C8 5 9 7 12 7C15 7 16 5 16 3C18 4 19 6 19 8C19 12 16 15 12 15Z" />
        </svg>
      );

    case 'lightning':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
      );

    case 'wave':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M2 12C2 12 4 8 8 8C12 8 14 12 14 12C14 12 12 16 8 16C4 16 2 12 2 12Z" />
          <path d="M10 12C10 12 12 8 16 8C20 8 22 12 22 12C22 12 20 16 16 16C12 16 10 12 10 12Z" />
        </svg>
      );

    case 'mountain':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M14 6L10.25 11L14 16L18 11L14 6Z" />
          <path d="M8.5 8L5 13L8.5 18L12 13L8.5 8Z" />
          <path d="M19.5 4L16 9L19.5 14L23 9L19.5 4Z" />
        </svg>
      );

    case 'eagle':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C8 4 6 8 6 12C6 16 8 20 12 22C16 20 18 16 18 12C18 8 16 4 12 2Z" />
          <path d="M9 8C9 8 10 10 12 10C14 10 15 8 15 8" />
          <path d="M8 14C8 14 10 16 12 16C14 16 16 14 16 14" />
        </svg>
      );

    case 'lion':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C8 4 6 8 6 12C6 16 8 20 12 22C16 20 18 16 18 12C18 8 16 4 12 2Z" />
          <path d="M8 8C8 8 9 10 12 10C15 10 16 8 16 8" />
          <path d="M10 6C10 6 11 7 12 7C13 7 14 6 14 6" />
          <path d="M8 14C8 14 10 16 12 16C14 16 16 14 16 14" />
        </svg>
      );

    case 'bull':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C8 4 6 8 6 12C6 16 8 20 12 22C16 20 18 16 18 12C18 8 16 4 12 2Z" />
          <path d="M8 8C8 8 9 10 12 10C15 10 16 8 16 8" />
          <path d="M6 6C6 6 7 7 8 7C9 7 10 6 10 6" />
          <path d="M14 6C14 6 15 7 16 7C17 7 18 6 18 6" />
        </svg>
      );

    case 'wolf':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C8 4 6 8 6 12C6 16 8 20 12 22C16 20 18 16 18 12C18 8 16 4 12 2Z" />
          <path d="M8 8C8 8 9 10 12 10C15 10 16 8 16 8" />
          <path d="M7 6C7 6 8 7 9 7C10 7 11 6 11 6" />
          <path d="M13 6C13 6 14 7 15 7C16 7 17 6 17 6" />
        </svg>
      );

    case 'bear':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C8 4 6 8 6 12C6 16 8 20 12 22C16 20 18 16 18 12C18 8 16 4 12 2Z" />
          <path d="M8 8C8 8 9 10 12 10C15 10 16 8 16 8" />
          <path d="M9 6C9 6 10 7 12 7C14 7 15 6 15 6" />
        </svg>
      );

    case 'tiger':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C8 4 6 8 6 12C6 16 8 20 12 22C16 20 18 16 18 12C18 8 16 4 12 2Z" />
          <path d="M8 8C8 8 9 10 12 10C15 10 16 8 16 8" />
          <path d="M7 6C7 6 8 7 9 7C10 7 11 6 11 6" />
          <path d="M13 6C13 6 14 7 15 7C16 7 17 6 17 6" />
        </svg>
      );

    case 'cross':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L12 10L20 10L20 14L12 14L12 22L8 22L8 14L0 14L0 10L8 10L8 2L12 2Z" />
        </svg>
      );

    case 'anchor':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 12V13H15V21H9V13H3V12H9V8H15V12H21Z" />
        </svg>
      );

    case 'sword':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M6.92 5L5 6.92L11.08 13L13 11.08L6.92 5ZM20.71 4.63L19.29 3.21L15.36 7.14L16.77 8.55L20.71 4.63ZM18.29 7.71L17.5 8.5L15.5 6.5L16.29 5.71L18.29 7.71ZM12 2L10 4L14 8L16 6L12 2ZM4 12L2 14L6 18L8 16L4 12ZM20 12L18 14L22 18L24 16L20 12Z" />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
        </svg>
      );

    case 'hammer':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
          <path d="M8 18L10 20L16 14L14 12L8 18Z" />
        </svg>
      );

    case 'gear':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
        </svg>
      );

    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};
