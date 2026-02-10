import { Desktop } from '@/components/desktop/Desktop';

export default function Home() {
  return (
    <main className="relative w-screen h-screen bg-background overflow-hidden">
      {/* CRT Scanline Effect Overlay */}
      <div className="scanlines" />
      
      {/* Simulation Desktop */}
      <Desktop />
      
      {/* Ambient Noise / Interference (Optional UI Layer) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://media.giphy.com/media/oEI9uWUicG5R6/giphy.gif')] bg-cover" />
    </main>
  );
}