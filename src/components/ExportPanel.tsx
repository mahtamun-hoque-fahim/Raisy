'use client';

import { useState } from 'react';
import { Download, FileText, Code2, QrCode, X } from 'lucide-react';

interface ExportPanelProps {
  shortId: string;
  question: string;
  totalVotes: number;
}

export function ExportPanel({ shortId, question, totalVotes }: ExportPanelProps) {
  const [showQR, setShowQR] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = async (format: 'csv' | 'json') => {
    setDownloading(format);
    try {
      const res = await fetch(`/api/polls/${shortId}/export?format=${format}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raisy-${shortId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(null);
    }
  };

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    background: active ? 'rgba(255,212,71,0.1)' : '#111118',
    border: `1px solid ${active ? '#FFD447' : '#1E1E2E'}`,
    color: active ? '#FFD447' : '#E8E8F0',
    padding: '9px 16px', borderRadius: 6,
    fontFamily: 'DM Mono, monospace', fontSize: 12,
    cursor: 'pointer', transition: 'all 0.18s',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        background: '#111118', border: '1px solid #1E1E2E',
        borderRadius: 8, padding: '20px 22px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={14} style={{ color: '#6B6B8A' }} />
            <span style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: 13, color: '#E8E8F0',
            }}>
              Export results
            </span>
            <span style={{
              fontSize: 11, color: '#6B6B8A',
              fontFamily: 'DM Mono, monospace',
            }}>
              · {totalVotes} votes
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* CSV */}
          <button
            style={btnStyle(downloading === 'csv')}
            onClick={() => download('csv')}
            disabled={!!downloading}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FFD447';
              e.currentTarget.style.color = '#FFD447';
            }}
            onMouseLeave={(e) => {
              if (downloading !== 'csv') {
                e.currentTarget.style.borderColor = '#1E1E2E';
                e.currentTarget.style.color = '#E8E8F0';
              }
            }}
          >
            <FileText size={13} />
            {downloading === 'csv' ? 'Exporting...' : 'Download CSV'}
          </button>

          {/* JSON */}
          <button
            style={btnStyle(downloading === 'json')}
            onClick={() => download('json')}
            disabled={!!downloading}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6BFFE4';
              e.currentTarget.style.color = '#6BFFE4';
            }}
            onMouseLeave={(e) => {
              if (downloading !== 'json') {
                e.currentTarget.style.borderColor = '#1E1E2E';
                e.currentTarget.style.color = '#E8E8F0';
              }
            }}
          >
            <Code2 size={13} />
            {downloading === 'json' ? 'Exporting...' : 'Download JSON'}
          </button>

          {/* QR Code */}
          <button
            style={btnStyle(showQR)}
            onClick={() => setShowQR((v) => !v)}
            onMouseEnter={(e) => {
              if (!showQR) {
                e.currentTarget.style.borderColor = '#C56CF0';
                e.currentTarget.style.color = '#C56CF0';
              }
            }}
            onMouseLeave={(e) => {
              if (!showQR) {
                e.currentTarget.style.borderColor = '#1E1E2E';
                e.currentTarget.style.color = '#E8E8F0';
              }
            }}
          >
            <QrCode size={13} />
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>
        </div>

        {/* QR panel */}
        {showQR && (
          <div style={{
            marginTop: 20, paddingTop: 20,
            borderTop: '1px solid #1E1E2E',
            display: 'flex', gap: 24, alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
            {/* QR image */}
            <div style={{
              background: '#111118', border: '1px solid #1E1E2E',
              borderRadius: 8, padding: 12, flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/polls/${shortId}/qr`}
                alt="Poll QR code"
                width={160}
                height={160}
                style={{ display: 'block', borderRadius: 4 }}
              />
            </div>

            {/* Instructions */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 14, color: '#E8E8F0', marginBottom: 8,
              }}>
                Scan to vote
              </div>
              <p style={{
                fontSize: 12, color: '#6B6B8A',
                fontFamily: 'DM Mono, monospace', lineHeight: 1.7, margin: 0,
              }}>
                Anyone who scans this QR code will land directly on your poll.
                Perfect for meetings, presentations, or printed materials.
              </p>

              {/* Download QR */}
              <a
                href={`/api/polls/${shortId}/qr`}
                download={`raisy-qr-${shortId}.svg`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  marginTop: 14, fontSize: 12,
                  color: '#C56CF0', fontFamily: 'DM Mono, monospace',
                  textDecoration: 'none',
                }}
              >
                <Download size={12} /> Download SVG
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
