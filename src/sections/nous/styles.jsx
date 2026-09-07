import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { NOUS_FONT, NOUS_COLORS } from 'src/theme/palette';

/**
 * The student site. It keeps the original NOUS structure and palette
 * (dark header, white cards on #f5f7fb, blue accents) with a lighter coat of
 * polish: a gradient hero, softer shadows, accent-tinted icons and hover states.
 */

const MOBILE = '@media (max-width: 700px)';

const SHADOW_SOFT = '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)';
const SHADOW_LIFT = '0 12px 32px rgba(16, 24, 40, 0.10)';

// ----------------------------------------------------------------------
// Shell
// ----------------------------------------------------------------------

export const AppRoot = styled('div')({
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: NOUS_COLORS.background,
  color: NOUS_COLORS.text,
  // the dashboard theme sets Public Sans + MUI typography metrics on <body>;
  // the student site keeps its own Arial baseline
  fontFamily: NOUS_FONT,
  fontSize: 16,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  '& *': { fontFamily: NOUS_FONT },
});

export const AppHeader = styled('header')({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: `linear-gradient(90deg, ${NOUS_COLORS.dark} 0%, #1b2537 100%)`,
  color: '#ffffff',
  padding: '16px 7%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  boxShadow: '0 1px 0 rgba(255, 255, 255, 0.06)',
  [MOBILE]: { padding: '14px 5%' },
});

export const Logo = styled(RouterLink)({
  fontSize: 24,
  fontWeight: 'bold',
  color: 'inherit',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
  '& span': { color: NOUS_COLORS.accentLight },
});

export const AppMain = styled('main')({
  width: '86%',
  maxWidth: 1200,
  margin: '0 auto',
  padding: '44px 0 64px',
  flex: '1 1 auto',
  [MOBILE]: { width: '90%', padding: '28px 0 40px' },
});

export const AppFooter = styled('footer')({
  textAlign: 'center',
  padding: 30,
  color: NOUS_COLORS.textMuted,
  fontSize: 14,
  borderTop: `1px solid ${NOUS_COLORS.border}`,
});

// ----------------------------------------------------------------------
// Hero + page title
// ----------------------------------------------------------------------

export const Hero = styled('div')({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 18,
  padding: '38px 40px',
  marginBottom: 36,
  color: '#ffffff',
  background: `linear-gradient(135deg, ${NOUS_COLORS.dark} 0%, #1e3a8a 60%, ${NOUS_COLORS.accent} 100%)`,
  boxShadow: SHADOW_LIFT,
  [MOBILE]: { padding: '26px 22px', borderRadius: 14 },
  '& h1': {
    fontSize: 34,
    fontWeight: 'bold',
    margin: '0 0 10px',
    letterSpacing: '-0.02em',
    [MOBILE]: { fontSize: 25 },
  },
  '& p': { margin: 0, color: 'rgba(255, 255, 255, 0.82)', fontSize: 15, maxWidth: 560 },
  // decorative rings, echoing the sign-in artwork
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.16)',
  },
  '&::before': { width: 320, height: 320, top: -140, right: -60 },
  '&::after': { width: 460, height: 460, bottom: -300, right: 80 },
});

export const HeroStats = styled('div')({
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 22,
  '& span': {
    fontSize: 13,
    padding: '7px 13px',
    borderRadius: 999,
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.14)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
  },
});

export const PageTitleRoot = styled('div')({
  marginBottom: 28,
  '& h1': {
    fontSize: 30,
    fontWeight: 'bold',
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
    [MOBILE]: { fontSize: 24 },
  },
  '& p': { color: NOUS_COLORS.textMuted, margin: 0, fontSize: 15 },
});

// ----------------------------------------------------------------------
// Breadcrumbs
// ----------------------------------------------------------------------

export const Crumbs = styled('nav')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  marginBottom: 18,
  fontSize: 13,
  color: NOUS_COLORS.textMuted,
  '& a': {
    color: NOUS_COLORS.textMuted,
    textDecoration: 'none',
    '&:hover': { color: NOUS_COLORS.accent },
  },
  '& .sep': { color: '#cbd5e1' },
  '& .current': { color: NOUS_COLORS.text, fontWeight: 'bold' },
});

// ----------------------------------------------------------------------
// Cards
// ----------------------------------------------------------------------

export const CardsGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 20,
});

const cardBase = {
  position: 'relative',
  display: 'block',
  overflow: 'hidden',
  background: NOUS_COLORS.paper,
  padding: 26,
  borderRadius: 16,
  border: `1px solid ${NOUS_COLORS.border}`,
  boxShadow: SHADOW_SOFT,
  cursor: 'pointer',
  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
  color: 'inherit',
  textDecoration: 'none',
  '& h2': { fontSize: 19, fontWeight: 'bold', margin: '0 0 6px' },
  '& p': { color: NOUS_COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.5 },
};

/** Clickable card (program / level / subject). */
export const NavCard = styled(RouterLink, {
  shouldForwardProp: (prop) => prop !== 'accent',
})(({ accent }) => ({
  ...cardBase,
  // a thin accent rail that fills in on hover
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: accent?.strong ?? NOUS_COLORS.accent,
    opacity: 0,
    transition: 'opacity .2s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: SHADOW_LIFT,
    borderColor: accent?.mid ?? NOUS_COLORS.borderHover,
  },
  '&:hover::before': { opacity: 1 },
}));

/** Same card, non interactive - used for the resource content panel. */
export const StaticCard = styled('div')({
  ...cardBase,
  cursor: 'default',
  padding: 30,
  '& h2': { fontSize: 20 },
});

export const CardIcon = styled('div', {
  shouldForwardProp: (prop) => prop !== 'accent',
})(({ accent }) => ({
  width: 52,
  height: 52,
  borderRadius: 14,
  background: `linear-gradient(135deg, ${accent?.soft ?? NOUS_COLORS.accentSoft} 0%, ${accent?.mid ?? '#dbeafe'} 100%)`,
  color: accent?.strong ?? NOUS_COLORS.accent,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  marginBottom: 18,
}));

export const CardMeta = styled('div')({
  marginTop: 16,
  paddingTop: 14,
  borderTop: `1px dashed ${NOUS_COLORS.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: 13,
  color: NOUS_COLORS.textMuted,
  '& .go': { color: NOUS_COLORS.accent, fontWeight: 'bold' },
});

// ----------------------------------------------------------------------
// Back button
// ----------------------------------------------------------------------

export const BackButtonRoot = styled('button')({
  fontFamily: NOUS_FONT,
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: NOUS_COLORS.paper,
  color: NOUS_COLORS.text,
  border: `1px solid ${NOUS_COLORS.border}`,
  padding: '9px 16px',
  borderRadius: 999,
  cursor: 'pointer',
  marginBottom: 22,
  boxShadow: SHADOW_SOFT,
  transition: 'background .2s ease, border-color .2s ease',
  '&:hover': { background: NOUS_COLORS.rowHover, borderColor: NOUS_COLORS.borderHover },
});

// ----------------------------------------------------------------------
// Chapters
// ----------------------------------------------------------------------

export const ChapterCardRoot = styled(RouterLink)({
  background: NOUS_COLORS.paper,
  border: `1px solid ${NOUS_COLORS.border}`,
  borderRadius: 14,
  padding: '16px 20px',
  marginBottom: 10,
  display: 'flex',
  gap: 16,
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  color: 'inherit',
  textDecoration: 'none',
  boxShadow: SHADOW_SOFT,
  transition: 'transform .18s ease, border-color .18s ease, background .18s ease',
  '&:hover': {
    borderColor: NOUS_COLORS.accentLight,
    background: NOUS_COLORS.rowHover,
    transform: 'translateX(3px)',
  },
  '& .chapter-badge': {
    flexShrink: 0,
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 15,
    color: NOUS_COLORS.accent,
    background: NOUS_COLORS.accentSoft,
  },
  '& .chapter-number': { color: NOUS_COLORS.accent, fontWeight: 'bold', fontSize: 13 },
  '& strong': { fontWeight: 'bold', display: 'block', marginTop: 2 },
  '& .chapter-go': { color: NOUS_COLORS.textMuted, fontSize: 18 },
});

// ----------------------------------------------------------------------
// Resources
// ----------------------------------------------------------------------

export const ResourcesGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 20,
  [MOBILE]: { gridTemplateColumns: '1fr' },
});

export const ResourceCardRoot = styled(RouterLink, {
  shouldForwardProp: (prop) => prop !== 'accent',
})(({ accent }) => ({
  display: 'block',
  padding: '32px 20px',
  background: NOUS_COLORS.paper,
  border: `1px solid ${NOUS_COLORS.border}`,
  borderRadius: 16,
  textAlign: 'center',
  cursor: 'pointer',
  boxShadow: SHADOW_SOFT,
  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: SHADOW_LIFT,
    borderColor: accent?.mid ?? NOUS_COLORS.borderHover,
  },
  '& .resource-icon': {
    width: 58,
    height: 58,
    margin: '0 auto 14px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 27,
    background: `linear-gradient(135deg, ${accent?.soft ?? NOUS_COLORS.accentSoft} 0%, ${accent?.mid ?? '#dbeafe'} 100%)`,
  },
  '& h3': { fontSize: 17, fontWeight: 'bold', margin: '0 0 6px' },
  '& p': { fontSize: 13, color: NOUS_COLORS.textMuted, margin: 0 },
  '& .resource-count': {
    display: 'inline-block',
    marginTop: 12,
    fontSize: 12,
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: 999,
    color: accent?.strong ?? NOUS_COLORS.accent,
    background: accent?.soft ?? NOUS_COLORS.accentSoft,
  },
}));

// ----------------------------------------------------------------------
// Header account area
// ----------------------------------------------------------------------

export const HeaderActions = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  fontSize: 14,
});

export const HeaderNote = styled('span')({
  fontSize: 13,
  padding: '5px 11px',
  borderRadius: 999,
  color: 'rgba(255, 255, 255, 0.9)',
  background: 'rgba(255, 255, 255, 0.10)',
  border: '1px solid rgba(255, 255, 255, 0.16)',
  [MOBILE]: { display: 'none' },
});

export const HeaderLink = styled(RouterLink)({
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: 14,
  '&:hover': { color: NOUS_COLORS.accentLight },
});

export const HeaderButton = styled('button')({
  fontFamily: NOUS_FONT,
  fontSize: 14,
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  color: '#ffffff',
  padding: '6px 14px',
  borderRadius: 999,
  cursor: 'pointer',
  transition: 'background .2s ease',
  '&:hover': { background: 'rgba(255, 255, 255, 0.14)' },
});

export const Avatar = styled('span')({
  width: 34,
  height: 34,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: 14,
  color: '#ffffff',
  overflow: 'hidden',
  flexShrink: 0,
  background: `linear-gradient(135deg, ${NOUS_COLORS.accent} 0%, ${NOUS_COLORS.accentLight} 100%)`,
  // a profile picture fills the circle; without one the initial shows through
  '& img': { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
});

export const HeaderText = styled('span')({
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.85)',
  [MOBILE]: { display: 'none' },
});

// ----------------------------------------------------------------------
// Documents (past papers / syllabus / notes)
// ----------------------------------------------------------------------

export const DocList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const DocItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '16px 18px',
  background: NOUS_COLORS.paper,
  border: `1px solid ${NOUS_COLORS.border}`,
  borderRadius: 14,
  boxShadow: SHADOW_SOFT,
  transition: 'border-color .2s ease, transform .18s ease',
  '&:hover': { borderColor: NOUS_COLORS.borderHover, transform: 'translateY(-2px)' },
  '& .doc-icon': {
    flexShrink: 0,
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    background: NOUS_COLORS.accentSoft,
  },
  '& .doc-body': { flexGrow: 1, minWidth: 0 },
  '& .doc-name': {
    fontWeight: 'bold',
    fontSize: 15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .doc-meta': { color: NOUS_COLORS.textMuted, fontSize: 13, marginTop: 3 },
  '& .doc-actions': { flexShrink: 0, display: 'flex', gap: 8 },
});

export const DocButton = styled('button')(({ variant }) => ({
  fontFamily: NOUS_FONT,
  fontSize: 13,
  fontWeight: 'bold',
  padding: '8px 14px',
  borderRadius: 999,
  cursor: 'pointer',
  transition: 'background .2s ease, border-color .2s ease, opacity .2s ease',
  ...(variant === 'primary'
    ? {
        border: '1px solid transparent',
        background: NOUS_COLORS.accent,
        color: '#ffffff',
        '&:hover': { background: '#1d4ed8' },
      }
    : {
        border: `1px solid ${NOUS_COLORS.border}`,
        background: NOUS_COLORS.paper,
        color: NOUS_COLORS.text,
        '&:hover': { background: NOUS_COLORS.rowHover, borderColor: NOUS_COLORS.borderHover },
      }),
  '&:disabled': { opacity: 0.55, cursor: 'not-allowed' },
}));

export const EmptyState = styled('div')({
  padding: '46px 26px',
  textAlign: 'center',
  background: NOUS_COLORS.paper,
  border: `1px dashed ${NOUS_COLORS.border}`,
  borderRadius: 16,
  color: NOUS_COLORS.textMuted,
  fontSize: 14,
  '& strong': { display: 'block', color: NOUS_COLORS.text, fontSize: 16, marginBottom: 6 },
});

// ----------------------------------------------------------------------
// Notes upload (the only thing a student may add)
// ----------------------------------------------------------------------

export const UploadCard = styled('form')({
  background: NOUS_COLORS.paper,
  border: `1px solid ${NOUS_COLORS.border}`,
  borderRadius: 16,
  padding: 24,
  marginBottom: 24,
  boxShadow: SHADOW_SOFT,
  '& h3': { fontSize: 17, fontWeight: 'bold', margin: '0 0 4px' },
  '& .upload-hint': { color: NOUS_COLORS.textMuted, fontSize: 13, margin: '0 0 18px' },
  '& .upload-row': { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  '& .upload-error': { color: NOUS_COLORS.danger, fontSize: 13, marginTop: 12 },
});

export const UploadInput = styled('input')({
  fontFamily: NOUS_FONT,
  fontSize: 14,
  flex: '1 1 240px',
  minWidth: 0,
  padding: '10px 14px',
  borderRadius: 10,
  border: `1px solid ${NOUS_COLORS.border}`,
  background: NOUS_COLORS.background,
  color: NOUS_COLORS.text,
  '&:focus': { outline: 'none', borderColor: NOUS_COLORS.accentLight },
});

export const FilePicker = styled('label')({
  fontFamily: NOUS_FONT,
  fontSize: 13,
  fontWeight: 'bold',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  borderRadius: 10,
  cursor: 'pointer',
  border: `1px dashed ${NOUS_COLORS.borderHover}`,
  background: NOUS_COLORS.accentSoft,
  color: NOUS_COLORS.accent,
  '& input': { display: 'none' },
  '& .file-name': { fontWeight: 'normal', color: NOUS_COLORS.textMuted },
});

export const ListHeading = styled('h2')({
  fontSize: 19,
  fontWeight: 'bold',
  margin: '34px 0 14px',
  letterSpacing: '-0.01em',
  '& span': { color: NOUS_COLORS.textMuted, fontWeight: 'normal', fontSize: 14, marginLeft: 10 },
});
