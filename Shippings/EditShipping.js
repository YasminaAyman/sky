import React from 'react';
import db from '../firebase.config';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { evaluate } from 'mathjs'
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

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


export default function EditShipping(props) {
  const classes = useStyles();
  const rowShipping = props.rowShipping;
  const [customers, setCustomers] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [customer, setCustomer] = React.useState({ code: rowShipping.customerCode, name: rowShipping.customerName });
  const [selectedDate, setSelectedDate] = React.useState(new Date(rowShipping.createDate.seconds * 1000));
  const [country, setCountry] = React.useState({ country: rowShipping.destination, zone: rowShipping.zone });
  const [fc, setFC] = React.useState(rowShipping.fc);
  const [rate, setRate] = React.useState(rowShipping.rate);
  const [cost, setCost] = React.useState(rowShipping.cost);
  const [dollarCost, setDollarCost] = React.useState(rowShipping.dollarCost);
  const [weight, setWeight] = React.useState(rowShipping.weight);
  const [skyAWB, setSkyAWB] = React.useState(rowShipping.skyAWB);
  const [awb, setAWB] = React.useState(rowShipping.AWB);
  const [isDoc, setIsDoc] = React.useState(rowShipping.isDoc)
  const [priceList, setPriceList] = React.useState(rowShipping.priceList || 1);
  const [extraFees, setExtraFees] = React.useState(rowShipping.extraFees);
  const [direction, setdirection] = React.useState(rowShipping.direction);
  const [status, setStatus] = React.useState(rowShipping.status);
  const [statusChangeDate, setStatusChangeDate] = React.useState(rowShipping.statusChangeDate);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleListChange = (event) => {
    setPriceList(event.target.value);
  };

  const save = () => {
    db.collection("shippings").doc(rowShipping.id).set({
      skyAWB: skyAWB,
      AWB: awb,
      destination: country.country,
      zone: country.zone,
      customerCode: customer.code,
      customerName: customer.name,
      cost: Number(cost).toFixed(2),
      dollarCost: Number(dollarCost).toFixed(2),
      weight: Number(weight),
      rate: Number(rate),
      fc: Number(fc),
      createDate: selectedDate,
      isDoc: isDoc,
      vat: ((Number(cost) / 1.1) * 0.1).toFixed(2),
      vatDollar: ((Number(dollarCost) / 1.1) * 0.1).toFixed(2),
      fees: (((Number(cost) / 1.1) / 1.4) * 0.14).toFixed(2),
      feesDollar: (((Number(dollarCost) / 1.1) / 1.4) * 0.14).toFixed(2),
      extraFees: Number(extraFees),
      status: status,
      direction: direction,
      statusChangeDate: statusChangeDate
    })
      .then(() => {
        alert('Shipping is updated successfully!');
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  };


  const calculateCost = (z, w, ef, f, r, isD) => {
    if (w && z && r && f && direction === 'dest' && customer.code !== '10000') {
      db.collection("prices").where("zone", "==", z.trim()).where("priceList", "==", priceList)
        .where("isDoc", "==", priceList === 2 ? isD : false)
        .get()
        .then((querySnapshot) => {
          var cost;
          querySnapshot.forEach((doc) => {
            if (Number(w) > Number(doc.data().weightFrom) && Number(w) <= Number(doc.data().weightTo)) {
              if (Number(w) > 30) {
                cost = evaluate(doc.data().cost.replace("n", w));
              } else {
                cost = Number(doc.data().cost)
              }
            }
          });
          cost = (((cost * Number(f)) * 1.14) * 1.1) + ((Number(ef) * Number(f)) * 1.14)
          setDollarCost(cost.toFixed(2))
          setCost((cost * Number(r)).toFixed(2))
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  }


  React.useEffect(() => {
    async function fetchShipping() {
      let customersRes = await db.collection("customers").orderBy("code").get().then((querySnapshot) => {
        var customersList = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().code) {
            customersList.push(doc.data());
          }
        });
        return customersList;
      });

      let countriesRes = await db.collection("countries").where("priceList", "==", priceList === 3 ? 2 : 1).get().then((querySnapshot) => {
        var countriesList = [];
        querySnapshot.forEach((doc) => {
          countriesList.push(doc.data());
        });
        return countriesList;
      });

      setCustomers(customersRes)
      setCountries(countriesRes)
    }

    fetchShipping()
  }, [priceList])

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid container item xs={12} sm={12}>
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">Price List</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={priceList}
              onChange={handleListChange}
            >
              <MenuItem value={1}>DHL</MenuItem>
              <MenuItem value={2}>UPS</MenuItem>
              <MenuItem value={3}>Aramex</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid container item xs={12} sm={12}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="dd/MM/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Date picker inline"
              value={selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField id="awbSky" name="awbSky" label="AWB Sky" value={skyAWB}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setSkyAWB(event.target.value)
            }} />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField id="awb" name="awb" label="AWB" value={awb}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setAWB(event.target.value)
            }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="combo-box-demo"
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
            label="Name"
            InputLabelProps={{
              shrink: true,
            }}
            disabled={true}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <RadioGroup aria-label="direction" name="direction" value={direction} onChange={(event) => {
            setdirection(event.target.value)
          }}>
            <FormControlLabel value="dest" control={<Radio />} label="Destination" />
            <FormControlLabel value="origin" control={<Radio />} label="Origin" />
          </RadioGroup>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="combo-box-demo"
            options={countries}
            value={country}
            getOptionLabel={(option) => option.country || ''}
            onChange={(event, newValue) => {
              if (newValue) {
                if (priceList === 2 && newValue.zone === '8') {
                  setCountry({ country: newValue.country, zone: "7" })
                }
                else setCountry(newValue);
              }
              else setCountry({});
            }}
            renderInput={(params) => <TextField {...params} label="Destination" variant="outlined" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="filled-name"
            value={country.zone || ''}
            label="Zone"
            InputLabelProps={{
              shrink: true,
            }}
            disabled={true}
            onChange={(event, newValue) => {
              calculateCost(newValue, weight, extraFees, fc, rate, isDoc)
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            id="weight"
            name="weight"
            label="Weight"
            value={weight}
            InputProps={{
              startAdornment: <InputAdornment position="start">Kg</InputAdornment>,
            }}
            type="number"
            onChange={(event) => {
              setWeight(event.target.value);
              calculateCost(country.zone, event.target.value, extraFees, fc, rate, isDoc);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="extraFees"
            name="extraFees"
            label="Extra Fees"
            value={extraFees}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            type="number"
            onChange={(event) => {
              setExtraFees(event.target.value);
              calculateCost(country.zone, weight, event.target.value, fc, rate, isDoc);
            }}
          />
        </Grid>
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
              calculateCost(country.zone, weight, extraFees, event.target.value, rate, isDoc);
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
              calculateCost(country.zone, weight, extraFees, fc, event.target.value, isDoc);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="filled-name"
            label="Cost"
            value={cost}
            disabled={direction === 'dest' && customer.code !== '10000'}
            InputProps={{
              startAdornment: <InputAdornment position="start">LE</InputAdornment>,
            }}
            type="number"
            onChange={(event) => {
              setCost(event.target.value)
              if (direction !== 'dest' || customer.code === '10000') {
                var dollar = Number(event.target.value) / rate;
                setDollarCost(dollar.toFixed(2))
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="filled-name"
            label="Cost"
            value={dollarCost}
            disabled={direction === 'dest' && customer.code !== '10000'}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            type="number"
            onChange={(event) => {
              setDollarCost(event.target.value)
              if (direction !== 'dest' || customer.code === '10000') {
                var egp = Number(event.target.value) * rate;
                setCost(egp.toFixed(2))
              }
            }}
          />
        </Grid>
        <Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDoc}
                onChange={(event) => {
                  setIsDoc(event.target.checked)
                  calculateCost(country.zone, weight, extraFees, fc, rate, isDoc)
                }}
                name="checkedB"
                color="primary"
              />
            }
            label="Document"
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">Shipping Status</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={status}
              onChange={(event) => {
                if (event.target.value !== status) {
                  setStatusChangeDate(new Date())
                }
                setStatus(event.target.value)
              }}
            >
              <MenuItem value={1}>Picked Up</MenuItem>
              <MenuItem value={2}>Arrived at Cairo</MenuItem>
              <MenuItem value={3}>Departed Facility in Cairo</MenuItem>
              <MenuItem value={4}>Arrived at Final Destination</MenuItem>
              <MenuItem value={5}>Delivered</MenuItem>
              <MenuItem value={6}>Need Correct Address</MenuItem>
              <MenuItem value={7}>Held at Customs</MenuItem>
            </Select>
          </FormControl>
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
    </React.Fragment>
  );
}