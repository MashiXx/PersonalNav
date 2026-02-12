const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const avatarDir = path.join(__dirname, 'src/public/images/avatars');
const iconDir = path.join(__dirname, 'src/public/images/icons');

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Generate 10 default avatar SVGs
const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

for (let i = 0; i < 10; i++) {
  const svg = `<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="64" fill="${avatarColors[i]}"/>
  <circle cx="64" cy="50" r="20" fill="white" opacity="0.9"/>
  <path d="M 30 90 Q 30 70 64 70 Q 98 70 98 90 L 98 128 L 30 128 Z" fill="white" opacity="0.9"/>
</svg>`;

  fs.writeFileSync(path.join(avatarDir, `default-${i + 1}.png.svg`), svg);
  console.log(`Created default-${i + 1}.png.svg`);
}

// Generate default icon SVGs
const icons = {
  'real_estate': {
    color: '#E74C3C',
    icon: '<path d="M64 20 L100 50 L100 110 L80 110 L80 80 L48 80 L48 110 L28 110 L28 50 Z" fill="white"/>'
  },
  'savings': {
    color: '#3498DB',
    icon: '<rect x="30" y="40" width="68" height="50" rx="5" fill="white"/><rect x="50" y="30" width="28" height="10" fill="white"/>'
  },
  'stocks': {
    color: '#2ECC71',
    icon: '<polyline points="20,90 35,70 50,75 70,45 90,55 108,30" stroke="white" stroke-width="4" fill="none"/>'
  },
  'crypto': {
    color: '#F39C12',
    icon: '<circle cx="64" cy="64" r="35" fill="none" stroke="white" stroke-width="5"/><text x="64" y="78" font-size="40" fill="white" text-anchor="middle" font-family="Arial">₿</text>'
  },
  'gold': {
    color: '#F1C40F',
    icon: '<polygon points="64,25 80,55 115,60 90,85 95,115 64,100 33,115 38,85 13,60 48,55" fill="white"/>'
  },
  'car': {
    color: '#95A5A6',
    icon: '<rect x="25" y="60" width="78" height="30" rx="5" fill="white"/><path d="M30 60 L40 40 L88 40 L98 60" fill="white"/><circle cx="40" cy="95" r="8" fill="white"/><circle cx="88" cy="95" r="8" fill="white"/>'
  },
  'jewelry': {
    color: '#E91E63',
    icon: '<polygon points="64,35 75,50 85,45 80,70 64,85 48,70 43,45 53,50" fill="white"/><circle cx="64" cy="60" r="8" fill="white"/>'
  },
  'art': {
    color: '#9B59B6',
    icon: '<rect x="25" y="25" width="78" height="78" rx="3" fill="none" stroke="white" stroke-width="4"/><circle cx="50" cy="50" r="10" fill="white"/><path d="M70 80 Q80 60 90 80" stroke="white" stroke-width="3" fill="none"/>'
  },
  'electronics': {
    color: '#34495E',
    icon: '<rect x="30" y="35" width="68" height="50" rx="3" fill="white"/><rect x="40" y="45" width="48" height="30" fill="'+ '#34495E' +'"/><circle cx="64" cy="95" r="3" fill="white"/>'
  },
  'other': {
    color: '#7F8C8D',
    icon: '<circle cx="64" cy="40" r="8" fill="white"/><circle cx="40" cy="64" r="8" fill="white"/><circle cx="88" cy="64" r="8" fill="white"/><circle cx="64" cy="88" r="8" fill="white"/>'
  }
};

Object.entries(icons).forEach(([name, data]) => {
  const svg = `<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="${data.color}" rx="20"/>
  ${data.icon}
</svg>`;

  fs.writeFileSync(path.join(iconDir, `${name}.png.svg`), svg);
  console.log(`Created ${name}.png.svg`);
});

console.log('\nDefault images created successfully!');
console.log('Note: These are SVG files with .png.svg extension for simplicity.');
console.log('In production, you may want to convert them to actual PNG files.');
