import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as moment from 'moment';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import 'date-fns';
import db from '../firebase.config';
import { evaluate } from 'mathjs'

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
  const [customer, setCustomer] = React.useState({});
  const [fc, setFC] = React.useState(1.23);
  const [rate, setRate] = React.useState(15.8);
  const [validCustomer, setValidCustomer] = React.useState(true);

  const classes = useStyles();

  const reset = () => {
    setCustomer({});
    setFC(1.23);
    setRate(15.8);
    setValidCustomer(true)
  }

  const getAmount = (w, z) => {
    var arr = customer.priceList.split("\n")
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

  const createInvoice = () => {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    db.collection("shippings")
      .where("customerCode", "==", customer.code)
      .where("createDate", ">=", startOfMonth)
      .where("createDate", "<=", endOfMonth)
      .get()
      .then((querySnapshot) => {
        var shippingList = [];
        var totalAmount = 0;
        var totalWeight = 0;
        var totalVAT = 0;

        querySnapshot.forEach((doc) => {
          const shipping = doc.data();
          const amount = getAmount(shipping.weight, shipping.zone);
          shippingList.push({
            skyAWB: shipping.skyAWB,
            createDate: shipping.createDate,
            source: shipping.direction === 'dest' ? 'Egypt' : shipping.destination,
            destination: shipping.direction === 'dest' ? shipping.destination : 'Egypt',
            weight: Number(shipping.weight),
            isDoc: shipping.isDoc,
            amount: (amount * Number(rate)).toFixed(1),
            amountDollar: amount.toFixed(1),
            extraFeesDollar: Number(shipping.extraFees).toFixed(1),
            extraFees: (Number(shipping.extraFees) * Number(rate)).toFixed(1),
            fcAmountDollar: ((amount + Number(shipping.extraFees)) * (Number(fc) - 1)).toFixed(1),
            fcAmount: ((amount + Number(shipping.extraFees)) * Number(rate) * (Number(fc) - 1)).toFixed(1),
            pfDollar: ((amount + Number(shipping.extraFees)) * Number(fc) * 0.1).toFixed(1),
            pf: ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * 0.1).toFixed(1),
            amountTotal: ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * 1.1).toFixed(1),
            amountTotalDollar: ((amount + Number(shipping.extraFees)) * Number(fc) * 1.1).toFixed(1)
          })
          totalAmount += ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * 1.1)
          totalVAT += ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * 1.1 * (customer.taxable ? 0.14 : 0))
          totalWeight += Number(shipping.weight);
        })

        db.collection("invoices").get().then((querySnapshot) => {
          const newCode = querySnapshot.size + 10000;
          db.collection("invoices").doc(customer.code + moment().format('MMYYYY').toString()).set({
            invoiceNumber: newCode,
            date: new Date(),
            rate: Number(rate),
            fc: Number(fc),
            customer: customer,
            shippings: shippingList,
            totalAmount: Number(totalAmount).toFixed(1),
            totalVAT: Number(totalVAT).toFixed(1),
            totalWeight: Number(totalWeight),
          });
        });
        alert('Shipping is added successfully!')
        reset();
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });

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
  }, [])


  React.useEffect(() => {
    if (Object.keys(customer).length !== 0) {
      db.collection("invoices").doc(customer.code + moment().format('MMYYYY').toString())
        .get().then((doc) => {
          if (doc.exists) {
            setValidCustomer(false);
          }
        });
    }
  }, [customer])

  return (
    <React.Fragment>
      <CssBaseline />
      <Typography variant="h4" gutterBottom className={classes.title}>
        Add Invoice
      </Typography>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              id="combo-box"
              options={customers}
              getOptionLabel={(option) => option.code || ''}
              value={customer}
              onChange={(event, newValue) => {
                if (!newValue) setCustomer({});
                else setCustomer(newValue);
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
            <div>
              {!validCustomer ? (<FormControlLabel value="valid" control={<div />} label="Customer is already having an invoice!" />) : <div />}</div>
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
              }}
            />
          </Grid>
          <Grid item xs={12} sm={12} >
            <Button variant="contained" color="primary" onClick={createInvoice}
              disabled={Object.keys(customer).length === 0 || customer.priceList === ""}>
              Add
            </Button>
          </Grid>
        </Grid>
      </div>
    </React.Fragment >
  );
}