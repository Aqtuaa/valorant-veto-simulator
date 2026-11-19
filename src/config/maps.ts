import { MapItem } from '../types/veto';

import abyssImg from '../assets/maps/Abyss.jpg';
import bindImg from '../assets/maps/Bind.jpg';
import corrodeImg from '../assets/maps/Corrode.jpg';
import havenImg from '../assets/maps/Haven.jpg';
import lotusImg from '../assets/maps/Lotus.jpg';
import summitImg from '../assets/maps/Summit.jpg';
import sunsetImg from '../assets/maps/Sunset.jpg';

/**
 * Hardcoded Valorant Map Pool (7 maps)
 * Uses high-res assets from the assets folder.
 */
export const MAP_POOL: MapItem[] = [
  {
    id: 'abyss',
    name: 'Abyss',
    location: 'Svalbard, Arctic Ocean',
    imageUrl: abyssImg,
    accentColor: '#1e88e5',
    secondaryColor: '#0d47a1',
    theme: {
      bgGradient: 'from-[#0b192c] via-[#102a43] to-[#0a1128]',
      overlayGradient: 'from-blue-600/30 to-sky-950/85',
      iconSymbol: 'ABYSS // 01',
    },
  },
  {
    id: 'bind',
    name: 'Bind',
    location: 'Rabat, Morocco',
    imageUrl: bindImg,
    accentColor: '#fb8c00',
    secondaryColor: '#e65100',
    theme: {
      bgGradient: 'from-[#2e1d10] via-[#4a2e18] to-[#1c120a]',
      overlayGradient: 'from-amber-600/30 to-orange-950/85',
      iconSymbol: 'BIND // 02',
    },
  },
  {
    id: 'corrode',
    name: 'Corrode',
    location: 'Industrial Facility',
    imageUrl: corrodeImg,
    accentColor: '#00e676',
    secondaryColor: '#1b5e20',
    theme: {
      bgGradient: 'from-[#0d2818] via-[#163820] to-[#041308]',
      overlayGradient: 'from-emerald-600/30 to-green-950/85',
      iconSymbol: 'CORRODE // 03',
    },
  },
  {
    id: 'haven',
    name: 'Haven',
    location: 'Thimphu, Bhutan',
    imageUrl: havenImg,
    accentColor: '#ff5252',
    secondaryColor: '#b71c1c',
    theme: {
      bgGradient: 'from-[#311015] via-[#4d161d] to-[#1e070a]',
      overlayGradient: 'from-rose-600/30 to-red-950/85',
      iconSymbol: 'HAVEN // 04',
    },
  },
  {
    id: 'lotus',
    name: 'Lotus',
    location: 'Western Ghats, India',
    imageUrl: lotusImg,
    accentColor: '#26c6da',
    secondaryColor: '#00838f',
    theme: {
      bgGradient: 'from-[#0e272a] via-[#16393e] to-[#08181a]',
      overlayGradient: 'from-cyan-600/30 to-teal-950/85',
      iconSymbol: 'LOTUS // 05',
    },
  },
  {
    id: 'summit',
    name: 'Summit',
    location: 'Alpine Research Post',
    imageUrl: summitImg,
    accentColor: '#80d8ff',
    secondaryColor: '#0091ea',
    theme: {
      bgGradient: 'from-[#102231] via-[#1a384f] to-[#0b1722]',
      overlayGradient: 'from-sky-500/30 to-slate-900/85',
      iconSymbol: 'SUMMIT // 06',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    location: 'Los Angeles, California',
    imageUrl: sunsetImg,
    accentColor: '#e040fb',
    secondaryColor: '#aa00ff',
    theme: {
      bgGradient: 'from-[#33113b] via-[#4f185c] to-[#1f0724]',
      overlayGradient: 'from-fuchsia-600/30 to-purple-950/85',
      iconSymbol: 'SUNSET // 07',
    },
  },
];
