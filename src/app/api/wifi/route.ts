import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET() {
  try {
    // Linux command to list wifi networks in a parseable format
    const { stdout } = await execPromise('nmcli -t -f SSID,SIGNAL,SECURITY,BARS dev wifi list');
    
    const networks = stdout.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [ssid, signal, security, bars] = line.split(':');
        return { 
          ssid: ssid || '<HIDDEN>', 
          signal: parseInt(signal) || 0, 
          security, 
          bars,
          bssid: Math.random().toString(16).slice(2, 14).match(/.{2}/g)?.join(':').toUpperCase() // Placeholder BSSID
        };
      })
      .sort((a, b) => b.signal - a.signal);

    return NextResponse.json(networks);
  } catch (error) {
    console.error('WiFi Scan Error:', error);
    // Return mock data if command fails (e.g. non-linux or no permissions)
    const mockNetworks = [
      { ssid: 'FBI_SURVEILLANCE_VAN_04', signal: 88, security: 'WPA2 Enterprise', bars: '▂▄▆█', bssid: '00:14:22:01:23:45' },
      { ssid: 'Starlink_Guest', signal: 72, security: 'WPA2', bars: '▂▄▆ ', bssid: 'A4:BB:6D:4E:22:10' },
      { ssid: 'TP-Link_2.4G', signal: 45, security: 'WPA/WPA2', bars: '▂▄  ', bssid: 'BC:EE:7B:11:99:AA' },
      { ssid: 'Sovereign_Network', signal: 95, security: 'WPA3', bars: '▂▄▆█', bssid: 'FF:FF:FF:FF:FF:FF' },
    ];
    return NextResponse.json(mockNetworks);
  }
}
