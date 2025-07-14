//import { Avatar, Drawer, List, Stack, Toolbar, Box } from "@mui/material";
import { Drawer, List, Stack, Box } from "@mui/material";
import assets from "../../assets";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import appRoutes from "../../routes/appRoutes";
import SidebarItem from "./SidebarItem";
import SidebarItemCollapse from "./SidebarItemCollapse";

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sizeConfigs.sidebar.width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sizeConfigs.sidebar.width,
          boxSizing: "border-box",
          borderRight: "0px",
          backgroundColor: colorConfigs.sidebar.bg,
          color: colorConfigs.sidebar.color
        }
      }}
    >
      <List disablePadding>
        <Stack
          sx={{ width: "100%", marginY: "20px" }} // Added marginY for vertical spacing
          direction="row"
          justifyContent="center"
        >
          <Box
            component="img"
            src={assets.images.logo}
            sx={{
              width: "100px", // Adjust the size as needed
              height: "auto",  // Maintain aspect ratio
              borderRadius: "8px", // Add some border radius for style, remove if not needed
              marginX: "20px",  // Add horizontal space before and after the image
            }}
          />
        </Stack>
        {appRoutes.map((route, index) => (
          route.sidebarProps ? (
            route.child ? (
              <SidebarItemCollapse item={route} key={index} />
            ) : (
              <SidebarItem item={route} key={index} />
            )
          ) : null
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
