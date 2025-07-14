import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import BottomBar from "../common/BottomBar";

const bottomBarHeight = 160; // Adjust the height as needed

const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Topbar />
      <Box
        component="nav"
        sx={{
          width: sizeConfigs.sidebar.width,
          flexShrink: 0
        }}
      >
        <Sidebar />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${sizeConfigs.sidebar.width})`,
          minHeight: "100vh",
          backgroundColor: colorConfigs.mainBg,
          paddingBottom: `${bottomBarHeight}px` // Add padding to the bottom
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      {/* <BottomBar /> {/* Add the BottomBar component */}  
      <BottomBar sx={{ height: `${bottomBarHeight}px` }} /> {/* Add the BottomBar component */}
    </Box>
  );
};

export default MainLayout;