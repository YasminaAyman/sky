import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as moment from 'moment';
import Button from '@material-ui/core/Button';
import 'date-fns';
import db from '../firebase.config';
import { evaluate } from 'mathjs'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import InvoiceDetails from './InvoiceDetails';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '600px'
  },
  title: {
    'text-align': 'center',
    'color': '#3f51b5',
    'height': '100px'
  },
  textArea: {
    width: '40%'
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: '50%'
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function CreateInvoice() {
  const [customers, setCustomers] = React.useState([]);
  const [cashShippings, setCashShippings] = React.useState([]);
  const [newNumber, setNewNumber] = React.useState('');
  const [lastNumber, setLastNumber] = React.useState('');
  const [customer, setCustomer] = React.useState({});
  const [fc, setFC] = React.useState(1.23);
  const [rate, setRate] = React.useState(15.8);
  const [date, setDate] = React.useState(Date.now())
  const [openFull, setOpenFull] = React.useState(false);
  const [newInvoice, setNewInvoice] = React.useState({})


  const classes = useStyles();

  const reset = () => {
    setNewNumber(lastNumber)
    setCustomer({});
    setFC(1.23);
    setRate(15.8);
  }

  const getAmount = (w, z, cust) => {
    var arr = cust.priceList.split("\n")
    for (let i = 0; i < arr.length; i++) {
      var words = arr[i].split('\t');
      if (Number(w) > Number(words[0].trim()) && Number(w) <= Number(words[1].trim())) {
        if (Number(w) > 30) {
          return evaluate(words[Number(z) + 1].replace("n", w));
        } else {
          return Number(words[Number(z) + 1])
        }
      }
    }
  }

  const handleDateChange = (date) => {
    setDate(date);
    previewInvoice(newNumber, date, customer, fc, rate)
  };

  const createInvoice = async () => {
    const valid = await checkValidInvoice();
    if (!valid) {
      alert('There is an invoice with that customer and in that month!')
    } else {
      db.collection("invoices").doc(customer.code + moment(date).format('MMYYYY').toString())
        .set(newInvoice);
      alert('Shipping is added successfully!')
      if (newNumber === lastNumber) {
        db.collection("constants").doc('invoice').set({
          value: Number(lastNumber) + 1
        })
      }
      reset();
    }
  }

  const previewInvoice = (invNumber, invDate, invCustomer, invFC, invRate) => {
    if (Object.keys(invCustomer).length !== 0 && invCustomer.priceList !== "" && invNumber && invFC && invRate) {
      const startOfMonth = moment(invDate).startOf('month').toDate();
      const endOfMonth = moment(invDate).endOf('month').toDate();
      db.collection("shippings")
        .where("customerCode", "==", invCustomer.code)
        .where("createDate", ">=", startOfMonth)
        .where("createDate", "<=", endOfMonth)
        .get()
        .then((querySnapshot) => {
          var shippingList = [];
          var totalAmount = 0, totalWeight = 0, totalVAT = 0, totalExtra = 0, totalFC = 0, totalPF = 0, total = 0, grandTotal = 0;

          querySnapshot.forEach((doc) => {
            const shipping = doc.data();
            const amount = getAmount(shipping.weight, shipping.zone, invCustomer);
            var pf = 0.1;
            if (shipping.weight >= 50) {
              pf = 0;
            }
            shippingList.push({
              skyAWB: shipping.skyAWB,
              createDate: shipping.createDate,
              source: shipping.direction === 'dest' ? 'Egypt' : shipping.destination,
              destination: shipping.direction === 'dest' ? shipping.destination : 'Egypt',
              weight: Number(shipping.weight),
              isDoc: shipping.isDoc,
              amount: (amount * Number(invRate)).toFixed(2),
              amountDollar: amount.toFixed(2),
              extraFeesDollar: Number(shipping.extraFees).toFixed(2),
              extraFees: (Number(shipping.extraFees) * Number(invRate)).toFixed(2),
              fcAmountDollar: ((amount + Number(shipping.extraFees)) * (Number(invFC) - 1)).toFixed(2),
              fcAmount: ((amount + Number(shipping.extraFees)) * Number(invRate) * (Number(invFC) - 1)).toFixed(2),
              pfDollar: ((amount + Number(shipping.extraFees)) * Number(invFC) * pf).toFixed(2),
              pf: ((amount + Number(shipping.extraFees)) * Number(invRate) * Number(invFC) * pf).toFixed(2),
              amountTotal: ((amount + Number(shipping.extraFees)) * Number(invRate) * Number(invFC) * (1 + pf)).toFixed(2),
              amountTotalDollar: ((amount + Number(shipping.extraFees)) * Number(invFC) * (1 + pf)).toFixed(2)
            })
            totalWeight += Number(shipping.weight);
            totalAmount += (amount * Number(invRate))
            totalExtra += (Number(shipping.extraFees) * Number(invRate))
            totalFC += ((amount + Number(shipping.extraFees)) * Number(invRate) * (Number(invFC) - 1))
            totalPF += ((amount + Number(shipping.extraFees)) * Number(invRate) * Number(invFC) * pf)
            totalVAT += ((amount + Number(shipping.extraFees)) * Number(invRate) * Number(invFC) * (1 + pf) * (invCustomer.taxable ? 0.14 : 0))
            total += ((amount + Number(shipping.extraFees)) * Number(invRate) * Number(invFC) * (1 + pf))
            grandTotal += ((amount + Number(shipping.extraFees)) * Number(invRate) * Number(invFC) * (1 + pf) * (invCustomer.taxable ? 1.14 : 1))
          })

          setNewInvoice({
            invoiceNumber: invNumber,
            date: moment(invDate).format('MM/YYYY'),
            rate: Number(invRate),
            fc: Number(invFC),
            customer: invCustomer,
            shippings: shippingList,
            pieces: shippingList.length,
            totalAmount: Number(totalAmount).toFixed(2),
            totalVAT: Number(totalVAT).toFixed(2),
            totalExtra: Number(totalExtra).toFixed(2),
            totalFC: Number(totalFC).toFixed(2),
            totalPF: Number(totalPF).toFixed(2),
            total: Number(total).toFixed(2),
            totalWeight: Number(totalWeight),
            grandTotal: Number(grandTotal).toFixed(2)
          })
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  }

  React.useEffect(() => {
    async function fetchCustomers() {
      let customersRes = await db.collection("customers").orderBy("code").get().then((querySnapshot) => {
        var customersList = [];
        querySnapshot.forEach((doc) => {
          customersList.push(doc.data());
        });
        return customersList;
      });
      setCustomers(customersRes)
    }
    fetchCustomers()
    async function getCashShippings() {
      let shippingsRes = await db.collection("shippings")
      .where("customerCode", "==", "10000").get().then((querySnapshot) => {
        var shippingsList = [];
        querySnapshot.forEach((doc) => {
          shippingsList.push(doc.data());
        });
        return shippingsList;
      });
      setCashShippings(shippingsList)
    }
    getCashShippings()
    db.collection("constants").doc('invoice').get().then((doc) => {
      const data = doc.data()
      setLastNumber(data.value)
      setNewNumber(data.value)
    })
  }, [])


  const checkValidInvoice = async () => {
    let valid
    if (Object.keys(customer).length !== 0) {
      valid = await db.collection("invoices").doc(customer.code + moment(date).format('MMYYYY').toString())
        .get().then((doc) => {
          if (doc.exists) {
            return false
          }
          return true
        });
    }

    valid = await db.collection("invoices")
      .where("invoiceNumber", "==", Number(newNumber))
      .get().then((querySnapshot) => {
        if (querySnapshot.size === 0) {
          return true
        }
        return false
      });
    return valid;
  }

  const handleClickOpenFullDial = () => {
    setOpenFull(true);
  }

  const handleCloseFull = () => {
    setOpenFull(false);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Typography variant="h4" gutterBottom className={classes.title}>
        Add Invoice
      </Typography>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid container item xs={12} sm={12}>
            <TextField id="number" name="number" label="Invoice Number" value={newNumber}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setNewNumber(event.target.value)
                previewInvoice(event.target.value, date, customer, fc, rate)
              }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              id="combo-box"
              options={customers}
              getOptionLabel={(option) => option.code || ''}
              value={customer}
              onChange={(event, newValue) => {
                if (!newValue) setCustomer({});
                else {
                  setCustomer(newValue)
                  previewInvoice(newNumber, date, newValue, fc, rate)
                };
              }}
              renderInput={(params) => <TextField {...params} label="Customer Code" variant="outlined" />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="filled-name"
              value={customer.name || ''}
              label="Customer Name"
              InputLabelProps={{
                shrink: true,
              }}
              disabled={true}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                variant="inline"
                openTo="year"
                views={["year", "month"]}
                label="Year and Month"
                helperText="Start from year selection"
                value={date}
                onChange={handleDateChange}
                maxDate={Date.now()}
              />
            </MuiPickersUtilsProvider>
          </Grid>

          <Grid container item xs={12} sm={12}>
            <TextField
              id="filled-name"
              label="FC"
              value={fc}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setFC(event.target.value)
                previewInvoice(newNumber, date, customer, event.target.value, rate)
              }}
            />
          </Grid>
          <Grid container item xs={12} sm={12}>
            <TextField
              id="filled-name"
              label="$ Rate"
              value={rate}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setRate(event.target.value)
                previewInvoice(newNumber, date, customer, fc, event.target.value)
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} >
            <Button variant="contained" color="primary" onClick={() => {
              handleClickOpenFullDial()
            }}
            disabled={Object.keys(customer).length === 0 || customer.priceList === "" || !newNumber || !fc || !rate}>
            Preview
            </Button>
            <Dialog maxWidth="lg" open={openFull} onClose={handleCloseFull} TransitionComponent={Transition}>
              <AppBar className={classes.appBar}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" onClick={handleCloseFull} aria-label="close">
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" className={classes.title}>
                    Invoice
                  </Typography>
                </Toolbar>
              </AppBar>
              <div style={{ 'margin-top': '40px' }}>
                <InvoiceDetails rowInvoice={newInvoice} closeDialog={handleCloseFull} />
              </div>
              <Button variant="contained" color="primary" onClick={createInvoice} style={{ 'width': '120px', 'left': '80%', 'margin-bottom': '40px' }}
                disabled={Object.keys(customer).length === 0 || customer.priceList === "" || !newNumber}>
                Create
              </Button>
            </Dialog>
          </Grid>

          <Grid item xs={12} sm={6} >
            <Button variant="contained" color="primary" onClick={() => {
              handleClickOpenFullDial()
            }}
            disabled={customer.code !== 1000}>
            Choose Shippings
            </Button>
            <Dialog maxWidth="lg" open={openFull} onClose={handleCloseFull} TransitionComponent={Transition}>
              <AppBar className={classes.appBar}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" onClick={handleCloseFull} aria-label="close">
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" className={classes.title}>
                    Invoice
                  </Typography>
                </Toolbar>
              </AppBar>
              <div style={{ 'margin-top': '40px' }}>
                <InvoiceDetails rowInvoice={newInvoice} closeDialog={handleCloseFull} />
              </div>
              <Button variant="contained" color="primary" onClick={createInvoice} style={{ 'width': '120px', 'left': '80%', 'margin-bottom': '40px' }}
                disabled={Object.keys(customer).length === 0 || customer.priceList === "" || !newNumber}>
                Create
              </Button>
            </Dialog>
          </Grid>
        </Grid>
      </div>
    </React.Fragment >
  );
}