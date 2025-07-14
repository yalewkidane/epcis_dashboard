import APIPageLayout from "../pages/api/APIPageLayout";
import HomePage from "../pages/home/HomePage";
//import { RouteType } from "./config";
import DefaultPage from "../pages/api/DefaultPage";
import QueryPage from "../pages/api/QueryPage";
import ChangelogPage from "../pages/changelog/ChangelogPage";
import SettingPage from "../pages/setting/SettingPage";
//import CapturePage from "../pages/api/capturePage";
import CapturePageLayout from "../pages/api/capture/CapturePageLayout";
import CaptureJsonPage from "../pages/api/capture/captureJson";
import CaptureManualPage from "../pages/api/capture/captureManual";
import SubscriptionPage from "../pages/api/SubscriptionPage";
import HomeIcon from '@mui/icons-material/Home';
import DashboardPageLayout from "../pages/dashboard/DashboardPageLayout";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
//import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import GeneralPage from "../pages/dashboard/GeneralPage";
import EventPage from "../pages/dashboard/EventPage";
import VocabularyPage from "../pages/dashboard/VocabularyPage";
import InstallationPage from "../pages/installation/InstallationPage";
import DocumentationPage from "../pages/documentation/DocumentationPage";
import TraceabilityPage from "../pages/traceability/TraceabilityPage";
import TimelineIcon from '@mui/icons-material/Timeline';
import ApiIcon from '@mui/icons-material/Api';
import TimeLineComponent from "../pages/traceability/TimeLineComponent";
import GraphComponent from "../pages/traceability/GraphComponent";
import TraceabilityPageLayout from "../pages/traceability/TraceabilityPageLayout";

const appRoutes = [
  {
    path: "/home",
    element: <HomePage />,
    state: "home",
    sidebarProps: {
      displayText: "Home",
      icon: <HomeIcon />
    }
  },
  
  {
    path: "/api",
    element: <APIPageLayout />,
    state: "api",
    sidebarProps: {
      displayText: "API",
      icon: <ApiIcon />
    },
    child: [
      {
        index: true,
        element: <DefaultPage />,
        state: "dashboard.index"
      },
      {
        path: "/api/capture",
        element: <CapturePageLayout />,
        state: "dashboard.capture",
        sidebarProps: {
          displayText: "Capture"
        },
        child: [
          {
            path: "/api/capture/captureJson",
            element: <CaptureJsonPage />,
            state: "dashboard.general",
            sidebarProps: {
              displayText: "Capture JSON"
            },
          },
          {
            path: "/api/capture/captureManual",
            element: <CaptureManualPage />,
            state: "dashboard.general",
            sidebarProps: {
              displayText: "Capture Manual"
            },
          }
        
        ]
      },
      {
        path: "/api/query",
        element: <QueryPage />,
        state: "dashboard.query",
        sidebarProps: {
          displayText: "Query"
        }
      },
      {
        path: "/api/saas",
        element: <SubscriptionPage />,
        state: "dashboard.subscription",
        sidebarProps: {
          displayText: "Subscription"
        }
      }
    ]
  },
  
  {
    path: "/dashboard",
    element: <DashboardPageLayout />,
    state: "dashboard",
    sidebarProps: {
      displayText: "Dashboard",
      icon: <DashboardOutlinedIcon />
    },
    child: [
      {
        path: "/dashboard/general",
        element: <GeneralPage />,
        state: "dashboard.general",
        sidebarProps: {
          displayText: "General"
        },
      },
      {
        path: "/dashboard/event",
        element: <EventPage />,
        state: "dashboard.event",
        sidebarProps: {
          displayText: "Event"
        }
      },
      {
        path: "/dashboard/vocabulary",
        element: <VocabularyPage />,
        state: "dashboard.vocabulary",
        sidebarProps: {
          displayText: "Vocabulary"
        }
      }
    ]
  },

  {
    path: "/traceability",
    element: <TraceabilityPageLayout />,
    state: "traceability",
    sidebarProps: {
      displayText: "Traceability",
      icon: <TimelineIcon />
    },
    child: [
      {
          path: "/traceability",
          element: <TraceabilityPage />,
          state: "traceability",
          sidebarProps: {
            displayText: "Traceability-Home",
          }
      },
      {
        path: "/traceability/timeLine",
        element: <TimeLineComponent />,
        state: "traceability.timeLine",
        sidebarProps: {
          displayText: "Time Line"
        },
      },
      {
        path: "/traceability/graph",
        element: <GraphComponent />,
        state: "traceability.graph",
        sidebarProps: {
          displayText: "Graph"
        }
      }
    ]
  },

  {
    path: "/documentation",
    element: <DocumentationPage />,
    state: "documentation",
    sidebarProps: {
      displayText: "Documentation",
      icon: <ArticleOutlinedIcon />
    }
  },

  {
    path: "/installation",
    element: <InstallationPage />,
    state: "installation",
    sidebarProps: {
      displayText: "Installation",
      icon: <FileDownloadOutlinedIcon />
    }
  },

  {
    path: "/settings",
    element: <SettingPage />,
    state: "changelog",
    sidebarProps: {
      displayText: "Settings",
      icon: <SettingsIcon />
    }
  },

  {
    path: "/changelog",
    element: <ChangelogPage />,
    state: "changelog",
    sidebarProps: {
      displayText: "Changelog",
      icon: <FormatListBulletedOutlinedIcon />
    }
  }
];

export default appRoutes;