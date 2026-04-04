import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { VotePanel } from '@/components/VotePanel';
import { CopyButton } from '@/components/CopyButton';
import { CreatorControls } from '@/components/CreatorControls';
import { ViewerCount } from '@/components/ViewerCount';
import { ExportPanel } from '@/components/ExportPanel';

interface Props {
  params: { shortId: string };
  searchParams: { created?: string };
}

async function getPoll(shortId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/polls/${shortId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props) {
  const poll = await getPoll(params.shortId);
  if (!poll) return { title: 'Poll not found — Raisy' };
  return {
    title: `${poll.question} — Raisy`,
    description: `Vote on: ${poll.question}. ${poll.totalVotes} votes so far.`,
  };
}

export default async function PollPage({ params, searchParams }: Props) {
  const poll = await getPoll(params.shortId);
  if (!poll) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pollUrl = `${appUrl}/poll/${params.shortId}`;
  const justCreated = searchParams.created === '1';

  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1, padding: '120px 24px 100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Just-created banner */}
          {justCreated && (
            <div style={{
              background: 'rgba(107,255,228,0.07)',
              border: '1px solid rgba(107,255,228,0.22)',
              borderRadius: 8, padding: '16px 20px', marginBottom: 32,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  color: '#6BFFE4', fontSize: 14, marginBottom: 4,
                }}>
                  ✓ Poll created — share the link to collect votes
                </div>
                <div style={{
                  fontSize: 12, color: '#6B6B8A',
                  fontFamily: 'DM Mono, monospace', wordBreak: 'break-all',
                }}>
                  {pollUrl}
                </div>
              </div>
              <CopyButton text={pollUrl} label="Copy link" />
            </div>
          )}

          {/* Main vote / results panel */}
          <VotePanel poll={poll} />

          {/* Divider */}
          <div style={{ height: 1, background: '#1E1E2E', margin: '36px 0' }} />

          {/* Share row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#6B6B8A', fontFamily: 'DM Mono, monospace' }}>
                Share poll
              </span>
              <ViewerCount shortId={params.shortId} closed={poll.closed} />
            </div>
            <CopyButton text={pollUrl} label="Copy link" />
          </div>

          {/* Export panel — always visible */}
          <ExportPanel
            shortId={params.shortId}
            question={poll.question}
            totalVotes={poll.totalVotes}
          />

          {/* Creator controls */}
          <CreatorControls shortId={params.shortId} pollId={poll.id} closed={poll.closed} />

        </div>
      </main>
    </>
  );
}
