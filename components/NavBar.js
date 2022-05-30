
import SearchContext from "../utils/search-context";

import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  makeStyles,
  TextField,
  InputAdornment,
  Typography,
  Menu,
  MenuItem,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import RestaurantMenuIcon from "@material-ui/icons/RestaurantMenu";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
  appbar: {
    backgroundColor: theme.palette.primary,
    color: theme.palette.primary.light,
    borderBottom: `1px solid ${theme.palette.primary.dark}`,

  },

  toolbar: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  menu: {
    display: "flex",
  },
  title: {
    fontWeight: "bold",
  },

  search: {
    width: 300,
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#FFFFFF",

  },
  searchIcon: {
    color: theme.palette.primary.dark,
  },

  inputRoot: {

    color: theme.palette.primary.dark
  },
  inputInput: {

    backgroundColor: theme.palette.primary.light,

    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const MainNavigation = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter()


  const routeToMenu = () => {
    const location = router.asPath

    if (!location.includes("Menu")) {
      router.push("/Menu")
    }
  }

  const { search, searchQuery } = useContext(SearchContext);

  return (
    <AppBar position="sticky" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <Typography className={classes.title}>
          <Link href="/">
            Order Up | Thai Pavilion
          </Link>
        </Typography>
        <div className={classes.search}>
          <TextField
            placeholder="Search menu"
            onClick={routeToMenu}
            onChange={search}
            value={searchQuery}
            classes={{
              root: classes.inputRoot,
            }}
            fullWidth
            InputProps={{
              "aria-label": "search",
              startAdornment: (
                <InputAdornment position="start" style={{ marginLeft: 15 }}>
                  <SearchIcon className={classes.searchIcon} />
                </InputAdornment>
              ),

              disableUnderline: true,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: 150,
          }}
        >

          <Link href="/">
            <HomeIcon />
          </Link>

          <Link href="/Menu">
            <RestaurantMenuIcon
              color="inherit"
              id="basic-button"
            />
          </Link>

          <Link href={"/Cart"}>
            <ShoppingCartIcon />
          </Link>

        </div>
      </Toolbar>
    </AppBar>
  );
};

export default MainNavigation;
