import React, {useMemo, useState} from 'react';
import PersonList from "./PersonList";
import Fab from "@material-ui/core/Fab";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import AddIcon from '@material-ui/icons/Add';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from "@material-ui/core/CssBaseline";
import randomColor from 'randomcolor';
import AddDialog from './AddDialog';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';
import {fade, makeStyles} from '@material-ui/core/styles';
import Backdrop from "@material-ui/core/Backdrop";
import InputBase from '@material-ui/core/InputBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import {v4} from "uuid";
import {OrderedMap, Map} from 'immutable';
import {blue} from "@material-ui/core/colors";
import {FormControlLabel, Hidden, Switch} from "@material-ui/core";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import {uniqueNamesGenerator, adjectives, animals} from 'unique-names-generator';

const genConfig = {
    dictionaries: [adjectives, animals],
    style: 'capital',
    separator: ' '
}

const ERROR_CODE = {
    OK: 0,
    FILTER_FORMAT_ERROR: -1,
    NO_ITEM: -2,
    NOT_FOUND: -3,
}

const ERROR_CAPTION = Map(
    [
        [ERROR_CODE.FILTER_FORMAT_ERROR, "请检查正则表达式语法！"],
        [ERROR_CODE.NO_ITEM, "请点击右下方的按钮“+”添加后端"],
        [ERROR_CODE.NOT_FOUND, "未检索到符合要求的后端"],
        [ERROR_CODE.OK, "OK!"]
    ]
)

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        flexGrow: 1,
    },
    appbar: {
        zIndex: 9
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    fabGroup: {
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
        zIndex: 10
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
    backdrop: {
        position: "absolute",
        zIndex: 4
    }
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const App: React.FC = (props) => {
    const [inputs, setInputs] = useState({
        name: "",
        ip: "127.0.0.1",
        port: 5000,
        useHttps: false
    })
    const [items: OrderedMap, setItems] = useState(OrderedMap());
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [baseline, setBaseline] = useState(0.15);
    const [color, setColor] = useState("#000");
    const [filter, setFilter] = useState("");
    const [timeId, setTimeId] = useState(0);
    const [waiting, setWaiting] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [reSearch, setReSearch] = useState(false);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            createMuiTheme({
                palette: {
                    primary: blue,
                    // secondary: deepOrange,
                    type: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode],
    );

    const classes = useStyles();

    function handleSubmit() {
        const uuid = v4();
        // console.log(uuid);
        const newPersonItem = {
            name: inputs.name,
            ip: inputs.ip,
            port: inputs.port,
            protocol: inputs.useHttps ? "https" : "http",
            color
        };
        setItems(items.set(uuid, newPersonItem));
        setOpenAddDialog(false);
    }

    function handleClose() {
        setOpenAddDialog(false);
    }

    function handleOpenAddDialog() {
        setOpenAddDialog(true);
        setInputs({
            name: uniqueNamesGenerator(genConfig),
            ip: "127.0.0.1",
            port: 5000,
            useHttps: false
        })
        setColor(randomColor());
    }

    function handleGenNameClick() {
        setInputs({...inputs, name: uniqueNamesGenerator(genConfig)})
    }

    function handleGenColorClick() {
        setColor(randomColor());
    }

    const deleteItem = (uuid) => {
        // console.log("delete:", uuid)
        setItems(items.delete(uuid));
    }

    const handleInputChange = ({target: {name, value}}) => {
        setInputs(ipt => ({...ipt, [name]: value}))
    }

    function handleUp() {
        setOpenSnackbar(true);
        setBaseline(baseline + 0.05)
    }

    function handleDown() {
        setOpenSnackbar(true);
        setBaseline(baseline - 0.05)
    }

    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    }

    useMemo(selectItemByFilter, [reSearch, filter, items]);

    function selectItemByFilter() {
        if (items.size === 0) return {ok: ERROR_CODE.NO_ITEM, data: [], msg: "No item."};
        try {
            let ret: OrderedMap = null;
            if (reSearch) {
                let re: RegExp = new RegExp(filter, "i");
                ret = items.filter((value) => {
                    return value.name.search(re) !== -1;
                });
            } else {
                ret = items.filter((value) => {
                    return value.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                })
            }
            console.log(ret);
            return {ok: (ret.size > 0 ? ERROR_CODE.OK : ERROR_CODE.NOT_FOUND), data: ret, msg: "Search OK"};
        } catch (e) {
            console.log(e.message);
            return {ok: ERROR_CODE.FILTER_FORMAT_ERROR, data: [], msg: e.message}
        }
    }

    function onSearchChange({target: {value}}) {
        setWaiting(true);
        if (timeId !== 0) {
            clearTimeout(timeId);
            setTimeId(0);
        }
        setTimeId(setTimeout(() => {
            if (filter !== value) setFilter(value);
            setWaiting(false);
        }, 500));
    }

    function onUseReChange({target: {checked}}) {
        setWaiting(true);
        if (timeId !== 0) {
            clearTimeout(timeId);
            setTimeId(0);
        }
        setTimeId(setTimeout(() => {
            if (reSearch !== checked) setReSearch(checked);
            setWaiting(false);
        }, 500));
    }

    let displayItems = selectItemByFilter();

    function onMenuClick(event) {
        setAnchorEl(event.currentTarget);
        setOpenMenu(true);
    }

    function handleMenuClose() {
        setAnchorEl(null);
        setOpenMenu(false);
    }

    function handleSwitch({target: {name, checked}}) {
        setInputs(ipt => ({...ipt, [name]: checked}))
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={openMenu}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleOpenAddDialog();
                    handleMenuClose();
                }}>Add...</MenuItem>
                <MenuItem onClick={() => {
                    handleUp();
                    handleMenuClose();
                }}>+0.05 to baseline</MenuItem>
                <MenuItem onClick={() => {
                    handleDown();
                    handleMenuClose();
                }}>-0.05 to baseline</MenuItem>
            </Menu>
            <AppBar position="static" className={classes.appbar}>
                <Toolbar>
                        <IconButton onClick={onMenuClick} edge="start" className={classes.menuButton} color="inherit"
                                    aria-label="menu">
                            <MenuIcon/>
                        </IconButton>
                    <Hidden xsDown>
                    <Typography variant="h6" className={classes.title}>
                        Hawkeye
                    </Typography>
                    </Hidden>
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon/>
                        </div>
                        <InputBase
                            onChange={onSearchChange}
                            placeholder="Search…"
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                            inputProps={{'aria-label': 'search'}}
                        />
                    </div>
                    <FormControlLabel control={
                        <Switch
                            checked={reSearch}
                            onChange={onUseReChange}
                            color="secondary"
                            name="useReSearch"
                            inputProps={{'aria-label': 'use RE-search switch'}}
                        />}
                                      label={<Hidden xsDown>Use RegExp?</Hidden>}
                    />
                    {/*<Button color="inherit">Login</Button>*/}
                </Toolbar>
            </AppBar>

            <div className={classes.root}>

                <Backdrop open={waiting} className={classes.backdrop}>
                    <CircularProgress color="inherit"/>
                </Backdrop>

                {displayItems.ok === ERROR_CODE.OK ?
                    <Container>
                        <PersonList items={displayItems.data} deleteCallback={deleteItem} baseline={baseline}/>
                    </Container>
                    :
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        textAlign: 'center',
                        verticalAlign: 'center',
                        width: '100vw',
                        height: '80vh',
                    }}>
                        <Box color="text.secondary" fontSize="h2.fontSize">{ERROR_CAPTION.get(displayItems.ok)}</Box>
                    </div>
                }

                <div className={classes.fabGroup}>
                    <Grid container direction="column" spacing={2} alignItems="center" justify="center">
                        <Grid item><Fab color="secondary" aria-label="up" onClick={handleUp}>
                            <KeyboardArrowUpIcon/>
                        </Fab></Grid>
                        <Grid item><Fab color="secondary" aria-label="down" onClick={handleDown}>
                            <KeyboardArrowDownIcon/>
                        </Fab></Grid>
                        <Grid item><Fab color="primary" aria-label="add" onClick={handleOpenAddDialog}>
                            <AddIcon/>
                        </Fab></Grid>
                    </Grid>
                </div>

                <AddDialog
                    color={color}
                    handleClose={handleClose}
                    handleGenColorClick={handleGenColorClick}
                    handleGenNameClick={handleGenNameClick}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    handleSwitchChange={handleSwitch}
                    inputs={inputs}
                    open={openAddDialog}
                    setColor={setColor}
                />

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    message={"New baseline is: " + baseline.toFixed(2)}
                    open={openSnackbar}
                    // autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                >
                    <Alert onClose={handleSnackbarClose} severity="info">
                        {"New baseline is: " + baseline.toFixed(2)}
                    </Alert>
                </Snackbar>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    message={displayItems.msg}
                    open={displayItems.ok === ERROR_CODE.FILTER_FORMAT_ERROR}
                >
                    <Alert severity="error">
                        {displayItems.msg}
                    </Alert>
                </Snackbar>
            </div>
        </ThemeProvider>
    );
}

export default App;
