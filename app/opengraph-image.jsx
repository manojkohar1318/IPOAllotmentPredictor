import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'NEPSE IPO Allotment Predictor';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '64px', fontWeight: 'bold', color: 'white', margin: 0 }}>
              NEPSE IPO Allotment Predictor
            </h1>
            <p style={{ fontSize: '32px', color: '#94a3b8', marginTop: '10px' }}>
              Check Your IPO Chances Instantly
            </p>
            <p style={{ fontSize: '24px', color: '#22c55e', marginTop: '20px' }}>
              ipoallotmentpredictor.vercel.app
            </p>
          </div>
          <div style={{ display: 'flex' }}>
            <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
        
        <div
          style={{
            background: '#22c55e',
            height: '80px',
            width: '1200px',
            position: 'absolute',
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#0f172a',
          }}
        >
          Free Tool • Live Data • Nepal's #1 IPO Predictor
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
