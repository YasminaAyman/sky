import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import db from '../firebase.config';
import CssBaseline from '@material-ui/core/CssBaseline';
import { evaluate } from 'mathjs'
import * as moment from 'moment';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '600px'
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

export default function EditInvoice(props) {
  const rowInvoice = props.rowInvoice;
  const classes = useStyles();
  const [fc, setFC] = React.useState(rowInvoice.fc);
  const [rate, setRate] = React.useState(rowInvoice.rate);
  const [priceList, setPriceList] = React.useState(rowInvoice.priceList);


  const getAmount = (w, z) => {
    var arr = priceList.split("\n")
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

  const save = () => {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    db.collection("shippings")
      .where("customerCode", "==", rowInvoice.customer.code)
      .where("createDate", ">=", startOfMonth)
      .where("createDate", "<=", endOfMonth)
      .get()
      .then((querySnapshot) => {
        var shippingList = [];
        var totalAmount = 0;
        var totalWeight = 0;

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
            amountDollar: (amount * Number(rate)).toFixed(1),
            amount: amount.toFixed(1),
            extraFeesDollar: Number(shipping.extraFees).toFixed(1),
            extraFees: (Number(shipping.extraFees) * Number(rate)).toFixed(1),
            fcAmountDollar: ((amount + Number(shipping.extraFees)) * (Number(fc) - 1)).toFixed(1),
            fcAmount: ((amount + Number(shipping.extraFees)) * Number(rate) * (Number(fc) - 1)).toFixed(1),
            pfDollar: ((amount + Number(shipping.extraFees)) * Number(fc) * 0.1).toFixed(1),
            pf: ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * 0.1).toFixed(1)
          })
          totalAmount += ((amount + Number(shipping.extraFees)) * Number(rate) * Number(fc) * 1.1)
          totalWeight += Number(shipping.weight);
        })
        db.collection("invoices").doc(rowInvoice.customer.code + moment().format('MMYYYY').toString()).set({
          date: new Date(),
          rate: Number(rate),
          fc: Number(fc),
          shippings: shippingList,
          totalAmount: Number(totalAmount).toFixed(1),
          totalWeight: Number(totalWeight),
          priceList: priceList
        }, { merge: true });

        alert('Invoice is updated successfully!')
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={12}>
            <div>
              <input type="file" onChange={async (e) => {
                e.preventDefault()
                const reader = new FileReader()
                reader.onload = async (e) => {
                  const text = (e.target.result)
                  setPriceList(text);
                };
                reader.readAsText(e.target.files[0])
              }} />
            </div>
          </Grid>
          <Grid item xs={12} sm={12} >
            <Button color="primary" size="medium" style={{ 'left': '7  0%' }} onClick={() => {
              props.closeDialog();
              save();
              props.updateTable();
            }}>
              Save
            </Button>
            <Button onClick={props.closeDialog} color="primary" size="medium" style={{ 'left': '80%' }}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  )

}