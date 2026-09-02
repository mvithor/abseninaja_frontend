import { useRef } from 'react';
import { Box } from '@mui/material';
import { T, RADIUS } from './sgaConfig';

// PRD §5.4 — filter kelas. role=tablist + navigasi panah kiri/kanan.
const ClassTabs = ({ items, activeId, onChange, loading }) => {
  const refs = useRef([]);

  const focusTab = (idx) => {
    const clamped = (idx + items.length) % items.length;
    refs.current[clamped]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusTab(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusTab(idx - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(items[idx].id); }
  };

  return (
    <Box
      role="tablist"
      aria-label="Filter kelas"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        p: 1, borderRadius: RADIUS.card,
        backgroundColor: T.surface, border: `1px solid ${T.border}`,
        maxWidth: '100%', overflowX: 'auto',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {items.map((item, idx) => {
        const active = item.id === activeId;
        // Tab aktif tidak di-disable saat loading; tab lain "antre" (aria-disabled).
        const isBlocked = loading && !active;
        return (
          <Box
            key={item.id}
            ref={(el) => { refs.current[idx] = el; }}
            role="tab"
            tabIndex={active ? 0 : -1}
            aria-selected={active}
            aria-disabled={isBlocked || undefined}
            onClick={() => { if (!isBlocked) onChange(item.id); }}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            sx={{
              px: 3, py: 1.5, borderRadius: RADIUS.tab,
              fontSize: '0.9375rem', lineHeight: 1.3,
              fontWeight: active ? 600 : 500, whiteSpace: 'nowrap',
              cursor: isBlocked ? 'default' : 'pointer', userSelect: 'none',
              backgroundColor: active ? T.primary : 'transparent',
              color: active ? '#fff' : T.textMuted,
              transition: 'background-color 150ms ease, color 150ms ease',
              '&:hover': active
                ? {}
                : { backgroundColor: isBlocked ? 'transparent' : '#F8F9FB', color: isBlocked ? T.textMuted : T.textSecondary },
              '&:focus-visible': { outline: `2px solid ${T.primary}`, outlineOffset: '2px' },
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
};

export default ClassTabs;
