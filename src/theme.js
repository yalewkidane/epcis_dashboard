import { createTheme, alpha } from '@mui/material/styles';

/**
 * Colours of the knowledge-graph roles follow Fig. 3 of the paper:
 * products purple, aggregations green, transformed items orange, events blue.
 */
export const roleColors = {
  product: { main: '#7c3aed', light: '#ede9fe', dark: '#5b21b6', label: 'Product' },
  aggregation: { main: '#16a34a', light: '#dcfce7', dark: '#166534', label: 'Aggregation (case, pallet, container)' },
  transformed: { main: '#ea580c', light: '#ffedd5', dark: '#9a3412', label: 'Transformed product' },
  event: { main: '#0284c7', light: '#e0f2fe', dark: '#075985', label: 'EPCIS event' },
};

export const linkColors = {
  INVOLVED_IN: '#94a3b8',
  AGGREGATED_INTO: '#16a34a',
  TRANSFORMED_TO: '#ea580c',
  TRANSFORMED_FROM: '#f59e0b',
};

export const eventTypeColors = {
  ObjectEvent: '#0284c7',
  AggregationEvent: '#16a34a',
  TransformationEvent: '#ea580c',
  TransactionEvent: '#7c3aed',
  AssociationEvent: '#0d9488',
};

export const layout = {
  sidebarWidth: 264,
  topbarHeight: 64,
  sidebarBg: '#0b1220',
  sidebarText: '#cbd5e1',
  sidebarActive: '#1e293b',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb', dark: '#1d4ed8', light: '#60a5fa' },
    secondary: { main: '#7c3aed' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
    info: { main: '#0284c7' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    divider: '#e2e8f0',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    monospace: { fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #e2e8f0', borderRadius: 12 } },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 600, color: '#475569', backgroundColor: '#f8fafc' } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 12 } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none', borderBottom: '1px solid #e2e8f0' } } },
  },
});

export const softBg = (color) => alpha(color, 0.12);

export default theme;
