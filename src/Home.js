import './App.css';
import AddShipping from './Shippings/AddShipping';
import Customers from './Customers/Customers';
import AddCustomer from './Customers/AddCustomer';
import 'react-tabs/style/react-tabs.css';
import TableShippings from './Shippings/TableShippings';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CreateInvoice from './Invoices/CreateInvoice';
import Invoices from './Invoices/Invoices'
import Button from '@material-ui/core/Button';
import React, { useContext } from "react";
import { AuthContext } from "./Auth";
import SignIn from './SignIn';
import firebase from "firebase/app";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const logout = () => {
  firebase.auth().signOut()
}


export default function Home(props) {
  const { currentUser } = useContext(AuthContext);
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const updateShippingsTable = () => {
    this.childShipping.updateTable();
  }

  const updateCustomersTable = () => {
    this.childCustomer.updateTable();
  }

  const updateInvoicesTable = () => {
    this.childInvoice.updateTable();
  }

  return (
    <>
      {currentUser ? (
        <div className={classes.root}>
          <AppBar position="static">
            <Tabs value={value} onChange={handleChange} aria-label="simple tabs example" variant="fullWidth">
              <Tab label="Shippings" {...a11yProps(0)} />
              <Tab label="Add Shipping" {...a11yProps(1)} />
              <Tab label="Customers" {...a11yProps(2)} />
              <Tab label="Add Customer" {...a11yProps(3)} />
              <Tab label="Invoices" {...a11yProps(4)} />
              <Tab label="Add Invoice" {...a11yProps(5)} />
              <Button onClick={logout}>Logout</Button>
            </Tabs>
          </AppBar>
          <TabPanel value={value} index={0}>
            <TableShippings ref={instance => { this.childShipping = instance; }} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <AddShipping updateShipping={updateShippingsTable} />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Customers ref={instance => { this.childCustomer = instance; }} />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <AddCustomer updateCustomers={updateCustomersTable} />
          </TabPanel>
          <TabPanel value={value} index={4}>
            <Invoices ref={instance => { this.childInvoice = instance; }} />
          </TabPanel>
          <TabPanel value={value} index={5}>
            <CreateInvoice updateInvoices={updateInvoicesTable} />
          </TabPanel>
        </div>
      ) : (
        <p>
          <SignIn></SignIn>
        </p>
      )}
    </>
  );
}
