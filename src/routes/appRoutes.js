import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SensorsIcon from '@mui/icons-material/Sensors';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

import HomePage from '../pages/home/HomePage';
import ExplorerPage from '../pages/traceability/ExplorerPage';
import ScenarioRunnerPage from '../pages/traceability/ScenarioRunnerPage';
import LiveFeedPage from '../pages/traceability/LiveFeedPage';
import RepositoryOverviewPage from '../pages/epcis/RepositoryOverviewPage';
import EventsPage from '../pages/epcis/EventsPage';
import VocabulariesPage from '../pages/epcis/VocabulariesPage';
import CapturePage from '../pages/console/CapturePage';
import QueryPage from '../pages/console/QueryPage';
import SubscriptionsPage from '../pages/console/SubscriptionsPage';
import SettingsPage from '../pages/system/SettingsPage';
import DocumentationPage from '../pages/system/DocumentationPage';
import InstallationPage from '../pages/system/InstallationPage';
import ChangelogPage from '../pages/system/ChangelogPage';

/** Navigation groups rendered by the sidebar; `path` doubles as the route. */
const navigation = [
  {
    title: 'Overview',
    items: [{ path: '/', label: 'Home', icon: <HomeOutlinedIcon />, element: <HomePage /> }],
  },
  {
    title: 'Traceability graph',
    items: [
      { path: '/traceability', label: 'Explorer', icon: <HubOutlinedIcon />, element: <ExplorerPage /> },
      { path: '/traceability/scenarios', label: 'Scenario runner', icon: <PlayCircleOutlineIcon />, element: <ScenarioRunnerPage /> },
      { path: '/traceability/live', label: 'Live feed', icon: <SensorsIcon />, element: <LiveFeedPage /> },
    ],
  },
  {
    title: 'EPCIS repository',
    items: [
      { path: '/epcis', label: 'Overview', icon: <DashboardOutlinedIcon />, element: <RepositoryOverviewPage /> },
      { path: '/epcis/events', label: 'Events', icon: <EventNoteOutlinedIcon />, element: <EventsPage /> },
      { path: '/epcis/vocabularies', label: 'Vocabularies', icon: <MenuBookOutlinedIcon />, element: <VocabulariesPage /> },
    ],
  },
  {
    title: 'API console',
    items: [
      { path: '/console/capture', label: 'Capture', icon: <UploadFileOutlinedIcon />, element: <CapturePage /> },
      { path: '/console/query', label: 'Query', icon: <ManageSearchOutlinedIcon />, element: <QueryPage /> },
      { path: '/console/subscriptions', label: 'Subscriptions', icon: <NotificationsActiveOutlinedIcon />, element: <SubscriptionsPage /> },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/settings', label: 'Settings', icon: <SettingsOutlinedIcon />, element: <SettingsPage /> },
      { path: '/docs', label: 'Documentation', icon: <ArticleOutlinedIcon />, element: <DocumentationPage /> },
      { path: '/install', label: 'Installation', icon: <DownloadOutlinedIcon />, element: <InstallationPage /> },
      { path: '/changelog', label: 'Changelog', icon: <HistoryOutlinedIcon />, element: <ChangelogPage /> },
    ],
  },
];

export const allRoutes = navigation.flatMap((g) => g.items);

export default navigation;
