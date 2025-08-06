const baselightTheme = {
    direction: 'ltr',
    palette: {
      primary: {
        main: '#973BE0',
        light: '#ECF2FF',
        dark: '#4570EA',
        about: '#FFAB00',
        about1: '#5B72EE',
        about2: '#29B9E7',
      },
      secondary: {
        main: '#2F327D',
        light: '#E8F7FF',
        dark: '#23afdb',
      },
      success: {
        main: '#13DEB9',
        light: '#E6FFFA',
        dark: '#02b3a9',
        contrastText: '#ffffff',
      },
      info: {
        main: '#539BFF',
        light: '#EBF3FE',
        dark: '#1682d4',
        contrastText: '#ffffff',
      },
      error: {
        main: '#FA896B',
        light: '#FDEDE8',
        dark: '#f3704d',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFAE1F',
        light: '#FEF5E5',
        dark: '#ae8e59',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#F2F6FA',
        200: '#EAEFF4',
        300: '#DFE5EF',
        400: '#7C8FAC',
        500: '#5A6A85',
        600: '#2A3547',
      },
      // text: {
      //   primary: '##7C858A', // Warna teks utama menjadi hitam di light mode
      //   // secondary: '',
      //   secondary: '#000000',
      // },
      text: {
        primary: '#2A3547',
        secondary: '#2A3547',
      },
      action: {
        disabledBackground: 'rgba(73,82,88,0.12)',
        hoverOpacity: 0.02,
        hover: '#f6f9fc',
      },
      divider: '#e5eaef',
      background: {
        paper: '#ffffff', // Latar belakang utama halaman tetap putih (sidebar/header)
        default: '#f0f0f0',   // Area di bawah `topcards` abu-abu terang
      },
    },
  };
  
  const baseDarkTheme = {
    direction: 'ltr',
    palette: {
      primary: {
        main: '#5D87FF',
        light: '#ECF2FF',
        dark: '#4570EA',
      },
      secondary: {
        main: '#777e89',
        light: '#1C455D',
        dark: '#173f98',
      },
      success: {
        main: '#13DEB9',
        light: '#1B3C48',
        dark: '#02b3a9',
        contrastText: '#ffffff',
      },
      info: {
        main: '#539BFF',
        light: '#223662',
        dark: '#1682d4',
        contrastText: '#ffffff',
      },
      error: {
        main: '#FA896B',
        light: '#4B313D',
        dark: '#f3704d',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFAE1F',
        light: '#4D3A2A',
        dark: '#ae8e59',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#333F55',
        200: '#465670',
        300: '#7C8FAC',
        400: '#DFE5EF',
        500: '#EAEFF4',
        600: '#F2F6FA',
        A700: '#465670',
      },
      text: {
        primary: '#ffffff', // Teks utama putih di dark mode
        secondary: '#b0b3b8', // Teks sekunder abu-abu muda
      },
      action: {
        disabledBackground: 'rgba(73,82,88,0.12)',
        hoverOpacity: 0.02,
        hover: '#333F55',
      },
      divider: '#333F55',
      background: {
        default: '#171c23', // Latar belakang utama halaman di dark mode
        paper: '#1e1e2d',   // Area di bawah `topcards` gelap
      },
    },
  };
  
  export { baseDarkTheme, baselightTheme };
  