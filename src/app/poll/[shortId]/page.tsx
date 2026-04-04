import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ogParams = new URLSearchParams();
  ogParams.set('q', poll.question);
  ogParams.set('v', String(poll.totalVotes));
  poll.results.slice(0, 4).forEach((r: { label: string }) => ogParams.append('o', r.label));
  const ogUrl = `${appUrl}/api/og?${ogParams.toString()}`;

  return {
    title: `${poll.question} — Raisy`,
    description: `Vote on: ${poll.question}. ${poll.totalVotes} vote${poll.totalVotes !== 1 ? 's' : ''} so far. Results update live.`,
    openGraph: {
      title: `${poll.question} — Raisy`,
      description: 'Cast your vote. Results update live.',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: poll.question }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${poll.question} — Raisy`,
      description: 'Cast your vote. Results update live.',
      images: [ogUrl],
    },
  };
}

export default async function PollPage({ params, searchParams }: Props) {
  const poll = await getPoll(params.shortId);
  if (!poll) notFound();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pollUrl = `${appUrl}/poll/${params.shortId}`;
  return (
    <>
      <Navbar />
      <PollPageAnimated
        poll={poll}
        pollUrl={pollUrl}
        justCreated={searchParams.created === '1'}
        shortId={params.shortId}
      />
    </>
  );
}
