// Create simple colored placeholder PNGs using Canvas API (Node.js)
const fs = require('fs');
const { createCanvas } = require('canvas');

const places = [
  { id: 'paris-fr', city: 'Paris', country: 'France', color: '#2563eb', photos: 3 },
  { id: 'tokyo-jp', city: 'Tokyo', country: 'Japan', color: '#dc2626', photos: 3 },
  { id: 'new-york-us', city: 'New York', country: 'United States', color: '#1d4ed8', photos: 3 },
  { id: 'sydney-au', city: 'Sydney', country: 'Australia', color: '#059669', photos: 3 },
  { id: 'cape-town-za', city: 'Cape Town', country: 'South Africa', color: '#ea580c', photos: 3 },
  { id: 'rio-br', city: 'Rio de Janeiro', country: 'Brazil', color: '#7c2d12', photos: 3 },
  { id: 'dubai-ae', city: 'Dubai', country: 'United Arab Emirates', color: '#92400e', photos: 3 },
  { id: 'vancouver-ca', city: 'Vancouver', country: 'Canada', color: '#0f766e', photos: 3 },
];

for (const place of places) {
  const dir = `src/assets/photos/${place.id}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  for (let i = 1; i <= place.photos; i++) {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, place.color);
    gradient.addColorStop(1, adjustColor(place.color, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Subtle pattern
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < 800; x += 40) {
      for (let y = 0; y < 600; y += 40) {
        ctx.fillRect(x, y, 20, 20);
      }
    }
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${place.city}, ${place.country}`, 400, 260);
    
    ctx.font = '300 24px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(`Photo ${i} of ${place.photos}`, 400, 320);
    
    // Decorative line
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 360);
    ctx.lineTo(500, 360);
    ctx.stroke();
    
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
    fs.writeFileSync(`${dir}/${i}.jpg`, buffer);
    console.log(`Created ${dir}/${i}.jpg`);
  }
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
