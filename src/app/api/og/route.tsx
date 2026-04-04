import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const question = searchParams.get('q') ?? 'Raise your hand.';
  const votes = searchParams.get('v') ?? '0';
  const opts = searchParams.getAll('o').slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0A0A0F',
          padding: '60px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,212,71,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,71,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 22, fontWeight: 800, color: '#FFD447',
          marginBottom: 'auto',
        }}>
          <span>✋</span>
          <span>Raisy</span>
          <span style={{
            fontSize: 11, color: '#6B6B8A', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginLeft: 8, fontWeight: 400,
          }}>
            · Real-time poll
          </span>
        </div>

        {/* Question */}
        <div style={{
          fontSize: question.length > 80 ? 36 : question.length > 50 ? 44 : 52,
          fontWeight: 800,
          color: '#E8E8F0',
          lineHeight: 1.1,
          letterSpacing: '-2px',
          marginBottom: 36,
          maxWidth: 860,
        }}>
          {question}
        </div>

        {/* Options preview */}
        {opts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {opts.map((opt, i) => {
              const colors = ['#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0'];
              const c = colors[i % colors.length];
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  fontSize: 16, color: '#E8E8F0',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: c, flexShrink: 0,
                  }} />
                  {opt}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6B6B8A' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#6BFFE4',
            }} />
            {votes} votes · results update live
          </div>
          <div style={{
            fontSize: 13, color: '#FFD447', fontWeight: 700,
            letterSpacing: '0.05em',
          }}>
            raisy.app →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
