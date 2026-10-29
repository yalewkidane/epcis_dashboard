import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import navigation from '../../routes/appRoutes';
import { layout } from '../../theme';

function Logo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#7c3aed 0%,#2563eb 60%,#16a34a 100%)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="6" r="2.2" />
          <circle cx="12" cy="18" r="2.2" />
          <path d="M8 7l3 9M16 7l-3 9M8 6h8" />
        </svg>
      </Box>
      <Box sx={{ lineHeight: 1.1 }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Traceability KG</Typography>
        <Typography sx={{ color: layout.sidebarText, fontSize: 11.5 }}>EPCIS 2.0 knowledge graph</Typography>
      </Box>
    </Box>
  );
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (path) => (path === '/' ? pathname === '/' : pathname === path || (path !== '/traceability' && path !== '/epcis' && pathname.startsWith(path + '/')));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: layout.sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: layout.sidebarWidth, boxSizing: 'border-box', border: 0, bgcolor: layout.sidebarBg, color: layout.sidebarText },
      }}
    >
      <Logo />
      {navigation.map((group) => (
        <List
          key={group.title}
          dense
          subheader={
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent', color: '#64748b', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '32px', px: 2.5 }}>
              {group.title}
            </ListSubheader>
          }
          sx={{ py: 0.5 }}
        >
          {group.items.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                end={item.path === '/'}
                sx={{
                  mx: 1.5,
                  my: 0.25,
                  borderRadius: 2,
                  color: active ? '#fff' : layout.sidebarText,
                  bgcolor: active ? layout.sidebarActive : 'transparent',
                  '&:hover': { bgcolor: layout.sidebarActive },
                  py: 0.9,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? '#60a5fa' : '#94a3b8' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }} />
              </ListItemButton>
            );
          })}
        </List>
      ))}
      <Box sx={{ mt: 'auto', px: 2.5, py: 2, color: '#64748b', fontSize: 11.5 }}>
        Auto-ID Labs, KAIST
        <br />
        EPCIS 2.0 meets knowledge graphs
      </Box>
    </Drawer>
  );
}
