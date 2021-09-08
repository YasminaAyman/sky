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
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';


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
  const [date, setDate] = React.useState(Date.now())

  const classes = useStyles();

  const reset = () => {
    setCustomer({});
    setFC(1.23);
    setRate(15.8);
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

  const handleDateChange = (date) => {
    setDate(date);
  };

  const createInvoice = () => {
    if (!checkValidInvoice()) {
      alert('There is an invoice with that customer and in that month!')
    } else {
      const startOfMonth = moment(date).startOf('month').toDate();
      const endOfMonth = moment(date).endOf('month').toDate();
      db.collection("shippings")
        .where("customerCode", "==", customer.code)
        .where("createDate", ">=", startOfMonth)
        .where("createDate", "<=", endOfMonth)
        .get()
        .then((querySnapshot) => {
          var shippingList = [];
          var totalAmount = 0, totalWeight = 0, totalVAT = 0, totalExtra = 0, totalFC = 0, totalPF = 0, total = 0;

          querySnapshot.forEach((doc) => {
            const shipping = doc.data();
            const amount = getAmount(shipping.weight, shipping.zone);
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
              amount: (amount * Number(rate)).toFixed(2),
              amountDollar: amount.toFixed(2),
              extraFeesDollar: Number(shipping.extraFees).toFixed(2),
              extraFees: (Number(shipping.extraFees) * Number(rate)).toFixed(2),
              fcAmountDollar: ((amount + Number(shipping.extraFees)) * (Number(fc) - 1)).toFixed(2),
              fcAmount: ((amount + Number(shipping.extraFees)) * Number(rate) * (Number(fc) - 1)).toFixed(2),
              pfDollar: ((amount + Number(shipping.extraFees)) * Number(fc) * pf).toFixed(2),
              pf: ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * pf).toFixed(2),
              amountTotal: ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * (1 + pf)).toFixed(2),
              amountTotalDollar: ((amount + Number(shipping.extraFees)) * Number(fc) * (1 + pf)).toFixed(2)
            })
            totalAmount += (amount * Number(rate))
            total += ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * (1 + pf) * (customer.taxable ? 1.14 : 0))
            totalExtra += (Number(shipping.extraFees) * Number(rate))
            totalFC += ((amount + Number(shipping.extraFees)) * Number(rate) * (Number(fc) - 1))
            totalPF += ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * pf)
            totalVAT += ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * (1 + pf) * (customer.taxable ? 0.14 : 0))
            totalWeight += Number(shipping.weight);
          })

          db.collection("invoices").get().then((querySnapshot) => {
            const newCode = querySnapshot.size + 10000;
            db.collection("invoices").doc(customer.code + moment(date).format('MMYYYY').toString()).set({
              invoiceNumber: newCode,
              date: new Date(),
              rate: Number(rate),
              fc: Number(fc),
              customer: customer,
              shippings: shippingList,
              pieces: shippingList.length,
              totalAmount: Number(totalAmount).toFixed(2),
              totalVAT: Number(totalVAT).toFixed(2),
              totalExtra: Number(totalExtra).toFixed(2),
              totalFC: Number(totalFC).toFixed(2),
              totalPF: Number(totalPF).toFixed(2),
              total: Number(total).toFixed(2),
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
    return valid;
  }

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