import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { VotePanel } from '@/components/VotePanel';
import { CopyButton } from '@/components/CopyButton';
import { CreatorControls } from '@/components/CreatorControls';
import { ViewerCount } from '@/components/ViewerCount';
import { ExportPanel } from '@/components/ExportPanel';
import { PollPageAnimated } from '@/components/PollPageAnimated';

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
    openGraph: {
      title: `${poll.question} — Raisy`,
      description: `Cast your vote. Results update live.`,
    },
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
      <PollPageAnimated
        poll={poll}
        pollUrl={pollUrl}
        justCreated={justCreated}
        shortId={params.shortId}
      />
    </>
  );
}
