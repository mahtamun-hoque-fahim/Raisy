'use client';

import { motion } from 'framer-motion';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
};

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #1E1E2E 25%, #2A2A3E 50%, #1E1E2E 75%)',
  backgroundSize: '200% 100%',
  borderRadius: 6,
};

function Bone({ w = '100%', h = 16, radius = 6, mb = 0 }: {
  w?: string | number; h?: number; radius?: number; mb?: number;
}) {
  return (
    <motion.div
      variants={shimmer}
      animate="animate"
      style={{ ...shimmerStyle, width: w, height: h, borderRadius: radius, marginBottom: mb }}
    />
  );
}

export function PollPageSkeleton() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Live badge */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <Bone w={60} h={22} radius={3} />
        <Bone w={80} h={22} radius={3} />
      </div>

      {/* Question */}
      <Bone h={40} mb={8} />
      <Bone w="70%" h={40} mb={36} />

      {/* Options */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <Bone h={56} radius={8} />
        </div>
      ))}

      {/* Button */}
      <div style={{ marginTop: 24 }}>
        <Bone h={52} radius={6} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#1E1E2E', margin: '40px 0 20px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Bone w={100} h={20} />
        <Bone w={120} h={36} radius={6} />
      </div>
    </div>
  );
}

export function CreateFormSkeleton() {
  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <Bone h={100} mb={32} />
      {[1, 2].map((i) => (
        <Bone key={i} h={50} mb={10} />
      ))}
      <Bone h={42} mb={32} w="60%" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <Bone h={80} />
        <Bone h={80} />
      </div>
      <Bone h={120} mb={40} />
      <Bone h={56} radius={6} />
    </div>
  );
}

export function ResultBarSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Bone w="45%" h={14} />
            <Bone w={36} h={14} />
          </div>
          <Bone h={5} radius={3} />
          <div style={{ marginTop: 4 }}>
            <Bone w={60} h={11} />
          </div>
        </div>
      ))}
    </div>
  );
}
